/**
 * Collect results from the in-browser mocha test runner for reporting back to
 * the console and integration with scripts.
 */
var system = require("system");
var url = system.args[1];
var page = require("webpage").create();

var pageHasUncaughtErrors = false;
var testsHaveStarted = false;

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onError = function(msg, trace) {
    pageHasUncaughtErrors = true;

    if (!testsHaveStarted) {
        system.stderr.write(
            JSON.stringify({
                msg: msg,
                trace: trace.map(function(item) {
                    return item.file + ":" + item.line;
                })
            })
        );
    }
};

console.log("Loading " + url + "...");
page.open(url, function(status) {
    if (status !== "success") {
        system.stderr.write("Failed to load URL " + status);
        phantom.exit(1);
    }
    console.log("Page loaded, loading dependencies...");
});

setTimeout(function() {
    if (!testsHaveStarted) {
        system.stderr.write("Timeout: tests did not start. " +
            "This may be because of errors on the page.");
        phantom.exit(1);
    }
}, 5 * 60 * 1000);
