/**
 * The CodeInjector object is responsible for running code, determining what
 * code to inject when the user code has been updated, and maintaining the
 * appropriate state in the processing object in order to make live editing
 * of processing-js programs work correctly.
 */
class PJSCodeInjector {

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
    constructor(options) {
        const defaultOptions = {
            sandboxed: true,
            envName: '__env__'
        };

        Object.assign(this, defaultOptions, options);
        this.DUMMY = this.processing.draw;  // initially draw is a DUMMY method
        this.seed = null;

        this.addMethods(this.additionalMethods);
        this.reseedRandom();

        // Methods that trigger the draw loop
        this.drawLoopMethods = [
            "draw", "mouseClicked", "mouseDragged", "mouseMoved",
            "mousePressed", "mouseReleased", "mouseScrolled", "mouseOver",
            "mouseOut", "touchStart", "touchEnd", "touchMove", "touchCancel",
            "keyPressed", "keyReleased", "keyTyped"
        ];

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
        this.idempotentCalls = [ "createFont" ];

        // If a list of exposed properties hasn't been generated before
        if (!this.props) {
            this.initializeProps();
        }

        this.loopProtector = new LoopProtector(
            this.infiniteLoopCallback, this.loopProtectTimeouts, true);

        /*
         * The worker that analyzes the user's code.
         */
        this.hintWorker = new PooledWorker(
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
        );
    }

    addMethods(additionalMethods) {
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
            getImage: (filename) => {
                return this.resourceCache.getImage(filename);
            },

            loadImage: (file) => {
                throw {message: "Use getImage instead of loadImage."};
            },

            requestImage: (file) => {
                throw {message: "Use getImage instead of requestImage."};
            },

            // Disable link method
            link: () => {
                throw {message: i18n._("link() method is disabled.")};
            },

            getSound: (filename) => {
                return this.resourceCache.getSound(filename);
            },

            playSound: (sound) => {
                if (sound && sound.audio && sound.audio.play) {
                    sound.audio.currentTime = 0;
                    sound.audio.play();
                } else {
                    throw {message: i18n._("No sound file provided.")};
                }
            },

            // Basic console logging
            debug: (...args) => {
                console.log(...args);
            }
        });

        Object.assign(this.processing, additionalMethods);
    }

    /**
     * Collects a list of props and safeCalls from this.processing.
     */
    initializeProps() {
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
                        if (this.idempotentCalls
                                .indexOf(processingProp) !== -1 ||
                            /native code/.test(strValue) ||
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

    /**
     * Restores the random seed to that saved seed value.
     */
    restoreRandomSeed() {
        this.processing.randomSeed(this.seed);
    }

    /**
     * Generate a new random seed value and save it.
     */
    reseedRandom() {
        this.seed = Math.floor(Math.random() * 4294967296);
    }

    /**
     * Resets the canvas.
     *
     * See liveReset for a list methods it calls and the values that resets.
     */
    clear() {
        Object.keys(this.liveReset).forEach((prop) => {
            this.processing[prop].apply(this.processing, this.liveReset[prop]);
        });
    }

    /**
     * Restarts the user's program.
     */
    restart() {
        this.lastGrab = null;
        this.lastGrabObj = null;

        // Grab a new random seed
        this.reseedRandom();

        // Reset frameCount variable on restart
        this.processing.frameCount = 0;

        // Clear Processing logs
        this.processing._clearLogs();
    }

    /**
     * Generate a string list of properties.
     *
     * @param {Object} props
     * @returns {string}
     */
    propListString(props) {
        // Prevent certain properties from being exposed
        var bannedProps = {
            externals: true
        };

        var propList = [];

        Object.keys(props).forEach((prop) => {
            if (!bannedProps[prop]) {
                propList.push(`${prop}:${props[prop]}`);
            }
        });

        return propList.join(",");
    }

    /**
     * Lints user code.
     *
     * @param {string} userCode: code to lint
     * @param {boolean} skip: skips linting if true and resolves Deferred immediately
     * @returns {Promise} resolves an array of lint errors
     */
    lint(userCode, skip) {
        return new Promise((resolve) => {
            if (skip || !userCode) {
                resolve([]);
                return;
            }

            // Build a string of options to feed into JSHint
            // All properties are defined in the config
            var hintCode = `/*jshint ${this.propListString(this.JSHint)} */` +

                // Build a string of variables names to feed into JSHint
                // This lets JSHint know which variables are globally exposed
                // and which can be overridden, more details:
                // http://www.jshint.com/about/
                // propName: true (is a global property, but can be overridden)
                // propName: false (is a global property, cannot be overridden)
                `/*global ${this.propListString(this.props)} */\n` +

                // The user's code to execute
                userCode;

            this.hintWorker.exec(hintCode, (hintData, hintErrors) => {
                this.globals = this.extractGlobals(hintData);
                resolve(hintErrors);
            });
        });
    }

    /**
     * Extracts globals from the data return from the jshint and stores them
     * in this.globals.  Used in runCode, hasOrHadDrawLoop, and injectCode.
     *
     * @param {Object} hintData: an object containing JSHINT.data after
     *                 jshint-worker.js runs JSHINT(userCode).
     * @returns {Object} An object containing all of the globals as keys.
     */
    extractGlobals(hintData) {
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

    /**
     * Extract an object's properties for dynamic insertion.
     *
     * @param {string} name The name of the property to extract.
     * @param {Object} obj Object to extract properties from.
     * @param {string} [proto] Name of a property on the object to use instead of
     *        of the object itself.
     */
    objectExtract(name, obj, proto) {
        // Make sure the object actually exists before we try
        // to inject stuff into it
        if (!this.processing[name]) {
            if (Array.isArray(obj)) {
                this.processing[name] = [];
            } else if (typeof obj === "function") {
                this.processing[name] = function() {};
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
                    this.grabObj[name + (proto ? "." + proto : "") +
                    "['" + objProp + "']"] =
                        PJSCodeInjector.stringify(obj[objProp]);

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

    /**
     * Checks to see if a draw loop-introducing method currently
     * exists, or did exist, in the user's program.
     */
    hasOrHadDrawLoop() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (this.globals[name] ||
                this.lastGrab && this.lastGrab[name]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks to see if a draw loop method is currently defined in the
     * user's program (defined is equivalent to !undefined or if it's
     * just a stub program.)
     */
    drawLoopMethodDefined() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (this.processing[name] !== this.DUMMY &&
                this.processing[name] !== undefined) {
                return true;
            }
        }

        return false;
    }

    runCode(userCode, callback) {
        try {
            let resources = PJSResourceCache.findResources(userCode);
            this.resourceCache.cacheResources(resources).then(() => {
                this.injectCode(userCode, callback);
            });
        } catch(e) {
            let [line, text] = e.message.split(":");

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
    injectCode(userCode, callback) {
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
            _.each(this.globals, function(val, global) {
                var value = this.processing[global];
                // Expose all the global values, if they already exist although
                // even if they are undefined, the result will still get sucked
                // into grabAll) Replace functions that have side effects with
                // placeholders (for later execution)
                grabAll[global] = ((typeof value === "function" &&
                !this.safeCalls[global]) ?
                    function() {
                        if (typeof fnCalls !== "undefined") {
                            fnCalls.push([global, arguments]);
                        }
                        return 0;
                    } :
                    value);
            }.bind(this));

            // Run the code with the grabAll context. The code is run with no
            // side effects and instead all function calls and globally-defined
            // variable values are extracted. Abort injection on a runtime
            // error.
            let error = this.exec(userCode, grabAll);
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
            for (let i = 0, l = PJSCodeInjector.instances.length; i < l; i++) {
                constructors[PJSCodeInjector.instances[i].constructor.__name] = true;
            }

            // The instantiated instances have changed, which means that
            // we need to re-run everything.
            if (this.oldInstances &&
                PJSCodeInjector.stringifyArray(this.oldInstances) !==
                PJSCodeInjector.stringifyArray(PJSCodeInjector.instances)) {
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

            // Look for new top-level function calls to inject
            for (let i = 0; i < fnCalls.length; i++) {
                // Reconstruction the function call
                var args = Array.prototype.slice.call(fnCalls[i][1]);

                var results = args.map((arg, argIndex) => {
                    // Parameters here can come in the form of objects.
                    // For any object parameter, we don't want to serialize it
                    // because we'd lose the whole prototype chain.
                    // Instead we create temporary variables for each.
                    if (!_.isArray(arg) && _.isObject(arg)) {
                        var varName = `__obj__${fnCalls[i][0]}__${argIndex}`;
                        this.processing[varName] = arg;
                        return varName;
                    } else {
                        return PJSCodeInjector.stringify(arg);
                    }
                });
                mutatingCalls.push(fnCalls[i][0] + "(" + results.join(", ") + ");");
            }

            // We also look for newly-changed global variables to inject
            _.each(grabAll, function(val, prop) {
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
                            // If we have an object, then copy over all of the
                            // properties so we don't accidentally destroy
                            // function scope from `with()` and closures on the
                            // object prototypes.
                            // TODO(bbondy): This may copy over things that
                            // were deleted. If we ever run into a problematic
                            // program, we may want to add support here.
                            if (!_.isArray(val) && _.isObject(val) &&
                                !_.isArray(this.processing[prop]) &&
                                _.isObject(this.processing[prop])) {
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

            // Insertion of new object properties or methods on a prototype
            _.each(this.grabObj, function(val, objProp) {
                var baseName = /^[^.[]*/.exec(objProp)[0];

                // If we haven't done an extraction before or if the value
                // has changed, or if the function was reinitialized,
                // insert the new value.
                if (!this.lastGrabObj || this.lastGrabObj[objProp] !== val ||
                        reinit[baseName]) {
                    inject += objProp + " = " + val + ";\n";
                }
            }.bind(this));

            // Deletion of old object properties
            for (var objProp in this.lastGrabObj) {
                if (!(objProp in this.grabObj)) {
                    inject += `delete ${objProp};\n`;
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
                if (!(oldProp in grabAll) &&
                    (!(oldProp in this.props) ||
                    _.contains(this.drawLoopMethods, oldProp))) {
                    // Create the code to delete the variable
                    inject += `delete ${oldProp};\n`;

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
            Object.keys(this.liveReset).forEach((prop) => {
                if (!this.globals[prop] && this.lastGrab[prop]) {
                    this.processing[prop].apply(this.processing, this.liveReset[prop]);
                }
            });
        }

        // Re-run the entire program if we don't need to inject the changes
        // (Injection only needs to occur if a draw loop exists and if a prior
        // run took place)
        if (!hasOrHadDrawLoop || !this.drawLoopMethodDefined() ||
            !this.lastGrab || rerun) {
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
            let error = this.exec(userCode, this.processing);
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
        } else if (inject || mutatingCalls.length > 0) {
            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (this.globals.draw) {
                inject += "\ndraw();";
            }

            // Execute the injected code
            let error = this.exec(inject, this.processing, mutatingCalls);
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
            } catch(e) {
                // Ignore any errors that were generated in the callback
                // NOTE(jeresig): This is needed because Mocha throws errors
                // when it encounters an assertion error, which causes this
                // to go haywire, generating an in-code error.
            }
        }
    }

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
    transformCode(code, context, mutatingCalls, options = {}) {
        let {envName, enableLoopProtect, loopProtector} = this;
        let rewriteNewExpression = true;
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
        let envNameRegex = new RegExp(`${envName}\\.`, "g");
        let ast = esprima.parse(code.replace(envNameRegex, ""), { loc: true });

        let astTransformPasses = [];

        // 'mutatingCalls' is undefined only when we are injecting code.
        // This is not perfect protection from users typing one of these banned
        // properties, but it does guard against some cases.  The reason why
        // we're allowing these props in this case is that code that injected
        // is comes from calling .toString on functions which have already been
        // transformed from a previous call to exec().

        if (!mutatingCalls) {
            astTransformPasses.push(ASTTransforms.checkForBannedProps([
                "__env__",
                "KAInfiniteLoopCount",
                "KAInfiniteLoopProtect",
                "KAInfiniteLoopSetTimeout"
            ]));
        } else {
            astTransformPasses.push(ASTTransforms.checkForBannedProps([
                "__env__"
            ]));
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
        walkAST(ast, null,
            [ASTTransforms.rewriteContextVariables(envName, context)]);

        code = "";
        if (mutatingCalls) {
            // Prepend injected function calls with envName and any arguments
            // that are objects with envName as well.  This is a lot quicker
            // than parsing these and using rewriteContextVariables, especially
            // if there are a lot of inject function calls.
            code += mutatingCalls.map(call => {
                call = call.replace(/__obj__/g, `${envName}.__obj__`);
                return `${envName}.${call}`;
            }).join("\n");
        }

        return code + escodegen.generate(ast);
    }

    /**
     * Exports code so that it can be run without live-editor (requires
     * processing.js)
     *
     * @param {string} code
     * @param {string} imageDir
     * @param {string} soundDir
     * @returns {string}
     */
    exportCode(code, imageDir, soundDir) {
        let options = {
            rewriteNewExpression: false
        };
        let transformedCode = this.transformCode(
            code, this.processing, null, options);
        let helperCode = "";
        let resources = PJSResourceCache.findResources(transformedCode);

        // TODO(kevinb) generate this code once (once webpack is in place)
        helperCode += `var resources = ${JSON.stringify(resources)};\n`;
        helperCode += PJSUtils.cleanupCode(
            PJSUtils.codeFromFunction(function () {
                var resourceCache = [];
                // __IMAGEDIR__
                // __SOUNDDIR__

                var imageHolder = document.createElement("div");

                imageHolder.style.height = 0;
                imageHolder.style.width = 0;
                imageHolder.style.overflow = "hidden";
                imageHolder.style.position = "absolute";

                document.body.appendChild(imageHolder);

                var loadImage = function(filename) {
                    return new Promise((resolve) => {
                        var img = document.createElement("img");
                        img.onload = function() {
                            resourceCache[filename] = img;
                            resolve();
                        };
                        img.onerror = function() {
                            resolve(); // always resolve
                        };

                        img.src = imageDir + filename;
                        imageHolder.appendChild(img);
                        resourceCache[filename] = img;
                    });
                };

                var loadSound = function(filename) {
                    return new Promise((resolve) => {
                        var audio = document.createElement("audio");
                        var parts = filename.split("/");

                        var group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
                        if (!group || group.sounds.indexOf(parts[1].replace(".mp3", "")) === -1) {
                            resolve();
                            return;
                        }

                        audio.preload = "auto";
                        audio.oncanplaythrough = function() {
                            resourceCache[filename] = audio;
                            resolve();
                        };
                        audio.onerror = function() {
                            resolve();
                        };

                        audio.src = soundDir + filename;
                    });
                };

                var promises = Object.keys(resources).map(function(filename) {
                    if (filename.indexOf(".png") !== -1) {
                        return loadImage(filename);
                    } else if (filename.indexOf(".mp3") !== -1) {
                        return loadSound(filename);
                    }
                });

                Promise.all(promises).then(function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = 400;
                    canvas.height = 400;

                    var p = new Processing(canvas);

                    p.width = 400;
                    p.height = 400;

                    p.getSound = function(sound) {
                        return resourceCache[sound + ".mp3"];
                    };

                    p.playSound = function(sound) {
                        if (sound && sound.play) {
                            sound.currentTime = 0;
                            sound.play();
                        } else {
                            throw new Error("No sound file provided.");
                        }
                    };

                    p.getImage = function(image) {
                        return new p.PImage(resourceCache[image + ".png"]);
                    };

                    // __USERCODE__

                    if (p.draw) {
                        p.loop();
                    }
                });
            })) + '\n';

        return helperCode
            .replace(/\/\/ __USERCODE__/g, transformedCode)
            .replace(/\/\/ __IMAGEDIR__/g, `var imageDir = "${imageDir}"`)
            .replace(/\/\/ __SOUNDDIR__/g, `var soundDir = "${soundDir}"`);
    }

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
    exec(code, context, mutatingCalls) {
        if (!code) {
            return;
        }

        // the top-level 'this' is empty except for this.externals, which
        // throws this message this is how users were getting at everything
        // from playing sounds to displaying pop-ups
        let badProgram = i18n._("This program uses capabilities we've turned " +
            "off for security reasons. Khan Academy prohibits showing " +
            "external images, playing external sounds, or displaying pop-ups.");
        let topLevelThis = "{ get externals() { throw { message: " +
            JSON.stringify(badProgram) + " } } }";

        try {
            if (this.debugger) {
                this.debugger.exec(code);
            } else {
                let transformedCode =
                    this.transformCode(code, context, mutatingCalls);
                let funcBody = `var ${this.envName} = context;\n` +
                    `(function(){\n${transformedCode}\n}).apply(${topLevelThis});`;
                let func = new Function("context", funcBody);
                func(context);
            }
        } catch (e) {
            return e;
        }
    }

    // Turn a JavaScript object into a form that can be executed
    // (Note: The form will not necessarily be able to pass a JSON linter)
    // (Note: JSON.stringify might throw an exception. We don't capture it
    //        here as we'll want to deal with it later.)
    static stringify(obj) {
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
    }

    // Turn an array into a string list
    // (Especially useful for serializing a list of arguments)
    static stringifyArray(array) {
        var results = [];

        for (var i = 0, l = array.length; i < l; i++) {
            results.push(this.stringify(array[i]));
        }

        return results.join(", ");
    }

    // Defer a 'new' on a function for later
    // Makes it possible to generate a unique signature for the
    // instance (see: .__id())
    // Meant to translate:
    // new Foo(a, b, c) into: applyInstance(Foo)(a, b, c)
    static applyInstance(classFn, className) {
        // Don't wrap it if we're dealing with a built-in object (like RegExp)
        try {
            var funcName = (/^function\s*(\w+)/.exec(classFn) || [])[1];
            if (funcName && window[funcName] === classFn) {
                return classFn;
            }
        } catch(e) {}

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

            this.newCallback(classFn, className, obj, args);

            // Return the new instance
            return obj;
        }.bind(this);
    }

    // called whenever a user defined class is called to instantiate an object.
    // adds metadata to the class and the object to keep track of it and to
    // serialize it.
    // Called in applyInstance and the Debugger's context.__instantiate__
    static newCallback(classFn, className, obj, args) {
        // Make sure a name is set for the class if one has not been
        // set already
        if (!classFn.__name && className) {
            classFn.__name = className;
        }

        // Point back to the original function
        obj.constructor = classFn;

        // Generate a semi-unique ID for the instance
        obj.__id = function() {
            return "new " + classFn.__name + "(" +
                this.stringifyArray(args) + ")";
        }.bind(this);

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
}

PJSCodeInjector.instances = [];

// TODO(kevinb) convert to a commonjs module at somepoint in the future
window.PJSCodeInjector = PJSCodeInjector;
