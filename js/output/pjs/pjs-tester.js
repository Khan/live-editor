var PJSTester = function(options) {
    this.initialize(options);
    this.bindTestContext();
};

PJSTester.prototype = new OutputTester();

PJSTester.prototype.testMethods = {
    /*
     * See if any of the patterns match the code
     */
    firstMatchingPattern: function(patterns) {
        return _.find(patterns, _.bind(function(pattern) {
            return this.testContext.matches(pattern);
        }, this));
    },

    hasFnCall: function(name, check) {
        for (var i = 0, l = this.fnCalls.length; i < l; i++) {
            var retVal = this.testContext.checkFn(
                this.fnCalls[i], name, check);

            if (retVal === true) {
                return;
            }
        }

        this.testContext.assert(false,
            $._("Expected function call to '%(name)s' was not made.",
            {name: name}));
    },

    orderedFnCalls: function(calls) {
        var callPos = 0;

        for (var i = 0, l = this.fnCalls.length; i < l; i++) {
            var retVal = this.testContext.checkFn(
                this.fnCalls[i],
                    calls[callPos][0], calls[callPos][1]);

            if (retVal === true) {
                callPos += 1;

                if (callPos === calls.length) {
                    return;
                }
            }
        }

        this.testContext.assert(false,
            $._("Expected function call to '%(name)s' was not made.",
            {name: calls[callPos][0]}));
    },

    checkFn: function(fnCall, name, check) {
        if (fnCall.name !== name) {
            return;
        }

        var pass = true;

        if (typeof check === "object") {
            if (check.length !== fnCall.args.length) {
                pass = false;

            } else {
                for (var c = 0; c < check.length; c++) {
                    if (check[c] !== null &&
                        check[c] !== fnCall.args[c]) {
                        pass = false;
                    }
                }
            }

        } else if (typeof check === "function") {
            pass = check(fnCall);
        }

        if (pass) {
            this.testContext.assert(true,
                $._("Correct function call made to %(name)s.",
                {name: name}));
        }

        return pass;
    },

    _isVarName: function(str) {
        return _.isString(str) && str.length > 0 && str[0] === "$";
    },

    _assertVarName: function(str) {
        if (!this.testContext._isVarName(str)) {
            throw new Error(
                $._("Expected '%(name)s' to be a valid variable name.",
                    {name: str}));
        }
    },

    /*
     * Satisfied when predicate(var) is true.
     */
    unaryOp: function(varName, predicate) {
        this.testContext._assertVarName(varName);
        return this.testContext.constraint([varName], function(ast) {
            return !!(ast && !_.isUndefined(ast.value) &&
                predicate(ast.value));
        });
    },

    /*
     * Satisfied when var is any literal.
     */
    isLiteral: function(varName) {
        function returnsTrue() {
            return true;
        }

        return this.testContext.unaryOp(varName, returnsTrue);
    },

    /*
     * Satisfied when var is a number.
     */
    isNumber: function(varName) {
        return this.testContext.unaryOp(varName, _.isNumber);
    },

    /*
     * Satisfied when var is an identifier
     */
    isIdentifier: function(varName) {
        return this.testContext.constraint([varName], function(ast) {
            return !!(ast && ast.type && ast.type === "Identifier");
        });
    },

    /*
     * Satisfied when var is a boolean.
     */
    isBoolean: function(varName) {
        return this.testContext.unaryOp(varName, _.isBoolean);
    },

    /*
     * Satisfied when var is a string.
     */
    isString: function(varName) {
        return this.testContext.unaryOp(varName, _.isString);
    },

    /*
     * Satisfied when pred(first, second) is true.
     */
    binaryOp: function(first, second, predicate) {
        var variables = [];
        var fn;
        if (this.testContext._isVarName(first)) {
            variables.push(first);
            if (this.testContext._isVarName(second)) {
                variables.push(second);
                fn = function(a, b) {
                    return !!(a && b && !_.isUndefined(a.value) &&
                        !_.isUndefined(b.value) &&
                        predicate(a.value, b.value));
                };
            } else {
                fn = function(a) {
                    return !!(a && !_.isUndefined(a.value) &&
                        predicate(a.value, second));
                };
            }
        } else if (this.testContext._isVarName(second)) {
            variables.push(second);
            fn = function(b) {
                return !!(b && !_.isUndefined(b.value) &&
                    predicate(first, b.value));
            };
        } else {
            throw new Error($._("Expected either '%(first)s' or '%(second)s'" +
                " to be a valid variable name.",
                {first: first, second: second}));
        }

        return this.testContext.constraint(variables, fn);
    },

    /*
     * Satisfied when a < b
     */
    lessThan: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a < b;
        });
    },

    /*
     * Satisfied when a <= b
     */
    lessThanOrEqual: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a <= b;
        });
    },

    /*
     * Satisfied when a > b
     */
    greaterThan: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a > b;
        });
    },

    /*
     * Satisfied when a > 0
     */
    positive: function(a) {
        return this.testContext.unaryOp(a, function(a) {
            return a > 0;
        });
    },

    /*
     * Satisfied when a > 0
     */
    negative: function(a) {
        return this.testContext.unaryOp(a, function(a) {
            return a < 0;
        });
    },

    /*
     * Satisfied when a >= b
     */
    greaterThanOrEqual: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a >= b;
        });
    },

    /*
     * Satisfied when min <= val <= max
     */
    inRange: function(val, min, max) {
        return this.testContext.and(
            this.testContext.greaterThanOrEqual(val, min),
            this.testContext.lessThanOrEqual(val, max)
        );
    },

    /*
     * Satisfied when a === b
     */
    equal: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a === b;
        });
    },

    /*
     * Satisfied when a !== b
     */
    notEqual: function(a, b) {
        return this.testContext.binaryOp(a, b, function(a, b) {
            return a !== b;
        });
    },

    /*
     * Satisfied when constraint is not satisfied
     */
    not: function(constraint) {
        return this.testContext.constraint(constraint.variables, function() {
            return !constraint.fn.apply({}, arguments);
        });
    },

    _naryShortCircuitingOp: function(allOrAny, args) {
        var variables = _.union.apply({}, _.pluck(args, "variables"));

        var argNameToIndex = _.object(_.map(variables, function(item, i) {
            return [item, i];
        }));

        return this.testContext.constraint(variables, function() {
            var constraintArgs = arguments;
            return allOrAny(args, function(constraint) {
                var fnArgs = _.map(constraint.variables, function(varName) {
                    return constraintArgs[argNameToIndex[varName]];
                });

                return constraint.fn.apply({}, fnArgs);
            });
        });
    },

    /*
     * Satisfied when all of the input constraints are satisfied
     */
    and: function() {
        return this.testContext._naryShortCircuitingOp(_.all, arguments);
    },

    /*
     * Satisfied when any of the input constraints are satisfied
     */
    or: function() {
        return this.testContext._naryShortCircuitingOp(_.any, arguments);
    },

    /*
     * Returns a new structure from the combination of a pattern and a
     * constraint
     */
    structure: function(pattern, constraint) {
        return {
            pattern: pattern,
            constraint: constraint
        };
    },

    /*
     * Creates a new variable constraint
     */
    constraint: function(variables, fn) {
        return {
            variables: variables,
            fn: fn
        };
    },

    /*
     * Returns the result of matching a structure against the user's code
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
            var constraint = structure.constraint;
            var callbacks;
            if (constraint) {
                callbacks = {};
                callbacks[constraint.variables.join(", ")] = constraint.fn;
            }
            var success = Structured.match(this.userCode,
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

    /*
     * Returns true if the structure matches the user's code
     */
    matches: function(structure) {
        if (typeof structure !== "object") {
            structure = this.testContext.structure(structure);
        }
        return this.testContext.match(structure).success;
    },

    /*
     * Creates a new test result (i.e. new challenge tab)
     */
    assertMatch: function(result, description, hint, image, syntaxChecks) {
        if (syntaxChecks) {
            // If we found any syntax errors or warnings, we'll send it
            // through the special syntax checks
            var foundErrors = _.any(this.errors, function(error) {
                return error.lint;
            });

            if (foundErrors) {
                _.each(syntaxChecks, function(syntaxCheck) {
                    // Check if we find the regex anywhere in the code
                    var foundCheck = this.userCode.search(syntaxCheck.re);
                    var rowNum = -1, colNum = -1, errorMsg;
                    if (foundCheck > -1) {
                        errorMsg = syntaxCheck.msg;

                        // Find line number and character
                        var lines = this.userCode.split("\n");
                        var totalChars = 0;
                        _.each(lines, function(line, num) {
                            if (rowNum === -1 &&
                                foundCheck < totalChars + line.length) {
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
                }.bind(this));
            }
        }

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
            structure: _.isString(hint) ? "function() {" + hint + "}" :
                hint.toString(),
            alternateMessage: alternateMessage,
            alsoMessage: alsoMessage,
            image: image
        });
    }
};