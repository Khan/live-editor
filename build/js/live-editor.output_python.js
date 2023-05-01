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
                // TODO: Figure out if we should be using globals() instead of sys.modules
                var script = "\n                import sys\n                __initial_globals__ = sys.modules[__name__].__dict__.copy()\n                ";
                pyodide.runPython(script);
                return pyodide;
            });
        }

        console.log("[Debug] Running code: " + userCode);
        this.loadPyodide.then(function (pyodide) {
            try {
                var script = "\n                import sys\n                names = list(sys.modules[__name__].__dict__.keys())\n                for n in names:\n                    if n not in __initial_globals__ and n != \"__initial_globals__\":\n                        del sys.modules[__name__].__dict__[n]\n                del sys.modules[__name__].__dict__[\"sys\"]\n                ";
                pyodide.runPython(script);
                // TODO: Figure out if we need to importlib.reload() the initial modules

                var result = pyodide.runPython(userCode);
                _this.$result.append(result);

                callback([]);
            } catch (e) {
                var errorDetails = parsePyError(e, userCode);
                _this.$stderr.append(errorDetails.text);

                callback([errorDetails]);
            }
        });
    },

    clear: function clear() {},

    kill: function kill() {}
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
    var errorType = e.type;
    var errorParts = e.message.split(errorType + ": ");
    var traceback = errorParts.length > 0 ? errorParts[0] : "File \"<exec>\", line 0, in <module>";
    var errorText = errorParts.length > 1 ? errorParts[1] : "unknown error";

    var lineNumber = traceback.split(" File \"<exec>\", line ")[1].split(",")[0];

    console.log(e);
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

// Clear the output

// Completely stop and clear the output
