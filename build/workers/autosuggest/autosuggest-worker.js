var init = false;

self.onmessage = function(event) {
    // load esprima on the first message we get
    if (!init) {
        init = true;

        importScripts(event.data.externalsDir +
            "/structuredjs/external/esprima.js?cachebust=" + (new Date()).toDateString());
    }

    // Parse the code using esprima
    try {
        var options = {
            range: true
        };
        var ast = esprima.parse(event.data.code, options);
        var userVars = [];

        ast.body.forEach(function (node) {
            if (node.type === "VariableDeclaration") {
                node.declarations.forEach(function (decl) {
                    userVars.push({
                        name: decl.id.name,
                        start: decl.id.range[1]
                    });
                });
            }
        });

        // Return the AST to the main thread
        self.postMessage({
            type: "userVars",
            userVars: userVars
        });
    } catch(e) {
        self.postMessage({
            type: "error"
        });
    }
};

