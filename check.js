// Exports a function to check that all source files and dependencies exist.

var fs = require("fs");

module.exports = function() {
    var missing = [];
    var traverse = function(obj) {
        if (Array.isArray(obj)) {
            obj.forEach(function (path) {
                if (path.indexOf("*") === -1) {
                    try {
                        fs.statSync(path);
                    } catch(e) {
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
        var bower = false;
        var submodule = false;
        console.log("missing files:");
        missing.forEach(function (path) {
            console.log("  " + path);
            if (path.indexOf("bower_components") !== -1) {
                bower = true;
            } else {
                submodule = true;
            }
        });
        console.log("make sure to run:");
        if (bower) {
            console.log("  bower install");
        }
        if (submodule) {
            console.log("  git submodule sync && git submodule update");
        }
    }
    return missing;
};
