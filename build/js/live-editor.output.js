this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Oh noes!";}

function program3(depth0,data) {
  
  
  return "Show me where";}

  buffer += "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n    <div class=\"tipnav\">\n        <a href=\"\" class=\"prev\"><span class=\"ui-icon ui-icon-circle-triangle-w\"></span></a>\n        <span class=\"current-pos\"></span>\n        <a href=\"\" class=\"next\"><span class=\"ui-icon ui-icon-circle-triangle-e\"></span></a>\n    </div>\n    <div class=\"text-wrap\">\n        <div class=\"oh-no\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a></div>\n    </div>\n</div>";
  return buffer;});;
/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

window.TipBar = Backbone.View.extend({
    initialize: function(options) {
        this.output = options.output;
        this.pos = 0;
        this.texts = [];
        this.render();
        this.bind();
    },

    render: function() {
        this.$overlay = $("<div class=\"overlay error-overlay\" style=\"display: none\"></div>").appendTo(this.$el);
        this.$el.append(Handlebars.templates["tipbar"]());
    },

    bind: function() {
        var self = this;

        this.$el.on("click", ".tipbar .tipnav a", function() {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.show();
            }

            self.output.postParent({ focus: true });

            return false;
        });

        this.$el.on("click", ".tipbar .text-wrap a", function() {
            var error = self.texts[self.pos];

            self.output.postParent({ cursor: error });

            return false;
        });
    },

    show: function() {
        var texts = this.errors;

        var pos = this.pos;
        var bar = this.$el.find(".tipbar");

        // Inject current text
        bar
            .find(".current-pos").text(texts.length > 1 ? (pos + 1) + "/" + texts.length : "").end()
            .find(".message").html(texts[pos].text || texts[pos] || "").end()
            .find("a.prev").toggleClass("ui-state-disabled", pos === 0).end()
            .find("a.next").toggleClass("ui-state-disabled", pos + 1 === texts.length).end();

        this.$el.find(".show-me").toggle(texts[pos].row !== -1);

        bar.find(".tipnav").toggle(texts.length > 1);

        // Only animate the bar in if it's not visible
        if (!bar.is(":visible")) {
            bar
                .css({ top: 400, opacity: 0.1 })
                .show()
                .animate({
                    top: this.$el.find(".toolbar").is(":visible") ? 33 : 100,
                    opacity: 0.9},
                    300);
        }
    },

    hide: function() {
        var bar = this.$el.find(".tipbar");
        if (bar.is(':visible')) {
            bar.animate({ top: 400, opacity: 0.1 }, 300, function() {
                $(this).hide();
            });
        }
        clearTimeout(this.errorDelay);
    },

    toggleErrors: function(errors) {
        this.errors = errors;
        var hasErrors = !!errors.length;

        this.$overlay.toggle(hasErrors);

        if (!hasErrors) {
            clearTimeout(this.errorDelay);
            this.hide();
            return;
        }

        this.errorDelay = setTimeout(this.show.bind(this), 1200);
    }
});
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
        //  referencing functions like staticTest and that
        //  function will fill in this.tests
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

        if (test.type === "static") {
            test.fn.call(this);
        }

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

            if (this.curTask) {
                if (state !== "pass") {
                    this.curTask.state = state;
                }

                this.curTask.results.push(item);
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
        this.render();

        this.setPaths(options);

        this.assertions = [];

        this.config = new ScratchpadConfig({});

        if (options.outputType) {
            this.setOutput(options.outputType);
        }

        this.bind();
    },

    render: function() {
        this.$el.html(Handlebars.templates["output"]());
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

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            return;
        }

        if (!this.output) {
            var outputType = data.outputType || _.keys(this.outputs)[0];
            this.setOutput(outputType);
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

        // We evaluate the test code to see if it itself has any syntax errors
        // This also ends up pushing the tests onto this.tests
        var error = this.output.initTests(validate);

        // Display errors encountered while evaluating the test code
        if (error && error.message) {
            this.$el.find(".test-errors").text(error.message).show();
        } else {
            this.$el.find(".test-errors").hide();
        }
    },

    runCode: function(userCode, callback) {
        
        this.currentCode = userCode;

        var runDone = function(errors, testResults) {
            errors = this.cleanErrors(errors || []);

            if (!this.loaded) {
                this.postParent({ loaded: true });
                this.loaded = true;
            }

            // A callback for working with a test suite
            if (callback) {
                callback(errors, testResults);
                return;
            }

            this.postParent({
                results: {
                    code: userCode,
                    errors: errors,
                    tests: testResults || [],
                    assertions: this.assertions
                }
            });

            this.toggle(!errors.length);
        }.bind(this);

        this.lint(userCode, function(errors) {
            // Run the tests (even if there are lint errors)
            this.test(userCode, this.validate, errors, function(errors, testResults) {
                if (errors.length > 0 || this.onlyRunTests) {
                    return runDone(errors, testResults);
                }

                // Then run the user's code
                try {
                    this.output.runCode(userCode, function(errors) {
                        runDone(errors, testResults);
                    });

                } catch (e) {
                    runDone([e], testResults);
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