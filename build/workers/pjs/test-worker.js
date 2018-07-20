/* eslint-disable no-var, no-undef */
/* TODO: Fix the lint errors */
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
    //window = self;
}

var init = false;
var date = (new Date()).toDateString();

var tester;

require("es5-shim");

const PJSTester = require("../../output/pjs/pjs-tester.js");

self.onmessage = function(event) {
    if (!init) {
        init = true;

        /*
        importScripts(event.data.externalsDir +
            "es5-shim/es5-shim.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "structuredjs/external/esprima.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + date);
        importScripts(event.data.externalsDir +
            "structuredjs/structured.js?cachebust=A" + date);
        */

        // Bring in the testing logic
        //importScripts("../shared/output-tester.js?cachebust=" + date);
        //importScripts("./pjs-tester.js?cachebust=" + date);

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
