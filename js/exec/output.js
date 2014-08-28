(function() {

// Keep track of the frame source and origin for later
var frameSource;
var frameOrigin;

var LiveEditorOutput = {
    recording: false,

    init: function(options) {
        this.$elem = $(options.el);
        this.render();

        this.setPaths(options);

        // These are the tests (like challenge tests)
        this.validate = null;

        this.assertions = [];

        this.context = {};
        this.loaded = false;

        this.config = new ScratchpadConfig({});

        this.tipbar = new TipBar({
            el: this.$elem[0]
        });

        this.setOutput(options.output);

        this.bind();
    },

    render: function() {
        this.$elem.html(Handlebars.templates["output"]());
    },

    bind: function() {
        // Handle messages coming in from the parent frame
        window.addEventListener("message",
            this.handleMessage.bind(this), false);
    },

    setPaths: function(data) {
        if (data.workersDir) {
            this.workersDir = this._qualifyURL(data.workersDir);
            PooledWorker.prototype.workersDir = this.workersDir;
        }
        if (data.externalsDir) {
            this.externalsDir = this._qualifyURL(data.externalsDir);
        }
        if (data.imagesDir) {
            this.imagesDir = this._qualifyURL(data.imagesDir);
        }
        if (data.jshintFile) {
            this.jshintFile = this._qualifyURL(data.jshintFile);
        }
    },

    _qualifyURL: function(url){
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    },

    handleMessage: function(event) {
        var data;

        frameSource = event.source;
        frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActive();

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            return;
        }

        // Set the paths from the incoming data, if they exist
        this.setPaths(data);

        // Validation code to run
        if (data.validate != null) {
            this.initTests(data.validate);
        }

        // Settings to initialize
        if (data.settings != null) {
            this.settings = data.settings;
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            this.runCode(data.code);
        }

        if (data.onlyRunTests != null) {
            this.onlyRunTests = !!(data.onlyRunTests);
        } else {
            this.onlyRunTests = false;
        }

        // Restart the output
        if (data.restart) {
            this.restart();
        }

        // Take a screenshot of the output
        if (data.screenshot) {
            // We want to resize the image to a 200x200 thumbnail,
            // which we can do by creating a temporary canvas
            var tmpCanvas = document.createElement("canvas");

            var screenshotSize = data.screenshotSize || 200;
            tmpCanvas.width = screenshotSize;
            tmpCanvas.height = screenshotSize;
            tmpCanvas.getContext("2d").drawImage(
                $("#output-canvas")[0], 0, 0, screenshotSize, screenshotSize);

            // Send back the screenshot data
            frameSource.postMessage(tmpCanvas.toDataURL("image/png"),
                frameOrigin);
        }

        // Keep track of recording state
        if (data.recording != null) {
            this.recording = data.recording;
        }

        // Play back recording
        if (data.action) {
            if (this.output.handlers[data.name]) {
                this.output.handlers[data.name](data.action);
            }
        }

        if (data.documentation) {
            BabyHint.initDocumentation(data.documentation);
        }
    },

    // Send a message back to the parent frame
    postParent: function(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (frameSource) {
            frameSource.postMessage(JSON.stringify(data), frameOrigin);
        }
    },

    notifyActive: _.once(function() {
        this.postParent({ active: true });
    }),

    // This function stores the new tests on the validate property
    //  and it executes the test code to see if its valid
    initTests: function(validate) {
        // Only update the tests if they have changed
        if (this.validate === validate) {
            return;
        }

        // Prime the test queue
        this.validate = validate;

        // We evaluate the test code to see if it itself has any syntax errors
        // This also ends up pushing the tests onto this.tests
        var error = this.output.initTests(validate);

        // Display errors encountered while evaluating the test code
        if (error && error.message) {
            $("#test-errors").text(result.message).show();
        } else {
            $("#test-errors").hide();
        }
    },

    runCode: function(userCode, callback) {
        this.currentCode = userCode;

        var runDone = function(errors) {
            errors = this.cleanErrors(errors || []);

            if (!this.loaded) {
                this.postParent({ loaded: true });
                this.loaded = true;
            }

            // A callback for working with a test suite
            if (callback) {
                callback(errors);
                return;
            }

            this.postParent({
                results: {
                    code: userCode,
                    errors: errors,
                    tests: this.testResults || [],
                    assertions: this.assertions
                }
            });

            this.toggleErrors(errors);
        }.bind(this);

        this.lint(userCode, function(errors) {
            // Run the tests (even if there are lint errors)
            this.test(userCode, this.validate, errors, function(errors) {
                if (errors.length > 0 || this.onlyRunTests) {
                    return runDone(errors);
                }

                // Then run the user's code
                try {
                    this.output.runCode(userCode, this.context, runDone);

                } catch (e) {
                    runDone([e]);
                }
            }.bind(this));
        }.bind(this));
    },

    test: function(userCode, validate, errors, callback) {
        this.output.test(userCode, validate, errors, callback);
    },

    lint: function(userCode, callback) {
        this.output.lint(userCode, callback);
    },

    setOutput: function(output) {
        if (this.output) {
            this.output.kill();
        }

        this.output = output;
        output.init({
            config: this.config
        });
    },

    getUserCode: function() {
        return this.currentCode || "";
    },

    toggle: function(toggle) {
        this.output.toggle(toggle);
    },

    start: function() {
        this.output.start();
    },

    stop: function() {
        this.output.stop();
    },

    restart: function() {
        this.output.restart();
    },

    clear: function() {
        this.output.clear();
    },

    cleanErrors: function(errors) {
        errors = errors.map(function(error) {
            if (!$.isPlainObject(error)) {
                return {
                    row: error.lineno ? error.lineno - 2 : -1,
                    column: 0,
                    text: this.clean(error.message),
                    type: "error",
                    source: "native",
                    priority: 3
                };
            }

            return {
                row: error.row,
                column: error.column,
                text: _.compose(this.prettify, this.clean)(error.text),
                type: error.type,
                lint: error.lint,
                source: error.source
            };
        }.bind(this));

        errors = errors.sort(function(a, b) {
            var diff = a.row - b.row;
            return diff === 0 ? (a.priority || 99) - (b.priority || 99) : diff;
        });

        return errors;
    },

    // This adds html tags around quoted lines so they can be formatted
    prettify: function(str) {
        str = str.split("\"");
        var htmlString = "";
        for (var i = 0; i < str.length; i++) {
            if (str[i].length === 0) {
                continue;
            }

            if (i % 2 === 0) {
                //regular text
                htmlString += "<span class=\"text\">" + str[i] + "</span>";
            } else {
                // text in quotes
                htmlString += "<span class=\"quote\">" + str[i] + "</span>";
            }
        }
        return htmlString;
    },

    clean: function(str) {
        return String(str).replace(/</g, "&lt;");
    },

    toggleErrors: function(errors) {
        var hasErrors = !!errors.length;

        $("#show-errors").toggleClass("ui-state-disabled", !hasErrors);
        $("#output .error-overlay").toggle(hasErrors);

        this.toggle(!hasErrors);

        if (!hasErrors) {
            this.tipbar.hide("Error");
            return;
        }

        if (this.errorDelay) {
            clearTimeout(this.errorDelay);
        }

        this.errorDelay = setTimeout(function() {
            if (errors.length > 0) {
                this.tipbar.show("Error", errors);
            }
        }.bind(this), 1500);
    },

    handleError: function(e) {
        if (this.testing) {
            // Note: Scratchpad challenge checks against the exact translated
            // text "A critical problem occurred..." to figure out whether
            // we hit this case.
            var message = $._("Error: %(message)s", { message: e.message });
            $("#test-errors").text(message).show();
            OutputTester.testContext.assert(false, message,
                $._("A critical problem occurred in your program " +
                    "making it unable to run."));
            return;
        }
    }
};

window.Output = LiveEditorOutput;
window.LiveEditorOutput = LiveEditorOutput;

})();
