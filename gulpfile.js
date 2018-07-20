var http = require("http");
var zlib = require("zlib");
var fs = require("fs");
var path = require("path");

var gulp = require("gulp");

var runSequence = require("run-sequence");
var mochaChrome = require("gulp-mocha-chrome");
var staticServe = require("node-static");
var request = require("request");

var mochaRunner = require("./testutil/gulp-mocha-runner.js");

var firstBuild = true;

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

        // We then run the Mocha tests in headless Chrome
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
var pjs_tests = ["output", "output", "assert", "async"];

pjs_tests.forEach(function(test) {
    gulp.task("test_output_pjs_" + test, function() {
        return gulp.src("tests/output/pjs/index.html")
            .pipe(mochaRunner({ test: test + "_test.js"}))
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

var webpage_tests = ["assert", "output"];

webpage_tests.forEach(function(test) {
    gulp.task("test_output_webpage_" + test, function() {
        return gulp.src("tests/output/webpage/index.html")
            .pipe(mochaRunner({ test: test + "_test.js" }))
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

gulp.task("test_modules", function() {
    return gulp.src("tests/module_tests.html")
        .pipe(mochaRunner());
});

gulp.task("check_errors", [], function() {
    process.exit(failureCount);
});

// TODO(kevinb7): Add task for debugger tests once ES5 is supported

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
        "test_tooltips", "test_modules", "check_errors", callback);
});

gulp.task("default", ["watch", "build"]);
