/* eslint-disable no-var, no-undef */
/* TODO: Fix the lint errors */
var init = false;

require("es5-shim");
const JSHINT = require("../../../external/jshint/jshint.js").JSHINT;

self.onmessage = function(event) {
    // We don't import JSHint on load as we need to know which language
    // the user is visiting the site in. If there is no language then
    // we just use the normal file.
    if (!init) {
        init = true;
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

