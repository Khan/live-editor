var q = require("q");
var fs = require("fs");
var mkdirp = require("mkdirp");

// don't worry about dependency chains at the start
// workers who are loading these dependency are responsible
// for getting the order right

var deps = {
    "jshint-worker.js": "build/workers/pjs/jshint-worker.js",
    "es5-shim.js": "bower_components/es5-shim/es5-shim.js",
    "jshint.js": "external/jshint/jshint.js",
    "underscore.js": "bower_components/underscore/underscore.js",
    
    "worker.js": "build/workers/pjs/worker.js",
    "processing-stubs.js": "js/workers/pjs/processing-stubs.js",
    "program-stubs.js": "js/workers/pjs/program-stubs.js",
    
    "test-worker.js": "build/workers/pjs/test-worker.js",
    // also uses es5-shim and underscore
    "esprima.js": "external/structuredjs/external/esprima.js",
    "structured.js": "external/structuredjs/structured.js",
    "output-tester.js": "js/output/shared/output-tester.js",
    "pjs-tester.js": "js/output/pjs/pjs-tester.js"
};

mkdirp = q.denodeify(mkdirp);

var readFile = q.denodeify(fs.readFile);
var writeFile = q.denodeify(fs.writeFile);

var obj = {};

mkdirp("build/workers").then(function () {
    return q.all(
        Object.keys(deps).map(function (filename) {
            var path = deps[filename];
            return readFile(path, { encoding: 'utf8' }).then(function (contents) {
                obj[filename] = contents; 
            });
        })
    );
}).then(function () {
    return writeFile("build/workers/deps.json", JSON.stringify(obj, null, "  ")); 
}).then(function () {
    console.log("success");
}).catch(function (err) {
    console.log(err);
});
