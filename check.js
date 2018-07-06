// Exports a function to check that all source files and dependencies exist.
/* eslint-disable no-console */
var fs = require("fs");

module.exports = function() {
    var missing = [];
    var traverse = function(obj) {
        if (Array.isArray(obj)) {
            obj.forEach(function(path) {
                if (path.indexOf("*") === -1 &&
                    path.indexOf("build/tmpl") === -1) {
                    try {
                        fs.statSync(path);
                    } catch (e) {
                        missing.push(path);
                    }
                }
            });
        } else {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    traverse(obj[i]);
                }
            }
        }
    };

    traverse(require("./build-paths.json"));

    if (missing.length > 0) {
        var npm = false;
        var submodule = false;
        console.log("missing files:");
        missing.forEach(function(path) {
            console.log(path);
            if (path.indexOf("node_modules") !== -1) {
                npm = true;
            } else {
                submodule = true;
            }
        });
        console.log("make sure to run:");
        if (npm) {
            console.log("  npm install");
        }
        if (submodule) {
            console.log("  git submodule update --init --recursive");
        }
    }
    return missing;
};
