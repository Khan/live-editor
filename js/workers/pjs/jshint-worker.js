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
            "structuredjs/external/esprima.js?cachebust=" + (new Date()).toDateString());

        importScripts(event.data.externalsDir +
            "underscore/underscore.js?cachebust=" + (new Date()).toDateString());
    }

    // Evaluate the code using JSHint
    JSHINT(event.data.code);

    // Remove all top scope user defined variables from JSHint's list of globals
    // esprima can throw so wrap it in a try-catch
    try {
        var data = JSHINT.data();
        var ast = esprima.parse(event.data.code);
        var i, j, decl;
        var topScopeUserVars = [];

        for (i = 0; i < ast.body.length; i++) {
            var node = ast.body[i];
            if (node.type === "VariableDeclaration") {
                for (j = 0; j < node.declarations.length; j++) {
                    decl = node.declarations[j];
                    topScopeUserVars.push(decl.id.name);
                }
            } else if (node.type === "ForStatement") {
                for (j = 0; j < node.init.declarations.length; j++) {
                    decl = node.init.declarations[j];
                    topScopeUserVars.push(decl.id.name);
                }
            }
        }
    } catch (e) {
        console.log("esprima error on jshint-worker: %o", e);
    }

    data.globals = _.difference(data.globals, topScopeUserVars);

    // Return the JSHint results to the main code
    self.postMessage({
         type: "jshint",
         message: {
            // JSHint passes back a non-JSON object so we need to convert it
            hintData: JSON.parse(JSON.stringify(data)),
            hintErrors: JSHINT.errors
        }
    });
};

