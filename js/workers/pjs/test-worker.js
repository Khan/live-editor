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
    var data = JSON.parse(event.data);
    
    if (!init) {
        init = true;

        if (data.deps) {
            var deps = JSON.parse(data.deps);

            eval(deps["es5-shim.js"]);
            eval(deps["esprima.js"]);
            eval(deps["underscore.js"]);
            eval(deps["structured.js"]);
            eval(deps["output-tester.js"]);
            eval(deps["pjs-tester.js"]);
        }

        tester = new PJSTester();
    }

    tester.test(data.code, data.validate, data.errors,
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