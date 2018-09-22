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

            var parser = new DOMParser();
            var doc = parser.parseFromString(userCode, "text/html");

            doc.querySelectorAll("script").forEach((scriptElement) => {
                this.testContext.allScripts += scriptElement.innerHTML;
                this.testContext.allScripts += "\n";
            });

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
                var numFound = this.testContext.docSP.querySelectorAll(selector).length;
                if ((expected === 0 && numFound !== 0) || numFound < expected) {
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
                        for (key in wVars) { /* jshint forin:false */
                            // Commit wildcard selections to parent wVars
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
            var patternParts = pattern.split(" ");
            var selectorParts = selector.split(" ");
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
         * The difference is that the hint text is
         * interpreted differently.
         */
        assertMatch: function(result, description, hint, image, syntaxChecks) {
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
                    message: i18n._("Syntax error!")
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
                console.warn(e);
                return {
                    success: true,
                    message: i18n._("Hm, we're having some trouble " +
                        "verifying your answer for this step, so we'll give " +
                        "you the benefit of the doubt as we work to fix it. " +
                        "Please click \"Report a problem\" to notify us.")
                };
            }
        },

    });
})();
