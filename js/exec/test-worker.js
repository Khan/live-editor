importScripts("../shared-package/es5-shim.js?cachebust=" + (new Date()).toDateString());
importScripts("/third_party/javascript-khansrc/structuredjs/external/esprima.js?cachebust=" + (new Date()).toDateString());
importScripts("/third_party/javascript-khansrc/underscore/underscore.js?cachebust=" + (new Date()).toDateString());
// We set window to self so that StructuredJS can find Esprima and Underscore
if (typeof window === "undefined") { 
    /*global window:true */
    window = self;  
}
importScripts("/third_party/javascript-khansrc/structuredjs/structured.js?cachebust=" + (new Date()).toDateString());
importScripts("./output-tester.js?cachebust=" + (new Date()).toDateString());

// Mock out $._, since we don't use any of the sprintf functionality
var $ = {};
$._ = function(str) { return str;};

self.onmessage = function(event) {
    OutputTester.test(event.data.code, event.data.validate, event.data.errors);

    // Return the OutputTester results to the main code
    self.postMessage({
         type: "test",
         message: {
            testResults: OutputTester.testResults,
            errors: OutputTester.errors
        }
    });
};