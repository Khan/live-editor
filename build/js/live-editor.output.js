window.PooledWorker = function (filename, onExec) {
    this.pool = [];
    this.curID = 0;
    this.filename = filename;
    this.onExec = onExec || function () {};
};

PooledWorker.prototype.getURL = function () {
    return this.workersDir + this.filename + "?cachebust=G" + new Date().toDateString();
};

PooledWorker.prototype.getWorkerFromPool = function () {
    // NOTE(jeresig): This pool of workers is used to cut down on the
    // number of new web workers that we need to create. If the user
    // is typing really fast, or scrubbing numbers, it has the
    // potential to use a lot of workers. We want to re-use as many of
    // them as possible as their creation can be expensive. (Chrome
    // seems to freak out, use lots of memory, and sometimes crash.)
    var worker = this.pool.shift();
    if (!worker) {
        worker = new window.Worker(this.getURL());
    }
    // Keep track of what number worker we're running so that we know
    // if any new hint workers have been started after this one
    this.curID += 1;
    worker.id = this.curID;
    return worker;
};

/* Returns true if the passed in worker is the most recently created */
PooledWorker.prototype.isCurrentWorker = function (worker) {
    return this.curID === worker.id;
};

PooledWorker.prototype.addWorkerToPool = function (worker) {
    // Return the worker back to the pool
    this.pool.push(worker);
};

PooledWorker.prototype.exec = function () {
    this.onExec.apply(this, arguments);
};

PooledWorker.prototype.kill = function () {
    this.pool.forEach(function (worker) {
        worker.terminate();
    }, this);
    this.pool = [];
};
window.OutputTester = function () {};

OutputTester.prototype = {
    initialize: function initialize(options) {
        var tester = this;

        this.tests = [];
        this.testContext = {};

        for (var prop in this.testMethods) {
            if (this.testMethods.hasOwnProperty(prop)) {
                this.testContext[prop] = this.testMethods[prop];
            }
        }

        for (var prop in this.defaultTestContext) {
            /* jshint forin:false */
            if (!(prop in this.testContext)) {
                this.testContext[prop] = this.defaultTestContext[prop];
            }
        }

        // This won't be defined inside a web worker itself (that's ok)
        if (typeof PooledWorker === "undefined") {
            return;
        }

        /*
         * The worker that runs the tests in the background, if possible.
         */
        this.testWorker = new PooledWorker(options.workerFile, function (code, validate, errors, callback) {
            var self = this;

            // If there are syntax errors in the tests themselves,
            //  then we ignore the request to test.
            try {
                tester.exec(validate);
            } catch (e) {
                console.warn(e.message);
                return;
            }

            // If there's no Worker support *or* there
            //  are syntax errors in user code, we do the testing in
            //  the browser instead.
            // We do it in-browser in the latter case as
            //  the code is often in a syntax-error state,
            //  and the browser doesn't like creating that many workers,
            //  and the syntax error tests that we have are fast.
            if (!window.Worker || errors.length > 0) {
                return tester.test(code, validate, errors, callback);
            }

            var worker = this.getWorkerFromPool();

            worker.onmessage = function (event) {
                if (event.data.type === "test") {
                    // PJSOutput.prototype.kill() is called synchronously
                    // from callback so if we want test workers to be
                    // cleaned up properly we need to add them back to the
                    // pool first.
                    // TODO(kevinb) track workers that have been removed
                    // from the PooledWorker's pool so we don't have to
                    // worry about returning workers to the pool before
                    // calling kill()
                    self.addWorkerToPool(worker);
                    if (self.isCurrentWorker(worker)) {
                        var data = event.data.message;
                        callback(data.errors, data.testResults);
                    }
                }
            };

            worker.postMessage({
                code: code,
                validate: validate,
                errors: errors,
                externalsDir: this.externalsDir
            });
        });
    },

    bindTestContext: function bindTestContext(obj) {
        obj = obj || this.testContext;

        /* jshint forin:false */
        for (var prop in obj) {
            if (typeof obj[prop] === "object") {
                this.bindTestContext(obj[prop]);
            } else if (typeof obj[prop] === "function") {
                obj[prop] = obj[prop].bind(this);
            }
        }
    },

    test: function test(userCode, validate, errors, callback) {
        var testResults = [];
        errors = this.errors = errors || [];
        this.userCode = userCode;
        this.tests = [];

        // This will also fill in tests, as it will end up
        // referencing functions like staticTest and that
        // function will fill in this.tests
        this.exec(validate);

        this.curTask = null;
        this.curTest = null;

        for (var i = 0; i < this.tests.length; i++) {
            testResults.push(this.runTest(this.tests[i], i));
        }

        callback(errors, testResults);
    },

    runTest: function runTest(test, i) {
        var result = {
            name: test.name,
            state: "pass",
            results: []
        };

        this.curTest = result;

        test.fn.call(this);

        this.curTest = null;

        return result;
    },

    exec: function exec(code) {
        if (!code) {
            return true;
        }

        code = "with(arguments[0]){\n" + code + "\n}";
        new Function(code).call({}, this.testContext);

        return true;
    },

    defaultTestContext: {
        test: function test(name, _fn, type) {
            if (!_fn) {
                _fn = name;
                name = i18n._("Test Case");
            }

            this.tests.push({
                name: name,

                type: type || "default",

                fn: function fn() {
                    try {
                        return _fn.apply(this, arguments);
                    } catch (e) {
                        console.warn(e);
                    }
                }
            });
        },

        staticTest: function staticTest(name, fn) {
            this.testContext.test(name, fn, "static");
        },

        log: function log(msg, state, expected, type, meta) {
            type = type || "info";

            var item = {
                type: type,
                msg: msg,
                state: state,
                expected: expected,
                meta: meta || {}
            };

            if (this.curTest) {
                if (state !== "pass") {
                    this.curTest.state = state;
                }

                this.curTest.results.push(item);
            }

            return item;
        },

        task: function task(msg, tip) {
            this.curTask = this.testContext.log(msg, "pass", tip, "task");
            this.curTask.results = [];
        },

        endTask: function endTask() {
            this.curTask = null;
        },

        assert: function assert(pass, msg, expected, meta) {
            pass = !!pass;
            this.testContext.log(msg, pass ? "pass" : "fail", expected, "assertion", meta);
            return pass;
        },

        isEqual: function isEqual(a, b, msg) {
            return this.testContext.assert(a === b, msg, [a, b]);
        },

        /*
         * Returns a pass result with an optional message
         */
        pass: function pass(message) {
            return {
                success: true,
                message: message
            };
        },

        /*
         * Returns a fail result with an optional message
         */
        fail: function fail(message) {
            return {
                success: false,
                message: message
            };
        },

        /*
         * If any of results passes, returns the first pass. Otherwise, returns
         * the first fail.
         */
        anyPass: function anyPass() {
            return _.find(arguments, this.testContext.passes) || arguments[0] || this.testContext.fail();
        },

        /*
         * If any of results fails, returns the first fail. Otherwise, returns
         * the first pass.
         */
        allPass: function allPass() {
            return _.find(arguments, this.testContext.fails) || arguments[0] || this.testContext.pass();
        },

        /*
         * Returns true if the result represents a pass.
         */
        passes: function passes(result) {
            return result.success;
        },

        /*
         * Returns true if the result represents a fail.
         */
        fails: function fails(result) {
            return !result.success;
        }
    }
};
// TODO(kevinb) remove after challenges have been converted to use i18n._
$._ = i18n._;

window.LiveEditorOutput = Backbone.View.extend({
    recording: false,
    loaded: false,
    outputs: {},
    lintErrors: [],
    runtimeErrors: [],
    lintWarnings: [],

    initialize: function initialize(options) {
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

    render: function render() {
        this.$el.html("<div class=\"output\"></div>");
    },

    bind: function bind() {
        // Handle messages coming in from the parent frame
        window.addEventListener("message", this.handleMessage.bind(this), false);
    },

    setOutput: function setOutput(outputType, enableLoopProtect, loopProtectTimeouts) {
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

    setPaths: function setPaths(data) {
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

    _qualifyURL: function _qualifyURL(url) {
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    },

    handleMessage: function handleMessage(event) {
        var data;

        this.frameSource = event.source;
        this.frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActive();

        // filter out events that are objects
        // currently the only messages that contain objects are messages
        // being sent by Poster instances being used by the iframeOverlay
        // in pjs-output.js
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
            this.onlyRunTests = !!data.onlyRunTests;
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
            this.output.getScreenshot(screenshotSize, (function (data) {
                // Send back the screenshot data
                this.postParent(data);
            }).bind(this));
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
    postParent: function postParent(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (this.frameSource) {
            var parentWindow = this.frameSource;
            // In Chrome on dev when postFrame is called from webapp's
            // scratchpad package it is somehow executed from the iframe
            // instead, so frameSource is not really the parent frame.  We
            // detect that here and fix it.
            // TODO(james): Figure out why this is and if there is a better
            // place to put a fix.
            if (this.frameSource === window) {
                parentWindow = this.frameSource.parent;
            }

            parentWindow.postMessage(typeof data === "string" ? data : JSON.stringify(data), this.frameOrigin);
        }
    },

    notifyActive: _.once(function () {
        this.postParent({ active: true });
    }),

    // This function stores the new tests on the validate property
    //  and it executes the test code to see if its valid
    initTests: function initTests(validate) {
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
    jsonifyError: function jsonifyError(error) {
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
                priority: 3
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
    runCode: function runCode(userCode, callback, noLint) {
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
        this.output.lint(userCode, skip).then((function (lintResults) {
            this.lintErrors = lintResults.errors;
            this.lintErrors.timestamp = timestamp;
            this.lintWarnings = lintResults.warnings;
            this.lintWarnings.timestamp = timestamp;
            return this.lintDone(userCode, timestamp);
        }).bind(this)).then((function () {
            this.buildDone(userCode, callback);
        }).bind(this));

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
    lintDone: function lintDone(userCode, timestamp) {
        var deferred = $.Deferred();
        if (this.lintErrors.length > 0 || this.onlyRunTests) {
            deferred.resolve();
            return deferred;
        }

        // Then run the user's code
        try {
            this.output.runCode(userCode, (function (runtimeErrors) {
                this.runtimeErrors = runtimeErrors;
                this.runtimeErrors.timestamp = timestamp;
                deferred.resolve();
            }).bind(this));
        } catch (e) {
            if (this.outputs.hasOwnProperty("pjs")) {
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
    buildDone: function buildDone(userCode, callback) {
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
            this._test(userCode, this.validate, errors, function (errors, testResults) {
                callback(errors, testResults);
            });
            // Normal case
        } else {
            // This is debounced (async)
            if (this.validate !== "") {
                this.test(userCode, this.validate, errors, (function (errors, testResults) {
                    this.results.errors = errors;
                    this.results.tests = testResults;
                    this.phoneHome();
                }).bind(this));
            }
        }
    },

    /**
     * Send the most up to date errors/test results to the parent frame.
     */
    phoneHome: function phoneHome() {
        this.postParent({
            results: this.results
        });
    },

    test: _.throttle(function () {
        this._test.apply(this, arguments);
    }, 200),
    _test: function _test(userCode, validate, errors, callback) {
        this.output.test(userCode, validate, errors, callback);
    },

    lint: function lint(userCode, callback) {
        this.output.lint(userCode, callback);
    },

    getUserCode: function getUserCode() {
        return this.currentCode || "";
    },

    toggle: function toggle(_toggle) {
        if (this.output.toggle) {
            this.output.toggle(_toggle);
        }
    },

    restart: function restart() {
        // This is called on load and it's possible that the output
        // hasn't been set yet.
        if (!this.output) {
            return;
        }

        if (this.output.restart) {
            this.output.restart();
        }

        this.runCode(this.getUserCode());
    }
});

LiveEditorOutput.registerOutput = function (name, output) {
    LiveEditorOutput.prototype.outputs[name] = output;
};

if (typeof exports !== "undefined") {
    exports.LiveEditorOutput = LiveEditorOutput;
}
