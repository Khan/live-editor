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
                // TODO: Figure out if we should be using globals() instead of sys.modules
                var script = `
                import sys
                __initial_globals__ = sys.modules[__name__].__dict__.copy()
                `;
                pyodide.runPython(script);
                return pyodide;
            });
        }

        console.log("[Debug] Running code: " + userCode);
        this.loadPyodide.then((pyodide) => {
            try {
                var script = `
                import sys
                names = list(sys.modules[__name__].__dict__.keys())
                for n in names:
                    if n not in __initial_globals__ and n != "__initial_globals__":
                        del sys.modules[__name__].__dict__[n]
                del sys.modules[__name__].__dict__["sys"]
                `;
                pyodide.runPython(script);
                // TODO: Figure out if we need to importlib.reload() the initial modules

                var result = pyodide.runPython(userCode);
                this.$result.append(result);

                callback([]);
            } catch (e) {
                const errorDetails = parsePyError(e, userCode);
                this.$stderr.append(errorDetails.text);

                callback([errorDetails]);
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

function parsePyError(e, userCode) {
    // This is an example of an error.  It has a lot of things we don't want to expose to the user:
    // Traceback (most recent call last):
    //   File "/lib/python3.10/_pyodide/_base.py", line 460, in eval_code
    //     .run(globals, locals)
    //   File "/lib/python3.10/_pyodide/_base.py", line 306, in run
    //     coroutine = eval(self.code, globals, locals)
    //   File "<exec>", line 9, in <module>
    // NameError: name 'greetz' is not defined

    // We want to extract the line number, the error kind, and the message, so something like this:
    // {
    //   source: "pyodide",
    //   type: "NameError",
    //   column: 0,
    //   row: "9",
    //   text: "name 'greetz' is not defined"
    // }
    const errorType = e.type;
    const errorParts = e.message.split(`${errorType}: `);
    const traceback = errorParts.length > 0 ? errorParts[0] : `File "<exec>", line 0, in <module>`;
    const errorText = errorParts.length > 1 ? errorParts[1] : "unknown error";

    const lineNumber = traceback.split(` File "<exec>", line `)[1].split(",")[0];

    console.log(e)
    return {
      source: "pyodide",
      type: errorType,
      column: 0,
      row: parseInt(lineNumber, 10) - 1,
      text: errorText,
      userCode: userCode
    };
}



LiveEditorOutput.registerOutput("python", PythonOutput);
