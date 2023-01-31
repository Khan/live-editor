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

        const $body = $(this.getDocument().body);

        $body.append(`
            <div>
                <div><strong>Output:</strong></div>
                <div id="stdout" />
            </div>
            <div>
                <div><strong>Errors:</strong></div>
                <div id="stderr" />
            </div>
            <div>
                <div><strong>Result:</strong></div>
                <div id="result" />
            </div>
        `);

        this.$stdout = $body.find("#stdout");
        this.$stderr = $body.find("#stderr");
        this.$result = $body.find("#result");
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
        // Clear out the stdout buffer:
        this.$stdout.empty();
        this.$stderr.empty();
        this.$result.empty();

        if (!this.loadPyodide) {
            // Caching this Pyodide load promise will make subsequecent loads faster, but
            // it also re-uses the context.  I don't think we want this long-term, but
            // creating the context takes some time... so I'm not sure which we want to use.
            this.loadPyodide = loadPyodide().then(pyodide => {
                pyodide.setStdout({
                    batched: data => {
                        this.$stdout.append(data + "<br />");
                    }
                });
                pyodide.setStderr({
                    batched: data => {
                        this.$stderr.append(data + "<br />");
                    }
                });
                return pyodide;
            });
        }

        console.log("[Debug] Running code: " + userCode);
        this.loadPyodide.then((pyodide) => {
            try {
                var result = pyodide.runPython(userCode);
                this.$result.append(result);

                callback([]);
            } catch (e) {
                //this.trigger("compileError", e);
                this.$stderr.append(JSON.stringify(e));

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

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("python", PythonOutput);
