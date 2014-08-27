(function() {

window.CanvasOutput = {
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

    init: function(options) {
        this.config = options.config;

        this.$elem = $("#output-canvas");

        // If no canvas element is found we make a dummy one and render to it
        if (this.$elem.length === 0) {
            this.$elem = $("<canvas>")
                .attr("id", "output-canvas")
                .appendTo("body");
        }

        this.$elem.show();

        CanvasOutput.bind();

        CanvasOutput.reseedRandom();
        CanvasOutput.lastGrab = null;

        CanvasOutput.build(this.$elem[0]);

        // If a list of exposed properties hasn't been generated before
        if (!CanvasOutput.props) {
            // CanvasOutput.props holds the names of the properties which
            // are to be exposed by Processing.js to the user.
            var externalProps = CanvasOutput.props = {},

                // CanvasOutput.safeCalls holds the names of the properties
                // which are functions which appear to not have any
                // side effects when called.
                safeCalls = CanvasOutput.safeCalls = {};

            // Make sure that only certain properties can be manipulated
            for (var processingProp in Output.context) {
                // Processing.js has some "private" methods (beginning with __)
                // these shouldn't be exposed to the user.
                if (processingProp.indexOf("__") < 0) {
                    var value = Output.context[processingProp],
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

        return this;
    },

    bind: function() {
        var offset = this.$elem.offset();

        // Go through all of the mouse events to track
        jQuery.each(CanvasOutput.trackedMouseEvents, function(i, name) {
            var eventType = "mouse" + name;

            // Track that event on the Canvas element
            CanvasOutput.$elem.bind(eventType, function(e) {
                // Only log if recording is occurring
                if (Output.recording) {
                    var action = {};

                    // Track the x/y coordinates of the event
                    // Set to a property with the mouse event name
                    action[name] = {
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    };

                    // Log the command
                    Output.postParent({ log: action });
                }
            });

            // Handle the command during playback
            CanvasOutput.handlers[name] = function(e) {
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
                CanvasOutput.$elem[0].dispatchEvent(evt);
            };
        });

        // Dynamically set the width and height based upon the size of the
        // window, which could be changed in the parent page
        $(window).on("resize", CanvasOutput.setDimensions);
    },

    // Handle recording playback
    handlers: {},

    build: function(canvas) {
        CanvasOutput.canvas = Output.context =
            new Processing(canvas, function(instance) {
                instance.draw = CanvasOutput.DUMMY;
            });

        $.extend(CanvasOutput.canvas, CanvasOutput.processing);

        this.config.runCurVersion("processing", CanvasOutput.canvas);

        CanvasOutput.clear();

        // Trigger the setting of the canvas size immediately
        CanvasOutput.setDimensions();
    },

    setDimensions: function() {
        var $window = $(window);
        var width = $window.width();
        var height = $window.height();

        if (width !== CanvasOutput.canvas.width ||
            height !== CanvasOutput.canvas.height) {
            // Set the canvas element to be the right size
            $("#output-canvas").width(width).height(height);

            // Set the Processing.js canvas to be the right size
            CanvasOutput.canvas.size(width, height);

            // Restart execution
            Output.restart();
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
        if (!CanvasOutput.imageHolder) {
            CanvasOutput.imageHolder = $("<div>")
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
            if (CanvasOutput.imageCache[file] || !fileMatch) {
                return loaded();
            }

            file = fileMatch[1];

            // We only allow images from within a certain path
            var path = Output.imagesDir + file + ".png";

            // Load the image in the background
            var img = document.createElement("img");
            img.onload = loaded;
            img.src = path;
            CanvasOutput.imageHolder.append(img);

            // Cache the img element
            // TODO(jeresig): It might be good to cache the PImage here
            // but PImage may be mutable, so that might not work.
            CanvasOutput.imageCache[file] = img;
        });
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
            var cachedFile = CanvasOutput.imageCache[file];

            // Display an error message as the file wasn't located.
            if (!cachedFile) {
                return Output.handleError({ message:
                      $._("Image '%(file)s' was not found.", {file: file}) });
            }

            // Give the image a representative ID
            var img = new CanvasOutput.canvas.PImage(cachedFile);
            img.__id = function() {
                return "getImage('" + file + "')";
            };
            return img;
        },

        // Make sure that loadImage is disabled in favor of getImage
        loadImage: function(file) {
            Output.handleError({ message:
                "Use getImage instead of loadImage." });
        },

        // Make sure that requestImage is disabled in favor of getImage
        requestImage: function(file) {
            Output.handleError({ message:
                "Use getImage instead of requestImage." });
        },

        // Disable link method
        link: function() {
            Output.handleError({ message:
                $._("link() method is disabled.") });
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
                return Output.settings || {};
            },

            // Force the program to restart (run again)
            restart: function() {
                Output.restart();
            },

            // Force the tests to run again
            runTests: function() {
                Output.test();
                return Output.testResults;
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
                var msg = $._(
                        "Assertion failed: " +
                        "%(actual)s is not equal to %(expected)s.",
                        {actual: Output.stringify(actual),
                         expected: Output.stringify(expected)});
                var lineNum = getLineNum();
                // Display on first line if we didn't find a line #
                if (lineNum < 0) {
                    lineNum = 0;
                }

                Output.assertions.push({
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

                Output.postParent({
                    results: {
                        code: Output.currentCode,
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

    preTest: function() {
        CanvasOutput.oldContext = Output.context;

        if (CanvasOutput.testingContext) {
            CanvasOutput.canvas = Output.context = CanvasOutput.testingContext;

        } else {
            CanvasOutput.testCanvas = document.createElement("canvas");
            CanvasOutput.build(CanvasOutput.testCanvas);
            CanvasOutput.testingContext = Output.context;
        }
    },

    postTest: function() {
        CanvasOutput.canvas = Output.context = CanvasOutput.oldContext;

        return CanvasOutput.testCanvas;
    },

    runTest: function(userCode, test, i) {
        // TODO(jeresig): Add in Canvas testing
        // Create a temporary canvas and a new processing instance
        // temporarily overwrite Output.context
        // Save the canvas for later and return that as the output
        // CanvasOutput.runCode(userCode);
    },

    runCode: function(userCode, globalContext, callback) {
        if (Output.globals.getImage) {
            CanvasOutput.cacheImages(userCode, runCode);

        } else {
            runCode();
        }

        function runCode() {
            if (window.Worker) {
                var context = {};

                _.each(Output.globals, function(val, global) {
                    var value = Output.context[global];
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
                        !(value instanceof Output.context.PImage))) {
                        contextVal = value;
                    } else {
                        contextVal = {};
                    }
                    context[global] = contextVal;
                });

                Output.worker.exec(userCode, context, function(userCode) {
                    try {
                        CanvasOutput.injectCode(userCode, callback);

                    } catch (e) {
                        Output.handleError(e);
                        callback();
                    }
                });

            } else {
                CanvasOutput.injectCode(userCode, callback);
            }
        }
    },

    /*
     * Checks to see if a draw loop-introducing method currently
     * exists, or did exist, in the user's program.
     */
    hasOrHadDrawLoop: function() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (Output.globals[name] ||
                CanvasOutput.lastGrab && CanvasOutput.lastGrab[name]) {
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
            if (Output.context[name] !== CanvasOutput.DUMMY &&
                Output.context[name] !== undefined) {
                    return true;
            }
        }

        return false;
    },

    /*
     * Injects code into the live Processing.js execution.
     *
     * The first time the code is injected, or if no draw loop exists, all of
     * the code is just executed normally using Output.exec().
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
            externalProps = CanvasOutput.props,

            // The code string to inject into the live execution
            inject = "";

        // Grab all object properties and prototype properties from
        // all objects and function prototypes
        CanvasOutput.grabObj = {};

        // Extract a list of instances that were created using applyInstance
        Output.instances = [];

        // Replace all calls to 'new Something' with
        // CanvasOutput.newInstance(Something)()
        // Used for keeping track of unique instances
        userCode = userCode && userCode.replace(/\bnew[\s\n]+([A-Z]{1,2}[a-z0-9_]+)([\s\n]*\()/g,
            "Output.applyInstance($1,'$1')$2");

        // If we have a draw function then we need to do injection
        // If we had a draw function then we still need to do injection
        // to clean up any live variables.
        var hasOrHadDrawLoop = CanvasOutput.hasOrHadDrawLoop();

        // Only do the injection if we have or had a draw loop
        if (hasOrHadDrawLoop) {
            // Go through all the globally-defined variables (this is determined by
            // a prior run-through using JSHINT) and ensure that they're all defined
            // on a single context. Also make sure that any function calls that have
            // side effects are instead replaced with placeholders that collect a
            // list of all functions called and their arguments.
            // TODO(jeresig): See if we can move this off into the worker thread to
            //                save an execution.
            _.each(Output.globals, function(val, global) {
                var value = Output.context[global];
                // Expose all the global values, if they already exist although even
                // if they are undefined, the result will still get sucked into
                // grabAll) Replace functions that have side effects with
                // placeholders (for later execution)
                grabAll[global] = ((typeof value === "function" &&
                        !CanvasOutput.safeCalls[global]) ?
                    function() { fnCalls.push([global, arguments]); return 0; } :
                    value);
            });

            // Run the code with the grabAll context. The code is run with no side
            // effects and instead all function calls and globally-defined variable
            // values are extracted. Abort injection on a runtime error.
            if (!Output.exec(userCode, grabAll)) {
                return;
            }

            // Attach names to all functions
            _.each(grabAll, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

            // Keep track of all the constructor functions that may
            // have to be reinitialized
            for (var i = 0, l = Output.instances.length; i < l; i++) {
                constructors[Output.instances[i].constructor.__name] = true;
            }

            // The instantiated instances have changed, which means that
            // we need to re-run everything.
            if (Output.oldInstances &&
                    Output.stringifyArray(Output.oldInstances) !==
                    Output.stringifyArray(Output.instances)) {
                rerun = true;
            }

            // Reset the instances list
            Output.oldInstances = Output.instances;
            Output.instances = null;

            // Look for new top-level function calls to inject
            for (var i = 0; i < fnCalls.length; i++) {
                // Reconstruction the function call
                var args = Array.prototype.slice.call(fnCalls[i][1]);
                inject += fnCalls[i][0] + "(" +
                    Output.stringifyArray(args) + ");\n";
            }

            // We also look for newly-changed global variables to inject
            _.each(grabAll, function(val, prop) {
                // Turn the result of the extracted value into
                // a nicely-formatted string
                try {
                    grabAll[prop] = Output.stringify(grabAll[prop]);

                    // Check to see that we've done an inject before and that
                    // the property wasn't one that shouldn't have been
                    // overridden, and that either the property wasn't in the
                    // last extraction or that the value of the property has
                    // changed.
                    if (CanvasOutput.lastGrab &&
                            externalProps[prop] !== false &&
                            (!(prop in CanvasOutput.lastGrab) ||
                            grabAll[prop] !== CanvasOutput.lastGrab[prop])) {

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
                            Output.context[prop] = val;
                        }
                    }

                    // For each function we also need to make sure that we
                    // extract all of the object and prototype properties
                    // (Since they won't be detected normally)
                    if (typeof val === "function" &&
                            externalProps[prop] !== false) {
                        CanvasOutput.objectExtract(prop, val);
                        CanvasOutput.objectExtract(prop, val, "prototype");
                    }

                // The variable contains something that can't be serialized
                // (such as instantiated objects) and so we need to extract it
                } catch (e) {
                    CanvasOutput.objectExtract(prop, val);
                }
            });

            // Insertion of new object properties
            _.each(CanvasOutput.grabObj, function(val, objProp) {
                var baseName = /^[^.[]*/.exec(objProp)[0];

                // If we haven't done an extraction before or if the value
                // has changed, or if the function was reinitialized,
                // insert the new value.
                if (!CanvasOutput.lastGrabObj ||
                        CanvasOutput.lastGrabObj[objProp] !== val ||
                        reinit[baseName]) {
                    inject += objProp + " = " + val + ";\n";
                }
            });

            // Deletion of old object properties
            for (var objProp in CanvasOutput.lastGrabObj) {
                if (!(objProp in CanvasOutput.grabObj)) {
                    inject += "delete " + objProp + ";\n";
                }
            }

            // Make sure that deleted variables are removed.
            // Go through all the previously-defined properties and check to see
            // if they've been removed.
            for (var oldProp in CanvasOutput.lastGrab) {
                // If the property doesn't exist in this grab extraction and
                // the property isn't a Processing.js-defined property
                // (e.g. don't delete 'background') but allow the 'draw'
                // function to be deleted (as it's user-defined)
                if (!(oldProp in grabAll) &&
                        (!(oldProp in CanvasOutput.props) ||
                            oldProp === "draw")) {
                    // Create the code to delete the variable
                    inject += "delete Output.context." + oldProp + ";\n";

                    // If the draw function was deleted we also
                    // need to clear the display
                    if (oldProp === "draw") {
                        CanvasOutput.clear();
                    }
                }
            }
        }

        // Make sure the matrix is always reset
        Output.context.resetMatrix();

        // Seed the random number generator with the same seed
        CanvasOutput.restoreRandomSeed();

        // Make sure the various draw styles are also reset
        // if they were just removed
        if (CanvasOutput.lastGrab) {
            for (var prop in CanvasOutput.liveReset) {
                if (!Output.globals[prop] && CanvasOutput.lastGrab[prop]) {
                    CanvasOutput.canvas[prop].apply(CanvasOutput.canvas,
                        CanvasOutput.liveReset[prop]);
                }
            }
        }

        // Re-run the entire program if we don't need to inject the changes
        // (Injection only needs to occur if a draw loop exists and if a prior
        // run took place)
        if (!hasOrHadDrawLoop || !CanvasOutput.drawLoopMethodDefined() ||
                !CanvasOutput.lastGrab || rerun) {
            // Clear the output if no injection is occurring
            CanvasOutput.clear();

            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (Output.globals.draw) {
                userCode += "\ndraw();";
            }

            // Run the code as normal
            Output.exec(userCode, Output.context);

            // Attach names to all functions
            _.each(Output.globals, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

        // Otherwise if there is code to inject
        } else if (inject) {
            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (Output.globals.draw) {
                inject += "\ndraw();";
            }

            // Execute the injected code
            Output.exec(inject, Output.context);
        }

        // Need to make sure that the draw function is never deleted
        // (Otherwise Processing.js starts to freak out)
        if (!Output.context.draw) {
            Output.context.draw = CanvasOutput.DUMMY;
        }

        // Save the extracted variables for later comparison
        if (hasOrHadDrawLoop) {
            CanvasOutput.lastGrab = grabAll;
            CanvasOutput.lastGrabObj = CanvasOutput.grabObj;
        }

        if (callback) {
            try {
                callback();
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
        if (!Output.context[name]) {
            Output.context[name] = $.isArray(obj) ? [] : {};
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
                    CanvasOutput.grabObj[name + (proto ? "." + proto : "") +
                            "['" + objProp + "']"] =
                        Output.stringify(obj[objProp]);

                // Otherwise we should probably just inject the value directly
                } else {
                    // Get the object that we'll be injecting into
                    var outputObj = Output.context[name];

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
        CanvasOutput.lastGrab = null;
        CanvasOutput.lastGrabObj = null;

        // Grab a new random seed
        CanvasOutput.reseedRandom();

        // Reset frameCount variable on restart
        CanvasOutput.canvas.frameCount = 0;

        Output.runCode(Output.getUserCode());
    },

    testContext: {
        testCanvas: function(name, fn) {
            Output.testContext.test(name, fn, CanvasOutput);
        }
    },

    toggle: function(doToggle) {
        if (doToggle) {
            CanvasOutput.start();

        } else {
            CanvasOutput.stop();
        }
    },

    stop: function() {
        CanvasOutput.canvas.noLoop();
    },

    start: function() {
        CanvasOutput.canvas.loop();
    },

    clear: function() {
        for (var prop in CanvasOutput.liveReset) {
            if (CanvasOutput.liveReset.hasOwnProperty(prop)) {
                CanvasOutput.canvas[prop].apply(CanvasOutput.canvas,
                    CanvasOutput.liveReset[prop]);
            }
        }
    },

    seed: null,

    reseedRandom: function() {
        CanvasOutput.seed = Math.floor(Math.random() * 4294967296);
    },

    restoreRandomSeed: function() {
        CanvasOutput.canvas.randomSeed(CanvasOutput.seed);
    },

    kill: function() {
        CanvasOutput.canvas.exit();
        CanvasOutput.$elem.hide();
    }
};

var PooledWorker = function(filename, onExec) {
    this.pool = [];
    this.curID = 0;
    this.filename = filename;
    this.onExec = onExec || function() {};
};

PooledWorker.prototype.getURL = function() {
    return Output.workersDir + this.filename +
        "?cachebust=B" + (new Date()).toDateString();
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

/*
 * The worker that matches with StructuredJS.
 */
Output.testWorker = new PooledWorker(
    "test-worker.js",
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

        Output.testing = true;

        // Generic function to handle results of testing
        var processTesterResults = function(tester) {
            Output.testResults = tester.testResults;
            Output.errors.concat(tester.errors);
            Output.testing = false;
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
            processTesterResults(OutputTester);
            callback();
            return;
        }

        var worker = this.getWorkerFromPool();

        worker.onmessage = function(event) {
            if (event.data.type === "test") {
                if (self.isCurrentWorker(worker)) {
                    var data = event.data.message;
                    processTesterResults(data);
                    callback();
                }
                self.addWorkerToPool(worker);
            }
        };

        worker.postMessage({
            code: code,
            validate: validate,
            errors: errors,
            externalsDir: Output.externalsDir
        });
    }
);

/*
 * The worker that analyzes the user's code.
 */
Output.hintWorker = new PooledWorker(
    "jshint-worker.js",
    function(hintCode, callback) {
        // Fallback in case of no worker support
        if (!window.Worker) {
            JSHINT(hintCode);
            callback(JSHINT.data(), JSHINT.errors);
            return;
        }

        var self = this;

        var worker = this.getWorkerFromPool();

        worker.onmessage = function(event) {
            if (event.data.type === "jshint") {
                // If a new request has come in since the worker started
                // then we just ignore the results and don't fire the callback
                if (self.isCurrentWorker(worker)) {
                    var data = event.data.message;
                    callback(data.hintData, data.hintErrors);
                }
                self.addWorkerToPool(worker);
            }
        };

        worker.postMessage({
            code: hintCode,
            externalsDir: Output.externalsDir,
            jshintFile: Output.jshintFile
        });
    }
);


Output.worker = {
    timeout: null,
    running: false,

    init: function() {
        var worker = Output.worker.worker =
            new window.Worker(Output.workersDir +
                "worker.js?cachebust=" + (new Date()).toDateString());

        worker.onmessage = function(event) {
            // Execution of the worker has begun so we wait for it...
            if (event.data.execStarted) {
                // If the thread doesn't finish executing quickly, kill it and
                // don't execute the code
                Output.worker.timeout = window.setTimeout(function() {
                    Output.worker.stop();
                    Output.worker.done({message:
                        $._("The program is taking too long to run. Perhaps " +
                            "you have a mistake in your code?")});
                }, 500);

            } else if (event.data.type === "end") {
                Output.worker.done();

            } else if (event.data.type === "error") {
                Output.worker.done({message: event.data.message});
            }
        };

        worker.onerror = function(event) {
            event.preventDefault();
            Output.worker.done(event);
        };
    },

    exec: function(userCode, context, callback) {
        // Stop old worker from finishing
        if (Output.worker.running) {
            Output.worker.stop();
        }

        if (!Output.worker.worker) {
            Output.worker.init();
        }

        Output.worker.done = function(e) {
            Output.worker.running = false;

            Output.worker.clearTimeout();

            if (e) {
                Output.handleError(e);

                // Make sure that the caller knows that we're done
                callback();
            } else {
                callback(userCode);
            }
        };

        try {
            Output.worker.worker.postMessage({
                code: userCode,
                context: context
            });

            Output.worker.running = true;
        } catch (e) {
            // TODO: Object is too complex to serialize, try to find
            // an alternative workaround
            Output.worker.done();
        }
    },

    /*
     * Stop long-running execution detection, if still going.
     */
    clearTimeout: function() {
        if (Output.worker.timeout !== null) {
            window.clearTimeout(Output.worker.timeout);
            Output.worker.timeout = null;
        }
    },

    /*
     * Calling this will stop execution of any currently running worker
     * Will return true if a worker was running, false if one was not.
     */
    stop: function() {
        Output.worker.clearTimeout();

        if (Output.worker.worker) {
            Output.worker.worker.terminate();
            Output.worker.worker = null;
            return true;
        }

        return false;
    }
};

if (window !== window.top && Object.freeze &&
        Object.getOwnPropertyDescriptor) {
    // Freezing the whole window, and more specifically window.location, causes
    // a redirect on Safari 6 and 7.
    // Test case: http://ejohn.org/files/freeze-test.html

    // Note that freezing the window object in any way in our test environment
    // will have no side effect, and will remain mutable in every way.

    // Manually freeze everything except for location for the object's own
    // properties. The Object prototype chain will be frozen just after.
    for (var prop in window) {
        // Could be combined into check below, but lint requires it here :(
        if (window.hasOwnProperty(prop)) {
            // The property descriptor check is needed to avoid some nasty
            // console messages when trying to freeze non configurable
            // properties.
            try {
                var propDescriptor = Object.getOwnPropertyDescriptor(window, prop);
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
        // On other browsers only freeze if we can, on Firefox it causes an
        // error because window is not configurable.
        var propDescriptor = Object.getOwnPropertyDescriptor(window);
        if (!propDescriptor || propDescriptor.configurable) {
            Object.freeze(window);
        }
    }

    // Completely lock down window's prototype chain
    Object.freeze(Object.getPrototypeOf(window));
}

})();