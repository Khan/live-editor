window.PythonOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;

        this.tester = null;

        this.render();
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show();

        var $body = $(this.getDocument().body);

        $body.append("\n            <div>\n                <div><strong>Output:</strong></div>\n                <div id=\"stdout\" />\n            </div>\n            <div>\n                <div><strong>Errors:</strong></div>\n                <div id=\"stderr\" />\n            </div>\n            <div>\n                <div><strong>Result:</strong></div>\n                <div id=\"result\" />\n            </div>\n        ");

        this.$stdout = $body.find("#stdout");
        this.$stderr = $body.find("#stderr");
        this.$result = $body.find("#result");
    },

    getDocument: function getDocument() {
        return this.$frame[0].contentWindow.document;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
            imagesDir: this.output.imagesDir,
            onrendered: function onrendered(canvas) {
                var width = screenshotSize;
                var height = screenshotSize / canvas.width * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(canvas, 0, 0, width, height);

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
    getErrorMessage: function getErrorMessage(sqliteError, statement) {
        return null;
    },

    lint: function lint(userCode, skip) {
        // the deferred isn't required in this case, but we need to match the
        // same API as the pjs-output.js' lint method.
        var deferred = $.Deferred();
        deferred.resolve({
            errors: [],
            warnings: []
        });
        return deferred;
    },

    initTests: function initTests(validate) {
        if (!validate) {
            return;
        }

        return;
    },

    test: function test(userCode, tests, errors, callback) {},

    postProcessing: function postProcessing() {},

    runCode: function runCode(userCode, callback) {
        var _this = this;

        // Clear out the stdout buffer:
        this.$stdout.empty();
        this.$stderr.empty();
        this.$result.empty();

        if (!this.loadPyodide) {
            // Caching this Pyodide load promise will make subsequecent loads faster, but
            // it also re-uses the context.  I don't think we want this long-term, but
            // creating the context takes some time... so I'm not sure which we want to use.
            this.loadPyodide = loadPyodide().then(function (pyodide) {
                pyodide.setStdout({
                    batched: function batched(data) {
                        _this.$stdout.append(data + "<br />");
                    }
                });
                pyodide.setStderr({
                    batched: function batched(data) {
                        _this.$stderr.append(data + "<br />");
                    }
                });
                return pyodide;
            });
        }

        console.log("[Debug] Running code: " + userCode);
        this.loadPyodide.then(function (pyodide) {
            try {
                var result = pyodide.runPython(userCode);
                _this.$result.append(result);

                callback([]);
            } catch (e) {
                //this.trigger("compileError", e);
                _this.$stderr.append(JSON.stringify(e));

                // {
                //     type: "error",
                //     source: "esprima",
                //     column: 0,
                //     row: parseInt(/[1-9][0-9]*/.exec(line), 10) - 1,
                //     text: text
                // }]

                console.error([e]);
                callback(e);
            }
        });
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("python", PythonOutput);

// Clear the output

// Completely stop and clear the output
