/* eslint-disable no-var, no-undef */
/* TODO: Fix the lint errors */
var init = false;

self.onmessage = function(event) {
    // We don't import JSHint on load as we need to know which language
    // the user is visiting the site in. If there is no language then
    // we just use the normal file.
    if (!init) {
        init = true;

        importScripts(event.data.externalsDir +
            "es5-shim/es5-shim.js?cachebust=" + (new Date()).toDateString());

        importScripts(event.data.jshintFile +
            "?cachebust=" + (new Date()).toDateString());

        importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + (new Date()).toDateString());
    }

    // Evaluate the code using JSHint
    JSHINT(event.data.code);

    // Return the JSHint results to the main code
    self.postMessage({
         type: "jshint",
         message: {
             hintData: JSON.parse(JSON.stringify(JSHINT.data())),
             hintErrors: JSHINT.errors
        }
    });
};

