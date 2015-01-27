// Mock out $._, since we don't use any of the sprintf functionality
var $ = {};
$._ = function(str) { return str;};

// We set window to self so that StructuredJS can find Esprima and
// Underscore
if (typeof window === "undefined") { 
    /*global window:true */
    window = self;  
}

var init = false;
var date = (new Date()).toDateString();

var tester;

self.onmessage = function(event) {
    if (!init) {
        init = true;

        if (event.data.deps) {
            var deps = JSON.parse(event.data.deps);

            eval(deps["es5-shim.js"]);
            eval(deps["esprima.js"]);
            eval(deps["underscore.js"]);
            eval(deps["structured.js"]);
            eval(deps["output-tester.js"]);
            eval(deps["pjs-tester.js"]);
        } else {
            importScripts(event.data.externalsDir +
            "es5-shim/es5-shim.js?cachebust=" + date);
            importScripts(event.data.externalsDir +
            "structuredjs/external/esprima.js?cachebust=" + date);
            importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + date);
            importScripts(event.data.externalsDir +
            "structuredjs/structured.js?cachebust=" + date);

            // Bring in the testing logic
            importScripts("../shared/output-tester.js?cachebust=" + date);
            importScripts("./pjs-tester.js?cachebust=" + date);
        }

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