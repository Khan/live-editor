var init = false;
var jshint;

self.onmessage = function(event) {
    // We don't import JSHint on load as we need to know which language
    // the user is visiting the site in. If there is no language then
    // we just use the normal file.
    if (!init) {
        init = true;

        if (event.data.deps) {
            var deps = JSON.parse(event.data.deps);

            eval(deps["es5-shim.js"]);
            eval(deps["jshint.js"]);
            eval(deps["underscore.js"]);

            self.JSHINT = JSHINT;    // store it in a global so we can use it next time
        } else {
            importScripts(event.data.externalsDir +
            "es5-shim/es5-shim.js?cachebust=" + (new Date()).toDateString());

            importScripts(event.data.jshintFile +
            "?cachebust=" + (new Date()).toDateString());

            importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + (new Date()).toDateString());
        }
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

