import _ from "underscore";
import $ from "jquery";
import Backbone from "backbone";
Backbone.$ = $;

import PooledWorker from "./pooled-worker.js";
import ScratchpadConfig from "../../shared/config.js";

const LiveEditorOutput = Backbone.View.extend({
    recording: false,
    loaded: false,
    outputs: {},
    lintErrors: [],
    runtimeErrors: [],
    lintWarnings: [],

    initialize: function(options) {
        this.render();

        this.setPaths(options);

        this.config = new ScratchpadConfig({});

        if (options.outputType) {
            this.setOutput(options.outputType, true, options.loopProtectTimeouts);
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
        this.lintWarnings.timestamp = 0;

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

    setOutput: function(outputType, enableLoopProtect, loopProtectTimeouts) {
        var OutputClass = this.outputs[outputType];
        this.output = new OutputClass({
            el: this.$el.find(".output"),
            config: this.config,
            output: this,
            type: outputType,
            enableLoopProtect: enableLoopProtect,
            loopProtectTimeouts: loopProtectTimeouts
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
            var enableLoopProtect = true;
            if (data.enableLoopProtect != null) {
                enableLoopProtect = data.enableLoopProtect;
            }
            var loopProtectTimeouts = {
                initialTimeout: 2000,
                frameTimeout: 500
            };
            if (data.loopProtectTimeouts != null) {
                loopProtectTimeouts = data.loopProtectTimeouts;
            }
            this.setOutput(outputType, enableLoopProtect, loopProtectTimeouts);
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
            let parentWindow = this.frameSource;
            // In Chrome on dev when postFrame is called from webapp's
            // scratchpad package it is somehow executed from the iframe
            // instead, so frameSource is not really the parent frame.  We
            // detect that here and fix it.
            // TODO(james): Figure out why this is and if there is a better
            // place to put a fix.
            if (this.frameSource === window) {
                parentWindow = this.frameSource.parent;
            }

            parentWindow.postMessage(
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
     * Converts an error to something that will JSONify usefully
     *
     * JS error objects JSONify to an empty object, so we need to convert them
     * to a plain object ourselves first.  Since we'll end up doing some
     * conversion of the format to better match jshint errors anyway, we'll
     * just do that here too.  But sanitization will happen outside the iframe,
     * since any code here can be bypassed by the user.
     *
     * @param {*} error: the error to JSONify
     * @returns {*}
     */
    jsonifyError: function(error) {
        if (typeof error !== "object" || $.isPlainObject(error)) {
            // If we're not an object, or we're a plain object, we don't need
            // to do anything.
            return error;
        } else {
            return {
                row: error.lineno ? error.lineno - 2 : -1,
                column: 0,
                text: error.message,
                type: "error",
                source: "native",
                priority: 3,
            };
        }
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
            assertions: [],
            warnings: []
        };

        var skip = noLint && this.firstLint;

        // Always lint the first time, so that PJS can populate its list of globals
        this.output.lint(userCode, skip).then(function (lintResults) {
            this.lintErrors = lintResults.errors;
            this.lintErrors.timestamp = timestamp;
            this.lintWarnings = lintResults.warnings;
            this.lintWarnings.timestamp = timestamp;
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
        var warnings = [];

        // only use lint errors if the timestamp isn't stale
        if (this.results.timestamp === this.lintErrors.timestamp) {
            errors = errors.concat(this.lintErrors);
        }
        // only use runtime errors if the timestamp isn't stale
        if (this.results.timestamp === this.runtimeErrors.timestamp) {
            errors = errors.concat(this.runtimeErrors);
        }
        // only use lint warnings if the timestamp isn't stale
        if (this.results.timestamp === this.lintWarnings.timestamp) {
            warnings = warnings.concat(this.lintWarnings);
        }

        errors = errors || [];
        errors = errors.map(this.jsonifyError);

        if (!this.loaded) {
            this.postParent({ loaded: true });
            this.loaded = true;
        }

        // Update results
        this.results.errors = errors;
        this.results.warnings = warnings;
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
});

LiveEditorOutput.registerOutput = function(name, output) {
    LiveEditorOutput.prototype.outputs[name] = output;
};

export default LiveEditorOutput;