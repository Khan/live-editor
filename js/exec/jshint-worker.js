importScripts("../shared-package/es5-shim.js?cachebust=" + (new Date()).toDateString());

self.onmessage = function(event) {
    // We don't import JSHint on load as we need to know which language
    // the user is visiting the site in. If there is no language then
    // we just use the normal file.
    if (typeof JSHint === "undefined") {
        var prefix = "../..";

        if (event.data.lang) {
            prefix = "../../genfiles/translations/" + event.data.lang;
        }

        importScripts(prefix + "/third_party/javascript-khansrc/jshint" +
            "/jshint.js?cachebust=" + (new Date()).toDateString());
    }

    // Evaluate the code using JSHint
    JSHINT(event.data.code);

    // Return the JSHint results to the main code
    self.postMessage({
         type: "jshint",
         message: {
            // JSHint passes back a non-JSON object so we need to convert it
            hintData: JSON.parse(JSON.stringify(JSHINT.data())),
            hintErrors: JSHINT.errors
        }
    });
};

