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
        // These are the outputted errors
        this.errors = [];

        this.assertions = [];

        this.context = {};
        this.loaded = false;

        this.config = new ScratchpadConfig({});

        // Load JSHint config options
        this.config.runCurVersion("jshint");

        this.config.on("versionSwitched", function(e, version) {
            this.config.runVersion(version, "processing", this.output.canvas);
        }.bind(this));

        this.tipbar = new TipBar({
            el: this.$elem[0]
        });

        this.bind();

        this.setOutput(options.output);

        BabyHint.init();
    },

    render: function() {
        this.$elem.html(Handlebars.templates["output"]());
    },

    bind: function() {      
        if (window !== window.top) {
            window.alert = $.noop;
            window.open = $.noop;
            window.showModalDialog = $.noop;
            window.confirm = $.noop;
            window.prompt = $.noop;
            window.eval = $.noop;
        }

        // Handle messages coming in from the parent frame
        window.addEventListener("message",
            this.handleMessage.bind(this), false);
    },


    setPaths: function(data) {
        if (data.workersDir) {
            this.workersDir = this._qualifyURL(data.workersDir);
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
        var result = this.exec(validate, OutputTester.testContext);

        // Display errors encountered while evaluating the test code
        if (result && result.message) {
            $("#test-errors").text(result.message).show();
        } else {
            $("#test-errors").hide();
        }
    },

    setOutput: function(output) {
        if (this.output) {
            this.output.kill();
        }

        this.output = output.init({
            config: this.config
        });

        $.extend(this.testContext, output.testContext);
    },

    getUserCode: function() {
        return this.currentCode || "";
    },

    // Returns an object that holds all the exposed properties
    // from the current execution environment. The properties will
    // correspond to boolean values: true if it cannot be overriden
    // by the user, false if it can be. See: JSHintGlobalString
    exposedProps: function() {
        return this.output ? this.output.props : {};
    },

    // Banned properties
    bannedProps: function() {
        return this.output ? this.output.bannedProps : {};
    },

    // Generate a string list of properties
    propListString: function(props) {
        var bannedProps = this.bannedProps();
        var propList = [];

        for (var prop in props) {
            if (!bannedProps[prop]) {
                propList.push(prop + ":" + props[prop]);
            }
        }

        return propList.join(",");
    },

    runCode: function(userCode, callback) {
        this.currentCode = userCode;

        // Build a string of options to feed into JSHint
        // All properties are defined in the config
        var hintCode = "/*jshint " +
            this.propListString(this.JSHint) + " */" +

            // Build a string of variables names to feed into JSHint
            // This lets JSHint know which variables are globally exposed
            // and which can be overridden, more details:
            // http://www.jshint.com/about/
            // propName: true (is a global property, but can be overridden)
            // propName: false (is a global property, cannot be overridden)
            "/*global " + this.propListString(this.exposedProps()) +

            // The user's code to execute
            "*/\n" + userCode;

        var done = function(hintData, hintErrors) {
            this.hintDone(userCode, hintData, hintErrors, callback);
        }.bind(this);

        // Don't run JSHint if there is no code to run
        if (!userCode) {
            done(null, []);
        } else {
            this.hintWorker.exec(hintCode, done);
        }
    },

    hintDone: function(userCode, hintData, hintErrors, callback) {
        var externalProps = this.exposedProps();

        this.globals = {};
        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in this.context)) {
                    this.context[global] = undefined;
                }

                this.globals[global] = true;
            }
        }
        this.assertions = [];

        this.babyErrors = BabyHint.babyErrors(userCode, hintErrors);

        this.errors = [];
        this.mergeErrors(hintErrors, this.babyErrors);

        var runDone = function() {
            if (!this.loaded) {
                this.postParent({ loaded: true });
                this.loaded = true;
            }

            // A callback for working with a test suite
            if (callback) {
                callback(this.errors);
                return;
            }
            this.postParent({
                results: {
                    code: userCode,
                    errors: this.errors,
                    tests: this.testResults || [],
                    assertions: this.assertions
                }
            });

            this.toggleErrors();
        }.bind(this);

        // We only need to extract globals when the code has passed
        // the JSHint check
        this.globals = {};

        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in this.context)) {
                    this.context[global] = undefined;
                }

                this.globals[global] = true;
            }
        }

        // Run the tests

        var doneWithTests = function() {
            if (this.errors.length === 0 && !this.onlyRunTests) {
                // Then run the user's code
                if (this.output && this.output.runCode) {
                    try {
                        this.output.runCode(userCode, this.context, runDone);

                    } catch (e) {
                        this.handleError(e);
                        runDone();
                    }

                    return;

                } else {
                    this.exec(userCode, this.context);
                }
            }
            runDone();
        }.bind(this);

        this.testWorker.exec(userCode, this.validate, this.errors,
            doneWithTests);
    },

    mergeErrors: function(jshintErrors, babyErrors) {
        var brokenLines = [];
        var hintErrors = [];

        // Find which lines JSHINT broke on
        _.each(jshintErrors, function(error) {
            if (error && error.line && error.character &&
                    error.reason &&
                    !/unable to continue/i.test(error.reason)) {
                brokenLines.push(error.line - 2);
                hintErrors.push({
                    row: error.line - 2,
                    column: error.character - 1,
                    text: _.compose(this.prettify, this.clean)(error.reason),
                    type: "error",
                    lint: error,
                    source: "jshint"
                });
            }
        }.bind(this));

        // Add baby errors if JSHINT also broke on those lines, OR we don't want
        // to allow that error
        _.each(babyErrors, function(error) {
            if (_.include(brokenLines, error.row) || error.breaksCode) {
                this.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(this.prettify, this.clean)(error.text),
                    type: "error",
                    source: error.source
                });
            }
        }.bind(this));

        // Add JSHINT errors at the end
        this.errors = this.errors.concat(hintErrors);
    },

    // This adds html tags around quoted lines so they can be formatted
    prettify: function(str) {
        str = str.split("\"");
        var htmlString = "";
        for (var i = 0; i < str.length; i++) {
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

    toggleErrors: function() {
        var self = this;
        var hasErrors = !!this.errors.length;

        $("#show-errors").toggleClass("ui-state-disabled", !hasErrors);
        $("#output .error-overlay").toggle(hasErrors);

        this.toggle(!hasErrors);

        if (hasErrors) {
            this.errors = this.errors.sort(function(a, b) {
                return a.row - b.row;
            });

            if (this.errorDelay) {
                clearTimeout(this.errorDelay);
            }

            this.errorDelay = setTimeout(function() {
                if (this.errors.length > 0) {
                    self.tipbar.show("Error", this.errors);
                }
            }.bind(this), 1500);

        } else {
            self.tipbar.hide("Error");
        }
    },

    toggle: function(toggle) {
        if (this.output && this.output.toggle) {
            this.output.toggle(toggle);
        }
    },

    start: function() {
        if (this.output && this.output.start) {
            this.output.start();
        }
    },

    stop: function() {
        if (this.output && this.output.stop) {
            this.output.stop();
        }
    },

    restart: function() {
        if (this.output && this.output.restart) {
            this.output.restart();
        }
    },

    clear: function() {
        if (this.output && this.output.clear) {
            this.output.clear();
        }
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

        var row = e.lineno ? e.lineno - 2 : -1;

        // Show babyHint errors first
        _.each(this.babyErrors, function(error) {
            if (error.row + 1 === row) {
                this.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(this.prettify, this.clean)(error.text),
                    type: "error"
                });
            }
        });

        this.errors.push({
            row: row,
            column: 0,
            text: this.clean(e.message),
            type: "error"
        });

        this.toggleErrors();
    },

    exec: function() {
        if (!this.output.exec) {
            return true;
        }

        try {
            return this.output.exec.apply(this.output, arguments);

        } catch (e) {
            this.handleError(e);
            return e;
        }
    }
};

window.Output = LiveEditorOutput;
window.LiveEditorOutput = LiveEditorOutput;

})();
