/**
 * A gulp plugin that runs mocha tests in phantomjs.
 *
 * Supports running tests in an iframe inside phantomjs because the test
 * results are passed back to the plugin using stdout via console.log().
 */
const PluginError = require("gulp-util").PluginError;
const through2 = require("through2");
const chromeLauncher = require("chrome-launcher");
const CDP = require("chrome-remote-interface");
const unmirror = require('chrome-unmirror');

var plugin = function (options) {
    options = options || {};

    var messages = [];
    var failures = [];
    var errors = [];
    var testsHaveStarted = false;
    var indent = "    ";
    var PluginName = "gulp-mocha-runner";

    function printStackTrace(error) {
        if (!error.stackArray) {
            return;
        }

        error.stackArray.filter(function(stackFrame) {
            if (!stackFrame.url) {
                return false;
            } else if (stackFrame.url && stackFrame.url.indexOf("mocha.js") !== -1) {
                return false;
            } else {
                return true;
            }
        }).forEach(function(stackFrame) {
            var url = stackFrame.sourceURL;
            url = url.replace(
                new RegExp("file://" + __dirname + "/"), "");

            console.log(indent + indent + indent +
                url + ":" + stackFrame.line +
                (stackFrame.function ? " in " + stackFrame.function : "")
            );
        });
    }

    function transform(file, enc, done) {

        if (file.isNull()) {
            return done(null, file);
        }
        if (file.isStream()) {
            return done(new PluginError(PluginName, "Streaming not supported"));
        }

        (async function() {
            async function launchChrome() {
                return await chromeLauncher.launch({
                    chromeFlags: [
                        "--disable-background-timer-throttling",
                        "--disable-default-apps",
                        "--disable-device-discovery-notifications",
                        "--disable-gpu",
                        "--disable-popup-blocking",
                        "--disable-renderer-backgrounding",
                        "--disable-translate",
                        "--headless",
                        "--no-default-browser-check",
                        "--no-first-run",
                        "--autoplay-policy=no-user-gesture-required",
                        "--allow-file-access-from-files"
                    ],
                    logLevel: "error"
                });
            }

            const chrome = await launchChrome();
            const protocol = await CDP({port: chrome.port});
            const {
                DOM,
                Page,
                Runtime,
                Console
            } = protocol;
            await Promise.all([
                DOM.enable(),
                Page.enable(),
                Runtime.enable(),
                Console.enable()
            ]);

            Runtime.exceptionThrown((exception) => {
                let message = exception.exceptionDetails.exception.description;
                // Don't log infinite loop exceptions,
                // those indicate the system is working correctly
                if (message.indexOf("KA_INFINITE_LOOP") !== -1 ||
                    message.indexOf("testingRuntimeErrors") !== -1) {
                    return;
                }
                errors.push(message);
            });

            Runtime.consoleAPICalled(({logType, args}) => {

                var logMessage = args[0].value;
                var logMessageObj;
                try {
                    logMessageObj = JSON.parse(logMessage);
                } catch(e) {
                    messages.push(unmirror(args[0]));
                    return;
                }
                var type = logMessageObj[0];
                var params = logMessageObj[1];

                if (type === "start") {
                    testsHaveStarted = true;
                    console.log("Running " + params.total + " tests...");
                } else if (type === "pass") {
                    process.stdout.write("\x1b[32m.\x1b[0m"); // green
                } else if (type === "fail") {
                    process.stdout.write("\x1b[31mF\x1b[0m"); // red
                    failures.push(params);
                } else if (type === "end") {
                    process.stdout.write("\n");

                    // failures
                    if (failures.length > 0) {
                        console.log("The following tests failed:");
                        failures.forEach(function(failure) {
                            var error = failure.error;
                            if (error) {
                                console.log(indent + failure.fullTitle);
                                console.log(indent + indent + error.message);
                                printStackTrace(error);
                            }
                        });
                    }

                    // errors
                    if (errors.length > 0) {
                        console.log("The following runtime errors occurred:");
                        errors.forEach(function(error) {
                            console.log(error);
                        });
                    }

                    // messages
                    if (messages.length && options.showMessages) {
                        console.log("\nConsole logs output during test run:");
                        messages.forEach(function(msg) {
                            console.log(indent + msg);
                        });
                    }

                    // stats
                    console.log(
                        "Finished running " + params.tests + " tests, with " +
                        params.passes + " passes and " +
                        params.failures + " failures."
                    );

                    protocol.close();
                    chrome.kill();

                    if (params.failures > 0) {
                        return done(new PluginError(PluginName, params.failures));
                    } else {
                        done();
                    }
                }
            });


            Page.loadEventFired(() => {
                console.log("Test page successfully loaded");
            });

            var fileUrl = "file:///" + file.path;
            if (options.test) {
                fileUrl += "?tests=" + options.test
            }
            Page.navigate({url: fileUrl});
        })();
    }

    return through2.obj(transform);
};

module.exports = plugin;
