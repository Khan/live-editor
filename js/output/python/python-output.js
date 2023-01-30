window.PythonOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;

        this.tester = null;

        this.render();
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
    },

    getDocument: function() {
        return this.$frame[0].contentWindow.document;
    },

    getScreenshot: function(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
            imagesDir: this.output.imagesDir,
            onrendered: function(canvas) {
                var width = screenshotSize;
                var height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(
                    canvas, 0, 0, width, height);

                // Send back the screenshot data
                callback(tmpCanvas.toDataURL("image/png"));
            }
        });
    },

    /**
     * Given an SQLite error and the current statement, suggest a better
     * error message.  SQLlite error messages aren't always very descriptive,
     * this should make common syntax errors easier to understand.
     */
    getErrorMessage: function(sqliteError, statement) {
        return null;
    },

    lint: function(userCode, skip) {
        // the deferred isn't required in this case, but we need to match the
        // same API as the pjs-output.js' lint method.
        var deferred = $.Deferred();
        deferred.resolve({
            errors: [],
            warnings: []
        });
        return deferred;
    },

    initTests: function(validate) {
        if (!validate) {
            return;
        }

        return;
    },

    test: function(userCode, tests, errors, callback) {},

    postProcessing: function() {},

    runCode: function(userCode, callback) {
        // TODO(hannah): Implement!
    },

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("python", PythonOutput);
