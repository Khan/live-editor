this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["output"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div class=\"output\"></div>\n<div class=\"test-errors\" style=\"display: none;\"></div>";});;
var PooledWorker = function(filename, onExec) {
    this.pool = [];
    this.curID = 0;
    this.filename = filename;
    this.onExec = onExec || function() {};
};

PooledWorker.prototype.getURL = function() {
    return this.workersDir + this.filename +
        "?cachebust=G" + (new Date()).toDateString();
};

PooledWorker.prototype.getWorkerFromPool = function() {
    // NOTE(jeresig): This pool of workers is used to cut down on the
    // number of new web workers that we need to create. If the user
    // is typing really fast, or scrubbing numbers, it has the
    // potential to use a lot of workers. We want to re-use as many of
    // them as possible as their creation can be expensive. (Chrome
    // seems to freak out, use lots of memory, and sometimes crash.)
    var worker = this.pool.shift();
    if (!worker) {
        console.log("creating a new worker");
        worker = new window.Worker(this.getURL());
    }
    // Keep track of what number worker we're running so that we know
    // if any new hint workers have been started after this one
    this.curID += 1;
    worker.id = this.curID;
    return worker;
};

/* Returns true if the passed in worker is the most recently created */
PooledWorker.prototype.isCurrentWorker = function(worker) {
    return this.curID === worker.id;
};

PooledWorker.prototype.addWorkerToPool = function(worker) {
    // Return the worker back to the pool
    this.pool.push(worker);
};

PooledWorker.prototype.exec = function() {
    this.onExec.apply(this, arguments);
};
window.OutputTester = function() {};

OutputTester.prototype = {
    initialize: function(options) {
        var tester = this;

        this.tests = [];
        this.testContext = {};

        for (var prop in this.testMethods) {
            if (this.testMethods.hasOwnProperty(prop)) {
                this.testContext[prop] = this.testMethods[prop];
            }
        }

        for (var prop in this.defaultTestContext) {
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
        this.testWorker = new PooledWorker(
            options.workerFile,
            function(code, validate, errors, callback) {
                var self = this;

                // If there are syntax errors in the tests themselves,
                //  then we ignore the request to test.
                try {
                    tester.exec(validate);
                } catch(e) {
                    if (window.console) {
                        console.warn(e.message);
                    }
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

                worker.onmessage = function(event) {
                    if (event.data.type === "test") {
                        if (self.isCurrentWorker(worker)) {
                            var data = event.data.message;
                            callback(data.errors, data.testResults);
                        }
                        self.addWorkerToPool(worker);
                    }
                };

                worker.postMessage({
                    code: code,
                    validate: validate,
                    errors: errors,
                    externalsDir: this.externalsDir
                });
            }
        );
    },

    bindTestContext: function(obj) {
        obj = obj || this.testContext;

        for (var prop in obj) {
            if (typeof obj[prop] === "object") {
                this.bindTestContext(obj[prop]);
            } else if (typeof obj[prop] === "function") {
                obj[prop] = obj[prop].bind(this);
            }
        }
    },

    test: function(userCode, validate, errors, callback) {
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

    runTest: function(test, i) {
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

    exec: function(code) {
        if (!code) {
            return true;
        }

        code = "with(arguments[0]){\n" + code + "\n}";
        (new Function(code)).call({}, this.testContext);

        return true;
    },

    defaultTestContext: {
        test: function(name, fn, type) {
            if (!fn) {
                fn = name;
                name = $._("Test Case");
            }

            this.tests.push({
                name: name,

                type: type || "default",

                fn: function() {
                    try {
                        return fn.apply(this, arguments);
                    } catch (e) {
                        if (window.console) {
                            console.warn(e);
                        }
                    }
                }
            });
        },

        staticTest: function(name, fn) {
            this.testContext.test(name, fn, "static");
        },

        log: function(msg, state, expected, type, meta) {
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

        task: function(msg, tip) {
            this.curTask = this.testContext.log(msg,
                "pass", tip, "task");
            this.curTask.results = [];
        },

        endTask: function() {
            this.curTask = null;
        },

        assert: function(pass, msg, expected, meta) {
            pass = !!pass;
            this.testContext.log(msg, pass ? "pass" : "fail",
                expected, "assertion", meta);
            return pass;
        },

        isEqual: function(a, b, msg) {
            return this.testContext.assert(a === b, msg, [a, b]);
        },

        /*
         * Returns a pass result with an optional message
         */
        pass: function(message) {
            return {
                success: true,
                message: message
            };
        },

        /*
         * Returns a fail result with an optional message
         */
        fail: function(message) {
            return {
                success: false,
                message: message
            };
        },

        /*
         * If any of results passes, returns the first pass. Otherwise, returns
         * the first fail.
         */
        anyPass: function() {
            return _.find(arguments, this.testContext.passes) || arguments[0] ||
                this.testContext.fail();
        },

        /*
         * If any of results fails, returns the first fail. Otherwise, returns
         * the first pass.
         */
        allPass: function() {
            return _.find(arguments, this.testContext.fails) || arguments[0] ||
                this.testContext.pass();
        },

        /*
         * Returns true if the result represents a pass.
         */
        passes: function(result) {
            return result.success;
        },

        /*
         * Returns true if the result represents a fail.
         */
        fails: function(result) {
            return !result.success;
        }
    }
};
window.LiveEditorOutput = Backbone.View.extend({
    recording: false,
    loaded: false,
    outputs: {},

    initialize: function(options) {
        $.get(options.workersDir + "deps.json", function(data) {
            var jshintDeps = JSON.stringify({
                "es5-shim.js": data["es5-shim.js"],
                "jshint.js": data["jshint.js"],
                "underscore.js": data["underscore.js"]
            });

            var workerDeps = JSON.stringify({
                "processing-stubs.js": data["processing-stubs.js"],
                "program-stubs.js": data["program-stubs.js"]
            });
            
            this.output.deps = data;

            this.output.hintWorker = new PooledWorker(
                "pjs/jshint-worker.js",
                function(hintCode, callback) {
                    // Fallback in case of no worker support
                    if (!window.Worker) {
                        JSHINT(hintCode);
                        callback(JSHINT.data(), JSHINT.errors);
                        return;
                    }

                    var worker = this.getWorkerFromPool();

                    worker.onmessage = function(event) {
                        if (event.data.type === "jshint") {
                            // If a new request has come in since the worker started
                            // then we just ignore the results and don't fire the callback
                            if (this.isCurrentWorker(worker)) {
                                var data = event.data.message;
                                callback(data.hintData, data.hintErrors);
                            }
                            this.addWorkerToPool(worker);
                        }
                    }.bind(this);

                    worker.postMessage({
                        deps: jshintDeps,
                        code: hintCode,
                        externalsDir: this.externalsDir,
                        jshintFile: this.jshintFile
                    });
                }
            );

            this.output.worker = new PooledWorker(
                "pjs/worker.js",
                function(userCode, context, callback) {
                    var timeout;
                    var worker = this.getWorkerFromPool();

                    var done = function(e) {
                        if (timeout) {
                            clearTimeout(timeout);
                        }

                        if (worker) {
                            this.addWorkerToPool(worker);
                        }

                        if (e) {
                            // Make sure that the caller knows that we're done
                            callback([e]);
                        } else {
                            callback([], userCode);
                        }
                    }.bind(this);

                    worker.onmessage = function(event) {
                        // Execution of the worker has begun so we wait for it...
                        if (event.data.execStarted) {
                            // If the thread doesn't finish executing quickly, kill it
                            // and don't execute the code
                            timeout = window.setTimeout(function() {
                                worker.terminate();
                                worker = null;
                                done({message:
                                    $._("The program is taking too long to run. " +
                                    "Perhaps you have a mistake in your code?")});
                            }, 500);

                        } else if (event.data.type === "end") {
                            done();

                        } else if (event.data.type === "error") {
                            done({message: event.data.message});
                        }
                    };

                    worker.onerror = function(event) {
                        event.preventDefault();
                        done(event);
                    };

                    try {
                        worker.postMessage({
                            deps: workerDeps,
                            code: userCode,
                            context: context
                        });
                    } catch (e) {
                        // TODO: Object is too complex to serialize, try to find
                        // an alternative workaround
                        done();
                    }
                }
            )
        }.bind(this));

        this.render();

        this.setPaths(options);

        this.config = new ScratchpadConfig({
            useDebugger: options.useDebugger
        });

        if (options.outputType) {
            this.setOutput(options.outputType);
            console.log("set output");
        }

        this.output.globals = {};

        // see if there are any images we should load
        // right now we're keeping this list in localStorage,
        // but really it should be injected into output.html
        // along with the code when output.html is loaded
        if (window.localStorage.imageFilenames) {
            var imageFilenames = JSON.parse(window.localStorage.imageFilenames);
            this.output.cacheImages(imageFilenames, function () {
                this.output.injectCode(options.code, function(errors) {
                    console.log(errors);
                });
            }.bind(this));
        } else {
            this.output.injectCode(options.code, function (errors) {
                console.log(errors);
            });
        }

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
            this.runCode(data.code, undefined, data.cursor, data.noLint);
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

    runCode: function(userCode, callback, cursor, noLint) {
        this.currentCode = userCode;

        this.results = {
            code: userCode,
            errors: [],
            assertions: []
        };
        this.lastSent = undefined;

        var buildDone = function(errors) {
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
                    return;
                });
            // Normal case
            } else {
                // This is debounced (async)
                this.test(userCode, this.validate, errors, function(errors, testResults) {
                    this.results.errors = errors;
                    this.results.tests = testResults;
                    this.phoneHome();
                }.bind(this));
            }
        }.bind(this);

        var lintDone = function(errors) {
            if (errors.length > 0 || this.onlyRunTests) {
                return buildDone(errors);
            }

            // Then run the user's code
            try {
                this.output.runCode(userCode, function(errors) {
                    buildDone(errors);
                }, cursor);

            } catch (e) {
                buildDone([e]);
            }
        }.bind(this);

        // Always lint the first time, so that PJS can populate its list of globals
        if (noLint && this.firstLint) {
            lintDone([]);
        } else {
            this.lint(userCode, lintDone);
            this.firstLint = true;
        }
    },

    /**
     * Send the most up to date errors/test results to the parent frame
     */
    phoneHome: function() {
        // Our handling of errors is leaky.
        // In the old design errors were passed from function to function 
        // via arguments to callbacks. Recently I have added asynchronous sources 
        // of errors such as those from breaking out of an infinite loop.
        // These two different mechanisms mean that it's possible for errors to 
        // get lost, but it can't be fixed without rewriting how all of the callbacks
        // work. As a work around if we ever see an error, never erase it.
        // I made the judgement that rather than trying to merge the two it's ok if 
        // earlier errors cover newer ones, since once the user fixes the earlier errors 
        // the new ones will appear, meaning we never leave the user stuck wondering what to do. 
        // I expect that to be good enough compromise.
        if (this.lastSent && this.lastSent.errors && this.lastSent.errors.length) {
            this.results.errors = this.lastSent.errors;
        } 
        this.postParent({
            results: this.results
        });
        this.lastSent = JSON.parse(JSON.stringify(this.results));
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
    LiveEditorOutput.prototype.outputs[name] = output;
};
