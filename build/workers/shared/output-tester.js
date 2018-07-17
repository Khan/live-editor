const PooledWorker = require("./pooled-worker.js");

const OutputTester = function() {};

OutputTester.prototype = {
    initialize: function(options) {
        var tester = this;

        this.tests = [];
        this.testContext = {};
        this.externalsDir = options.externalsDir;

        for (var prop in this.testMethods) {
            if (this.testMethods.hasOwnProperty(prop)) {
                this.testContext[prop] = this.testMethods[prop];
            }
        }

        for (var prop in this.defaultTestContext) { /* jshint forin:false */
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
            options.workerFile, options.workersDir,
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
                console.log("externalDir", this.externalsDir);
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

        /* jshint forin:false */
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
                name = i18n._("Test Case");
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

module.exports = OutputTester;