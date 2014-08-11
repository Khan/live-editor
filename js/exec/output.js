(function() {

// Keep track of the frame source and origin for later
var frameSource;
var frameOrigin;

var LiveEditorOutput = {
    recording: false,

    init: function(options) {
        this.$elem = $(options.el);
        this.render();

        // These are the tests (like challenge tests)
        this.validate = null;
        // These are the outputted errors
        this.errors = [];

        this.context = {};
        this.loaded = false;

        this.config = new ScratchpadConfig({});

        // Load JSHint config options
        this.config.runCurVersion("jshint");

        this.config.on("versionSwitched", function(e, version) {
            this.config.runVersion(version, "processing", Output.output.canvas);
        }.bind(this));

        this.tipbar = new TipBar({
            el: this.$elem[0]
        });

        Output.bind();

        Output.setOutput(options.output);

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

        Output.workersDir = data.workersDir;
        Output.externalsDir = data.externalsDir;
        Output.imagesDir = data.imagesDir;
        Output.jshintFile = data.jshintFile;

        // Validation code to run
        if (data.validate != null) {
            Output.initTests(data.validate);
        }

        // Settings to initialize
        if (data.settings != null) {
            Output.settings = data.settings;
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            Output.runCode(data.code);
        }

        if (data.onlyRunTests != null) {
            Output.onlyRunTests = !!(data.onlyRunTests);
        } else {
            Output.onlyRunTests = false;
        }

        // Restart the output
        if (data.restart) {
            Output.restart();
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
            Output.recording = data.recording;
        }

        // Play back recording
        if (data.action) {
            if (Output.output.handlers[data.name]) {
                Output.output.handlers[data.name](data.action);
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
        if (Output.validate === validate) {
            return;
        }

        // Prime the test queue
        Output.validate = validate;

        // We evaluate the test code to see if it itself has any syntax errors
        // This also ends up pushing the tests onto Output.tests
        var result = Output.exec(validate, OutputTester.testContext);

        // Display errors encountered while evaluating the test code
        if (result && result.message) {
            $("#test-errors").text(result.message).show();
        } else {
            $("#test-errors").hide();
        }
    },

    setOutput: function(output) {
        if (Output.output) {
            Output.output.kill();
        }

        Output.output = output.init({
            config: this.config
        });

        $.extend(Output.testContext, output.testContext);
    },

    getUserCode: function() {
        return Output.currentCode || "";
    },

    // Returns an object that holds all the exposed properties
    // from the current execution environment. The properties will
    // correspond to boolean values: true if it cannot be overriden
    // by the user, false if it can be. See: JSHintGlobalString
    exposedProps: function() {
        return Output.output ? Output.output.props : {};
    },

    // Banned properties
    bannedProps: function() {
        return Output.output ? Output.output.bannedProps : {};
    },

    // Generate a string list of properties
    propListString: function(props) {
        var bannedProps = Output.bannedProps();
        var propList = [];

        for (var prop in props) {
            if (!bannedProps[prop]) {
                propList.push(prop + ":" + props[prop]);
            }
        }

        return propList.join(",");
    },

    runCode: function(userCode, callback) {
        Output.currentCode = userCode;

        // Build a string of options to feed into JSHint
        // All properties are defined in the config
        var hintCode = "/*jshint " +
            Output.propListString(Output.JSHint) + " */" +

            // Build a string of variables names to feed into JSHint
            // This lets JSHint know which variables are globally exposed
            // and which can be overridden, more details:
            // http://www.jshint.com/about/
            // propName: true (is a global property, but can be overridden)
            // propName: false (is a global property, cannot be overridden)
            "/*global " + Output.propListString(Output.exposedProps()) +

            // The user's code to execute
            "*/\n" + userCode;

        var done = function(hintData, hintErrors) {
            Output.hintDone(userCode, hintData, hintErrors, callback);
        };

        // Don't run JSHint if there is no code to run
        if (!userCode) {
            done(null, []);
        } else {
            Output.hintWorker.exec(hintCode, done);
        }
    },

    hintDone: function(userCode, hintData, hintErrors, callback) {
        var externalProps = Output.exposedProps();

        Output.globals = {};
        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in Output.context)) {
                    Output.context[global] = undefined;
                }

                Output.globals[global] = true;
            }
        }

        Output.babyErrors = BabyHint.babyErrors(userCode, hintErrors);

        Output.errors = [];
        Output.mergeErrors(hintErrors, Output.babyErrors);

        var runDone = function() {
            if (!Output.loaded) {
                this.postParent({ loaded: true });
                Output.loaded = true;
            }

            // A callback for working with a test suite
            if (callback) {
                callback(Output.errors);
                return;
            }

            this.postParent({
                results: {
                    code: userCode,
                    errors: Output.errors,
                    tests: Output.testResults || []
                }
            });

            Output.toggleErrors();
        }.bind(this);

        // We only need to extract globals when the code has passed
        // the JSHint check
        Output.globals = {};

        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in Output.context)) {
                    Output.context[global] = undefined;
                }

                Output.globals[global] = true;
            }
        }

        // Run the tests

        var doneWithTests = function() {
            if (Output.errors.length === 0 && !Output.onlyRunTests) {
                // Then run the user's code
                if (Output.output && Output.output.runCode) {
                    try {
                        Output.output.runCode(userCode, Output.context, runDone);

                    } catch (e) {
                        Output.handleError(e);
                        runDone();
                    }

                    return;

                } else {
                    Output.exec(userCode, Output.context);
                }
            }
            runDone();
        };

        Output.testWorker.exec(userCode, Output.validate, Output.errors,
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
                    text: _.compose(Output.prettify, Output.clean)(error.reason),
                    type: "error",
                    lint: error,
                    source: "jshint"
                });
            }
        });

        // Add baby errors if JSHINT also broke on those lines, OR we don't want
        // to allow that error
        _.each(babyErrors, function(error) {
            if (_.include(brokenLines, error.row) || error.breaksCode) {
                Output.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(Output.prettify, Output.clean)(error.text),
                    type: "error",
                    source: error.source
                });
            }
        });

        // Add JSHINT errors at the end
        Output.errors = Output.errors.concat(hintErrors);
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
        var hasErrors = !!Output.errors.length;

        $("#show-errors").toggleClass("ui-state-disabled", !hasErrors);
        $("#output .error-overlay").toggle(hasErrors);

        Output.toggle(!hasErrors);

        if (hasErrors) {
            Output.errors = Output.errors.sort(function(a, b) {
                return a.row - b.row;
            });

            if (Output.errorDelay) {
                clearTimeout(Output.errorDelay);
            }

            Output.errorDelay = setTimeout(function() {
                if (Output.errors.length > 0) {
                    self.tipbar.show("Error", Output.errors);
                }
            }, 1500);

        } else {
            self.tipbar.hide("Error");
        }
    },

    trackFunctions: function() {
        Output.tracking = {};
        Output.fnCalls = [];

        _.each(Output.context, function(fn, prop) {
            if (typeof fn === "function") {
                Output.tracking[prop] = fn;
                Output.context[prop] = function() {
                    var retVal = Output.tracking[prop].apply(
                        Output.context, arguments);

                    // Track the function call
                    Output.fnCalls.push({
                        name: prop,
                        args: Array.prototype.slice.call(arguments),
                        retVal: retVal
                    });

                    return retVal;
                };
            }
        });
    },

    endTrackFunctions: function() {
        _.each(Output.tracking, function(fn, prop) {
            Output.context[prop] = fn;
        });

        Output.tracking = {};
    },

    toggle: function(toggle) {
        if (Output.output && Output.output.toggle) {
            Output.output.toggle(toggle);
        }
    },

    start: function() {
        if (Output.output && Output.output.start) {
            Output.output.start();
        }
    },

    stop: function() {
        if (Output.output && Output.output.stop) {
            Output.output.stop();
        }
    },

    restart: function() {
        if (Output.output && Output.output.restart) {
            Output.output.restart();
        }
    },

    clear: function() {
        if (Output.output && Output.output.clear) {
            Output.output.clear();
        }
    },

    handleError: function(e) {
        if (Output.testing) {
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
        _.each(Output.babyErrors, function(error) {
            if (error.row + 1 === row) {
                Output.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(Output.prettify, Output.clean)(error.text),
                    type: "error"
                });
            }
        });

        Output.errors.push({
            row: row,
            column: 0,
            text: Output.clean(e.message),
            type: "error"
        });

        Output.toggleErrors();
    },

    exec: function(code) {
        if (!code) {
            return true;
        }

        var contexts = Array.prototype.slice.call(arguments, 1);

        function exec_() {
            // this is kind of sort of supposed to fake a gensym that the user can't access
            // but since we're limited to string manipulation, we can't guarantee this fo sho'
            // so we just change the name to something long and random every time the code runs
            // and hope for the best!
            var randomEnvName = function() {
                return "__env__" + Math.floor(Math.random() * 1000000000);
            };

            if (Output.output && Output.output.compile) {
                code = Output.output.compile(code);
            }

            var envName = randomEnvName();

            for (var i = 0; i < contexts.length; i++) {
                if (contexts[i]) {
                    code = "with(" + envName + "[" + i + "]){\n" + code + "\n}";
                }
            }

            // the top-level 'this' is empty except for this.externals, which throws this message
            // this is how users were getting at everything from playing sounds to displaying pop-ups
            var badProgram = $._("This program uses capabilities we've turned off for security reasons. Khan Academy prohibits showing external images, playing sounds, or displaying pop-ups.");
            var topLevelThis = "{ get externals() { throw { message: " + JSON.stringify(badProgram) + " } } }";

            // if we pass in the env as a parameter, the user will be able to get at it
            // through the 'arguments' binding, so we close over it instead
            code = "var " + envName + " = arguments;\n(function(){\n" + code + "\n}).apply(" + topLevelThis + ");";

            (new Function(code)).apply(Output.context, contexts);

            return true;
        }

        try {
            return exec_();

        } catch (e) {
            Output.handleError(e);
            return e;
        }
    },

    // Turn a JavaScript object into a form that can be executed
    // (Note: The form will not necessarily be able to pass a JSON linter)
    // (Note: JSON.stringify might throw an exception. We don't capture it
    //        here as we'll want to deal with it later.)
    stringify: function(obj) {
        // Use toString on functions
        if (typeof obj === "function") {
            return obj.toString();

        // If we're dealing with an instantiated object just
        // use its generated ID
        } else if (obj && obj.__id) {
            return obj.__id();

        // Check if we're dealing with an array
        } else if (obj && Object.prototype.toString.call(obj) === "[object Array]") {
            return Output.stringifyArray(obj);

        // JSON.stringify returns undefined, not as a string, so we specially handle that
        } else if (typeof obj === "undefined") {
                return "undefined";

        // If all else fails, attempt to JSON-ify the string
        // TODO(jeresig): We should probably do recursion to better handle
        // complex objects that might hold instances.
        } else {
            return JSON.stringify(obj, function(k, v) {
                // Don't jsonify the canvas or its context because it can lead
                // to circular jsonification errors on chrome.
                if (v && (v.id !== undefined && v.id === "output-canvas" ||
                        typeof CanvasRenderingContext2D !== "undefined" &&
                        v instanceof CanvasRenderingContext2D)) {
                    return undefined;
                }
                return v;
            });
        }
    },

    // Turn an array into a string list
    // (Especially useful for serializing a list of arguments)
    stringifyArray: function(array) {
        var results = [];

        for (var i = 0, l = array.length; i < l; i++) {
            results.push(Output.stringify(array[i]));
        }

        return results.join(", ");
    },

    // Defer a 'new' on a function for later
    // Makes it possible to generate a unique signature for the
    // instance (see: .__id())
    // Meant to translate:
    // new Foo(a, b, c) into: applyInstance(Foo)(a, b, c)
    applyInstance: function(classFn, className) {
        // Don't wrap it if we're dealing with a built-in object (like RegExp)

        try {
            var funcName = (/^function\s*(\w+)/.exec(classFn) || [])[1];
            if (funcName && window[funcName] === classFn) {
                return classFn;
            }
        } catch(e) {}

        // Make sure a name is set for the class if one has not been set already
        if (!classFn.__name && className) {
            classFn.__name = className;
        }

        // Return a function for later execution.
        return function() {
            var args = arguments;

            // Create a temporary constructor function
            function Class() {
                classFn.apply(this, args);
            }

            // Copy the prototype
            Class.prototype = classFn.prototype;

            // Instantiate the dummy function
            var obj = new Class();

            // Point back to the original function
            obj.constructor = classFn;

            // Generate a semi-unique ID for the instance
            obj.__id = function() {
                return "new " + classFn.__name + "(" +
                    Output.stringifyArray(args) + ")";
            };

            // Keep track of the instances that have been instantiated
            if (Output.instances) {
                Output.instances.push(obj);
            }

            // Return the new instance
            return obj;
        };
    }
};

// TODO(jlfwong): Stop globalizing Output
window.Output = LiveEditorOutput;
window.LiveEditorOutput = LiveEditorOutput;

})();
