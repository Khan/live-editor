var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var changed = require("gulp-changed");
var handlebars = require("gulp-handlebars");
var defineModule = require("gulp-define-module");
var declare = require("gulp-declare");
var mochaPhantomJS = require("gulp-mocha-phantomjs");
var staticServe = require("node-static");
var http = require("http");

var paths = require("./build-paths.json");

gulp.task("templates", function() {
    gulp.src(paths.templates)
        .pipe(changed("build/tmpl", {extension: ".js"}))
        .pipe(handlebars())
        .pipe(defineModule("plain"))
        .pipe(declare({
            namespace: "Handlebars.templates"
        }))
        .pipe(gulp.dest("build/tmpl"));
});

var scriptTypes = Object.keys(paths.scripts);

scriptTypes.forEach(function(type) {
    gulp.task("script_" + type, ["templates"], function() {
        var outputFileName = "live-editor." + type + ".js";
        return gulp.src(paths.scripts[type])
            .pipe(newer("build/js/" + outputFileName))
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/js"));
    });

    gulp.task("script_" + type + "_min", ["script_" + type], function() {
        var outputFileName = "live-editor." + type + ".min.js";
        return gulp.src(["build/js/live-editor." + type + ".js"])
            .pipe(newer("build/js/" + outputFileName))
            .pipe(uglify())
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/js"));
    });
});

gulp.task("scripts", scriptTypes.map(function(type) {
    return "script_" + type;
}));

gulp.task("scripts_min", scriptTypes.map(function(type) {
    return "script_" + type + "_min";
}));

gulp.task("workers", function() {
    gulp.src(paths.workers_html)
        .pipe(gulp.dest("build/workers/html"));

    gulp.src(paths.workers_p5js)
        .pipe(gulp.dest("build/workers/p5js"));
});

gulp.task("externals", function() {
    gulp.src(paths.externals, {base: "./"})
        .pipe(gulp.dest("build/"));
});

var styleTypes = Object.keys(paths.styles);

styleTypes.forEach(function(type) {
    gulp.task("style_" + type, function() {
        var outputFileName = "live-editor." + type + ".css";
        return gulp.src(paths.styles[type])
            .pipe(newer("build/css/" + outputFileName))
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/css"));
    });
});

gulp.task("styles", styleTypes.map(function(type) {
    return "style_" + type;
}));

gulp.task("fonts", function() {
    gulp.src(paths.fonts)
        .pipe(gulp.dest("build/fonts"));
});

gulp.task("images", function() {
    gulp.src(paths.images)
        .pipe(gulp.dest("build/images"));
});

gulp.task("watch", function() {
    scriptTypes.forEach(function(type) {
        gulp.watch(paths.scripts[type], ["script_" + type]);
    });

    // Run output tests when the output code changes
    gulp.watch(paths.scripts.output
        .concat(paths.scripts.output_p5js), ["test"]);

    styleTypes.forEach(function(type) {
        gulp.watch(paths.styles[type], ["style_" + type]);
    });

    gulp.watch(paths.templates, ["templates"]);

    gulp.watch(paths.workers, ["workers"]);

    gulp.watch(paths.images, ["images"]);
});

gulp.task("test", function () {
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
    var stream = mochaPhantomJS();
    stream.write({
        path: "http://localhost:11537/tests/index.html"
    });
    stream.end();
    stream.on("finish", function() {
        server.close();
    });

    // Returning the stream lets Gulp know when the tests have
    // finished running.
    return stream;
});

gulp.task("default", ["watch", "templates", "scripts", "workers", "styles",
    "fonts", "images", "externals"]);