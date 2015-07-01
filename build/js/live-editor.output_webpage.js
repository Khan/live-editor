(function() {
    window.WebpageTester = function(options) {
        this.initialize(options);
        this.bindTestContext();
        this.testContext.phoneHome = options.output.phoneHome.bind(options.output);
    };

    WebpageTester.prototype = new OutputTester();

    _.extend(WebpageTester.prototype, {
        test: function(userCode, validate, errors, callback) {
            var testResults = [];
            errors = this.errors = errors || [];
            this.userCode = userCode;
            this.tests = [];

            // This will also fill in tests, as it will end up
            //  referencing functions like staticTest and that
            //  function will fill in this.tests
            this.exec(validate);

            this.testContext.allScripts = "";
            _.each(this.testContext.$doc.find("script"), function($script) {
                this.testContext.allScripts += $script.innerHTML;
                this.testContext.allScripts += "\n";
            }.bind(this));

            this.curTask = null;
            this.curTest = null;

            // uiTests will try to postMessage the parent immediately
            // because they are usually running asynchronously.
            // Set this flag so that they know we are actually running
            // the original pass, and we will handle reporting everything
            // caught here for them.
            this.syncTests = true;
            for (var i = 0; i < this.tests.length; i++) {
                testResults.push(this.runTest(this.tests[i], i));
            }
            this.syncTests = false;

            callback(errors, testResults);
        },
    });


    /*
     * Returns a callback which will accept arguments and make a constriant
     * used internally to create shorthand functions that accept arguments
     */
    var constraintPartial = function(callback) {
        return function() {
            return {
                variables: arguments,
                fn: callback
            };
        };
    };
    WebpageTester.prototype.testMethods = _.clone(window.PJSTester.prototype.testMethods);

    _.extend(WebpageTester.prototype.testMethods, {
        scriptTest: function() {
            this.testContext.staticTest.apply(this, arguments);
        },

        /**
         * This looks exactly like an assertion,
         * but can be updated asynchronously
         */
        uiTest: function(name, callback, description, hint, image) {
            var fn = function() {
                var test = this.curTest;
                test.state = "fail";
                var result = {
                    type: "assertion",
                    msg: description,
                    state: "fail",
                    expected: "",
                    meta: {
                        structure: hint,
                        image: image
                    }
                };
                test.results = [result];

                callback(function(success, message) { 
                    var state = success ? "pass" : "fail";
                    test.state = state;
                    result.state = state;
                    delete result.meta.alsoMessage;
                    delete result.meta.alternateMessage;
                    if (message) {
                        result.meta[success ? "alternateMessage" : "alsoMessage"] = message;
                    }

                    if (!this.syncTests) {
                        this.testContext.phoneHome();
                    }

                }.bind(this));
            }.bind(this);
            this.testContext.test(name, fn, "ui");
        },
        
        constraintPartial: constraintPartial,

        /*
         * Introspect a callback to determine it's parameters and then
         * produces a constraint that contains the appropriate variables and callbacks.
         *
         * This allows much terser definition of callback functions since you don't have to
         * explicitly state the parameters in a separate list
         */
        constraint: function(variables, fn) {
            if (!fn) {
                fn = variables;
                var paramText = /^function\s*[^\(]*\(([^\)]*)\)/.exec(fn.toString())[1];
                var variables = paramText.match(/[$_a-zA-z0-9]+/g);

                for (var key in variables) {
                    if (variables[key][0] !== "$") {
                        console.warn("Invalid variable in constraint (should begin with a '$'): ", variables[key]);
                        return null;
                    }
                }
            }

            return {
                variables: variables,
                fn: fn
            };
        },

        cleanStructure: function(structure) {
            // Passing in a single selector string is equivalent to passing in
            // {"selector": 1}
            if (typeof structure === "string") {
                var tmp = {};
                tmp[structure] = 1;
                structure = tmp;
            }
            return structure;
        },

        /*
         * Returns the result of matching a structure against the user's HTML
         */
        htmlMatch: function(structure) {
            // If there were syntax errors, don't even try to match it
            if (this.errors.length) {
                return {success: false};
            }

            structure = this.testContext.cleanStructure(structure);
            // HTML challenge tests
            /* jshint forin:false */
            for (var selector in structure) {
                var expected = structure[selector];
                // TODO(jeresig): Maybe find a way to do this such that we can run
                // it in a worker thread.
                var numFound = $(selector, this.testContext.$docSP).length;
                if (expected === 0 && numFound !== 0 || numFound < expected) {
                    return {success: false};
                }
            }

            return {success: true}; 
        },


        /* 
         * Returns all of the rules from the user's code,  
         * formatted as a map of selectors to properties and 
         * property names to property values:
         *
         * {
         *    "#foo div": {
         *        color: "red",
         *        height: "14px",
         *        ...
         *    },
         *    ...
         * }
         */
        getCssMap: function() {
            // Convert CSS rules from a list of parsed objects into a map.
            var css = {};
            _.each(this.testContext.cssRules, function(rule) {
                // Parse all properties for this rule into map
                var properties = {};
                _.each(rule.declarations.properties, function(property) {
                    var normalized = this.testContext.normalizePropertyValue(property.value.value);
                    properties[property.name.value] = normalized;
                }.bind(this));

                var selectors = [rule.selector.value];

                // For combined selectors like "div, li, a" we want to attach the specific rules
                // To each of the individual selectors as well as the whole combination
                // e.g. "div", "li", "a" & "div, li, a"
                if (selectors[0].indexOf(",") !== -1) {
                    selectors.push.apply(selectors, selectors[0].split(","));
                }

                _.each(selectors, function(selector) {
                    selector = this.testContext.normalizeSelector(selector);
                    if (!(selector in css)) {
                        css[selector] = {};
                    }
                    /* jshint forin:false */
                    for (var prop in properties) {
                        css[selector][prop] = properties[prop];
                    }
                }.bind(this));
            }.bind(this));

            return css;
        },

         cssMatch: function(pattern, callbacks) {
            // If there were syntax errors, don't even try to match it
            if (this.errors.length) {
                return {success: false};
            }

            var css = this.testContext.getCssMap();
            var cssRules = pattern.split("}").slice(0, -1);
            if (!_.isArray(callbacks) && !_.isUndefined(callbacks)) {
                callbacks = [callbacks];
            }
            callbacks = _.map(callbacks, function(cb) {
                if (typeof cb === "function") {
                    return this.testContext.constraint(cb);
                }
                return cb;
            }.bind(this));

            var res = this.testContext.testCSSRules(cssRules, css, callbacks , {});
            return res;
        },

        /*
         * Make it so that equivalent CSS property values are
         * be equal strings. In particular this targets odd spacing
         * in rgb(0,0,0) or border: 1px solid black;
         */
        normalizePropertyValue: function(property) {
            return property.replace(/\s+/g, " ").replace(", ", ",").trim();
        },

        /*
         * Make it so that equivalent CSS selectors are equal strings.
         * In particular this function targets odd spacing, and different ordered 
         * sets of "," delimitted selectors. It also forces modifiers to
         * be attached to their selector "div > p" -> "div >p" so that selectors
         * can be split by spaces
         */
        normalizeSelector: function(selector) {
            selector = selector.replace(/\s+/g, " ").replace(/(>|~|,) /g, "$1");
            var pieces = selector.split(",");
            pieces = pieces.map(function(s) { return s.trim(); });
            selector = pieces.sort().join(",");
            return selector;
        },

        /*
         * Recursively verify a set of CSS rules and
         * check that wildcard variables match callbacks.
         * This function uses recursion in order to attempt all
         * possible combinations of wildcard variables (since some
         * of them might pass the callbacks even if others fail)
         */
        testCSSRules: function(rules, css, callbacks, wVars) {
            wVars = wVars || {};
            // Base case. All rules have passed preliminarily.
            // Check that the wildcards vars pass the callbacks
            if (rules.length === 0) {
                return this.testContext.checkCallbacks(callbacks || [], wVars);
            }

            // We will handle a single rule per recursion
            var rawRule = rules.shift();
            var rule = rawRule.split("{");
            var testSelector = this.testContext.normalizeSelector(rule[0]);
            var testBody = rule[1];

            // Get the properties for this rule
            var testProperties = {};
            _.each(testBody.split(";"), function(prop) {
                if (prop.trim().length === 0) {
                    return;
                }
                var parts = prop.split(":");
                testProperties[parts[0].trim()] = this.testContext.normalizePropertyValue(parts[1]);
            }.bind(this));

            var oldWVars = wVars;
            var lastFailureMessage = {success: false};

            // Attempt to match the selector/property combination against every available piece of CSS
            /* jshint forin:false */
            for (var selector in css) {
                // On each pass we propose a new set of wVars
                // based on the specific set things we matched.
                // If we end up rejecting a match we want to 
                // discard the associated wVars as well. To facilitate 
                // this we isolate each group of proposed wVars in its
                // own object on the prototype chain
                wVars = Object.create(oldWVars); 
                
                // Match selector
                if (!this.testContext.selectorMatch(testSelector, selector, wVars)) {
                    continue;
                }

                // Match properties
                var doPropertiesMatch = _.every(testProperties, function(value, prop) {
                    return (prop in css[selector]) && 
                            this.testContext.wildcardMatch(value, css[selector][prop], wVars);
                }.bind(this));
                if (!doPropertiesMatch) {
                    continue;
                }

                // Recurse
                var result = this.testContext.testCSSRules(rules, css, callbacks, wVars);
                if (result.success) {
                    return result;
                } else {
                    lastFailureMessage = result;
                }
            }

            // We've exhausted all possibilities in this branch
            rules.unshift(rawRule);
            return  lastFailureMessage;
        },

        /*
         * Match two values, accounting for wildcard values
         * "_" and "$var"
         */
        wildcardMatch: function(pattern, value, wVars) {
            if (pattern === "_") {
                return true;
            } else if (pattern[0] === "$") {
                if (!(pattern  in wVars)) {
                    wVars[pattern] = value;
                    return true;
                } else {
                    return wVars[pattern] === value;
                }
            } else {
                return pattern === value;
            }
        },

        checkCallbacks: function(callbacks, wVars) {
            for (var i = 0; i < callbacks.length; i++) {
                var cb = callbacks[i];
                var cbArgs = _.map(cb.variables, function(variable) {
                    if (typeof variable === "string" && variable[0] === "$") {
                        return wVars[variable];
                    } else {
                        return variable;
                    }
                });
                var res = cb.fn.apply({}, cbArgs);
                if (res === false) {
                    return {success: false};
                } else if (res.success === false) {
                    return res;
                }
            }

            return {success: true};
        },
        selectorMatch: function(compositePattern, compositeSelector, wVars) {
            return this.testContext.multiSelectorMatch(compositePattern.split(","), compositeSelector.split(","), wVars);
        },

        /*
         * Check if two comma delimmited CSS selectors can be matched.
         * Checks every possible order since patterns and selectors
         * could be ordered differently.
         */
        multiSelectorMatch: function(patterns, selectors, wVars) {
            if (patterns.length !== selectors.length) {
                return false;
            } else if (patterns.length === 0) {
                return true;
            }

            wVars = wVars || {};
            var oldWVars = wVars;

            var pattern = patterns.shift();
            for (var key = 0; key < selectors.length; key++) {
                wVars = Object.create(oldWVars);
                var selector = selectors[key];
                if (this.testContext.singleSelectorMatch(pattern, selector, wVars)) {
                    if (this.testContext.multiSelectorMatch(patterns, selectors.slice(0, key).concat(selectors.slice(key + 1)), wVars)) {
                        for (key in wVars) { // Commit wildcard selections to parent wVars
                            if (!(key in oldWVars)) {
                                oldWVars[key] = wVars[key];
                            }
                        }
                        return true;
                    }
                }
            }
            patterns.unshift(pattern);
            return false;
        },


        /*
         * Check if two CSS selectors match, including wildcards
         * "div" == "div"
         * "_" == "div"
         */
        singleSelectorMatch: function(pattern, selector, wVars) {
            patternParts = pattern.split(" ");
            selectorParts = selector.split(" ");
            if (patternParts.length !== selectorParts.length) {
                return false;
            }
            for (var i = 0; i < patternParts.length; i++) {
                if (!this.testContext.wildcardMatch(patternParts[i], selectorParts[i], wVars)) {
                    return false;
                }
            }
            return true;
        },

        /*
         * Returns true if match() succeeds
         */
        htmlMatches: function(structure) {
            return this.testContext.htmlMatch.apply(this, arguments).success;
        },
        cssMatches: function(pattern, callbacks) {
            return this.testContext.cssMatch.apply(this, arguments).success;
        },

        notDefaultColor: constraintPartial(function(color) {
            var isRGB = ( /rgb\((\s*\d+,){2}(\s*\d+\s*)\)/.test(color) ||
                          /rgba\((\s*\d+,){3}(\s*\d+\s*)\)/.test(color) );
            var isDefault = color.replace(/\s+/, "") === "rgb(255,0,0)";
            return isRGB && !isDefault;
        }),

        isValidColor:  constraintPartial(function(color) {
            var isValidNum = function(val) {
                var num = parseInt(val, 10);
                return num >= 0 && num <= 255;
            };
            var isRGB = ( /rgb\((\s*\d+,){2}(\s*\d+\s*)\)/.test(color) ||
                          /rgba\((\s*\d+,){3}(\s*\d+\s*)\)/.test(color) );
            if (isRGB) {
                var vals = color.split("(")[1].split(",");
                return (isValidNum(vals[0]) &&
                        isValidNum(vals[1]) &&
                        isValidNum(vals[2]));
            }

            // If they're trying to use a color name, it should be at least 
            //  three letters long and not equal to rgb
            return /[a-zA-Z]+/.test(color) && 
                color.length >= 3 &&
                color.indexOf("rgb") === -1;
        }),

        ///////////////////////////////////////////////////////
        ///////////////// Override PJS functions //////////////
        ///////////////////////////////////////////////////////

        /**
         * The differences are that this assertMatch doesn't support syntaxChecks
         * (deemed unnecessary for webpage JS testing, and that the hint text is 
         * interpreted differently. 
         */
        assertMatch: function(result, description, hint, image) {
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
                structure: hint ? hint.toString() : "",
                alternateMessage: alternateMessage,
                alsoMessage: alsoMessage,
                image: image
            });
        },
        
        

        /*
         * The difference here is that it tests against allScripts instead of userCode
         */
        match: function(structure) {
            // If there were syntax errors, don't even try to match it
            if (this.errors.length) {
                return {
                    success: false,
                    message: $._("Syntax error!")
                };
            }
    
            // At the top, we take care of some "alternative" uses of this
            // function. For ease of challenge developing, we return a
            // failure() instead of disallowing these uses altogether
    
            // If we don't see a pattern property, they probably passed in
            // a pattern itself, so we'll turn it into a structure
            if (structure && _.isUndefined(structure.pattern)) {
                structure = {pattern: structure};
            }
    
            // If nothing is passed in or the pattern is non-existent, return
            // failure
            if (!structure || ! structure.pattern) {
                return {
                    success: false,
                    message: ""
                };
            }
    
            try {
                var callbacks = structure.constraint;
                var success = Structured.match(this.testContext.allScripts,
                    structure.pattern, {
                        varCallbacks: callbacks
                    });
    
                return {
                    success: success,
                    message: callbacks && callbacks.failure
                };
            } catch (e) {
                if (window.console) {
                    console.warn(e);
                }
                return {
                    success: true,
                    message: $._("Hm, we're having some trouble " +
                        "verifying your answer for this step, so we'll give " +
                        "you the benefit of the doubt as we work to fix it. " +
                        "Please click \"Report a problem\" to notify us.")
                };
            }
        },

    });
})();

/**
 * WebpageOutput
 * It creates an iframe on the same domain, and uses
 * document.write() to update the HTML each time.
 * It also includes the StateScrubber that ensures
 * that the JS in a page always gets executed in a fresh
 * global context, and it retrofits the JS with parsing/injection
 * so that it will stop an infinite loop from running in the browser.
 * Because the host iframe is typically hosted an another domain
 * so that it can be sandboxed from the main domain,
 * it communicates via postMessage() with liveEditor.
 */
window.WebpageOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;

        this.tester = new WebpageTester(options);

        this.render();

        // Load Webpage config options
        this.config.runCurVersion("webpage", this);

        // Set up infinite loop protection
        this.loopProtector = new LoopProtector(this.infiniteLoopCallback.bind(this));
        this.$frame.contentWindow.KAInfiniteLoopProtect = 
            this.loopProtector.KAInfiniteLoopProtect;
        // In case frame didn't load (like in IE10), this adds it
        //  once the frame has loaded
        this.$frame.addEventListener("load", function () {
            this.$frame.contentWindow.KAInfiniteLoopProtect = 
                this.loopProtector.KAInfiniteLoopProtect;
        }.bind(this));
        // Do this at the end so variables I add to the global scope stay
        // i.e.  KAInfiniteLoopProtect
        this.stateScrubber = new StateScrubber(this.$frame.contentWindow);
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function(screenshotSize, callback) {
        html2canvas(this.frameDoc.body, {
            imagesDir: this.output.imagesDir,
            onrendered: function(canvas) {
                var width = screenshotSize;
                var height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(
                    canvas, 0, 0, width, height);

                // Send back the screenshot data
                callback(tmpCanvas.toDataURL("image/png"));
            }
        });
    },

    infiniteLoopError: {
        text: $._("Your javascript is taking too long to run. " +
                    "Perhaps you have a mistake in your code?"),
        type: "error",
        source: "timeout",
    },

    runtimeError: {
        text: $._("Your javascript encountered a runtime error. " +
                    "Check your console for more information."),
        type: "error",
        source: "timeout",
    },

    infiniteLoopCallback:  function() {
        this.output.postParent({
            results: {
                code: this.output.currentCode,
                errors: [this.infiniteLoopError]
            }
        });
        this.KA_INFINITE_LOOP = true;
    },

    lint: function(userCode, skip) {
        // the deferred isn't required in this case, but we need to match the
        // same API as the pjs-output.js' lint method.
        var deferred = $.Deferred();
        if (skip) {
            deferred.resolve([]);
            return deferred;
        }
        
        this.userCode = userCode;
        userCode = userCode || "";

        // Lint the user's code, returning any errors in the callback
        var results = {};
        try {
            results = Slowparse.HTML(document, userCode, {
                scriptPreprocessor: this.loopProtector.protect.bind(this.loopProtector),
                disableTags: ["iframe", "embed", "object"]
            });
        } catch (e) {
            if (window.console) {
                console.warn(e);
            }
            results.error = {
                type: "UNKNOWN_SLOWPARSE_ERROR"
            };
        }

        this.slowparseResults = results;

        if (results.error) {
            var pos = results.error.cursor || 0;
            var previous = userCode.slice(0, pos);
            var column = pos - previous.lastIndexOf("\n") - 1;
            var row = (previous.match(/\n/g) || []).length;

            deferred.resolve([{
                row: row,
                column: column,
                text: this.getLintMessage(results.error),
                type: "error",
                source: "slowparse",
                lint: results.error,
                priority: 2
            }]);
            return deferred;
        }

        deferred.resolve([]);
        return deferred;
    },

    flattenError: function(plainError, error, base) {
        error = error || {};
        base = base || "";

        for (var prop in plainError) {
            if (plainError.hasOwnProperty(prop)) {
                var flatName = (base ? base + "_" + prop : prop);
                if (typeof plainError[prop] === "object") {
                    this.flattenError(plainError[prop], error, flatName);
                } else {
                    error[flatName] = plainError[prop];
                }
            }
        }

        return error;
    },

    getLintMessage: function(plainError) {
        var error = this.flattenError(plainError);

        // Mostly borrowed from:
        // https://github.com/mozilla/thimble.webmaker.org/blob/master/locale/en_US/thimble-dialog-messages.json
        return ({
            ATTRIBUTE_IN_CLOSING_TAG: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag cannot contain any attributes.", error),
            CLOSE_TAG_FOR_VOID_ELEMENT: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag for a void element (and void elements don't need to be closed).", error),
            CSS_MIXED_ACTIVECONTENT: $._("You have a css property \"%(cssProperty_property)s\" with a \"url()\" value that currently points to an insecure resource.", error),
            EVENT_HANDLER_ATTR_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"%(attribute_name_value)s\" JavaScript event handler attribute.", error),
            HTML_CODE_IN_CSS_BLOCK: $._("Did you put HTML code inside a CSS area?", error),
            HTTP_LINK_FROM_HTTPS_PAGE: $._("The \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute currently points to an insecure resource.", error),
            INVALID_ATTR_NAME: $._("The attribute name \"%(attribute_name_value)s\" is not permitted under HTML5 naming conventions.", error),
            UNSUPPORTED_ATTR_NAMESPACE: $._("The attribute \"%(attribute_name_value)s\" uses an attribute namespace that is not permitted under HTML5 conventions.", error),
            MULTIPLE_ATTR_NAMESPACES: $._("The attribute \"%(attribute_name_value)s\" has multiple namespaces. Check your text and make sure there's only a single namespace prefix for the attribute.", error),
            INVALID_CSS_PROPERTY_NAME: $._("The CSS property \"%(cssProperty_property)s\" does not exist.", error),
            INVALID_TAG_NAME: $._("A \"&lt;\" character appears to be the beginning of a tag, but is not followed by a valid tag name. If you want a \"&lt;\" to appear on your Web page, try using \"&amp;lt;\" instead. Otherwise, check your spelling.", error),
            JAVASCRIPT_URL_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"javascript:\" URL.", error),
            MISMATCHED_CLOSE_TAG: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag that doesn't pair with the opening \"&lt;%(openTag_name)s&gt;\" tag. This is likely due to a missing or misordered \"&lt;/%(openTag_name)s&gt;\" tag.", error),
            MISSING_CSS_BLOCK_CLOSER: $._("You're missing either a \"}\" or another \"property:value;\" pair following \"%(cssValue_value)s\".", error),
            MISSING_CSS_BLOCK_OPENER: $._("You're missing the \"{\" after \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_PROPERTY: $._("You're missing property for \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_SELECTOR: $._("You're missing either a new CSS selector or the \"&lt;/style&gt;\" tag.", error),
            MISSING_CSS_VALUE: $._("You're missing value for \"%(cssProperty_property)s\".", error),
            SCRIPT_ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;script&gt;\" tags.", error),
            ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;%(openTag_name)s&gt;\" tags.", error),
            SELF_CLOSING_NON_VOID_ELEMENT: $._("The \"&lt;%(name)s&gt;\" tag can't be self-closed, because \"&lt;%(name)s&gt;\" is not a void element; it must be closed with a separate \"&lt;/%(name)s&gt;\" tag.", error),
            UNCAUGHT_CSS_PARSE_ERROR: $._("A parse error occurred outside expected cases: \"%(error_msg)s\"", error),
            UNCLOSED_TAG: $._("It looks like your \"&lt;%(openTag_name)s&gt;\" tag never closes.", error),
            UNEXPECTED_CLOSE_TAG: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag that doesn't pair with any matching opening tags.", error),
            UNFINISHED_CSS_PROPERTY: $._("The CSS property \"%(cssProperty_property)s\" is missing a \":\"", error),
            UNFINISHED_CSS_SELECTOR: $._("The CSS selector \"%(cssSelector_selector)s\" needs to be followed by \"{\"", error),
            UNFINISHED_CSS_VALUE: $._("The CSS value \"%(cssValue_value)s\" still needs to be finalized with \";\"", error),
            UNKOWN_CSS_KEYWORD: $._("The CSS @keyword \"%(cssKeyword_value)s\" does not match any known @keywords.", error),
            UNQUOTED_ATTR_VALUE: $._("Make sure your attribute value starts with an opening double quote.", error),
            UNTERMINATED_ATTR_VALUE: $._("It looks like your \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute has a value that doesn't end with a closing double quote.", error),
            UNTERMINATED_CLOSE_TAG: $._("It looks like your closing \"&lt;/%(closeTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error),
            UNTERMINATED_COMMENT: $._("It looks like your comment doesn't end with a \"--&gt;\".", error),
            UNTERMINATED_CSS_COMMENT: $._("It looks like your CSS comment doesn't end with a \"*/\".", error),
            UNTERMINATED_OPEN_TAG: $._("It looks like your opening \"&lt;%(openTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error),
            UNKNOWN_SLOWPARSE_ERROR: $._("Something's wrong with the HTML, but we're not sure what."),
            JAVASCRIPT_ERROR: $._("Javascript Error:\n\"%(message)s\"", error)
        })[error.type];
    },

    initTests: function(validate) {
        if (!validate) {
            return;
        }

        try {
            var code = "with(arguments[0]){\n" + validate + "\n}";
            (new Function(code)).apply({}, this.tester.testContext);
        } catch (e) {
            return e;
        }
    },

    test: function(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        _.extend(this.tester.testContext, {
            $doc: $(this.frameDoc),
            // Append to a div because jQuery doesn't work on a document fragment
            $docSP: $("<div>").append(this.slowparseResults.document),
            cssRules: this.slowparseResults.rules
        });

        this.tester.test(userCode, tests, errors,
            function(errors, testResults) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    var message = $._("Error: %(message)s",
                        {message: errors[errors.length - 1].message});
                    // TODO(jeresig): Find a better way to show this
                    this.output.$el.find(".test-errors").text(message).show();
                    this.tester.testContext.assert(false, message,
                        $._("A critical problem occurred in your program " +
                            "making it unable to run."));
                }

                if (this.foundRunTimeError) {
                    errors.push(this.runtimeError);
                }
                callback(errors, testResults);

            }.bind(this));
    },

    // Prefixes a URL with the URL of a redirecting proxy,
    //  if one has been specified.
    transformUrl: function(url) {
        if (url.match(/^https?:\/\/([\w\d]+\.)?khanacademy\.org/)) {
            return url;
        }
        var redirectUrl = this.output.redirectUrl;
        if (redirectUrl && url.indexOf(redirectUrl) !== 0) {
            return redirectUrl + "?url=" + encodeURIComponent(url);
        }
        return url;
    },

    postProcessing: function(oldPageTitle) {
        var self = this;

        // Change external links to a redirecting proxy
        $(this.frameDoc).find("a").each(function(ind, a) {
            var url = $(a).attr("href");
            if (url && url[0] !== "#") {
                $(a).attr("target", "_blank");
                $(a).attr("href", this.transformUrl(url));
            }
        }.bind(this));

        // Animate internal links (as otherwise, they don't work in FF)
        $(this.frameDoc).find("a[href^='#']").on("mouseup", function() {
            var url = $(this).attr("href");
            var target = $(self.frameDoc).find(url);
            // Scroll only if the target exists
            if (target.length) {
                $(self.frameDoc).find("html, body").animate({
                    scrollTop: $(self.frameDoc).find(url).offset().top
                }, 1000);
            }
            return;
        });

        // Monitor changes to the title tag
        var titleTag = $(this.frameDoc).find("head > title");
        var title = titleTag.first().text();
        if (titleTag.length >= 0 && this.oldPageTitle !== title) {
            this.oldPageTitle = title;
            self.output.postParent({
                action: "page-info",
                title: title
            });
        }
    },

    runCode: function(codeObj, callback) {
        this.stateScrubber.clearAll();
        this.KA_INFINITE_LOOP = false;
        this.foundRunTimeError = false;
        this.frameDoc.open();
        // It's necessary in FF/IE to redefine it here
        this.$frame.contentWindow.KAInfiniteLoopProtect = 
                this.loopProtector.KAInfiniteLoopProtect;
        this.$frame.contentWindow.addEventListener("error", function () {
            this.foundRunTimeError = true;
        }.bind(this));

        this.frameDoc.write(this.slowparseResults.code);
        this.frameDoc.close();

        this.postProcessing();

        if (this.KA_INFINITE_LOOP) {
            callback([this.infiniteLoopError]);
        } else {
            callback([]);
        }
        
    },

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("webpage", WebpageOutput);

