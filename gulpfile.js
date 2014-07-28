var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var changed = require("gulp-changed");
var handlebars = require("gulp-handlebars");
var defineModule = require("gulp-define-module");
var declare = require("gulp-declare");

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
    gulp.src("css/bootstrap/fonts/*")
        .pipe(gulp.dest("build/fonts"));
});

gulp.task("watch", function() {
    scriptTypes.forEach(function(type) {
        gulp.watch(paths.scripts[type], ["script_" + type]);
    });

    styleTypes.forEach(function(type) {
        gulp.watch(paths.styles[type], ["style_" + type]);
    });
});

gulp.task("default", ["watch", "templates", "scripts", "styles", "fonts"]);