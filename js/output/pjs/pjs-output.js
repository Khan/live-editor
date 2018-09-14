window.PJSOutput = Backbone.View.extend({
    // Canvas mouse events to track
    // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
    trackedMouseEvents: ["move", "over", "out", "down", "up"],

    // Banned Properties
    // Prevent certain properties from being exposed
    bannedProps: {
        externals: true
    },

    initialize: function(options) {
        // Handle recording playback
        this.handlers = {};

        this.config = options.config;
        this.output = options.output;

        this.tester = new PJSTester(_.extend(options, {
            workerFile: "pjs/test-worker.js"
        }));

        this.render();
        this.bind();

        this.build(
            this.$canvas[0],
            options.enableLoopProtect,
            options.loopProtectTimeouts);

        if (this.config.useDebugger && PJSDebugger) {
            iframeOverlay.createRelay(this.$canvas[0]);

            this.debugger = new PJSDebugger({
                context: this.processing,
                output: this
            });
        }

        this.config.on("versionSwitched", function(e, version) {
            this.config.runVersion(version, "processing", this.processing);
        }.bind(this));

        BabyHint.init({
            context: this.processing
        });

        return this;
    },

    render: function() {
        this.$el.empty();
        this.$canvas = $("<canvas>")
            .attr("id", "output-canvas")
            .appendTo(this.el)
            .show();
    },

    bind: function() {
        if (window !== window.top) {
            var windowMethods = ["alert", "open", "showModalDialog",
                "confirm", "prompt", "eval"];
            for (var i = 0, l = windowMethods.length; i < l; i++) {
                window.constructor.prototype[windowMethods[i]] = $.noop;
            }
        }

        if (window !== window.top && Object.freeze &&
                Object.getOwnPropertyDescriptor) {
            // Freezing the whole window, and more specifically
            // window.location, causes a redirect on Safari 6 and 7.
            // Test case: http://ejohn.org/files/freeze-test.html

            // Note that freezing the window object in any way in our test
            // environment will have no side effect, and will remain mutable in
            // every way.

            // Manually freeze everything except for location for the object's
            // own properties. The Object prototype chain will be frozen just
            // after.
            for (var prop in window) {
                // Could be combined into check below, but lint requires it
                // here :(
                if (window.hasOwnProperty(prop)) {
                    // The property descriptor check is needed to avoid some
                    // nasty console messages when trying to freeze non
                    // configurable properties.
                    try {
                        var propDescriptor =
                            Object.getOwnPropertyDescriptor(window, prop);
                        if (!propDescriptor || propDescriptor.configurable) {
                            Object.defineProperty(window, prop, {
                                value: window[prop],
                                writable: false,
                                configurable: false
                            });
                        }
                    } catch(e) {
                        // Couldn't access property for permissions reasons,
                        //  like window.frame
                        // Only happens on prod where it's cross-origin
                    }
                }
            }

            // If possible, prevent further changes to property descriptors and
            // prevent extensibility on window. Most browsers don't support
            // this, unfortunately.
            // TODO(charlie): Look into enforcing this via an AST transform.
            var propDescriptor = Object.getOwnPropertyDescriptor(window);
            if (!propDescriptor || propDescriptor.configurable) {
                Object.freeze(window);
            }

            // Completely lock down window's prototype chain
            Object.freeze(Object.getPrototypeOf(window));
        }

        var offset = this.$canvas.offset();

        // Go through all of the mouse events to track
        _.each(this.trackedMouseEvents, function(name) {
            var eventType = "mouse" + name;

            // Track that event on the Canvas element
            this.$canvas.on(eventType, function(e) {
                // Only log if recording is occurring
                if (this.output.recording) {
                    // Log the command
                    // Track the x/y coordinates of the event
                    var x = e.pageX - offset.left;
                    var y = e.pageY - offset.top;
                    this.output.postParent({
                        log: [name, x, y]
                    });
                }
            }.bind(this));

            // Handle the command during playback
            this.handlers[name] = function(x, y) {
                // Build the clientX and clientY values
                var pageX = x + offset.left;
                var pageY = y + offset.top;
                var clientX = pageX - $(window).scrollLeft();
                var clientY = pageY - $(window).scrollTop();

                // Construct the simulated mouse event
                var evt = document.createEvent("MouseEvents");

                // See: https://developer.mozilla.org/en/DOM/
                //          event.initMouseEvent
                evt.initMouseEvent(eventType, true, true, window, 0,
                    0, 0, clientX, clientY,
                    false, false, false, false,
                    0, document.documentElement);

                // And execute it upon the canvas element
                this.$canvas[0].dispatchEvent(evt);
            }.bind(this);
        }.bind(this));

        // Dynamically set the width and height based upon the size of the
        // window, which could be changed in the parent page
        $(window).on("resize", this.setDimensions);
    },

    /**
     * Create the processing instance, add additional methods, and initialize
     * the code injector.
     *
     * @param {HTMLCanvasElement} canvas
     * @param {Boolean} enableLoopProtect
     * @param {Object} loopProtectTimeouts
     */
    build: function(canvas, enableLoopProtect, loopProtectTimeouts) {
        this.processing = new Processing(canvas, (instance) => {
            instance.draw = this.DUMMY;
        });

        // The reason why we're passing the whole "output" object instead of
        // just imagesDir and soundsDir is because setPaths() is called
        // asynchronously on the first run so we don't actually know the value
        // for those paths yet.
        var resourceCache = new PJSResourceCache({
            canvas: this.processing,
            output: this.output
        });

        var additionalMethods = { Program: {} };

        Object.keys(this.ProgramMethods).forEach((key) => {
            additionalMethods.Program[key] = this.ProgramMethods[key].bind(this);
        });

        // Load JSHint config options
        this.config.runCurVersion("jshint", this);

        this.injector = new PJSCodeInjector({
            processing: this.processing,
            resourceCache: resourceCache,
            infiniteLoopCallback: this.infiniteLoopCallback.bind(this),
            enableLoopProtect: enableLoopProtect,
            JSHint: this.JSHint,
            additionalMethods: additionalMethods,
            loopProtectTimeouts: loopProtectTimeouts,
        });

        this.config.runCurVersion("processing", this.processing);
        this.injector.clear();

        // Trigger the setting of the canvas size immediately
        this.setDimensions();
    },

    /**
     * Used as a placeholder function for the .draw() method on the processing
     * instance because processing doesn't like being without a .draw() method.
     */
    DUMMY: function() {},

    setDimensions: function() {
        var $window = $(window);
        var width = $window.width();
        var height = $window.height();

        if (this.processing &&
            (width !== this.processing.width ||
            height !== this.processing.height)) {
            // Set the canvas element to be the right size
            this.$canvas.width(width).height(height);

            // Set the Processing.js canvas to be the right size
            this.processing.size(width, height);

            // Restart execution
            this.output.restart();
        }
    },

    messageHandlers: {
        // Play back mouse actions
        mouseAction: function(data) {
            data = data.mouseAction;
            this.handlers[data.name](data.x, data.y);
        },

        documentation: function(data) {
            BabyHint.initDocumentation(data.documentation);
        }
    },

    getScreenshot: function(screenshotSize, callback) {
        // We want to resize the image to a thumbnail,
        // which we can do by creating a temporary canvas
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = screenshotSize;
        tmpCanvas.height = screenshotSize;
        tmpCanvas.getContext("2d").drawImage(
            this.$canvas[0], 0, 0, screenshotSize, screenshotSize);

        // Send back the screenshot data
        callback(tmpCanvas.toDataURL("image/png"));
    },

    // Allow programs to have some control over the program running
    // Including being able to dynamically force execute of the tests
    // Or even run their own tests.
    ProgramMethods: {
        settings: function() {
            return this.output.settings || {};
        },

        // Force the program to restart (run again)
        restart: function() {
            this.output.restart();
        },

        // Force the tests to run again
        runTests: function(callback) {
            return this.output.test(this.output.getUserCode(),
                this.output.validate, [], callback);
        },

        assertEqual: function(actual, expected, line, column) {
            if (_.isEqual(actual, expected)) {
                return;
            }

            var msg = i18n._("Assertion failed: " +
                "%(actual)s is not equal to %(expected)s.", {
                    actual: JSON.stringify(actual),
                    expected: JSON.stringify(expected)
            });

            this.output.results.assertions.push({
                row: line - 1, column: column, text: msg
            });
        },

        // Run a single test (specified by a function)
        // and send the results back to the parent frame
        runTest: function(name, fn) {
            if (arguments.length === 1) {
                fn = name;
                name = "";
            }

            var result = !!fn();

            this.output.postParent({
                results: {
                    code: this.output.getUserCode(),
                    errors: [],
                    tests: [{
                        name: name,
                        state: result ? "pass" : "fail",
                        results: []
                    }]
                },
                pass: result
            });
        }
    },

    lint: function(userCode, skip) {
        return this.injector.lint(userCode, skip).then((hintErrors) => {
            let babyErrors = BabyHint.babyErrors(userCode, hintErrors);
            return {
                errors: this.mergeErrors(hintErrors, babyErrors),
                warnings: []
            };
        });
    },

    mergeErrors: function(jshintErrors, babyErrors) {
        var brokenLines = [];
        var prioritizedChars = {};
        var hintErrors = [];

        // Find which lines JSHINT broke on
        _.each(jshintErrors, (error) => {
            if (error && error.line && error.character &&
                error.reason &&
                !/unable to continue/i.test(error.reason)) {
                var realErrorLine = error.line - 2;
                brokenLines.push(realErrorLine);
                // Errors that override BabyLint errors in the remainder of the
                // line. Includes: unclosed string (W112)
                if (error.code === "W112") {
                    error.character = error.evidence.indexOf("\"");
                    if (!prioritizedChars[realErrorLine] ||
                        prioritizedChars[realErrorLine] >
                        error.character - 1) {
                        prioritizedChars[realErrorLine] = error.character - 1;
                    }
                }
                hintErrors.push({
                    row: realErrorLine,
                    column: error.character - 1,
                    text: error.reason,
                    type: "error",
                    lint: error,
                    source: "jshint",
                    priority: 2
                });
            }
        });

        // Only use baby errors if JSHint also broke on those lines OR
        // we want to prevent the user from making this mistake.
        babyErrors = babyErrors.filter((error) =>
            (_.include(brokenLines, error.row) || error.breaksCode) &&
            (!prioritizedChars[error.row] || prioritizedChars[error.row] > error.column)
        ).map(error => {
            return {
                row: error.row,
                column: error.column,
                text: error.text,
                type: "error",
                source: error.source,
                context: error.context,
                priority: 1
            };
        });

        // Check for JSHint and BabyHint errors on the same line and character.
        // Merge error messages where appropriate.
        _.each(hintErrors, (jsError) => {
            _.each(babyErrors, (babyError) => {
                if (jsError.row === babyError.row &&
                    jsError.column === babyError.column) {
                    // Merge if JSLint error says a variable is undefined and
                    // BabyLint has spelling suggestion.
                    if (jsError.lint.code === "W117" &&
                        babyError.source === "spellcheck") {
                        babyError.text = i18n._("\"%(word)s\" is not defined. Maybe you meant to type \"%(keyword)s\", " +
                            "or you're using a variable you didn't define.",
                            {word: jsError.lint.a, keyword: babyError.context.keyword});
                    }
                }
            });
        });

        // Merge JSHint and BabyHint errors
        let errors = babyErrors;
        let babyErrorRows = _.uniq(babyErrors.map(error => error.row));
        hintErrors.forEach(error => {
            // Only add JSHint errors if there isn't already a BabyHint error
            // on that line (row).
            if (!_.contains(babyErrorRows, error.row)) {
                errors.push(error);
            }
        });

        // De-duplicate errors. Replacer tells JSON.stringify to ignore column
        // and lint keys so objects with different columns or lint will still be
        // treated as duplicates.
        var replacer = function(key, value) {
            if (key === "column" || key === "lint") {
                return;
            }
            return value;
        };

        // Stringify objects to compare and de-duplicate.
        return _.uniq(errors, false, (obj) => JSON.stringify(obj, replacer));
    },

    test: function(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        this.tester.testWorker.exec(userCode, tests, errors,
            function(errors, testResults) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    var message = i18n._("Error: %(message)s",
                        {message: errors[errors.length - 1].message});
                    console && console.warn(message);
                    this.tester.testContext.assert(false, message,
                        i18n._("A critical problem occurred in your program " +
                            "making it unable to run."));
                }

                callback(errors, testResults);
            }.bind(this));
    },

    // TODO(kevinb) pass scrubbing location and value so that we can skip parsing
    runCode: function(userCode, callback) {
        this.injector.runCode(userCode, callback);
    },

    restart: function() {
        this.injector.restart();
    },

    toggle: function(doToggle) {
        if (doToggle) {
            this.processing.loop();

        } else {
            this.processing.noLoop();
        }
    },

    kill: function() {
        this.tester.testWorker.kill();
        this.injector.hintWorker.kill();
        this.processing.exit();
    },

    initTests: function(validate) {
        return this.exec(validate, this.tester.testContext);
    },

    infiniteLoopCallback:  function(error) {
        this.output.postParent({
            results: {
                code: this.output.currentCode,
                errors: [error],
            }
        });
        this.KA_INFINITE_LOOP = true;
    }
});

// Add in some static helper methods
_.extend(PJSOutput, {

});

LiveEditorOutput.registerOutput("pjs", PJSOutput);
