var http = require("http");
var zlib = require("zlib");
var fs = require("fs");
var path = require("path");

var gulp = require("gulp");

var concat = require("gulp-concat");
var newer = require("gulp-newer");
var changed = require("gulp-changed");
var handlebars = require("gulp-handlebars");
var defineModule = require("gulp-define-module");
var declare = require("gulp-declare");
var runSequence = require("run-sequence");
var mochaChrome = require("gulp-mocha-chrome");
var staticServe = require("node-static");
var request = require("request");
var gutil = require("gulp-util");
var babel = require("./babel-plugin.js");
var gulpIf = require("gulp-if");
var chmod = require("gulp-chmod");
var eol = require("gulp-eol");

var mochaRunner = require("./testutil/gulp-mocha-runner.js");
var check = require("./check.js");
var paths = require("./build-paths.json");

function generateTemplates() {
    return gulp.src(paths.templates)
        .pipe(changed("build/tmpl", {extension: ".js"}))
        .pipe(handlebars({
            handlebars: require("handlebars")
        }))
        .pipe(defineModule("plain"))
        .pipe(declare({
            namespace: "Handlebars.templates",
            root: "window"
        }))
        .pipe(gulp.dest("build/tmpl"));
}

var firstBuild = true;
var scriptTypes = Object.keys(paths.scripts);

function generateScripts(done) {
    const tasks = scriptTypes.map((type) => {
        function generateScript() {
            var outputFileName = "live-editor." + type + ".js";
            var srcPath = path.join(__dirname, "js");

            return gulp.src(paths.scripts[type])
                .pipe(firstBuild ? gutil.noop() : newer("build/js/" + outputFileName))
                .pipe(gulpIf(function (file) {
                    // transform source files but not dependencies
                    return file.path.indexOf(srcPath) === 0;
                }, babel({ blacklist: ["strict"] })))
                .pipe(concat(outputFileName))
                .pipe(chmod(644))
                .pipe(eol("\n"))
                .pipe(gulp.dest("build/js"));
        }
        generateScript.displayName = `generateScript_${type}`;
        return generateScript;
    });
    return gulp.parallel(...tasks, (tasksDone) => {
        tasksDone();
        done();
    })();
}

function generateWorkerFiles(done) {
    gulp.src(paths.workers_webpage)
        .pipe(gulp.dest("build/workers/webpage"));

    gulp.src(paths.workers_pjs)
        .pipe(gulp.dest("build/workers/pjs"));

    gulp.src(paths.workers_shared)
        .pipe(gulp.dest("build/workers/shared"));
    done();
}

function copyExternals() {
    return gulp.src(paths.externals, {base: "./"})
        .pipe(gulp.dest("build/"));
}

var styleTypes = Object.keys(paths.styles);

function generateStyles(done) {
    const tasks = styleTypes.map((type) => {
        function generateStyle() {
            var outputFileName = "live-editor." + type + ".css";
            return gulp.src(paths.styles[type])
                .pipe(firstBuild ? gutil.noop() : newer("build/css/" + outputFileName))
                .pipe(concat(outputFileName))
                .pipe(gulp.dest("build/css"));
        }
        generateStyle.displayName = `generateStyle_${type}`;
        return generateStyle;
    });
    return gulp.series(...tasks, (seriesDone) => {
        seriesDone();
        done();
    })();
}

function copyImages() {
    return gulp.src(paths.images)
        .pipe(gulp.dest("build/images"));
}

var failureCount = 0;

// We run tests in groups so that we don't require as much memory to run them
// in Travis-CI.
var pjs_tests = ["jshint", "output", "assert", "ast_transform", "async"];

function runPJSTests(done) {
    const testTasks = pjs_tests.map((test) => {
        function runTest() {
            return gulp.src("tests/output/pjs/index.html")
                .pipe(mochaRunner({ test: test + "_test.js"}))
                .on("error", function (err) {
                    failureCount += parseInt(err.message);
                    this.emit("end");
            });
        }
        runTest.displayName = `runPJSTest_${test}`;
        return runTest;
    });
    return gulp.series(...testTasks, (seriesDone) => {
        seriesDone();
        done();
    })();
}

var webpage_tests = ["assert", "output", "transform"];

function runWebpageTests(done) {
    const testTasks = webpage_tests.map((test) => {
        function runTest() {
            return gulp.src("tests/output/webpage/index.html")
                .pipe(mochaRunner({ test: test + "_test.js" }))
                .on("error", function (err) {
                    failureCount += parseInt(err.message);
                    this.emit("end");
                });
        }
        runTest.displayName = `runWebpageTest_${test}`;
        return runTest;
    });
    return gulp.series(...testTasks, (seriesDone) => {
        seriesDone();
        done();
    })();
}

function runSQLTest() {
   return gulp.src("tests/output/sql/index.html")
       .pipe(mochaRunner());
}

function runTooltipsTest() {
    return gulp.src("tests/tooltips/index.html")
        .pipe(mochaRunner());
}

function checkForTestErrors(done) {
    if (failureCount > 0) {
        console.log("Found test errors");
        process.exit();
    } else {
        done();
    }
}

// NOTE(jeresig): We don't bundle this data as it's kind of big. Better to
// download it dynamically, when we need it.
var recordDataURL = "https://s3.amazonaws.com/ka-cs-scratchpad-audio/" +
    "tests/recording-data.json.gz";
var recordDataFile = "tests/record/recording-data.json";


var runTest = function(fileName) {
    return function() {
        // We need to set up a server to host the content
        // Unfortunately we can't just run it from a file:// url
        // as web workers don't like working in that way.
        var fileServer = new staticServe.Server("./");
        var server = http.createServer(function(req, res) {
            req.addListener("end", function() {
                fileServer.serve(req, res);
            }).resume();
        });
        server.listen(11537);

        // We then run the Mocha tests in a headless Chrome
        var stream = mochaChrome();
        stream.write({
            path: "http://localhost:11537/tests/" + fileName
        });
        stream.end();
        stream.on("finish", function() {
            server.close();
        });

        // Returning the stream lets Gulp know when the tests have
        // finished running.
        return stream;
    };
};

function testRecordData() {
    if (fs.existsSync(recordDataFile)) {
        return done();
    }

    return request(recordDataURL)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(recordDataFile));
}

// NOTE(jeresig): Not included in the main tests yet, as they take a
// long time to run.
// TODO(kevinb) find out about recording-data.json
function testRecording() {
    return gulp.series(testRecordData, runTest("record/index.html"));
}

// Check to make sure all source files and dependencies exist before building.
function checkMissing(done) {
    var missing = check();
    if (missing.length > 0) {
        console.log("Aborting build");
        process.exit();
    } else {
        console.log("all files exist");
    }
    done();
}

exports.build = gulp.series(
    checkMissing,
    generateTemplates,
    generateScripts,
    generateWorkerFiles,
    generateStyles,
    copyImages,
    copyExternals
);

exports.test = gulp.series(
    runPJSTests,
    runWebpageTests,
    runSQLTest,
    runTooltipsTest,
    checkForTestErrors
);