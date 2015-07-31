window.LiveEditorOutput = Backbone.View.extend({
    recording: false,
    loaded: false,
    outputs: {},
    lintErrors: [],
    runtimeErrors: [],

    initialize: function(options) {
        this.render();

        this.setPaths(options);

        this.config = new ScratchpadConfig({
            useDebugger: options.useDebugger
        });

        if (options.outputType) {
            this.setOutput(options.outputType);
        }
        
        // Add a timestamp property to the lintErrors and runtimeErrors arrays
        // to keep track of which version of the code the errors are for.  A
        // new timestamp is created when runCode is called and is assigned to
        // lintErrors and runtimeErrors (if there is no lint) when linting and
        // running of the code complete.  The timestamps are used later to 
        // ensure we're not report stale errors that have already been fixed
        // to the parent.  Adding properties to an array works because Array is
        // essentially a special subclass of Object.
        this.lintErrors.timestamp = 0;
        this.runtimeErrors.timestamp = 0;
        
        this.bind();
    },

    render: function() {
        this.$el.html("<div class=\"output\"></div>");
    },

    bind: function() {
        // Handle messages coming in from the parent frame
        window.addEventListener("message",
            this.handleMessage.bind(this), false);
    },

    setOutput: function(outputType) {
        var OutputClass = this.outputs[outputType];
        this.output = new OutputClass({
            el: this.$el.find(".output"),
            config: this.config,
            output: this,
            type: outputType
        });
    },

    setPaths: function(data) {
        if (data.workersDir) {
            this.workersDir = this._qualifyURL(data.workersDir);
            PooledWorker.prototype.workersDir = this.workersDir;
        }
        if (data.externalsDir) {
            this.externalsDir = this._qualifyURL(data.externalsDir);
            PooledWorker.prototype.externalsDir = this.externalsDir;
        }
        if (data.imagesDir) {
            this.imagesDir = this._qualifyURL(data.imagesDir);
        }
        if (data.soundsDir) {
            this.soundsDir = this._qualifyURL(data.soundsDir);
        }
        if (data.redirectUrl) {
            this.redirectUrl = data.redirectUrl;
        }
        if (data.jshintFile) {
            this.jshintFile = this._qualifyURL(data.jshintFile);
            PooledWorker.prototype.jshintFile = this.jshintFile;
        }
    },

    _qualifyURL: function(url){
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    },

    handleMessage: function(event) {
        var data;

        this.frameSource = event.source;
        this.frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActive();

        // filter out events that are objects
        // currently the only messages that contain objects are messages
        // being sent by Poster instances being used by the iframeOverlay
        // in pjs-output.js and ui/debugger.js 
        if (typeof event.data === "object") {
            return;
        }

        try {
            data = JSON.parse(event.data);
        } catch (err) {
            return;
        }
        if (!this.output) {
            var outputType = data.outputType || _.keys(this.outputs)[0];
            this.setOutput(outputType);
        }

        // filter out debugger events
        // handled by pjs-debugger.js::handleMessage
        if (data.type === "debugger") {
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
            this.runCode(data.code, undefined, data.noLint);
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

        // Keep track of recording state
        if (data.recording != null) {
            this.recording = data.recording;
        }

        // Take a screenshot of the output
        if (data.screenshot != null) {
            var screenshotSize = data.screenshotSize || 200;
            this.output.getScreenshot(screenshotSize, function(data) {
                // Send back the screenshot data
                this.postParent(data);
            }.bind(this));
        }

        if (this.output.messageHandlers) {
            for (var prop in data) {
                if (prop in this.output.messageHandlers) {
                    this.output.messageHandlers[prop].call(this.output, data);
                }
            }
        }
    },

    // Send a message back to the parent frame
    postParent: function(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (this.frameSource) {
            this.frameSource.postMessage(
                typeof data === "string" ? data : JSON.stringify(data),
                this.frameOrigin);
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
    },

    /**
     * Performs all steps necessary to run code.
     * - lint
     * - actually run the code
     * - manage lint and runtime errors
     * - call the callback (via buildDone) to run tests
     * 
     * @param userCode: code to run
     * @param callback: used by the tests
     * @param noLint: disables linting if true, first run still lints
     * 
     * TODO(kevinb) return a Deferred and move test related code to test_utils
     */
    runCode: function(userCode, callback, noLint) {
        this.currentCode = userCode;
        var timestamp = Date.now();
        
        this.results = {
            timestamp: timestamp,
            code: userCode,
            errors: [],
            assertions: []
        };
        
        var skip = noLint && this.firstLint;

        // Always lint the first time, so that PJS can populate its list of globals
        this.output.lint(userCode, skip).then(function (lintErrors) {
            this.lintErrors = lintErrors;
            this.lintErrors.timestamp = timestamp;
            return this.lintDone(userCode, timestamp);
        }.bind(this)).then(function () {
            this.buildDone(userCode, callback);
        }.bind(this));
        
        this.firstLint = true;
    },

    /**
     * Runs the code and records runtime errors.  Returns immediately if there
     * are any lint errors.
     * 
     * @param userCode
     * @param timestamp
     * @returns {$.Deferred}
     */
    lintDone: function(userCode, timestamp) {
        var deferred = $.Deferred();
        if (this.lintErrors.length > 0 || this.onlyRunTests) {
            deferred.resolve();
            return deferred;
        }

        // Then run the user's code
        try {
            this.output.runCode(userCode, function(runtimeErrors) {
                this.runtimeErrors = runtimeErrors;
                this.runtimeErrors.timestamp = timestamp;
                deferred.resolve();
            }.bind(this));

        } catch (e) {
            if (this.outputs.hasOwnProperty('pjs')) {
                this.runtimeErrors = [e];
            }
            deferred.resolve();
        }
        return deferred;
    },

    /**
     * Posts results to the the parent frame and runs tests if a callback has 
     * been provided or if the .validate property is set.
     * 
     * @param userCode
     * @param callback
     */
    buildDone: function(userCode, callback) {
        var errors = [];
        // only use lint errors if the timestamp isn't stale
        if (this.results.timestamp === this.lintErrors.timestamp) {
            errors = errors.concat(this.lintErrors);
        }
        // only use runtime errors if the timestamp isn't stale
        if (this.results.timestamp === this.runtimeErrors.timestamp) {
            errors = errors.concat(this.runtimeErrors);
        }
        errors = this.cleanErrors(errors || []);

        if (!this.loaded) {
            this.postParent({ loaded: true });
            this.loaded = true;
        }

        // Update results
        this.results.errors = errors;
        this.phoneHome();

        this.toggle(!errors.length);

        // A callback for working with a test suite
        if (callback) {
            //This is synchronous
            this._test(userCode, this.validate, errors, function(errors, testResults) {
                callback(errors, testResults);
            });
            // Normal case
        } else {
            // This is debounced (async)
            if (this.validate !== "") {
                this.test(userCode, this.validate, errors, function(errors, testResults) {
                    this.results.errors = errors;
                    this.results.tests = testResults;
                    this.phoneHome();
                }.bind(this));
            }
        }
    },

    /**
     * Send the most up to date errors/test results to the parent frame.
     */
    phoneHome: function() {
        this.postParent({
            results: this.results
        });
    },


    test: _.throttle(function() {
        this._test.apply(this, arguments);
    }, 200),
    _test: function(userCode, validate, errors, callback) {
        this.output.test(userCode, validate, errors, callback);
    },

    lint: function(userCode, callback) {
        this.output.lint(userCode, callback);
    },

    getUserCode: function() {
        return this.currentCode || "";
    },

    toggle: function(toggle) {
        if (this.output.toggle) {
            this.output.toggle(toggle);
        }
    },

    restart: function() {
        // This is called on load and it's possible that the output
        // hasn't been set yet.
        if (!this.output) {
            return;
        }

        if (this.output.restart) {
            this.output.restart();
        }

        this.runCode(this.getUserCode());
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
                text: _.compose(this.prettify, this.clean)(
                    error.text || error.message || ""),
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
    }
});

LiveEditorOutput.registerOutput = function(name, output) {
    console.log("hai, called with " + name);
    LiveEditorOutput.prototype.outputs[name] = output;
};
