window.PJSUtils = {
    /**
     * Returns code contained within a function.
     *
     * @param {Function} func
     * @returns {string}
     */
    codeFromFunction: function codeFromFunction(func) {
        var code = func.toString();
        code = code.substr(code.indexOf("{") + 1);
        return code.substr(0, code.length - 1);
    },

    /**
     * Removes excess indentation from code.
     *
     * @param {string} code
     * @returns {string}
     */
    cleanupCode: function cleanupCode(code) {
        var lines = code.split("\n").filter(function (line) {
            return line !== "";
        });

        var indent = lines[0].length - lines[0].trim().length;

        return lines.map(function (line) {
            return line.substring(indent);
        }).join("\n").trim();
    }
};
var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The CodeInjector object is responsible for running code, determining what
 * code to inject when the user code has been updated, and maintaining the
 * appropriate state in the processing object in order to make live editing
 * of processing-js programs work correctly.
 */

var PJSCodeInjector = (function () {

    /**
     * Create a new processing-js code injector.
     *
     * @param {Object} options
     * - processing: A Processing instance.
     * - resourceCache: A ResourceCache instance.
     * - infiniteLoopCallback: A function that's when the loop protector is
     *   triggered.
     * - enabledLoopProtect: When true, loop protection code is injected.
     * - loopProtectTimeouts: An object defining initialTimeout and
     *   frameTimeout, see loop-protect.js for details.
     * - JSHint: An object containing the JSHint configuration.
     * - additionalMethods: An object containing methods that will be added
     *   to the Processing instance.
     * - [sandboxed] A boolean specifying whether we're in the PJS sandbox or
     *   this is an official CS program we're compiling for a read-only
     *   environment.  Default is true.
     * - [envName] All references to global symbols, e.g. fill(...), draw, etc.
     *   are prefixed with this string which defaults to  "__env__".
     */

    function PJSCodeInjector(options) {
        _classCallCheck(this, PJSCodeInjector);

        var defaultOptions = {
            sandboxed: true,
            envName: "__env__"
        };

        Object.assign(this, defaultOptions, options);
        this.DUMMY = this.processing.draw; // initially draw is a DUMMY method
        this.seed = null;
        this.globals = {};

        this.addMethods(this.additionalMethods);
        this.reseedRandom();

        // Methods that trigger the draw loop
        this.drawLoopMethods = ["draw", "mouseClicked", "mouseDragged", "mouseMoved", "mousePressed", "mouseReleased", "mouseScrolled", "mouseOver", "mouseOut", "touchStart", "touchEnd", "touchMove", "touchCancel", "keyPressed", "keyReleased", "keyTyped"];

        // During live coding all of the following state must be reset
        // when it's no longer used.
        this.liveReset = {
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
        };

        /**
         * PJS calls which are known to produce no side effects when
         * called multiple times.
         * It's a good idea to add things here for functions that have
         * return values, but still call other PJS functions. In that
         * exact case, we detect that the function is not safe, but it
         * should indeed be safe.  So add it here! :)
         */
        this.idempotentCalls = ["createFont"];

        // If a list of exposed properties hasn't been generated before
        if (!this.props) {
            this.initializeProps();
        }

        this.loopProtector = new LoopProtector(this.infiniteLoopCallback, this.loopProtectTimeouts, true);

        /*
         * The worker that analyzes the user's code.
         */
        this.hintWorker = new PooledWorker("pjs/jshint-worker.js", function (hintCode, callback) {
            // Fallback in case of no worker support
            if (!window.Worker) {
                JSHINT(hintCode);
                callback(JSHINT.data(), JSHINT.errors);
                return;
            }

            var worker = this.getWorkerFromPool();

            worker.onmessage = (function (event) {
                if (event.data.type === "jshint") {
                    // If a new request has come in since the worker started
                    // then we just ignore the results and don't fire the callback
                    if (this.isCurrentWorker(worker)) {
                        var data = event.data.message;
                        callback(data.hintData, data.hintErrors);
                    }
                    this.addWorkerToPool(worker);
                }
            }).bind(this);

            worker.postMessage({
                code: hintCode,
                externalsDir: this.externalsDir,
                jshintFile: this.jshintFile
            });
        });
    }

    _createClass(PJSCodeInjector, [{
        key: "addMethods",
        value: function addMethods(additionalMethods) {
            var _this = this;

            if (this.sandboxed) {
                this.processing.Object = window.Object;
                this.processing.RegExp = window.RegExp;
                this.processing.Math = window.Math;
                this.processing.Array = window.Array;
                this.processing.String = window.String;
                this.processing.isNaN = window.isNaN;
                this.processing.Number = window.Number;
                this.processing.Date = window.Date;
            }

            Object.assign(this.processing, {
                getImage: function getImage(filename) {
                    return _this.resourceCache.getImage(filename);
                },

                loadImage: function loadImage(file) {
                    throw { message: "Use getImage instead of loadImage." };
                },

                requestImage: function requestImage(file) {
                    throw { message: "Use getImage instead of requestImage." };
                },

                // Disable link method
                link: function link() {
                    throw { message: i18n._("link() method is disabled.") };
                },

                getSound: function getSound(filename) {
                    return _this.resourceCache.getSound(filename);
                },

                playSound: function playSound(sound) {
                    if (sound && sound.audio && sound.audio.play) {
                        sound.audio.currentTime = 0;
                        sound.audio.play();
                    } else {
                        throw { message: i18n._("No sound file provided.") };
                    }
                },

                // Basic console logging
                debug: function debug() {
                    console.log.apply(console, arguments);
                }
            });

            Object.assign(this.processing, additionalMethods);
        }
    }, {
        key: "initializeProps",

        /**
         * Collects a list of props and safeCalls from this.processing.
         */
        value: function initializeProps() {
            // this.props holds the names of the properties which
            // are to be exposed by Processing.js to the user.
            var externalProps = this.props = {},

            // this.safeCalls holds the names of the properties
            // which are functions which appear to not have any
            // side effects when called.
            safeCalls = this.safeCalls = {};

            // Make sure that only certain properties can be manipulated
            for (var processingProp in this.processing) {
                // Processing.js has some "private" methods (beginning with __)
                // these shouldn't be exposed to the user.
                if (processingProp.indexOf("__") < 0) {
                    var value = this.processing[processingProp],
                        isFunction = typeof value === "function";

                    // If the property is a function or begins with an uppercase
                    // character (as is the case for constants in Processing.js)
                    // or is height/width (overriding them breaks stuff)
                    // or is a key-related function (as in keyPressed)
                    // then the user should not be allowed to override the
                    // property (restricted by JSHINT).
                    externalProps[processingProp] = !(/^[A-Z]/.test(processingProp) || processingProp === "height" || processingProp === "width" || processingProp === "key" || isFunction && processingProp.indexOf("key") < 0);

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
                            if (this.idempotentCalls.indexOf(processingProp) !== -1 || /native code/.test(strValue) || /return /.test(strValue) && !/p\./.test(strValue) && !/new P/.test(strValue)) {
                                safeCalls[processingProp] = true;
                            }
                        } catch (e) {}
                    }
                }
            }

            // PVector is actually safe, there are no obvious side effects
            safeCalls.PVector = true;

            // The same is true for the color function.  The reason why color
            // fails the test above is because processing-js defines a toString
            // method on it which returns "rgba(0,0,0,0)" which doesn't doesn't
            // contain the string "return" so it fails.
            safeCalls.color = true;

            // arc fails the test because it calls convertToRadians,
            // but that doesn't produce a side effect
            safeCalls.arc = true;

            // It doesn't affect the main Processing instance.  It fails the
            // above test because it calls "new Processing();".
            safeCalls.createGraphics = true;

            // The one exexternalPropsception to the rule above is the draw function
            // (which is defined on init but CAN be overridden).
            externalProps.draw = true;
        }
    }, {
        key: "restoreRandomSeed",

        /**
         * Restores the random seed to that saved seed value.
         */
        value: function restoreRandomSeed() {
            this.processing.randomSeed(this.seed);
        }
    }, {
        key: "reseedRandom",

        /**
         * Generate a new random seed value and save it.
         */
        value: function reseedRandom() {
            this.seed = Math.floor(Math.random() * 4294967296);
        }
    }, {
        key: "clear",

        /**
         * Resets the canvas.
         *
         * See liveReset for a list methods it calls and the values that resets.
         */
        value: function clear() {
            var _this2 = this;

            Object.keys(this.liveReset).forEach(function (prop) {
                _this2.processing[prop].apply(_this2.processing, _this2.liveReset[prop]);
            });
        }
    }, {
        key: "restart",

        /**
         * Restarts the user's program.
         */
        value: function restart() {
            this.lastGrab = null;
            this.lastGrabObj = null;

            // Grab a new random seed
            this.reseedRandom();

            // Reset frameCount variable on restart
            this.processing.frameCount = 0;

            // Clear Processing logs
            this.processing._clearLogs();
        }
    }, {
        key: "propListString",

        /**
         * Generate a string list of properties.
         *
         * @param {Object} props
         * @returns {string}
         */
        value: function propListString(props) {
            // Prevent certain properties from being exposed
            var bannedProps = {
                externals: true
            };

            var propList = [];

            Object.keys(props).forEach(function (prop) {
                if (!bannedProps[prop]) {
                    propList.push(prop + ":" + props[prop]);
                }
            });

            return propList.join(",");
        }
    }, {
        key: "lint",

        /**
         * Lints user code.
         *
         * @param {string} userCode: code to lint
         * @param {boolean} skip: skips linting if true and resolves Deferred immediately
         * @returns {Promise} resolves an array of lint errors
         */
        value: function lint(userCode, skip) {
            var _this3 = this;

            return new Promise(function (resolve) {
                if (skip || !userCode) {
                    resolve([]);
                    return;
                }

                // Build a string of options to feed into JSHint
                // All properties are defined in the config
                var hintCode = "/*jshint " + _this3.propListString(_this3.JSHint) + " */" + (

                // Build a string of variables names to feed into JSHint
                // This lets JSHint know which variables are globally exposed
                // and which can be overridden, more details:
                // http://www.jshint.com/about/
                // propName: true (is a global property, but can be overridden)
                // propName: false (is a global property, cannot be overridden)
                "/*global " + _this3.propListString(_this3.props) + " */\n") +

                // The user's code to execute
                userCode;

                _this3.hintWorker.exec(hintCode, function (hintData, hintErrors) {
                    _this3.globals = _this3.extractGlobals(hintData);
                    resolve(hintErrors);
                });
            });
        }
    }, {
        key: "extractGlobals",

        /**
         * Extracts globals from the data return from the jshint and stores them
         * in this.globals.  Used in runCode, hasOrHadDrawLoop, and injectCode.
         *
         * @param {Object} hintData: an object containing JSHINT.data after
         *                 jshint-worker.js runs JSHINT(userCode).
         * @returns {Object} An object containing all of the globals as keys.
         */
        value: function extractGlobals(hintData) {
            var globals = {};

            // We only need to extract globals when the code has passed
            // the JSHint check
            var externalProps = this.props;
            if (hintData && hintData.globals) {
                for (var i = 0, l = hintData.globals.length; i < l; i++) {
                    var global = hintData.globals[i];

                    // Do this so that declared variables are gobbled up
                    // into the global context object
                    if (!externalProps[global] && !(global in this.processing)) {
                        this.processing[global] = undefined;
                    }
                    globals[global] = true;
                }
            }
            return globals;
        }
    }, {
        key: "objectExtract",

        /**
         * Extract an object's properties for dynamic insertion.
         *
         * @param {string} name The name of the property to extract.
         * @param {Object} obj Object to extract properties from.
         * @param {string} [proto] Name of a property on the object to use instead of
         *        of the object itself.
         */
        value: function objectExtract(name, obj, proto) {
            // Make sure the object actually exists before we try
            // to inject stuff into it
            if (!this.processing[name]) {
                if (Array.isArray(obj)) {
                    this.processing[name] = [];
                } else if (typeof obj === "function") {
                    this.processing[name] = function () {};
                } else {
                    this.processing[name] = {};
                }
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
                        this.grabObj[name + (proto ? "." + proto : "") + "['" + objProp + "']"] = PJSCodeInjector.stringify(obj[objProp]);

                        // Otherwise we should probably just inject the value directly
                    } else {
                        // Get the object that we'll be injecting into
                        var outputObj = this.processing[name];

                        if (proto) {
                            outputObj = outputObj[proto];
                        }

                        // Inject the object
                        outputObj[objProp] = obj[objProp];
                    }
                }
            }
        }
    }, {
        key: "hasOrHadDrawLoop",

        /**
         * Checks to see if a draw loop-introducing method currently
         * exists, or did exist, in the user's program.
         */
        value: function hasOrHadDrawLoop() {
            for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
                var name = this.drawLoopMethods[i];
                if (this.globals[name] || this.lastGrab && this.lastGrab[name]) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: "drawLoopMethodDefined",

        /**
         * Checks to see if a draw loop method is currently defined in the
         * user's program (defined is equivalent to !undefined or if it's
         * just a stub program.)
         */
        value: function drawLoopMethodDefined() {
            for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
                var name = this.drawLoopMethods[i];
                if (this.processing[name] !== this.DUMMY && this.processing[name] !== undefined) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: "runCode",
        value: function runCode(userCode, callback) {
            var _this4 = this;

            try {
                var resources = PJSResourceCache.findResources(userCode);
                this.resourceCache.cacheResources(resources).then(function () {
                    _this4.injectCode(userCode, callback);
                });
            } catch (e) {
                var _e$message$split = e.message.split(":");

                var _e$message$split2 = _slicedToArray(_e$message$split, 2);

                var line = _e$message$split2[0];
                var text = _e$message$split2[1];

                if (text.trim() === "Unexpected token ILLEGAL") {
                    text = i18n._("Unexpected character.");
                } else {
                    text = i18n._("Parser error.");
                }

                // JSHint isn't affected by numbers prefixed with 0s, but esprima
                // is.  We display exceptions thrown by esprima as errors to the
                // user.  Unfortunately, esprima doesn't provide that much
                // information, but it's better than swallowing the error.
                callback([{
                    type: "error",
                    source: "esprima",
                    column: 0,
                    row: parseInt(/[1-9][0-9]*/.exec(line), 10) - 1,
                    text: text
                }]);
            }
        }
    }, {
        key: "injectCode",

        /**
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
         *
         * @param {string} userCode
         * @param {Function} callback
         */
        value: function injectCode(userCode, callback) {
            var _this5 = this;

            // Holds all the global variables extracted from the user's code
            var grabAll = {};

            // Holds all the function calls that came from function calls that
            // have side effects
            var fnCalls = [];

            // Holds rendered code for each of the calls in fnCalls
            var mutatingCalls = [];

            // Is true if the code needs to be completely re-run
            // This is true when instantiated objects that need
            // to be reinitialized.
            var rerun = false;

            // Keep track of which function properties need to be
            // reinitialized after the constructor has been changed
            var reinit = {};

            // A map of all global constructors (used for later
            // reinitialization of instances upon a constructor change)
            var constructors = {};

            // The properties exposed by the Processing.js object
            var externalProps = this.props;

            // The code string to inject into the live execution
            var inject = "";

            // Grab all object properties and prototype properties from
            // all objects and function prototypes
            this.grabObj = {};

            // Extract a list of instances that were created using applyInstance
            PJSCodeInjector.instances = [];

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
                _.each(this.globals, (function (val, global) {
                    var value = this.processing[global];
                    // Expose all the global values, if they already exist although
                    // even if they are undefined, the result will still get sucked
                    // into grabAll) Replace functions that have side effects with
                    // placeholders (for later execution)
                    grabAll[global] = typeof value === "function" && !this.safeCalls[global] ? function () {
                        if (typeof fnCalls !== "undefined") {
                            fnCalls.push([global, arguments]);
                        }
                        return 0;
                    } : value;
                }).bind(this));

                // Run the code with the grabAll context. The code is run with no
                // side effects and instead all function calls and globally-defined
                // variable values are extracted. Abort injection on a runtime
                // error.
                var error = this.exec(userCode, grabAll);
                if (error) {
                    return callback([error]);
                }

                // Attach names to all functions
                _.each(grabAll, function (val, prop) {
                    if (typeof val === "function") {
                        val.__name = prop;
                    }
                });

                // Keep track of all the constructor functions that may
                // have to be reinitialized
                for (var i = 0, l = PJSCodeInjector.instances.length; i < l; i++) {
                    constructors[PJSCodeInjector.instances[i].constructor.__name] = true;
                }

                // The instantiated instances have changed, which means that
                // we need to re-run everything.
                if (this.oldInstances && PJSCodeInjector.stringifyArray(this.oldInstances) !== PJSCodeInjector.stringifyArray(PJSCodeInjector.instances)) {
                    rerun = true;
                }

                // TODO(kevinb) cache instances returned by createGraphics.
                // Rerun if there are any uses of createGraphics.  The problem is
                // not actually createGraphics, but rather calls that render stuff
                // to the Processing instances returned by createGraphics.  In the
                // future we might be able to reuse these instances, but we'd need
                // to track which call to createGraphics returned which instance.
                // Using the arguments as an id is insufficient.  We'd have to use
                // some combination of which line number createGraphics was called
                // on whether it was the first call, second call, etc. that created
                // it to deal with loops.  We'd also need to take into account edit
                // operations that add/remove lines so that we could update the
                // line number in the id to avoid unnecessary reruns.  After all of
                // that we'll still have to fall back to rerun in all other cases.
                if (/createGraphics[\s\n]*\(/.test(userCode)) {
                    rerun = true;
                }

                // Reset the instances list
                this.oldInstances = PJSCodeInjector.instances;
                PJSCodeInjector.instances = [];

                var _loop = function (i) {
                    // Reconstruction the function call
                    args = Array.prototype.slice.call(fnCalls[i][1]);
                    results = args.map(function (arg, argIndex) {
                        // Parameters here can come in the form of objects.
                        // For any object parameter, we don't want to serialize it
                        // because we'd lose the whole prototype chain.
                        // Instead we create temporary variables for each.
                        if (!_.isArray(arg) && _.isObject(arg)) {
                            var varName = "__obj__" + fnCalls[i][0] + "__" + argIndex;
                            _this5.processing[varName] = arg;
                            return varName;
                        } else {
                            return PJSCodeInjector.stringify(arg);
                        }
                    });

                    mutatingCalls.push(fnCalls[i][0] + "(" + results.join(", ") + ");");
                };

                // Look for new top-level function calls to inject
                for (var i = 0; i < fnCalls.length; i++) {
                    var args;
                    var results;

                    _loop(i);
                }

                // We also look for newly-changed global variables to inject
                _.each(grabAll, (function (val, prop) {
                    // Ignore KAInfiniteLoop functions.
                    if (/^KAInfiniteLoop/.test(prop)) {
                        return;
                    }

                    // Ignore PJSCodeInjector so that we can still access 'test', 'lint'
                    // and other methods in our tests.
                    if (/^PJSCodeInjector/.test(prop)) {
                        return;
                    }

                    // Turn the result of the extracted value into
                    // a nicely-formatted string
                    try {
                        grabAll[prop] = PJSCodeInjector.stringify(grabAll[prop]);

                        // Check to see that we've done an inject before and that
                        // the property wasn't one that shouldn't have been
                        // overridden, and that either the property wasn't in the
                        // last extraction or that the value of the property has
                        // changed.
                        if (this.lastGrab && externalProps[prop] !== false && (!(prop in this.lastGrab) || grabAll[prop] !== this.lastGrab[prop])) {

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

                                inject += "var " + prop + " = " + grabAll[prop] + ";\n";

                                // Give the function a name as well
                                inject += prop + ".__name = '" + prop + "';\n";

                                // Otherwise it's ok to inject it directly into the
                                // new environment
                            } else {
                                // If we have an object, then copy over all of the
                                // properties so we don't accidentally destroy
                                // function scope from `with()` and closures on the
                                // object prototypes.
                                // TODO(bbondy): This may copy over things that
                                // were deleted. If we ever run into a problematic
                                // program, we may want to add support here.
                                if (!_.isArray(val) && _.isObject(val) && !_.isArray(this.processing[prop]) && _.isObject(this.processing[prop])) {
                                    // Copy over all of the properties
                                    for (var p in val) {
                                        if (val.hasOwnProperty(p)) {
                                            this.processing[prop][p] = val[p];
                                        }
                                    }
                                } else {
                                    this.processing[prop] = val;
                                }
                            }
                        }

                        // For each function we also need to make sure that we
                        // extract all of the object and prototype properties
                        // (Since they won't be detected normally)
                        if (typeof val === "function" && externalProps[prop] !== false) {
                            this.objectExtract(prop, val);
                            this.objectExtract(prop, val, "prototype");
                        }

                        // The variable contains something that can't be serialized
                        // (such as instantiated objects) and so we need to extract it
                    } catch (e) {
                        this.objectExtract(prop, val);
                    }
                }).bind(this));

                // Insertion of new object properties or methods on a prototype
                _.each(this.grabObj, (function (val, objProp) {
                    var baseName = /^[^.[]*/.exec(objProp)[0];

                    // If we haven't done an extraction before or if the value
                    // has changed, or if the function was reinitialized,
                    // insert the new value.
                    if (!this.lastGrabObj || this.lastGrabObj[objProp] !== val || reinit[baseName]) {
                        inject += objProp + " = " + val + ";\n";
                    }
                }).bind(this));

                // Deletion of old object properties
                for (var objProp in this.lastGrabObj) {
                    if (!(objProp in this.grabObj)) {
                        inject += "delete " + objProp + ";\n";
                    }
                }

                // Make sure that deleted variables are removed.
                // Go through all the previously-defined properties and check to see
                // if they've been removed.
                /* jshint forin:false */
                for (var oldProp in this.lastGrab) {
                    // ignore KAInfiniteLoop functions
                    if (/^KAInfiniteLoop/.test(oldProp)) {
                        continue;
                    }
                    // If the property doesn't exist in this grab extraction and
                    // the property isn't a Processing.js-defined property
                    // (e.g. don't delete 'background') but allow the 'draw'
                    // function to be deleted (as it's user-defined)
                    if (!(oldProp in grabAll) && (!(oldProp in this.props) || _.contains(this.drawLoopMethods, oldProp))) {
                        // Create the code to delete the variable
                        inject += "delete " + oldProp + ";\n";

                        // If the draw function was deleted we also
                        // need to clear the display
                        if (oldProp === "draw") {
                            this.clear();
                            this.processing.draw = this.DUMMY;
                        }
                    }
                }
            }

            // Make sure the matrix is always reset
            this.processing.resetMatrix();

            // Seed the random number generator with the same seed
            this.restoreRandomSeed();

            // Make sure the various draw styles are also reset
            // if they were just removed
            if (this.lastGrab) {
                Object.keys(this.liveReset).forEach(function (prop) {
                    if (!_this5.globals[prop] && _this5.lastGrab[prop]) {
                        _this5.processing[prop].apply(_this5.processing, _this5.liveReset[prop]);
                    }
                });
            }

            // Re-run the entire program if we don't need to inject the changes
            // (Injection only needs to occur if a draw loop exists and if a prior
            // run took place)
            if (!hasOrHadDrawLoop || !this.drawLoopMethodDefined() || !this.lastGrab || rerun) {
                // Clear the output if no injection is occurring
                this.clear();

                // Clear Processing logs
                this.processing._clearLogs();

                // Force a call to the draw function to force checks for instances
                // and to make sure that errors in the draw loop are caught.
                if (this.globals.draw) {
                    userCode += "\ndraw();";
                }

                // Run the code as normal
                var error = this.exec(userCode, this.processing);
                if (error) {
                    return callback([error]);
                }

                // Attach names to all functions
                _.each(this.globals, function (val, prop) {
                    if (typeof val === "function") {
                        val.__name = prop;
                    }
                });

                // Otherwise if there is code to inject
            } else if (inject || mutatingCalls.length > 0) {
                // Force a call to the draw function to force checks for instances
                // and to make sure that errors in the draw loop are caught.
                if (this.globals.draw) {
                    inject += "\ndraw();";
                }

                // Execute the injected code
                var error = this.exec(inject, this.processing, mutatingCalls);
                if (error) {
                    return callback([error]);
                }
            }

            // Need to make sure that the draw function is never deleted
            // (Otherwise Processing.js starts to freak out)
            if (!this.processing.draw) {
                this.processing.draw = this.DUMMY;
            }

            // Save the extracted variables for later comparison
            if (hasOrHadDrawLoop) {
                this.lastGrab = grabAll;
                this.lastGrabObj = this.grabObj;
            }

            if (callback) {
                try {
                    callback([]);
                } catch (e) {}
            }
        }
    }, {
        key: "transformCode",

        /**
         * Transform processing-js code so that it can be run in a sandboxed
         * environment or exported so that it can run without live-editor (requires
         * processing.js)
         *
         * @param {String} code A string contain the code to transform.
         * @param {Object} context An object which contains methods which should
         * appear global to the code being run.  The code should be run using the
         * same context, see PJSCodeInjector::exec.
         * @param {String[]} [mutatingCalls] An array of strings containing calls
         * that change state and must be re-run in order to put a Processing
         * context back into a particular state.  This array is optional and is
         * only used when injecting code into a running Processing instance.
         * @param {Object} [options] Currently the only option supported is the
         * `rewriteNewExpression` property which controls whether or not to rewrite
         * `new` expressions as calls to PJSCodeInjector.applyInstance.
         * @returns {String} The transformed code.
         */
        value: function transformCode(code, context, mutatingCalls) {
            var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var envName = this.envName;
            var enableLoopProtect = this.enableLoopProtect;
            var loopProtector = this.loopProtector;

            var rewriteNewExpression = true;
            if (options.hasOwnProperty("rewriteNewExpression")) {
                rewriteNewExpression = options.rewriteNewExpression;
            }

            context.KAInfiniteLoopProtect = this.loopProtector.KAInfiniteLoopProtect;
            context.KAInfiniteLoopSetTimeout = this.loopProtector.KAInfiniteLoopSetTimeout;
            context.KAInfiniteLoopCount = 0;

            // Adding this to the context is required for any calls to applyInstance.
            // TODO(kevinb) We should change how we're rewriting constructor calls.
            // Currently we're doing a global replace which causes things that look
            // like 'new' calls in comments to be replaced as well.
            context.PJSCodeInjector = PJSCodeInjector;

            // This is necessary because sometimes 'code' is code that we want to
            // inject.  This injected code can contain code obtained from calling
            // .toString() on functions that were grabbed.  These may contain
            // references to KAInfiniteLoopCount that have already been prefixed
            // with a previous __env__ string.
            // TODO(kevinb) figure out how to use the AST so we're not calling .toString() on functions
            var envNameRegex = new RegExp(envName + "\\.", "g");
            var ast = esprima.parse(code.replace(envNameRegex, ""), { loc: true });

            var astTransformPasses = [];

            // 'mutatingCalls' is undefined only when we are injecting code.
            // This is not perfect protection from users typing one of these banned
            // properties, but it does guard against some cases.  The reason why
            // we're allowing these props in this case is that code that injected
            // is comes from calling .toString on functions which have already been
            // transformed from a previous call to exec().

            if (!mutatingCalls) {
                astTransformPasses.push(ASTTransforms.checkForBannedProps(["__env__", "KAInfiniteLoopCount", "KAInfiniteLoopProtect", "KAInfiniteLoopSetTimeout"]));
            } else {
                astTransformPasses.push(ASTTransforms.checkForBannedProps(["__env__"]));
            }

            // loopProtector adds LoopProtector code which checks how long it's
            // taking to run event loop and will throw if it's taking too long.
            if (enableLoopProtect && !mutatingCalls) {
                astTransformPasses.push(loopProtector);
            }

            // rewriteAssertEquals adds line and column arguments to calls to
            // Program.assertEquals.
            astTransformPasses.push(ASTTransforms.rewriteAssertEquals);

            // rewriteNewExpressions transforms NewExpressions into CallExpressions.
            if (rewriteNewExpression) {
                astTransformPasses.push(ASTTransforms.rewriteNewExpressions(envName, context));
            }

            try {
                walkAST(ast, null, astTransformPasses);
            } catch (e) {
                return e;
            }

            // rewriteContextVariables has to be done separately because loopProtector
            // adds variable references which need to be rewritten.
            // Profile first before trying to combine these two passes.  It may be
            // that parsing is dominating
            walkAST(ast, null, [ASTTransforms.rewriteContextVariables(envName, context)]);

            code = "";
            if (mutatingCalls) {
                // Prepend injected function calls with envName and any arguments
                // that are objects with envName as well.  This is a lot quicker
                // than parsing these and using rewriteContextVariables, especially
                // if there are a lot of inject function calls.
                code += mutatingCalls.map(function (call) {
                    call = call.replace(/__obj__/g, envName + ".__obj__");
                    return envName + "." + call;
                }).join("\n");
            }

            return code + escodegen.generate(ast);
        }
    }, {
        key: "exportCode",

        /**
         * Exports code so that it can be run without live-editor (requires
         * processing.js)
         *
         * @param {string} code
         * @param {string} imageDir
         * @param {string} soundDir
         * @returns {string}
         */
        value: function exportCode(code, imageDir, soundDir) {
            var options = {
                rewriteNewExpression: false
            };
            var transformedCode = this.transformCode(code, this.processing, null, options);
            var helperCode = "";
            var resources = PJSResourceCache.findResources(transformedCode);

            // TODO(kevinb) generate this code once (once webpack is in place)
            helperCode += "var resources = " + JSON.stringify(resources) + ";\n";
            helperCode += PJSUtils.cleanupCode(PJSUtils.codeFromFunction(function () {
                var resourceCache = [];
                // __IMAGEDIR__
                // __SOUNDDIR__

                var imageHolder = document.createElement("div");

                imageHolder.style.height = 0;
                imageHolder.style.width = 0;
                imageHolder.style.overflow = "hidden";
                imageHolder.style.position = "absolute";

                document.body.appendChild(imageHolder);

                var loadImage = function loadImage(filename) {
                    return new Promise(function (resolve) {
                        var img = document.createElement("img");
                        img.onload = function () {
                            resourceCache[filename] = img;
                            resolve();
                        };
                        img.onerror = function () {
                            resolve(); // always resolve
                        };

                        img.src = imageDir + filename;
                        imageHolder.appendChild(img);
                        resourceCache[filename] = img;
                    });
                };

                var loadSound = function loadSound(filename) {
                    return new Promise(function (resolve) {
                        var audio = document.createElement("audio");
                        var parts = filename.split("/");

                        var group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
                        if (!group || group.sounds.indexOf(parts[1].replace(".mp3", "")) === -1) {
                            resolve();
                            return;
                        }

                        audio.preload = "auto";
                        audio.oncanplaythrough = function () {
                            resourceCache[filename] = audio;
                            resolve();
                        };
                        audio.onerror = function () {
                            resolve();
                        };

                        audio.src = soundDir + filename;
                    });
                };

                var promises = Object.keys(resources).map(function (filename) {
                    if (filename.indexOf(".png") !== -1) {
                        return loadImage(filename);
                    } else if (filename.indexOf(".mp3") !== -1) {
                        return loadSound(filename);
                    }
                });

                Promise.all(promises).then(function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = 400;
                    canvas.height = 400;

                    var p = new Processing(canvas);

                    p.width = 400;
                    p.height = 400;

                    p.getSound = function (sound) {
                        return resourceCache[sound + ".mp3"];
                    };

                    p.playSound = function (sound) {
                        if (sound && sound.play) {
                            sound.currentTime = 0;
                            sound.play();
                        } else {
                            throw new Error("No sound file provided.");
                        }
                    };

                    p.getImage = function (image) {
                        return new p.PImage(resourceCache[image + ".png"]);
                    };

                    // __USERCODE__

                    if (p.draw) {
                        p.loop();
                    }
                });
            })) + "\n";

            return helperCode.replace(/\/\/ __USERCODE__/g, transformedCode).replace(/\/\/ __IMAGEDIR__/g, "var imageDir = \"" + imageDir + "\"").replace(/\/\/ __SOUNDDIR__/g, "var soundDir = \"" + soundDir + "\"");
        }
    }, {
        key: "exec",

        /**
         * Executes the user's code.
         *
         * @param {string} code The user code to execute.
         * @param {Object} context An object containing global object we'd like the
         * user to have access to.  It's also used to capture objects that the user
         * defines so that we can re-inject them into the execution context as
         * users modify their programs.
         * @param {Array} [mutatingCalls] An array of strings containing all of the
         * function calls to be injected.
         * @returns {Error}
         */
        value: function exec(code, context, mutatingCalls) {
            if (!code) {
                return;
            }

            // the top-level 'this' is empty except for this.externals, which
            // throws this message this is how users were getting at everything
            // from playing sounds to displaying pop-ups
            var badProgram = i18n._("This program uses capabilities we've turned " + "off for security reasons. Khan Academy prohibits showing " + "external images, playing external sounds, or displaying pop-ups.");
            var topLevelThis = "{ get externals() { throw { message: " + JSON.stringify(badProgram) + " } } }";

            try {
                var transformedCode = this.transformCode(code, context, mutatingCalls);
                var funcBody = "var " + this.envName + " = context;\n" + ("(function(){\n" + transformedCode + "\n}).apply(" + topLevelThis + ");");
                var func = new Function("context", funcBody);
                func(context);
            } catch (e) {
                return e;
            }
        }
    }], [{
        key: "stringify",

        // Turn a JavaScript object into a form that can be executed
        // (Note: The form will not necessarily be able to pass a JSON linter)
        // (Note: JSON.stringify might throw an exception. We don't capture it
        //        here as we'll want to deal with it later.)
        value: function stringify(obj) {
            // Use toString on functions
            if (typeof obj === "function") {
                return obj.toString();

                // If we're dealing with an instantiated object just
                // use its generated ID
            } else if (obj && obj.__id) {
                return obj.__id();

                // Check if we're dealing with an array
            } else if (obj && Object.prototype.toString.call(obj) === "[object Array]") {
                return this.stringifyArray(obj);

                // JSON.stringify returns undefined, not as a string, so we specially
                // handle that
            } else if (typeof obj === "undefined") {
                return "undefined";
            }

            // If all else fails, attempt to JSON-ify the string
            // TODO(jeresig): We should probably do recursion to better handle
            // complex objects that might hold instances.
            return JSON.stringify(obj, function (k, v) {
                // Don't jsonify the canvas or its context because it can lead
                // to circular jsonification errors on chrome.
                if (v && (v.id !== undefined && v.id === "output-canvas" || typeof CanvasRenderingContext2D !== "undefined" && v instanceof CanvasRenderingContext2D)) {
                    return undefined;
                }
                return v;
            });
        }
    }, {
        key: "stringifyArray",

        // Turn an array into a string list
        // (Especially useful for serializing a list of arguments)
        value: function stringifyArray(array) {
            var results = [];

            for (var i = 0, l = array.length; i < l; i++) {
                results.push(this.stringify(array[i]));
            }

            return results.join(", ");
        }
    }, {
        key: "applyInstance",

        // Defer a 'new' on a function for later
        // Makes it possible to generate a unique signature for the
        // instance (see: .__id())
        // Meant to translate:
        // new Foo(a, b, c) into: applyInstance(Foo)(a, b, c)
        value: function applyInstance(classFn, className) {
            // Don't wrap it if we're dealing with a built-in object (like RegExp)
            try {
                var funcName = (/^function\s*(\w+)/.exec(classFn) || [])[1];
                if (funcName && window[funcName] === classFn) {
                    return classFn;
                }
            } catch (e) {}

            // Return a function for later execution.
            return (function () {
                var args = arguments;

                // Create a temporary constructor function
                function Class() {
                    classFn.apply(this, args);
                }

                // Copy the prototype
                Class.prototype = classFn.prototype;

                // Instantiate the dummy function
                var obj = new Class();

                this.newCallback(classFn, className, obj, args);

                // Return the new instance
                return obj;
            }).bind(this);
        }
    }, {
        key: "newCallback",

        // called whenever a user defined class is called to instantiate an object.
        // adds metadata to the class and the object to keep track of it and to
        // serialize it.
        // Called in applyInstance
        value: function newCallback(classFn, className, obj, args) {
            // Make sure a name is set for the class if one has not been
            // set already
            if (!classFn.__name && className) {
                classFn.__name = className;
            }

            // Point back to the original function
            obj.constructor = classFn;

            // Generate a semi-unique ID for the instance
            obj.__id = (function () {
                return "new " + classFn.__name + "(" + this.stringifyArray(args) + ")";
            }).bind(this);

            // Keep track of the instances that have been instantiated
            // Note: this.instances is actually PJSCodeInjector.instances which is
            // a singleton.  This means that multiple instances of PJSCodeInjector
            // share the same instances array. Since each PJSCodeInjector lives in its
            // its own iframe with its own execution context, each should have its own
            // copy of PJSCodeInjector.instances.
            if (this.instances) {
                this.instances.push(obj);
            }
        }
    }]);

    return PJSCodeInjector;
})();

PJSCodeInjector.instances = [];

// TODO(kevinb) convert to a commonjs module at somepoint in the future
window.PJSCodeInjector = PJSCodeInjector;

// Ignore any errors that were generated in the callback
// NOTE(jeresig): This is needed because Mocha throws errors
// when it encounters an assertion error, which causes this
// to go haywire, generating an in-code error.
window.PJSTester = function (options) {
    this.initialize(options);
    this.bindTestContext();
};

PJSTester.prototype = new OutputTester();

PJSTester.prototype.testMethods = {
    /*
     * See if any of the patterns match the code
     */
    firstMatchingPattern: function firstMatchingPattern(patterns) {
        return _.find(patterns, _.bind(function (pattern) {
            return this.testContext.matches(pattern);
        }, this));
    },

    hasFnCall: function hasFnCall(name, check) {
        for (var i = 0, l = this.fnCalls.length; i < l; i++) {
            var retVal = this.testContext.checkFn(this.fnCalls[i], name, check);

            if (retVal === true) {
                return;
            }
        }

        this.testContext.assert(false, i18n._("Expected function call to '%(name)s' was not made.", { name: name }));
    },

    orderedFnCalls: function orderedFnCalls(calls) {
        var callPos = 0;

        for (var i = 0, l = this.fnCalls.length; i < l; i++) {
            var retVal = this.testContext.checkFn(this.fnCalls[i], calls[callPos][0], calls[callPos][1]);

            if (retVal === true) {
                callPos += 1;

                if (callPos === calls.length) {
                    return;
                }
            }
        }

        this.testContext.assert(false, i18n._("Expected function call to '%(name)s' was not made.", { name: calls[callPos][0] }));
    },

    checkFn: function checkFn(fnCall, name, check) {
        if (fnCall.name !== name) {
            return;
        }

        var pass = true;

        if (typeof check === "object") {
            if (check.length !== fnCall.args.length) {
                pass = false;
            } else {
                for (var c = 0; c < check.length; c++) {
                    if (check[c] !== null && check[c] !== fnCall.args[c]) {
                        pass = false;
                    }
                }
            }
        } else if (typeof check === "function") {
            pass = check(fnCall);
        }

        if (pass) {
            this.testContext.assert(true, i18n._("Correct function call made to %(name)s.", { name: name }));
        }

        return pass;
    },

    _isVarName: function _isVarName(str) {
        return _.isString(str) && str.length > 0 && str[0] === "$";
    },

    _assertVarName: function _assertVarName(str) {
        if (!this.testContext._isVarName(str)) {
            throw new Error(i18n._("Expected '%(name)s' to be a valid variable name.", { name: str }));
        }
    },

    /*
     * Satisfied when predicate(var) is true.
     */
    unaryOp: function unaryOp(varName, predicate) {
        this.testContext._assertVarName(varName);
        return this.testContext.constraint([varName], function (ast) {
            return !!(ast && !_.isUndefined(ast.value) && predicate(ast.value));
        });
    },

    /*
     * Satisfied when var is any literal.
     */
    isLiteral: function isLiteral(varName) {
        function returnsTrue() {
            return true;
        }

        return this.testContext.unaryOp(varName, returnsTrue);
    },

    /*
     * Satisfied when var is a number.
     */
    isNumber: function isNumber(varName) {
        return this.testContext.unaryOp(varName, _.isNumber);
    },

    /*
     * Satisfied when var is an identifier
     */
    isIdentifier: function isIdentifier(varName) {
        return this.testContext.constraint([varName], function (ast) {
            return !!(ast && ast.type && ast.type === "Identifier");
        });
    },

    /*
     * Satisfied when var is a boolean.
     */
    isBoolean: function isBoolean(varName) {
        return this.testContext.unaryOp(varName, _.isBoolean);
    },

    /*
     * Satisfied when var is a string.
     */
    isString: function isString(varName) {
        return this.testContext.unaryOp(varName, _.isString);
    },

    /*
     * Satisfied when pred(first, second) is true.
     */
    binaryOp: function binaryOp(first, second, predicate) {
        var variables = [];
        var fn;
        if (this.testContext._isVarName(first)) {
            variables.push(first);
            if (this.testContext._isVarName(second)) {
                variables.push(second);
                fn = function (a, b) {
                    return !!(a && b && !_.isUndefined(a.value) && !_.isUndefined(b.value) && predicate(a.value, b.value));
                };
            } else {
                fn = function (a) {
                    return !!(a && !_.isUndefined(a.value) && predicate(a.value, second));
                };
            }
        } else if (this.testContext._isVarName(second)) {
            variables.push(second);
            fn = function (b) {
                return !!(b && !_.isUndefined(b.value) && predicate(first, b.value));
            };
        } else {
            throw new Error(i18n._("Expected either '%(first)s' or '%(second)s'" + " to be a valid variable name.", { first: first, second: second }));
        }

        return this.testContext.constraint(variables, fn);
    },

    /*
     * Satisfied when a < b
     */
    lessThan: function lessThan(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a < b;
        });
    },

    /*
     * Satisfied when a <= b
     */
    lessThanOrEqual: function lessThanOrEqual(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a <= b;
        });
    },

    /*
     * Satisfied when a > b
     */
    greaterThan: function greaterThan(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a > b;
        });
    },

    /*
     * Satisfied when a > 0
     */
    positive: function positive(a) {
        return this.testContext.unaryOp(a, function (a) {
            return a > 0;
        });
    },

    /*
     * Satisfied when a > 0
     */
    negative: function negative(a) {
        return this.testContext.unaryOp(a, function (a) {
            return a < 0;
        });
    },

    /*
     * Satisfied when a >= b
     */
    greaterThanOrEqual: function greaterThanOrEqual(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a >= b;
        });
    },

    /*
     * Satisfied when min <= val <= max
     */
    inRange: function inRange(val, min, max) {
        return this.testContext.and(this.testContext.greaterThanOrEqual(val, min), this.testContext.lessThanOrEqual(val, max));
    },

    /*
     * Satisfied when a === b
     */
    equal: function equal(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a === b;
        });
    },

    /*
     * Satisfied when a !== b
     */
    notEqual: function notEqual(a, b) {
        return this.testContext.binaryOp(a, b, function (a, b) {
            return a !== b;
        });
    },

    /*
     * Satisfied when constraint is not satisfied
     */
    not: function not(constraint) {
        return this.testContext.constraint(constraint.variables, function () {
            return !constraint.fn.apply({}, arguments);
        });
    },

    _naryShortCircuitingOp: function _naryShortCircuitingOp(allOrAny, args) {
        var variables = _.union.apply({}, _.pluck(args, "variables"));

        var argNameToIndex = _.object(_.map(variables, function (item, i) {
            return [item, i];
        }));

        return this.testContext.constraint(variables, function () {
            var constraintArgs = arguments;
            return allOrAny(args, function (constraint) {
                var fnArgs = _.map(constraint.variables, function (varName) {
                    return constraintArgs[argNameToIndex[varName]];
                });

                return constraint.fn.apply({}, fnArgs);
            });
        });
    },

    /*
     * Satisfied when all of the input constraints are satisfied
     */
    and: function and() {
        return this.testContext._naryShortCircuitingOp(_.all, arguments);
    },

    /*
     * Satisfied when any of the input constraints are satisfied
     */
    or: function or() {
        return this.testContext._naryShortCircuitingOp(_.any, arguments);
    },

    /*
     * Returns a new structure from the combination of a pattern and a
     * constraint
     */
    structure: function structure(pattern, constraint) {
        return {
            pattern: pattern,
            constraint: constraint
        };
    },

    /*
     * Creates a new variable constraint
     */
    constraint: function constraint(variables, fn) {
        return {
            variables: variables,
            fn: fn
        };
    },

    /*
     * Returns the result of matching a structure against the user's code
     */
    match: function match(structure) {
        // If there were syntax errors, don't even try to match it
        if (this.errors.length) {
            return {
                success: false,
                message: i18n._("Syntax error!")
            };
        }

        // At the top, we take care of some "alternative" uses of this
        // function. For ease of challenge developing, we return a
        // failure() instead of disallowing these uses altogether

        // If we don't see a pattern property, they probably passed in
        // a pattern itself, so we'll turn it into a structure
        if (structure && _.isUndefined(structure.pattern)) {
            structure = { pattern: structure };
        }

        // If nothing is passed in or the pattern is non-existent, return
        // failure
        if (!structure || !structure.pattern) {
            return {
                success: false,
                message: ""
            };
        }

        try {
            var callbacks = structure.constraint;
            var success = Structured.match(this.userCode, structure.pattern, {
                varCallbacks: callbacks
            });

            return {
                success: success,
                message: callbacks && callbacks.failure
            };
        } catch (e) {
            console.warn(e);
            return {
                success: true,
                message: i18n._("Hm, we're having some trouble " + "verifying your answer for this step, so we'll give " + "you the benefit of the doubt as we work to fix it. " + "Please click \"Report a problem\" to notify us.")
            };
        }
    },

    /*
     * Returns true if the structure matches the user's code
     */
    matches: function matches(structure) {
        if (typeof structure !== "object") {
            structure = this.testContext.structure(structure);
        }
        return this.testContext.match(structure).success;
    },

    _checkSyntaxErrors: function _checkSyntaxErrors(syntaxChecks) {
        if (!syntaxChecks) return;

        // If we found any syntax errors or warnings, we'll send it
        // through the special syntax checks
        var foundErrors = _.any(this.errors, function (error) {
            return error.lint;
        });

        if (foundErrors) {
            _.each(syntaxChecks, (function (syntaxCheck) {
                // Check if we find the regex anywhere in the code
                var foundCheck = this.userCode.search(syntaxCheck.re);
                var rowNum = -1,
                    colNum = -1,
                    errorMsg;
                if (foundCheck > -1) {
                    errorMsg = syntaxCheck.msg;

                    // Find line number and character
                    var lines = this.userCode.split("\n");
                    var totalChars = 0;
                    _.each(lines, function (line, num) {
                        if (rowNum === -1 && foundCheck < totalChars + line.length) {
                            rowNum = num;
                            colNum = foundCheck - totalChars;
                        }
                        totalChars += line.length;
                    });

                    this.errors.splice(0, 1, {
                        text: errorMsg,
                        row: rowNum,
                        col: colNum,
                        type: "error"
                    });
                }
            }).bind(this));
        }
    },

    /*
     * Creates a new test result (i.e. new challenge step)
     */
    assertMatch: function assertMatch(result, description, hint, image, syntaxChecks) {
        this.testContext._checkSyntaxErrors(syntaxChecks);

        var alternateMessage;
        var alsoMessage;

        if (result.success) {
            alternateMessage = result.message;
        } else {
            alsoMessage = result.message;
        }

        this.testContext.assert(result.success, description, "", {
            // We can accept string hints here because
            //  we never match against them anyway
            structure: _.isString(hint) ? "function() {" + hint + "}" : hint.toString(),
            alternateMessage: alternateMessage,
            alsoMessage: alsoMessage,
            image: image
        });
    }
};
/*
 * BabyHint does a line-by-line check for common beginner programming mistakes,
 * such as misspelling, missing spaces, missing commas, etc.  It is used in
 * conjunction with JSHINT to report errors to the user.
 *
 * Each error returned contains the members:
 * {
 *      row         :   the row at which the error was found
 *      column      :   the column at which the error was found
 *      text        :   the error messaage
 *      breaksCode  :   true if we actually want to prevent them from
 *                      doing this
 *                      (if false, will only display if JSHINT broke on
 *                      the same line)
 * }
 */

var BabyHint = {

    EDIT_DISTANCE_THRESHOLD: 2,

    // We'll get function names from the global context
    // non-function keywords go here
    keywords: [
    /* RESERVED WORDS */
    "break", "case", "catch", "continue", "default", "do", "else", "finally", "for", "function", "if", "in", "instanceof", "new", "return", "switch", "this", "throw", "try", "typeof", "var", "while",
    /* JAVASCRIPT OBJECT PROPERTIES AND FUNCTIONS */
    /* Omit those included in the global context */
    "charAt", "charCodeAt", "fromCharCode", "indexOf", "lastIndexOf", "length", "pop", "prototype", "push", "replace", "search", "shift", "slice", "substring", "toLowerCase", "toUpperCase", "unshift"],

    // Expected number of parameters for known functions.
    // (Some functions can take multiple signatures)
    // We'll get most of these from the global context,
    // so these are just the overrides.
    functionParamCount: {
        "acos": 1,
        "asin": 1,
        "atan": 1,
        "atan2": 2,
        "background": [1, 2, 3, 4],
        "beginShape": [0, 1],
        "bezier": 8,
        "bezierVertex": [6],
        "box": [1, 2, 3],
        "color": [1, 2, 3, 4],
        "colorMode": [1, 2, 4, 5],
        "createFont": [1, 2],
        "cos": 1,
        "curve": 8,
        "cursor": [0, 1, 2, 3],
        "endShape": [0, 1],
        "dist": [4, 6],
        "fill": [1, 2, 3, 4],
        "filter": [1, 2],
        "get": [0, 2, 3, 4, 5],
        "image": [3, 5],
        "line": 4,
        "loadImage": [1, 3],
        "getImage": 1,
        "mag": [2, 3],
        "max": 2,
        "min": 2,
        "noise": [1, 2, 3],
        "PVector": [0, 2, 3],
        "random": [0, 1, 2],
        "RegExp": [1, 2],
        "rect": [4, 5, 8],
        "scale": [1, 2],
        "set": [3, 4],
        "sin": 1,
        "stroke": [1, 2, 3, 4],
        "tan": 1,
        "text": [3, 5],
        "textAlign": [1, 2],
        "textFont": [1, 2],
        "translate": [2, 3],
        "vertex": [2, 4],
        "Date": [0, 1, 2, 3, 4, 5, 6, 7]
    },

    // A mapping from function name to an example usage of the function
    // the titles of documentation programs
    functionFormSuggestion: {
        // forms that don't have documentation scratchpads
        // or weird formatting
        "function": "var drawWinston = function() { ... };",
        "while": "while (x < 20) { ... };"
    },

    // functions in the global context that we want
    // blacklisted because it's complicated...
    functionParamBlacklist: ["debug", "max", "min"],

    // These properties can be used for malicious purposes
    // It's just a stop-gap measure, making it much harder
    bannedProperties: {
        location: true,
        document: true,
        ownerDocument: true,
        createElement: true
    },

    variables: [],
    errors: [],
    inComment: false,
    spellChecked: false,

    init: function init(options) {
        // grab globals from Processing object
        for (var f in options.context) {
            if (typeof options.context[f] === "function") {
                BabyHint.keywords.push(f);
                if (!(f in BabyHint.functionParamCount) && !_.include(BabyHint.functionParamBlacklist, f)) {
                    BabyHint.functionParamCount[f] = options.context[f].length;
                }
            }
        }
    },

    initDocumentation: function initDocumentation(docTitles) {
        for (var i = 0; i < docTitles.length; i++) {
            var usage = docTitles[i];

            // kind of hacky, but many documentation titles don't take the form name(...) ...
            // so we grab which ones we can. and rely on the intial value of
            // the functionFormSuggestion map for any others we want to
            // support rest of them
            var firstParen = usage.indexOf("(");

            var name = usage;
            if (firstParen >= 0) {
                name = name.substring(0, firstParen).trim();
                BabyHint.functionFormSuggestion[name] = usage;
            }
        }
    },

    babyErrors: function babyErrors(source, hintErrors) {
        var errorLines = {};
        var lines = (source || "").split("\n");
        BabyHint.errors = [];
        BabyHint.variables = [];
        BabyHint.inComment = false;
        BabyHint.spellChecked = false;

        // Build a map of the lines on which JSHint produced an error
        _.each(hintErrors, function (error) {
            // Get correct index number from the reported line number
            if (error) {
                errorLines[error.line - 2] = true;
            }
        });

        _.each(lines, function (line, index) {
            // Check the line for errors
            BabyHint.errors = BabyHint.errors.concat(BabyHint.parseLine(line, index, errorLines[index]));
        });

        return BabyHint.errors;
    },

    // Checks a single line for errors
    parseLine: function parseLine(line, lineNumber, hasError) {
        var errors = [];

        if (BabyHint.inComment) {
            // We are in a multi-line comment.
            // Look for the end of the comments.
            line = BabyHint.removeEndOfMultilineComment(line);
        }
        if (!BabyHint.inComment) {
            line = BabyHint.removeStrings(line);
            line = BabyHint.removeComments(line);

            // Checks could detect new errors, thus must run on every line
            errors = errors
            // check for incorrect function declarations
            .concat(BabyHint.checkFunctionDecl(line, lineNumber))
            // we don't allow ending lines with "="
            .concat(BabyHint.checkTrailingEquals(line, lineNumber))
            // check for correct number of parameters
            .concat(BabyHint.checkFunctionParams(line, lineNumber))
            // check for banned property names
            .concat(BabyHint.checkBannedProperties(line, lineNumber));

            // Checks only run on lines with existing errors
            if (hasError) {
                errors = errors
                // check for missing space after var
                .concat(BabyHint.checkSpaceAfterVar(line, lineNumber));

                // only check spelling for the first error shown
                if (!BabyHint.spellChecked) {
                    errors = errors.concat(BabyHint.checkSpelling(line, lineNumber));
                    BabyHint.spellChecked = true;
                }
            }

            // add new variables for future spellchecking
            BabyHint.variables = BabyHint.variables.concat(BabyHint.getVariables(line));
        }

        return errors;
    },

    removeComments: function removeComments(line) {
        // replace commented out code with whitespaces
        // first check for "//"
        var index = line.indexOf("//");
        if (index !== -1) {
            line = line.slice(0, index);
        }

        // now check for "/*"
        while (line.indexOf("/*") !== -1) {
            index = line.indexOf("/*");
            var closeIndex = line.indexOf("*/");
            while (closeIndex !== -1 && closeIndex <= index + 1) {
                // unopened comments - let JSHINT catch these
                // we'll just remove the extra */ for now
                line = line.slice(0, closeIndex) + "  " + line.slice(closeIndex + 2);
                closeIndex = line.indexOf("*/");
            }
            if (closeIndex > index + 1) {
                // found /* */ on the same line
                var comment = line.slice(index, closeIndex + 2);
                line = line.slice(0, index) + comment.replace(/./g, " ") + line.slice(closeIndex + 2);
            } else if (closeIndex === -1) {
                // beginning of a multi-line comment
                // inComment won't take effect until the next line
                BabyHint.inComment = true;
                line = line.slice(0, index);
            }
        }
        return line;
    },

    removeEndOfMultilineComment: function removeEndOfMultilineComment(line) {
        var index = line.indexOf("*/");
        if (index !== -1) {
            BabyHint.inComment = false;
            line = line.slice(0, index + 2).replace(/./g, " ") + line.slice(index + 2);
        }
        return line;
    },

    removeStrings: function removeStrings(line) {
        // currently JSHINT doesn't allow multi-line strings, so
        // all string quotes should be closed on the same line
        var openIndex = -1;
        var quoteType = null;
        for (var i = 0; i < line.length; i++) {
            var letter = line[i];
            if (openIndex === -1) {
                // look for any type of quotes
                if (letter === "\"") {
                    openIndex = i;
                    quoteType = "\"";
                } else if (letter === "'") {
                    openIndex = i;
                    quoteType = "'";
                }
            } else if (letter === quoteType) {
                // replace string contents with whitespace
                var string = line.slice(openIndex + 1, i);
                line = line.slice(0, openIndex + 1) + string.replace(/./g, " ") + line.slice(i);
                openIndex = -1;
            }
        }
        return line;
    },

    checkFunctionDecl: function checkFunctionDecl(line, lineNumber) {
        var errors = [];
        var functions = line.match(/function\s+\w+/g);
        _.each(functions, function (fun) {
            var name = fun.split(/\s+/g)[1];
            // I18N: Don't translate the '\" var %(name)s = function() {}; \"' part
            var error = {
                row: lineNumber,
                column: line.indexOf(fun),
                text: i18n._("If you want to define a function, you should use \"var %(name)s = function() {}; \" instead!", { name: name }),
                breaksCode: true,
                source: "funcdeclaration",
                context: { name: name }
            };
            errors.push(error);
        });
        return errors;
    },

    checkBannedProperties: function checkBannedProperties(line, lineNumber) {
        var errors = [];
        var words = line.split(/[^~`@#\$\^\w]/g);
        _.each(words, function (word) {
            if (BabyHint.bannedProperties.hasOwnProperty(word)) {
                var error = {
                    row: lineNumber,
                    column: line.indexOf(word),
                    text: i18n._("%(word)s is a reserved word.", { word: word }),
                    breaksCode: true,
                    source: "bannedwords",
                    context: { word: word }
                };

                errors.push(error);
            }
        });
        return errors;
    },

    checkSpelling: function checkSpelling(line, lineNumber) {
        var errors = [];
        var words = line.split(/[^~`@#\$\^\w]/g);
        var skipNext = false;
        // Keeps track of portion of string not yet spellchecked, so search for
        // the second instance of the same word will be accurate.
        var checkedChar = -1;
        _.each(words, function (word) {
            if (word.length > 0 && !skipNext) {
                var editDist = BabyHint.editDistance(word);
                var dist = editDist.editDistance;
                var keyword = editDist.keyword;
                if (dist > 0 && dist <= BabyHint.EDIT_DISTANCE_THRESHOLD && dist < keyword.length - 1 && BabyHint.keywords.indexOf(word) === -1) {
                    checkedChar = line.indexOf(word, checkedChar + 1);
                    var error = {
                        row: lineNumber,
                        column: checkedChar,
                        text: i18n._("Did you mean to type \"%(keyword)s\" instead of \"%(word)s\"?", { keyword: keyword, word: word }),
                        breaksCode: false,
                        source: "spellcheck",
                        context: { keyword: keyword, word: word }
                    };

                    // if we have usage forms, display them as well.
                    if (BabyHint.functionFormSuggestion[keyword]) {
                        error.text += " " + i18n._("In case you forgot, you can use it like \"%(usage)s\"", { usage: BabyHint.functionFormSuggestion[keyword] });
                    }

                    errors.push(error);
                }
            }
            // Don't spell check variable declarations or function arguments
            skipNext = word === "var" || word === "function";
        });
        return errors;
    },

    editDistance: function editDistance(word) {
        var wordOrig = word;
        word = word.toLowerCase();

        // Dynamic programming implementation of Levenshtein Distance.
        // The rows are the letters of the keyword.
        // The cols are the letters of the word.
        var make2DArray = function make2DArray(rows, cols, initialVal) {
            initialVal = typeof initialVal === "undefined" ? 0 : initialVal;
            var array2D = [];
            for (var i = 0; i < rows; i++) {
                array2D[i] = [];
                for (var j = 0; j < cols; j++) {
                    array2D[i][j] = initialVal;
                }
            }
            return array2D;
        };

        var minDist = Infinity;
        var minWord = "";
        _.each(BabyHint.keywords.concat(BabyHint.variables), function (keyword) {

            // Take care of words being precisely the same
            if (keyword === wordOrig) {
                minDist = 0;
                minWord = keyword;
                return;
            }

            // Take care of simple case of capitalization as only difference
            if (keyword.toLowerCase() === word && keyword !== wordOrig) {
                minDist = 1;
                minWord = keyword;
                return;
            }

            // skip words with lengths that are too different
            if (Math.abs(keyword.length - word.length) > BabyHint.EDIT_DISTANCE_THRESHOLD) {
                return;
            }
            var rows = keyword.length;
            var cols = word.length;
            var table = make2DArray(rows, cols, 1);
            // initialize first cell
            if (keyword[0] === word[0]) {
                table[0][0] = 0;
            }
            // initialize first row
            for (var c = 1; c < cols; c++) {
                var diff = keyword[0] === word[c] ? 0 : 1;
                table[0][c] = table[0][c - 1] + diff;
            }
            // initialize first col
            for (var r = 1; r < rows; r++) {
                var diff = keyword[r] === word[0] ? 0 : 1;
                table[r][0] = table[r - 1][0] + diff;
            }
            // compute table
            for (var i = 1; i < rows; i++) {
                var minInRow = Number.MAX_VALUE;
                for (var j = 1; j < cols; j++) {
                    var diff = keyword[i] === word[j] ? 0 : 1;
                    var dist = _.min([table[i - 1][j] + 1, table[i][j - 1] + 1, table[i - 1][j - 1] + diff]);
                    minInRow = Math.min(minInRow, dist);
                    table[i][j] = dist;
                }
                // break out if entire row exceeds threshold
                if (minInRow > BabyHint.EDIT_DISTANCE_THRESHOLD) {
                    return;
                }
            }
            if (table[rows - 1][cols - 1] < minDist) {
                minDist = table[rows - 1][cols - 1];
                minWord = keyword;
            }
        });
        return { editDistance: minDist, keyword: minWord };
    },

    checkSpaceAfterVar: function checkSpaceAfterVar(line, lineNumber) {
        // Sometimes students forget the space between "var" and the
        // variable name. This only finds the first occurence of this
        // missing space
        var errors = [];
        var regex = /var\w+/g;
        var matches = line.match(regex);
        if (matches) {
            var variableName = matches[0].slice(3);
            var error = {
                row: lineNumber,
                column: line.search(regex) + 3,
                text: i18n._("Did you forget a space between \"var\" and \"%(variable)s\"?", { variable: variableName }),
                breaksCode: false
            };
            errors.push(error);
        }
        return errors;
    },

    checkTrailingEquals: function checkTrailingEquals(line, lineNumber) {
        var errors = [];
        var i = line.length - 1;
        // find the last character in the line
        while (line[i] === " ") {
            i--;
        }
        if (line[i] === "=") {
            var error = {
                row: lineNumber,
                column: i,
                text: i18n._("You can't end a line with \"=\""),
                breaksCode: true
            };
            errors.push(error);
        }
        return errors;
    },

    getVariables: function getVariables(line) {
        // Add any new variables for future spellchecking.
        // This misses variables that are not the first variable to be
        // declared on a line (e.g. var draw = function() {var x = 3;};)
        var variables = [];
        var regex = /\s*var\s*([A-z]\w*)\s*(;|=)/;
        if (regex.exec(line)) {
            var variable = regex.exec(line)[1];
            variables.push(variable);
        }

        // Add any variables declared as function parameters
        // Also only checks first function declaration on the line
        var functionRegex = /function\s*\(([\w\s,]*)\)/;
        if (functionRegex.exec(line)) {
            var fun = RegExp.$1;
            var params = fun.split(/\s*,\s*/);
            _.each(params, function (param) {
                if (param) {
                    variables.push(param);
                }
            });
        }
        return variables;
    },

    checkFunctionParams: function checkFunctionParams(line, lineNumber) {
        // Many Processing functions don't break if passed the wrong
        // number of parameters, but they also don't work.
        // We want to display errors for these specific cases.

        var errors = [];
        // first match up pairs of parentheses
        var parenPairs = {};
        var stack = [];
        for (var i = 0; i < line.length; i++) {
            if (line[i] === "(") {
                stack.push(i);
            } else if (line[i] === ")") {
                if (stack.length === 0) {
                    var error = {
                        row: lineNumber,
                        column: i,
                        text: i18n._("It looks like you have an extra \")\""),
                        breaksCode: false,
                        source: "paramschecker",
                        context: {}
                    };
                    errors.push(error);
                    // if we messed up the parens matching,
                    // parameter counts will be off
                    return errors;
                } else {
                    parenPairs[stack.pop()] = i;
                }
            }
        }
        if (stack.length > 0) {
            // check if there's anything left in the stack
            var error = {
                row: lineNumber,
                column: stack.pop(),
                text: i18n._("It looks like you are missing a \")\" - does every \"(\" have a corresponding closing \")\"?"),
                breaksCode: false,
                source: "paramschecker",
                context: {}
            };
            errors.push(error);
            // if we messed up the parens matching,
            // parameter counts will be off
            return errors;
        }

        // Find all function calls.
        // This will also include "if", "for", and "while".  These will be
        // filtered out later so that we don't generate errors for param checks
        // on things that aren't function calls.
        var functions = line.match(/\w+\s*\(/g) || [];
        // find all functions calls on an object
        var objectFunctions = line.match(/\.\s*\w+\s*\(/g) || [];
        objectFunctions = _.map(objectFunctions, function (fun) {
            // remove the leading '.'
            var functionStart = fun.indexOf(fun.match(/\w/g)[0]);
            return fun.slice(functionStart);
        });

        // go through functions from right to left
        for (var i = functions.length - 1; i >= 0; i--) {
            var index = line.lastIndexOf(functions[i]);

            var functionName = functions[i].split(/\(\s*/g)[0];
            if (["for", "if", "while"].indexOf(functionName.trim()) !== -1) {
                continue;
            }

            // extract the stuff inside the parens
            index += functionName.length;
            var params = line.slice(index, parenPairs[index] + 1);

            // check for missing commas
            var spacesBetween = params.match(/[A-z0-9]+\s+[A-z0-9]+/g);
            if (spacesBetween) {
                var col = line.indexOf(spacesBetween[0]);
                while (line[col] !== " ") {
                    col++;
                }
                var error = {
                    row: lineNumber,
                    column: col,
                    text: i18n._("Did you forget to add a comma between two parameters?"),
                    breaksCode: false, // JSHINT should break on these lines,
                    source: "paramschecker",
                    context: {}
                };
                errors.push(error);
                // this might confuse the parameter count, so move on for now
                break;
            }

            // count the parameters passed
            var numParams;
            var numCommas = params.match(/,/g);
            if (numCommas) {
                numParams = numCommas.length + 1;
            } else {
                numParams = params.match(/[^\s()]/g) ? 1 : 0;
            }

            // ignore functions of objects
            if (!_.include(objectFunctions, functions[i])) {
                // check if parameters passed matches the expected number
                functionName = functionName.replace(/\s/g, "");

                var expectedParams = BabyHint.functionParamCount[functionName];
                var text;
                var functionCall;

                if (typeof expectedParams !== "undefined") {
                    functionCall = "\"" + functionName + "()\"";

                    if (typeof expectedParams === "number" && numParams !== expectedParams) {

                        text = i18n.ngettext("%(name)s takes 1 parameter, not %(given)s!", "%(name)s takes %(num)s parameters, not %(given)s!", expectedParams, { name: functionCall, given: numParams });
                    } else if (typeof expectedParams !== "number" && !_.include(expectedParams, numParams)) {

                        var listOfParams = "" + expectedParams[0];

                        for (var j = 1; j < expectedParams.length - 1; j++) {
                            listOfParams += ", " + expectedParams[j];
                        }

                        listOfParams += " " + i18n._("or") + " " + expectedParams[expectedParams.length - 1];

                        text = i18n._("%(name)s takes %(list)s parameters, not %(given)s!", { name: functionCall, list: listOfParams, given: numParams });
                    }
                }

                if (text) {
                    var functionForm = BabyHint.functionFormSuggestion[functionName];
                    if (functionForm) {
                        text = i18n._("It looks like you're trying to use %(name)s. In case you forgot, you can use it like: %(usage)s", { name: functionCall, usage: "\"" + functionForm + "\"" });
                    }
                }

                if (text) {
                    var error = {
                        row: lineNumber,
                        column: index,
                        text: text,
                        breaksCode: true,
                        source: "paramschecker",
                        context: {}
                    };
                    errors.push(error);
                }
            }
            // remove this function call so we don't mess up future comma counts
            line = line.slice(0, index) + params.replace(/./g, "0") + line.slice(parenPairs[index] + 1);
        }
        return errors;
    }
};
// TODO(jlfwong): Stop globalizing BabyHint
window.BabyHint = BabyHint;
function PJSResourceCache(options) {
    this.canvas = options.canvas; // customized Processing instance
    this.output = options.output; // LiveEditorOutput instance
    this.cache = {};
    this.imageHolder = null;

    // Insert the images into a hidden div to cause them to load
    // but not be visible to the user
    if (!this.imageHolder) {
        this.imageHolder = document.createElement("div");
        this.imageHolder.style.height = 0;
        this.imageHolder.style.width = 0;
        this.imageHolder.style.overflow = "hidden";
        this.imageHolder.style.position = "absolute";
        document.body.appendChild(this.imageHolder);
    }
}

/**
 * Load and cache all resources (images and sounds) referenced in the code.
 *
 * All resources are loaded as we don't have more details on exactly which
 * images will be required.  Execution is delayed if a getImage/getSound call
 * is encountered in the source code and none of the resources have been loaded
 * yet.  Execution begins once all the resources have loaded.
 *
 * @param {Object} resources A object whose keys are filenames
 * @returns {Promise}
 */
PJSResourceCache.prototype.cacheResources = function (resources) {
    var _this = this;

    var promises = Object.keys(resources).map(function (filename) {
        return _this.loadResource(filename);
    });
    return Promise.all(promises);
};

PJSResourceCache.prototype.loadResource = function (filename) {
    if (filename.endsWith(".png")) {
        return this.loadImage(filename);
    } else if (filename.endsWith(".mp3")) {
        return this.loadSound(filename);
    }
};

PJSResourceCache.prototype.loadImage = function (filename) {
    var _this2 = this;

    return new Promise(function (resolve) {
        var path = _this2.output.imagesDir + filename;
        var img = document.createElement("img");

        img.onload = function () {
            _this2.cache[filename] = img;
            resolve();
        };
        img.onerror = function () {
            resolve(); // always resolve
        };

        img.src = path;
        _this2.imageHolder.appendChild(img);
    });
};

PJSResourceCache.prototype.loadSound = function (filename) {
    var _this3 = this;

    return new Promise(function (resolve) {
        var audio = document.createElement("audio");
        var parts = filename.split("/");

        var group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
        var hasSound = group && group.sounds.includes(parts[1].replace(".mp3", ""));
        if (!hasSound) {
            resolve();
            return;
        }

        audio.preload = "auto";
        audio.oncanplaythrough = function () {
            _this3.cache[filename] = {
                audio: audio,
                __id: function __id() {
                    return "getSound('" + filename.replace(".mp3", "") + "')";
                }
            };
            resolve();
        };
        audio.onerror = function () {
            resolve();
        };

        audio.src = _this3.output.soundsDir + filename;
    });
};

PJSResourceCache.prototype.getResource = function (filename, type) {
    switch (type) {
        case "image":
            return this.getImage(filename);
        case "sound":
            return this.getSound(filename);
        default:
            throw "we can't load '" + type + "' resources yet";
    }
};

PJSResourceCache.prototype.getImage = function (filename) {
    var image = this.cache[filename + ".png"];

    if (!image) {
        throw { message: i18n._("Image '%(file)s' was not found.", { file: filename }) };
    }

    // cache <img> instead of PImage until we investigate how caching
    // PImage instances affects loadPixels(), pixels[], updatePixels()
    var pImage = new this.canvas.PImage(image);
    pImage.__id = function () {
        return "getImage('" + filename + "')";
    };

    return pImage;
};

PJSResourceCache.prototype.getSound = function (filename) {
    var sound = this.cache[filename + ".mp3"];

    if (!sound) {
        throw { message: i18n._("Sound '%(file)s' was not found.", { file: filename }) };
    }

    return sound;
};

/**
 * Searches for strings containing the name of any image or sound we providefor
 * users and adds them to `resources` as a key.
 *
 * @param {string} code
 * @returns {Object}
 */
PJSResourceCache.findResources = function (code) {
    var ast = esprima.parse(code, { loc: true });

    var resources = {};
    walkAST(ast, null, [ASTTransforms.findResources(resources)]);

    return resources;
};
window.PJSOutput = Backbone.View.extend({
    // Canvas mouse events to track
    // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
    trackedMouseEvents: ["move", "over", "out", "down", "up"],

    // Banned Properties
    // Prevent certain properties from being exposed
    bannedProps: {
        externals: true
    },

    initialize: function initialize(options) {
        // Handle recording playback
        this.handlers = {};

        this.config = options.config;
        this.output = options.output;

        this.tester = new PJSTester(_.extend(options, {
            workerFile: "pjs/test-worker.js"
        }));

        this.render();
        this.bind();

        this.build(this.$canvas[0], options.enableLoopProtect, options.loopProtectTimeouts);

        this.config.on("versionSwitched", (function (e, version) {
            this.config.runVersion(version, "processing", this.processing);
        }).bind(this));

        BabyHint.init({
            context: this.processing
        });

        return this;
    },

    render: function render() {
        this.$el.empty();
        this.$canvas = $("<canvas>").attr("id", "output-canvas").appendTo(this.el).show();
    },

    bind: function bind() {
        if (window !== window.top) {
            var windowMethods = ["alert", "open", "showModalDialog", "confirm", "prompt", "eval"];
            for (var i = 0, l = windowMethods.length; i < l; i++) {
                window.constructor.prototype[windowMethods[i]] = $.noop;
            }
        }

        if (window !== window.top && Object.freeze && Object.getOwnPropertyDescriptor) {
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
                        var propDescriptor = Object.getOwnPropertyDescriptor(window, prop);
                        if (!propDescriptor || propDescriptor.configurable) {
                            Object.defineProperty(window, prop, {
                                value: window[prop],
                                writable: false,
                                configurable: false
                            });
                        }
                    } catch (e) {}
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
        _.each(this.trackedMouseEvents, (function (name) {
            var eventType = "mouse" + name;

            // Track that event on the Canvas element
            this.$canvas.on(eventType, (function (e) {
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
            }).bind(this));

            // Handle the command during playback
            this.handlers[name] = (function (x, y) {
                // Build the clientX and clientY values
                var pageX = x + offset.left;
                var pageY = y + offset.top;
                var clientX = pageX - $(window).scrollLeft();
                var clientY = pageY - $(window).scrollTop();

                // Construct the simulated mouse event
                var evt = document.createEvent("MouseEvents");

                // See: https://developer.mozilla.org/en/DOM/
                //          event.initMouseEvent
                evt.initMouseEvent(eventType, true, true, window, 0, 0, 0, clientX, clientY, false, false, false, false, 0, document.documentElement);

                // And execute it upon the canvas element
                this.$canvas[0].dispatchEvent(evt);
            }).bind(this);
        }).bind(this));

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
    build: function build(canvas, enableLoopProtect, loopProtectTimeouts) {
        var _this = this;

        this.processing = new Processing(canvas, function (instance) {
            instance.draw = _this.DUMMY;
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

        Object.keys(this.ProgramMethods).forEach(function (key) {
            additionalMethods.Program[key] = _this.ProgramMethods[key].bind(_this);
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
            loopProtectTimeouts: loopProtectTimeouts
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
    DUMMY: function DUMMY() {},

    setDimensions: function setDimensions() {
        var $window = $(window);
        var width = $window.width();
        var height = $window.height();

        if (this.processing && (width !== this.processing.width || height !== this.processing.height)) {
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
        mouseAction: function mouseAction(data) {
            data = data.mouseAction;
            this.handlers[data.name](data.x, data.y);
        },

        documentation: function documentation(data) {
            BabyHint.initDocumentation(data.documentation);
        }
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {
        // We want to resize the image to a thumbnail,
        // which we can do by creating a temporary canvas
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = screenshotSize;
        tmpCanvas.height = screenshotSize;
        tmpCanvas.getContext("2d").drawImage(this.$canvas[0], 0, 0, screenshotSize, screenshotSize);

        // Send back the screenshot data
        callback(tmpCanvas.toDataURL("image/png"));
    },

    // Allow programs to have some control over the program running
    // Including being able to dynamically force execute of the tests
    // Or even run their own tests.
    ProgramMethods: {
        settings: function settings() {
            return this.output.settings || {};
        },

        // Force the program to restart (run again)
        restart: function restart() {
            this.output.restart();
        },

        // Force the tests to run again
        runTests: function runTests(callback) {
            return this.output.test(this.output.getUserCode(), this.output.validate, [], callback);
        },

        assertEqual: function assertEqual(actual, expected, line, column) {
            if (_.isEqual(actual, expected)) {
                return;
            }

            var msg = i18n._("Assertion failed: " + "%(actual)s is not equal to %(expected)s.", {
                actual: JSON.stringify(actual),
                expected: JSON.stringify(expected)
            });

            this.output.results.assertions.push({
                row: line - 1, column: column, text: msg
            });
        },

        // Run a single test (specified by a function)
        // and send the results back to the parent frame
        runTest: function runTest(name, fn) {
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

    lint: function lint(userCode, skip) {
        var _this2 = this;

        return this.injector.lint(userCode, skip).then(function (hintErrors) {
            var babyErrors = BabyHint.babyErrors(userCode, hintErrors);
            return {
                errors: _this2.mergeErrors(hintErrors, babyErrors),
                warnings: []
            };
        });
    },

    mergeErrors: function mergeErrors(jshintErrors, babyErrors) {
        var brokenLines = [];
        var prioritizedChars = {};
        var hintErrors = [];

        // Find which lines JSHINT broke on
        _.each(jshintErrors, function (error) {
            if (error && error.line && error.character && error.reason && !/unable to continue/i.test(error.reason)) {
                var realErrorLine = error.line - 2;
                brokenLines.push(realErrorLine);
                // Errors that override BabyLint errors in the remainder of the
                // line. Includes: unclosed string (W112)
                if (error.code === "W112") {
                    error.character = error.evidence.indexOf("\"");
                    if (!prioritizedChars[realErrorLine] || prioritizedChars[realErrorLine] > error.character - 1) {
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
        babyErrors = babyErrors.filter(function (error) {
            return (_.include(brokenLines, error.row) || error.breaksCode) && (!prioritizedChars[error.row] || prioritizedChars[error.row] > error.column);
        }).map(function (error) {
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
        _.each(hintErrors, function (jsError) {
            _.each(babyErrors, function (babyError) {
                if (jsError.row === babyError.row && jsError.column === babyError.column) {
                    // Merge if JSLint error says a variable is undefined and
                    // BabyLint has spelling suggestion.
                    if (jsError.lint.code === "W117" && babyError.source === "spellcheck") {
                        babyError.text = i18n._("\"%(word)s\" is not defined. Maybe you meant to type \"%(keyword)s\", " + "or you're using a variable you didn't define.", { word: jsError.lint.a, keyword: babyError.context.keyword });
                    }
                }
            });
        });

        // Merge JSHint and BabyHint errors
        var errors = babyErrors;
        var babyErrorRows = _.uniq(babyErrors.map(function (error) {
            return error.row;
        }));
        hintErrors.forEach(function (error) {
            // Only add JSHint errors if there isn't already a BabyHint error
            // on that line (row).
            if (!_.contains(babyErrorRows, error.row)) {
                errors.push(error);
            }
        });

        // De-duplicate errors. Replacer tells JSON.stringify to ignore column
        // and lint keys so objects with different columns or lint will still be
        // treated as duplicates.
        var replacer = function replacer(key, value) {
            if (key === "column" || key === "lint") {
                return;
            }
            return value;
        };

        // Stringify objects to compare and de-duplicate.
        return _.uniq(errors, false, function (obj) {
            return JSON.stringify(obj, replacer);
        });
    },

    test: function test(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        this.tester.testWorker.exec(userCode, tests, errors, (function (errors, testResults) {
            if (errorCount !== errors.length) {
                // Note: Scratchpad challenge checks against the exact
                // translated text "A critical problem occurred..." to
                // figure out whether we hit this case.
                var message = i18n._("Error: %(message)s", { message: errors[errors.length - 1].message });
                console.warn(message);
                this.tester.testContext.assert(false, message, i18n._("A critical problem occurred in your program " + "making it unable to run."));
            }

            callback(errors, testResults);
        }).bind(this));
    },

    // TODO(kevinb) pass scrubbing location and value so that we can skip parsing
    runCode: function runCode(userCode, callback) {
        this.injector.runCode(userCode, callback);
    },

    restart: function restart() {
        this.injector.restart();
    },

    toggle: function toggle(doToggle) {
        if (doToggle) {
            this.processing.loop();
        } else {
            this.processing.noLoop();
        }
    },

    kill: function kill() {
        this.tester.testWorker.kill();
        this.injector.hintWorker.kill();
        this.processing.exit();
    },

    initTests: function initTests(validate) {
        return this.exec(validate, this.tester.testContext);
    },

    infiniteLoopCallback: function infiniteLoopCallback(error) {
        this.output.postParent({
            results: {
                code: this.output.currentCode,
                errors: [error]
            }
        });
        this.KA_INFINITE_LOOP = true;
    }
});

// Add in some static helper methods
_.extend(PJSOutput, {});

LiveEditorOutput.registerOutput("pjs", PJSOutput);

// Couldn't access property for permissions reasons,
//  like window.frame
// Only happens on prod where it's cross-origin
