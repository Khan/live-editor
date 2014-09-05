window.PJSOutput = Backbone.View.extend({
    // Canvas mouse events to track
    // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
    trackedMouseEvents: ["move", "over", "out", "down", "up"],

    // Banned Properties
    // Prevent certain properties from being exposed
    bannedProps: {
        externals: true
    },

    // Methods that trigger the draw loop
    drawLoopMethods: ["draw", "mouseClicked", "mouseDragged", "mouseMoved",
        "mousePressed", "mouseReleased", "mouseScrolled", "mouseOver",
        "mouseOut", "touchStart", "touchEnd", "touchMove", "touchCancel",
        "keyPressed", "keyReleased", "keyTyped"],

    // During live coding all of the following state must be reset
    // when it's no longer used.
    liveReset: {
        background: [255, 255, 255],
        colorMode: [1],
        ellipseMode: [3],
        fill: [255, 255, 255],
        frameRate: [60],
        imageMode: [0],
        rectMode: [0],
        stroke: [0, 0, 0],
        strokeCap: ["round"],
        strokeWeight: [1],
        textAlign: [37, 0],
        textAscent: [9],
        textDescent: [12],
        textFont: ["Arial", 12],
        textLeading: [14],
        textSize: [12]
    },

    initialize: function(options) {
        // Handle recording playback
        this.handlers = {};

        this.config = options.config;
        this.output = options.output;

        this.render();
        this.bind();

        this.build(this.$canvas[0]);

        this.reseedRandom();
        this.lastGrab = null;

        // If a list of exposed properties hasn't been generated before
        if (!this.props) {
            // this.props holds the names of the properties which
            // are to be exposed by Processing.js to the user.
            var externalProps = this.props = {},

                // this.safeCalls holds the names of the properties
                // which are functions which appear to not have any
                // side effects when called.
                safeCalls = this.safeCalls = {};

            // Make sure that only certain properties can be manipulated
            for (var processingProp in this.canvas) {
                // Processing.js has some "private" methods (beginning with __)
                // these shouldn't be exposed to the user.
                if (processingProp.indexOf("__") < 0) {
                    var value = this.canvas[processingProp],
                        isFunction = (typeof value === "function");

                    // If the property is a function or begins with an uppercase
                    // character (as is the case for constants in Processing.js)
                    // or is height/width (overriding them breaks stuff)
                    // or is a key-related function (as in keyPressed)
                    // then the user should not be allowed to override the
                    // property (restricted by JSHINT).
                    externalProps[processingProp] =
                        !(/^[A-Z]/.test(processingProp) ||
                            processingProp === "height" ||
                            processingProp === "width" ||
                            processingProp === "key" ||
                            isFunction && processingProp.indexOf("key") < 0);

                    // Find the functions which could be safe to call
                    // (in that they have no side effects when called)
                    if (isFunction) {
                        try {
                            // Serialize the function into a string
                            var strValue = String(value);

                            // Determine if a function has any side effects
                            // (a "side effect" being something that changes
                            //  state in the Processing.js environment)
                            //  - If it's a native method then it doesn't have
                            //    any Processing side effects.
                            //  - Otherwise it's a Processing method so we need
                            //    to make sure it:
                            //      (1) returns a value,
                            //      (2) that it doesn't call any other
                            //          Processing functions, and
                            //      (3) doesn't instantiate any Processing
                            //          objects.
                            //    If all three of these are the case assume then
                            //    assume that there are no side effects.
                            if (/native code/.test(strValue) ||
                                /return /.test(strValue) &&
                                !/p\./.test(strValue) &&
                                !/new P/.test(strValue)) {
                                    safeCalls[processingProp] = true;
                            }
                        } catch (e) {}
                    }
                }
            }

            // PVector is actually safe, there are no obvious side effects
            safeCalls.PVector = true;

            // The one exception to the rule above is the draw function
            // (which is defined on init but CAN be overridden).
            externalProps.draw = true;
        }

        // Load JSHint config options
        this.config.runCurVersion("jshint", this);

        this.config.on("versionSwitched", function(e, version) {
            this.config.runVersion(version, "processing", this.canvas);
        }.bind(this));

        BabyHint.init({
            context: this.canvas
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
            window.alert = $.noop;
            window.open = $.noop;
            window.showModalDialog = $.noop;
            window.confirm = $.noop;
            window.prompt = $.noop;
            window.eval = $.noop;
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

            // Prevent further changes to property descriptors and prevent
            // extensibility on window.
            var userAgent = navigator.userAgent.toLowerCase();
            if (/chrome/.test(userAgent)) {
                Object.freeze(window.location);
                Object.freeze(window);
            } else if (/safari/.test(userAgent)) {
                Object.seal(window);
            } else {
                // On other browsers only freeze if we can, on Firefox it
                // causes an error because window is not configurable.
                var propDescriptor = Object.getOwnPropertyDescriptor(window);
                if (!propDescriptor || propDescriptor.configurable) {
                    Object.freeze(window);
                }
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
                    var action = {};

                    // Track the x/y coordinates of the event
                    // Set to a property with the mouse event name
                    action[name] = {
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    };

                    // Log the command
                    this.output.postParent({ log: action });
                }
            }.bind(this));

            // Handle the command during playback
            this.handlers[name] = function(e) {
                // Get the command data
                var action = e[name];

                // Build the clientX and clientY values
                var pageX = action.x + offset.left;
                var pageY = action.y + offset.top;
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

    build: function(canvas) {
        this.canvas = new Processing(canvas, function(instance) {
            instance.draw = this.DUMMY;
        }.bind(this));

        this.bindProcessing(this.processing, this.canvas);

        this.config.runCurVersion("processing", this.canvas);

        this.clear();

        // Trigger the setting of the canvas size immediately
        this.setDimensions();
    },

    bindProcessing: function(obj, bindTo) {
        for (var prop in obj) {
            var val = obj[prop];

            if (!(prop in window)) {
                if (typeof val === "object") {
                    val = {};
                    this.bindProcessing(obj[prop], val);
                }

                if (typeof val === "function") {
                    val = val.bind(this);
                }
            }

            bindTo[prop] = val;
        }
    },

    setDimensions: function() {
        var $window = $(window);
        var width = $window.width();
        var height = $window.height();

        if (width !== this.canvas.width ||
            height !== this.canvas.height) {
            // Set the canvas element to be the right size
            this.$canvas.width(width).height(height);

            // Set the Processing.js canvas to be the right size
            this.canvas.size(width, height);

            // Restart execution
            this.output.restart();
        }
    },

    messageHandlers: {
        // Take a screenshot of the output
        screenshot: function(data) {
            // We want to resize the image to a 200x200 thumbnail,
            // which we can do by creating a temporary canvas
            var tmpCanvas = document.createElement("canvas");

            var screenshotSize = data.screenshotSize || 200;
            tmpCanvas.width = screenshotSize;
            tmpCanvas.height = screenshotSize;
            tmpCanvas.getContext("2d").drawImage(
                this.$canvas[0], 0, 0, screenshotSize, screenshotSize);

            // Send back the screenshot data
            this.output.postParent(tmpCanvas.toDataURL("image/png"));
        },

        // Play back recording
        action: function(data) {
            if (this.handlers[data.name]) {
                this.handlers[data.name](data.action);
            }
        },

        documentation: function(data) {
            BabyHint.initDocumentation(data.documentation);
        }
    },

    imageCache: {},
    imagesCached: false,
    imageCacheStarted: false,
    imageHolder: null,

    // Load and cache all images that could be used in the environment
    // Right now all images are loaded as we don't have more details on
    // exactly which images will be required.
    // Execution is delayed once a getImage appears in the source code
    // and none of the images are cached. Execution begins once all the
    // images have loaded.
    cacheImages: function(userCode, callback) {
        // Grab all the image calls from the source code
        var images = userCode.match(/getImage\s*\(.*?\)/g);

        // Keep track of how many images have loaded
        var numLoaded = 0;

        // Insert the images into a hidden div to cause them to load
        // but not be visible to the user
        if (!this.imageHolder) {
            this.imageHolder = $("<div>")
                .css({
                    height: 0,
                    width: 0,
                    overflow: "hidden",
                    position: "absolute"
                })
                .appendTo("body");
        }

        // Keep track of when image files are loaded
        var loaded = function() {
            numLoaded += 1;

            // All the images have loaded so now execution can begin
            if (numLoaded === images.length) {
                callback();
            }
        };

        // Go through all the images and begin loading them
        _.each(images, function(file) {
            // Get the actual file name
            var fileMatch = /"([A-Za-z0-9_\/-]*?)"/.exec(file);

            // Skip if the image has already been cached
            // Or if the getImage call is malformed somehow
            if (this.imageCache[file] || !fileMatch) {
                return loaded();
            }

            file = fileMatch[1];

            // We only allow images from within a certain path
            var path = this.output.imagesDir + file + ".png";

            // Load the image in the background
            var img = document.createElement("img");
            img.onload = loaded;
            img.src = path;
            this.imageHolder.append(img);

            // Cache the img element
            // TODO(jeresig): It might be good to cache the PImage here
            // but PImage may be mutable, so that might not work.
            this.imageCache[file] = img;
        }.bind(this));
    },

    // New methods and properties to add to the Processing instance
    processing: {
        // Global objects that we want to expose, by default
        Object: window.Object,
        RegExp: window.RegExp,
        Math: window.Math,
        Array: window.Array,
        String: window.String,

        // getImage: Retrieve a file and return a PImage holding it
        // Only allow access to certain approved files and display
        // an error message if a file wasn't found.
        // NOTE: Need to make sure that this will be a 'safeCall'
        getImage: function(file) {
            var cachedFile = this.imageCache[file];

            // Display an error message as the file wasn't located.
            if (!cachedFile) {
                throw {message:
                      $._("Image '%(file)s' was not found.", {file: file})};
            }

            // Give the image a representative ID
            var img = new this.canvas.PImage(cachedFile);
            img.__id = function() {
                return "getImage('" + file + "')";
            };
            return img;
        },

        // Make sure that loadImage is disabled in favor of getImage
        loadImage: function(file) {
            throw {message: "Use getImage instead of loadImage."};
        },

        // Make sure that requestImage is disabled in favor of getImage
        requestImage: function(file) {
            throw {message: "Use getImage instead of requestImage."};
        },

        // Disable link method
        link: function() {
            throw {message: $._("link() method is disabled.")};
        },

        // Basic console logging
        debug: function() {
            console.log.apply(console, arguments);
        },

        // Allow programs to have some control over the program running
        // Including being able to dynamically force execute of the tests
        // Or even run their own tests.
        Program: {
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

            assertEqual: function(actual, expected) {
                // Uses TraceKit to get stacktrace of caller,
                // it looks for the line number of the first anonymous eval
                // Stack traces are pretty nasty and not standardized yet
                // so this is not as elegant as one might hope.
                // Safari doesn't even give line numbers for anonymous evals,
                // so they can go sit in the dunce corner today.
                // This returns 0 if not found, which will mean that all
                // the assertion failures are shown on the first line.
                var getLineNum = function(stacktrace) {
                    var err = new Error();
                    TraceKit.remoteFetching = false;
                    TraceKit.collectWindowErrors = false;
                    var stacktrace = TraceKit.computeStackTrace.ofCaller();
                    var lines = stacktrace.stack;
                    for (var i = 0; i < lines.length; i++) {
                        if (lines[i].func === "Object.apply.get.message") {
                            // Chrome
                            return lines[i].line - 5;
                        } else if (lines[i].func === "anonymous/<") {
                            // Firefox
                            return lines[i].line - 4;
                        }
                    }
                    return -1;
                };

                if (_.isEqual(actual, expected)) {
                    return;
                }

                var msg = $._("Assertion failed: " +
                    "%(actual)s is not equal to %(expected)s.", {
                        actual: JSON.stringify(actual),
                        expected: JSON.stringify(expected)
                });

                var lineNum = getLineNum();
                // Display on first line if we didn't find a line #
                if (lineNum < 0) {
                    lineNum = 0;
                }

                this.output.assertions.push({
                    row: lineNum, column: 0, text: msg
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
        }
    },

    DUMMY: function() {},

    // Generate a string list of properties
    propListString: function(props) {
        var bannedProps = this.bannedProps;
        var propList = [];

        for (var prop in props) {
            if (!bannedProps[prop]) {
                propList.push(prop + ":" + props[prop]);
            }
        }

        return propList.join(",");
    },

    lint: function(userCode, callback) {
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
            "/*global " + this.propListString(this.props) +

            // The user's code to execute
            "*/\n" + userCode;

        var done = function(hintData, hintErrors) {
            this.lintDone(userCode, hintData, hintErrors, callback);
        }.bind(this);

        // Don't run JSHint if there is no code to run
        if (!userCode) {
            done(null, []);
        } else {
            this.hintWorker.exec(hintCode, done);
        }
    },

    lintDone: function(userCode, hintData, hintErrors, callback) {
        var externalProps = this.props;

        this.globals = {};

        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in this.canvas)) {
                    this.canvas[global] = undefined;
                }

                this.globals[global] = true;
            }
        }

        var errors = this.mergeErrors(hintErrors,
            BabyHint.babyErrors(userCode, hintErrors));

        // We only need to extract globals when the code has passed
        // the JSHint check
        this.globals = {};

        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in this.canvas)) {
                    this.canvas[global] = undefined;
                }

                this.globals[global] = true;
            }
        }

        callback(errors);
    },

    test: function(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        this.testWorker.exec(userCode, tests, errors, function(errors, testResults) {
            if (errorCount !== errors.length) {
                // Note: Scratchpad challenge checks against the exact
                // translated text "A critical problem occurred..." to figure
                // out whether we hit this case.
                var message = $._("Error: %(message)s",
                    {message: errors[errors.length - 1].message});
                // TODO(jeresig): Find a better way to show this
                this.output.$el.find(".test-errors").text(message).show();
                OutputTester.testContext.assert(false, message,
                    $._("A critical problem occurred in your program " +
                        "making it unable to run."));
            }

            callback(errors, testResults);
        }.bind(this));
    },

    mergeErrors: function(jshintErrors, babyErrors) {
        var errors = [];
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
                    text: error.reason,
                    type: "error",
                    lint: error,
                    source: "jshint",
                    priority: 2
                });
            }
        }.bind(this));

        // Add baby errors if JSHINT also broke on those lines, OR we don't want
        // to allow that error
        _.each(babyErrors, function(error) {
            if (_.include(brokenLines, error.row) || error.breaksCode) {
                errors.push({
                    row: error.row,
                    column: error.column,
                    text: error.text,
                    type: "error",
                    source: error.source,
                    priority: 1
                });
            }
        }.bind(this));

        // Add JSHINT errors at the end
        return errors.concat(hintErrors);
    },

    runCode: function(userCode, callback) {
        var runCode = function() {
            if (!window.Worker) {
                return this.injectCode(userCode, callback);
            }

            var context = {};

            _.each(this.globals, function(val, global) {
                var value = this.canvas[global];
                var contextVal;
                if (typeof value === "function" || global === "Math") {
                    contextVal = "__STUBBED_FUNCTION__";
                } else if (typeof value !== "object" ||
                    // We can send object literals over, but not
                    //  objects created with a constructor.
                    // jQuery thinks PImage is a plain object,
                    //  so we must specially check for it,
                    //  otherwise we'll give web workers an object that
                    //  they can't serialize.
                    ($.isPlainObject(value) &&
                    !(value instanceof this.canvas.PImage))) {
                    contextVal = value;
                } else {
                    contextVal = {};
                }
                context[global] = contextVal;
            }.bind(this));

            this.worker.exec(userCode, context, function(errors, userCode) {
                if (errors && errors.length > 0) {
                    return callback(errors, userCode);
                }

                try {
                    this.injectCode(userCode, callback);
                } catch (e) {
                    callback([e]);
                }
            }.bind(this));
        }.bind(this);

        if (this.globals.getImage) {
            this.cacheImages(userCode, runCode);

        } else {
            runCode();
        }
    },

    /*
     * Checks to see if a draw loop-introducing method currently
     * exists, or did exist, in the user's program.
     */
    hasOrHadDrawLoop: function() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (this.globals[name] ||
                this.lastGrab && this.lastGrab[name]) {
                    return true;
            }
        }

        return false;
    },

    /*
     * Checks to see if a draw loop method is currently defined in the
     * user's program (defined is equivalent to !undefined or if it's
     * just a stub program.)
     */
    drawLoopMethodDefined: function() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (this.canvas[name] !== this.DUMMY &&
                this.canvas[name] !== undefined) {
                    return true;
            }
        }

        return false;
    },

    /*
     * Injects code into the live Processing.js execution.
     *
     * The first time the code is injected, or if no draw loop exists, all of
     * the code is just executed normally using .exec().
     *
     * For all subsequent injections the following workflow takes place:
     *   - The code is executed but with all functions that have side effects
     *     replaced with empty function placeholders.
     *     - During this execution a context is set (wrapping the code with a
     *       with(){...}) that intentionally gobbles up all globally-exposed
     *       variables that the user has defined. For example, this code:
     *       var x = 10, y = 20; will result in a grabAll object of:
     *       {"x":10,"y":20}. Only user defined variables are captured.
     *     - Additionally all calls to side effect-inducing functions are logged
     *       for later to the fnCalls array (this includes a log of the function
     *       name and its arguments).
     *   - When the injection occurs a number of pieces need to be inserted into
     *     the live code.
     *     - First, all side effect-inducing function calls are re-run. For
     *       example a call to background(0, 0, 0); will result in the code
     *       background(0, 0, 0); being run again.
     *     - Second any new, or changed, variables will be re-inserted. Given
     *       the x/y example from above, let's say the user changes y to 30,
     *       thus the following code will be executed: var y = 30;
     *     - Third, any variables that existed on the last run of the code but
     *       no longer exist will be deleted. For example, if the ", y = 20" was
     *       removed from the above example the following would be executed:
     *       "delete y;" If the draw function was deleted then the output will
     *       need to be cleared/reset as well.
     *     - Finally, if any draw state was reset to the default from the last
     *       inject to now (for example there use to be a 'background(0, 0, 0);'
     *       but now there is none) then we'll need to reset that draw state to
     *       the default.
     *   - All of these pieces of injected code are collected together and are
     *     executed in the context of the live Processing.js environment.
     */
    injectCode: function(userCode, callback) {
        // Holds all the global variables extracted from the user's code
        var grabAll = {},

            // Holds all the function calls that came from function calls that
            // have side effects
            fnCalls = [],

            // Is true if the code needs to be completely re-run
            // This is true when instantiated objects that need
            // to be reinitialized.
            rerun = false,

            // Keep track of which function properties need to be
            // reinitialized after the constructor has been changed
            reinit = {},

            // A map of all global constructors (used for later
            // reinitialization of instances upon a constructor change)
            constructors = {},

            // The properties exposed by the Processing.js object
            externalProps = this.props,

            // The code string to inject into the live execution
            inject = "";

        // Grab all object properties and prototype properties from
        // all objects and function prototypes
        this.grabObj = {};

        // Extract a list of instances that were created using applyInstance
        this.instances = [];

        // Replace all calls to 'new Something' with
        // this.newInstance(Something)()
        // Used for keeping track of unique instances
        userCode = userCode && userCode.replace(/\bnew[\s\n]+([A-Z]{1,2}[a-z0-9_]+)([\s\n]*\()/g,
            "PJSOutput.applyInstance($1,'$1')$2");

        // If we have a draw function then we need to do injection
        // If we had a draw function then we still need to do injection
        // to clean up any live variables.
        var hasOrHadDrawLoop = this.hasOrHadDrawLoop();

        // Only do the injection if we have or had a draw loop
        if (hasOrHadDrawLoop) {
            // Go through all the globally-defined variables (this is
            // determined by a prior run-through using JSHINT) and ensure that
            // they're all defined on a single context. Also make sure that any
            // function calls that have side effects are instead replaced with
            // placeholders that collect a list of all functions called and
            // their arguments.
            // TODO(jeresig): See if we can move this off into the worker
            // thread to save an execution.
            _.each(this.globals, function(val, global) {
                var value = this.canvas[global];
                // Expose all the global values, if they already exist although
                // even if they are undefined, the result will still get sucked
                // into grabAll) Replace functions that have side effects with
                // placeholders (for later execution)
                grabAll[global] = ((typeof value === "function" &&
                        !this.safeCalls[global]) ?
                    function() {
                        fnCalls.push([global, arguments]);
                        return 0;
                    } :
                    value);
            }.bind(this));

            // Run the code with the grabAll context. The code is run with no
            // side effects and instead all function calls and globally-defined
            // variable values are extracted. Abort injection on a runtime
            // error.
            var error = this.exec(userCode, grabAll);
            if (error) {
                return callback([error]);
            }

            // Attach names to all functions
            _.each(grabAll, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

            // Keep track of all the constructor functions that may
            // have to be reinitialized
            for (var i = 0, l = this.instances.length; i < l; i++) {
                constructors[this.instances[i].constructor.__name] = true;
            }

            // The instantiated instances have changed, which means that
            // we need to re-run everything.
            if (this.oldInstances &&
                    PJSOutput.stringifyArray(this.oldInstances) !==
                    PJSOutput.stringifyArray(this.instances)) {
                rerun = true;
            }

            // Reset the instances list
            this.oldInstances = this.instances;
            this.instances = null;

            // Look for new top-level function calls to inject
            for (var i = 0; i < fnCalls.length; i++) {
                // Reconstruction the function call
                var args = Array.prototype.slice.call(fnCalls[i][1]);
                inject += fnCalls[i][0] + "(" +
                    PJSOutput.stringifyArray(args) + ");\n";
            }

            // We also look for newly-changed global variables to inject
            _.each(grabAll, function(val, prop) {
                // Turn the result of the extracted value into
                // a nicely-formatted string
                try {
                    grabAll[prop] = PJSOutput.stringify(grabAll[prop]);

                    // Check to see that we've done an inject before and that
                    // the property wasn't one that shouldn't have been
                    // overridden, and that either the property wasn't in the
                    // last extraction or that the value of the property has
                    // changed.
                    if (this.lastGrab &&
                            externalProps[prop] !== false &&
                            (!(prop in this.lastGrab) ||
                            grabAll[prop] !== this.lastGrab[prop])) {

                        // If we hit a function we need to re-execute the code
                        // by injecting it. Preserves the closure.
                        if (typeof val === "function") {
                            // If the constructor function was changed and an
                            // instance of the function exists, then we need to
                            // re-run all the code from start
                            if (constructors[prop]) {
                                rerun = true;
                            }

                            // Remember that this function has been
                            // reinitialized for later (in case it has
                            // properties that need to be re-injected)
                            reinit[prop] = true;

                            inject += "var " + prop + " = " +
                                grabAll[prop] + ";\n";

                            // Give the function a name as well
                            inject += prop + ".__name = '" + prop + "';\n";

                        // Otherwise it's ok to inject it directly into the
                        // new environment
                        } else {
                            this.canvas[prop] = val;
                        }
                    }

                    // For each function we also need to make sure that we
                    // extract all of the object and prototype properties
                    // (Since they won't be detected normally)
                    if (typeof val === "function" &&
                            externalProps[prop] !== false) {
                        this.objectExtract(prop, val);
                        this.objectExtract(prop, val, "prototype");
                    }

                // The variable contains something that can't be serialized
                // (such as instantiated objects) and so we need to extract it
                } catch (e) {
                    this.objectExtract(prop, val);
                }
            }.bind(this));

            // Insertion of new object properties
            _.each(this.grabObj, function(val, objProp) {
                var baseName = /^[^.[]*/.exec(objProp)[0];

                // If we haven't done an extraction before or if the value
                // has changed, or if the function was reinitialized,
                // insert the new value.
                if (!this.lastGrabObj ||
                        this.lastGrabObj[objProp] !== val ||
                        reinit[baseName]) {
                    inject += objProp + " = " + val + ";\n";
                }
            }.bind(this));

            // Deletion of old object properties
            for (var objProp in this.lastGrabObj) {
                if (!(objProp in this.grabObj)) {
                    inject += "delete " + objProp + ";\n";
                }
            }

            // Make sure that deleted variables are removed.
            // Go through all the previously-defined properties and check to see
            // if they've been removed.
            for (var oldProp in this.lastGrab) {
                // If the property doesn't exist in this grab extraction and
                // the property isn't a Processing.js-defined property
                // (e.g. don't delete 'background') but allow the 'draw'
                // function to be deleted (as it's user-defined)
                if (!(oldProp in grabAll) &&
                        (!(oldProp in this.props) ||
                            oldProp === "draw")) {
                    // Create the code to delete the variable
                    inject += "delete this." + oldProp + ";\n";

                    // If the draw function was deleted we also
                    // need to clear the display
                    if (oldProp === "draw") {
                        this.clear();
                    }
                }
            }
        }

        // Make sure the matrix is always reset
        this.canvas.resetMatrix();

        // Seed the random number generator with the same seed
        this.restoreRandomSeed();

        // Make sure the various draw styles are also reset
        // if they were just removed
        if (this.lastGrab) {
            for (var prop in this.liveReset) {
                if (!this.globals[prop] && this.lastGrab[prop]) {
                    this.canvas[prop].apply(this.canvas,
                        this.liveReset[prop]);
                }
            }
        }

        // Re-run the entire program if we don't need to inject the changes
        // (Injection only needs to occur if a draw loop exists and if a prior
        // run took place)
        if (!hasOrHadDrawLoop || !this.drawLoopMethodDefined() ||
                !this.lastGrab || rerun) {
            // Clear the output if no injection is occurring
            this.clear();

            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (this.globals.draw) {
                userCode += "\ndraw();";
            }

            // Run the code as normal
            var error = this.exec(userCode, this.canvas);
            if (error) {
                return callback([error]);
            }

            // Attach names to all functions
            _.each(this.globals, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

        // Otherwise if there is code to inject
        } else if (inject) {
            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (this.globals.draw) {
                inject += "\ndraw();";
            }

            // Execute the injected code
            var error = this.exec(inject, this.canvas);
            if (error) {
                return callback([error]);
            }
        }

        // Need to make sure that the draw function is never deleted
        // (Otherwise Processing.js starts to freak out)
        if (!this.canvas.draw) {
            this.canvas.draw = this.DUMMY;
        }

        // Save the extracted variables for later comparison
        if (hasOrHadDrawLoop) {
            this.lastGrab = grabAll;
            this.lastGrabObj = this.grabObj;
        }

        if (callback) {
            try {
                callback([]);
            } catch(e) {
                // Ignore any errors that were generated in the callback
                // NOTE(jeresig): This is needed because Mocha throws errors
                // when it encounters an assertion error, which causes this
                // to go haywire, generating an in-code error.
            }
        }
    },

    // Extract an object's properties for dynamic insertion
    objectExtract: function(name, obj, proto) {
        // Make sure the object actually exists before we try
        // to inject stuff into it
        if (!this.canvas[name]) {
            this.canvas[name] = $.isArray(obj) ? [] : {};
        }

        // A specific property to inspect of the object
        // (which will probably be the .prototype)
        if (proto) {
            obj = obj[proto];
        }

        // Go through each property of the object
        for (var objProp in obj) {
            // Make sure the property is actually on the object and that
            // it isn't a "private" property (e.g. __name or __id)
            if (obj.hasOwnProperty(objProp) && objProp.indexOf("__") < 0) {
                // Turn the result of the extracted function into
                // a nicely-formatted string (maintains the closure)
                if (typeof obj[objProp] === "function") {
                    this.grabObj[name + (proto ? "." + proto : "") +
                            "['" + objProp + "']"] =
                        PJSOutput.stringify(obj[objProp]);

                // Otherwise we should probably just inject the value directly
                } else {
                    // Get the object that we'll be injecting into
                    var outputObj = this.canvas[name];

                    if (proto) {
                        outputObj = outputObj[proto];
                    }

                    // Inject the object
                    outputObj[objProp] = obj[objProp];
                }
            }
        }
    },

    restart: function() {
        this.lastGrab = null;
        this.lastGrabObj = null;

        // Grab a new random seed
        this.reseedRandom();

        // Reset frameCount variable on restart
        this.canvas.frameCount = 0;
    },

    toggle: function(doToggle) {
        if (doToggle) {
            this.canvas.loop();

        } else {
            this.canvas.noLoop();
        }
    },

    clear: function() {
        for (var prop in this.liveReset) {
            if (this.liveReset.hasOwnProperty(prop)) {
                this.canvas[prop].apply(this.canvas,
                    this.liveReset[prop]);
            }
        }
    },

    seed: null,

    reseedRandom: function() {
        this.seed = Math.floor(Math.random() * 4294967296);
    },

    restoreRandomSeed: function() {
        this.canvas.randomSeed(this.seed);
    },

    kill: function() {
        this.canvas.exit();
        this.canvas.hide();
    },

    initTests: function(validate) {
        return this.exec(validate, OutputTester.testContext)
    },

    exec: function(code) {
        if (!code) {
            return;
        }

        var contexts = Array.prototype.slice.call(arguments, 1);

        // this is kind of sort of supposed to fake a gensym that the user
        // can't access but since we're limited to string manipulation, we
        // can't guarantee this fo sho' so we just change the name to something
        // long and random every time the code runs and hope for the best!
        var envName = "__env__" + Math.floor(Math.random() * 1000000000);

        for (var i = 0; i < contexts.length; i++) {
            if (contexts[i]) {
                code = "with(" + envName + "[" + i + "]){\n" + code + "\n}";
            }
        }

        // the top-level 'this' is empty except for this.externals, which
        // throws this message this is how users were getting at everything
        // from playing sounds to displaying pop-ups
        var badProgram = $._("This program uses capabilities we've turned " +
            "off for security reasons. Khan Academy prohibits showing " +
            "external images, playing sounds, or displaying pop-ups.");
        var topLevelThis = "{ get externals() { throw { message: " +
            JSON.stringify(badProgram) + " } } }";

        // if we pass in the env as a parameter, the user will be able to get
        // at it through the 'arguments' binding, so we close over it instead
        code = "var " + envName + " = arguments;\n(function(){\n" + code +
            "\n}).apply(" + topLevelThis + ");";

        try {
            (new Function(code)).apply(this.canvas, contexts);

        } catch (e) {
            return e;
        }
    },

    /*
     * The worker that matches with StructuredJS.
     */
    testWorker: new PooledWorker(
        "pjs/test-worker.js",
        function(code, validate, errors, callback) {
            var self = this;

            // If there are syntax errors in the tests themselves,
            //  then we ignore the request to test.
            try {
                OutputTester.exec(validate);
            } catch(e) {
                console.warn(e.message);
                return;
            }

            // Generic function to handle results of testing
            var processTesterResults = function(tester) {
                errors = errors.concat(tester.errors);
                return tester.testResults;
            };

            // If there's no Worker support *or* there
            //  are syntax errors in user code, we do the testing in
            //  the browser instead.
            // We do it in-browser in the latter case as
            //  the code is often in a syntax-error state,
            //  and the browser doesn't like creating that many workers,
            //  and the syntax error tests that we have are fast.
            if (!window.Worker || errors.length > 0) {
                OutputTester.test(code, validate, errors);
                var results = processTesterResults(OutputTester);
                return callback(errors, results);
            }

            var worker = this.getWorkerFromPool();

            worker.onmessage = function(event) {
                if (event.data.type === "test") {
                    if (self.isCurrentWorker(worker)) {
                        var data = event.data.message;
                        var results = processTesterResults(data);
                        callback(errors, results);
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
    ),

    /*
     * The worker that analyzes the user's code.
     */
    hintWorker: new PooledWorker(
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
                code: hintCode,
                externalsDir: this.externalsDir,
                jshintFile: this.jshintFile
            });
        }
    ),

    worker: new PooledWorker(
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
});

// Add in some static helper methods
_.extend(PJSOutput, {
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
        } else if (obj &&
                Object.prototype.toString.call(obj) === "[object Array]") {
            return this.stringifyArray(obj);

        // JSON.stringify returns undefined, not as a string, so we specially
        // handle that
        } else if (typeof obj === "undefined") {
                return "undefined";
        }

        // If all else fails, attempt to JSON-ify the string
        // TODO(jeresig): We should probably do recursion to better handle
        // complex objects that might hold instances.
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
    },

    // Turn an array into a string list
    // (Especially useful for serializing a list of arguments)
    stringifyArray: function(array) {
        var results = [];

        for (var i = 0, l = array.length; i < l; i++) {
            results.push(this.stringify(array[i]));
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

        // Make sure a name is set for the class if one has not been
        // set already
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
                    this.stringifyArray(args) + ")";
            }.bind(this);

            // Keep track of the instances that have been instantiated
            if (this.instances) {
                this.instances.push(obj);
            }

            // Return the new instance
            return obj;
        }.bind(this);
    }
});

LiveEditorOutput.registerOutput("pjs", PJSOutput);