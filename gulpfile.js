var gulp = require("gulp");

var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");

var paths = require("./build-paths.json");
var scriptTypes = Object.keys(paths.scripts);

scriptTypes.forEach(function(type) {
    gulp.task(type, [], function() {
        var outputFileName = "live-editor." + type + ".js";
        return gulp.src(paths.scripts[type])
            .pipe(newer("build/js/" + outputFileName))
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/js"));
    });

    gulp.task(type + "_min", [type], function() {
        var outputFileName = "live-editor." + type + ".min.js";
        return gulp.src(["build/js/live-editor." + type + ".js"])
            .pipe(newer("build/js/" + outputFileName))
            .pipe(uglify())
            .pipe(concat(outputFileName))
            .pipe(gulp.dest("build/js"));
    });
});

gulp.task("scripts", scriptTypes);

gulp.task("scripts_min", scriptTypes.map(function(type) {
    return type + "_min";
}));

gulp.task("watch", function() {
    scriptTypes.forEach(function(type) {
        gulp.watch(paths.scripts[type], [type]);
    });
});

gulp.task("default", ["watch", "scripts"]);