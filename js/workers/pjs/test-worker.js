import "es5-shim";

import PJSTester from "../../output/pjs/pjs-tester.js";

var init = false;

var tester;

self.onmessage = function(event) {
    if (!init) {
        init = true;
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
