var q = require("q");
var fs = require("fs");
var mkdirp = require("mkdirp");
var uglify = require("uglify-js");

// don't worry about dependency chains at the start
// workers who are loading these dependency are responsible
// for getting the order right

var deps = {
    "jshint-worker.js": "js/workers/pjs/jshint-worker.js",
    "es5-shim.js": "bower_components/es5-shim/es5-shim.js",
    "jshint.js": "external/jshint/jshint.js",
    "underscore.js": "bower_components/underscore/underscore.js",

    "worker.js": "js/workers/pjs/worker.js",
    "processing-stubs.js": "js/workers/pjs/processing-stubs.js",
    "program-stubs.js": "js/workers/pjs/program-stubs.js",

    "test-worker.js": "js/workers/pjs/test-worker.js",
    // also uses es5-shim and underscore
    "esprima.js": "external/structuredjs/external/esprima.js",
    "structured.js": "external/structuredjs/structured.js",
    "output-tester.js": "js/output/shared/output-tester.js",
    "pjs-tester.js": "js/output/pjs/pjs-tester.js"
};

mkdirp = q.denodeify(mkdirp);

var readFile = q.denodeify(fs.readFile);
var writeFile = q.denodeify(fs.writeFile);

// TODO: return a stream so that the results can piped to gulp
var bundle_deps = function(deps) {
    var obj = {};

    mkdirp("build/workers").then(function () {

        // An interesting side effect of using promises to run multiple
        // tasks concurrently is the order that they complete in is random.
        // The interesting thing about the order of keys in a dictionary
        // is that it's not alphabetical, but rather based on order of addition
        // to the dictionary. 
        return q.all(
            Object.keys(deps).map(function (filename) {
                var path = deps[filename];
                return readFile(path, { encoding: 'utf8' }).then(function (contents) {
                    var result = uglify.minify(contents, {fromString: true});
                    obj[filename] = result.code;
                });
            })
        );
    }).then(function () {
        var orderedObject = {};
        Object.keys(obj).sort().forEach(function (key) {
            orderedObject[key] = obj[key];
        });
        return writeFile("build/workers/deps.json", JSON.stringify(orderedObject, null, "  "));
    }).then(function () {
        console.log("finished packaging pjs workers into build/workers/deps.json");
    }).catch(function (err) {
        console.log(err);
    });
};

exports.bundle_deps = bundle_deps;
exports.deps = deps;
