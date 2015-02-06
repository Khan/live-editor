var init = false;

self.onmessage = function(event) {
    var data = JSON.parse(event.data);

    // We don't import JSHint on load as we need to know which language
    // the user is visiting the site in. If there is no language then
    // we just use the normal file.
    if (!init) {
        init = true;

        if (data.deps) {
            var deps = data.deps;

            eval(deps["es5-shim.js"]);
            eval(deps["jshint.js"]);
            eval(deps["underscore.js"]);

            self.JSHINT = JSHINT;    // store it in a global so we can use it next time
        }
    }

    // Evaluate the code using JSHint
    JSHINT(data.code);

    // Return the JSHint results to the main code
    self.postMessage({
         type: "jshint",
         message: {
             hintData: JSON.parse(JSON.stringify(JSHINT.data())),
             hintErrors: JSHINT.errors
        }
    });
};

