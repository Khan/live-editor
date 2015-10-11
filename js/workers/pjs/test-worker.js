// Mock out $._, since we don't use any of the sprintf functionality
var i18n = {};
i18n._ = function(str) { return str; };
// TODO(kevinb) remove when all challenge test code is updated to use i18n._
var $ = {};
$._ = i18n._;

// We set window to self so that StructuredJS can find Esprima and
// Underscore
if (typeof window === "undefined") {
    /*global window:true */
    window = self;
}

var init = false;
var date = (new Date()).toDateString();

var tester;

// The problem is that we're loading some scripts using importScript and they
// have dependencies which they're loading with require now instead of depending
// on a global. I set those dependencies up to also expose globals that's why
// the code below works. I need to make this better. Also, there's this weird
// situation where "pooled-worker.js" is being required in "output-tester.js"
// even though it's not being used in side the worker itself. The "initialize"
// method creates a PooledWorker instance, but "initialize" isn't called inside
// the web worker.
// TODO(kevinb) refactor so that we don't need this hack
var module = {};
var require = function(path) {
    if (path === "./pooled-worker.js") {
        return PooledWorker;
    }
    if (path === "../shared/output-tester.js") {
        return OutputTester;
    }
    if (path === "structuredjs") {
        return Structured;
    }
};

self.onmessage = function(event) {
    if (!init) {
        init = true;

        importScripts(event.data.externalsDir +
            "es5-shim/es5-shim.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "structuredjs/external/esprima.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "structuredjs/structured.js?cachebust=A" + date);

        // Bring in the testing logic
        importScripts("../shared/output-tester.js?cachebust=" + date);
        importScripts("./pjs-tester.js?cachebust=" + date);

        tester = new PJSTester();
    }

    tester.test(event.data.code, event.data.validate, event.data.errors,
        function(errors, testResults) {
            // Return the test results to the main code
            self.postMessage({
                 type: "test",
                 message: {
                    testResults: testResults,
                    errors: errors
                }
            });
        });
};
