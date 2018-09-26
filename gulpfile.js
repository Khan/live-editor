var http = require("http");
var zlib = require("zlib");
var fs = require("fs");
var path = require("path");

var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
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

gulp.task("templates", function() {
    gulp.src(paths.templates)
        .pipe(changed("build/tmpl", {extension: ".js"}))
        .pipe(handlebars({
            handlebars: require("handlebars")
        }))
        .pipe(defineModule("plain"))
        .pipe(declare({
            namespace: "Handlebars.templates"
        }))
        .pipe(gulp.dest("build/tmpl"));
});

var firstBuild = true;
var scriptTypes = Object.keys(paths.scripts);

scriptTypes.forEach(function(type) {
    gulp.task("script_" + type, ["templates"], function() {
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
    });

    gulp.task("script_" + type + "_min", ["script_" + type], function() {
        var outputFileName = "live-editor." + type + ".min.js";
        return gulp.src(["build/js/live-editor." + type + ".js"])
            .pipe(firstBuild ? gutil.noop() : newer("build/js/" + outputFileName))
            .pipe(uglify())
            .pipe(concat(outputFileName))
            .pipe(chmod(644))
            .pipe(eol("\n"))
            .pipe(gulp.dest("build/js"));
    });
});

gulp.task("scripts", scriptTypes.map(function(type) {
    return "script_" + type;
}));

gulp.task("scripts_min", scriptTypes.map(function(type) {
    return "script_" + type + "_min";
}));

gulp.task("externals", function() {
    gulp.src(paths.externals, {base: "./"})
        .pipe(gulp.dest("build/"));
});

var styleTypes = Object.keys(paths.styles);

styleTypes.forEach(function(type) {
    gulp.task("style_" + type, function() {
        var outputFileName = "live-editor." + type + ".css";
        return gulp.src(paths.styles[type])
            .pipe(firstBuild ? gutil.noop() : newer("build/css/" + outputFileName))
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/css"));
    });
});

gulp.task("styles", styleTypes.map(function(type) {
    return "style_" + type;
}));

gulp.task("watch", function() {
    scriptTypes.forEach(function(type) {
        gulp.watch(paths.scripts[type], ["script_" + type]);
    });

    styleTypes.forEach(function(type) {
        gulp.watch(paths.styles[type], ["style_" + type]);
    });

    gulp.watch(paths.templates, ["templates"]);
});

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

        // We then run the Mocha tests in a headless PhantomJS
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

var failureCount = 0;

// We run tests in groups so that we don't require as much memory to run them
// in Travis-CI.
const testPre = "../../../build/js/live-editor.tests_output_";

var pjs_tests = ["assert", "async", "jshint", "output"];

pjs_tests.forEach(function(test) {
    gulp.task("test_output_pjs_" + test, function() {
        return gulp.src("tests/output/pjs/index.html")
            .pipe(mochaRunner({ test: testPre + "pjs_" + test + ".js"}))
            .on("error", function (err) {
                failureCount += parseInt(err.message);
                this.emit("end");
            });
    });
});

gulp.task("test_output_pjs", function(callback) {
    var sequence = pjs_tests.map(function(test) {
        return "test_output_pjs_" + test;
    });
    sequence.push(callback);
    runSequence.apply(null, sequence);
});

var webpage_tests = ["assert", "output", "transform"];

webpage_tests.forEach(function(test) {
    gulp.task("test_output_webpage_" + test, function() {
        return gulp.src("tests/output/webpage/index.html")
            .pipe(mochaRunner({ test: testPre + "webpage_" + test + ".js" }))
            .on("error", function (err) {
                failureCount += parseInt(err.message);
                this.emit("end");
            });
    });
});

gulp.task("test_output_webpage", function(callback) {
    var sequence = webpage_tests.map(function(test) {
        return "test_output_webpage_" + test;
    });
    sequence.push(callback);
    runSequence.apply(null, sequence);
});

gulp.task("test_output_sql", function() {
   return gulp.src("tests/output/sql/index.html")
       .pipe(mochaRunner());
});

gulp.task("test_tooltips", function() {
    return gulp.src("tests/tooltips/index.html")
        .pipe(mochaRunner());
});

gulp.task("check_errors", [], function() {
    process.exit(failureCount);
});

// NOTE(jeresig): We don't bundle this data as it's kind of big. Better to
// download it dynamically, when we need it.
var recordDataURL = "https://s3.amazonaws.com/ka-cs-scratchpad-audio/" +
    "tests/recording-data.json.gz";
var recordDataFile = "tests/record/recording-data.json";

gulp.task("test_record_data", function(done) {
    if (fs.existsSync(recordDataFile)) {
        return done();
    }

    return request(recordDataURL)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(recordDataFile));
});

// NOTE(jeresig): Not included in the main tests yet, as they take a
// long time to run.
// TODO(kevinb) find out about recording-data.json
gulp.task("test_record", ["test_record_data"],
    runTest("record/index.html"));

gulp.task("test", function(callback) {
    runSequence("test_output_pjs", "test_output_webpage", "test_output_sql",
        "test_tooltips", "check_errors", callback);
});

// Check to make sure all source files and dependencies exist before building.
gulp.task("check", function() {
    var missing = check();
    if (missing.length > 0) {
        console.log("Aborting build");
        process.exit();
    } else {
        console.log("all files exist");
    }
});

gulp.task("build",
    ["check", "templates", "scripts", "styles", "externals"],
    function() {
        firstBuild = false;
    });

gulp.task("default", ["watch", "build"]);
