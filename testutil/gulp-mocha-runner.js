/**
 * 
 */
var PluginError = require("gulp-util").PluginError;
var spawn = require("child_process").spawn;
var through2 = require("through2");

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

        error.stackArray.forEach(function(stackFrame) {
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

        var args = [ __dirname + "/phantom-script.js", file.path ];
        var phantom = spawn(require("phantomjs").path, args);
        
        phantom.stdout.setEncoding('utf8');
        phantom.stdout.on('data', function(data) {
            var msgStr = data.toString().trim();
            
            if (msgStr.charAt(0) === "[") {
                var msgObj = JSON.parse(msgStr);
                var type = msgObj[0];
                var params = msgObj[1];

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
                            console.log(indent + failure.fullTitle);
                            console.log(indent + indent + error.message);
                            printStackTrace(error);
                        });
                    }

                    // errors
                    if (errors.length > 0) {
                        console.log("The following errors occurred:");
                        errors.forEach(function(error) {
                            console.log(indent + error.msg);
                            error.trace.forEach(function(line) {
                                console.log(indent + indent + line);
                            });
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
                    
                    phantom.kill(); // kill the process or gulp won't exit
                    done();
                }
            } else {
                messages.push(msgStr);
            }
        });
        phantom.stderr.on("data", function(data) {
            errors.push(JSON.parse(data.toString("utf-8")));
        });
    }

    return through2.obj(transform);
};

module.exports = plugin;
