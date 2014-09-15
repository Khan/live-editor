var WebpageTester = function(options) {
    this.initialize(options);
    this.bindTestContext();
};

WebpageTester.prototype = new OutputTester();

WebpageTester.prototype.testMethods = {
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
    match: function(structure) {
        // If there were syntax errors, don't even try to match it
        if (this.errors.length) {
            return {
                success: false,
                message: $._("Syntax error!")
            };
        }

        structure = this.testContext.cleanStructure(structure);

        for (var selector in structure) {
            var expected = structure[selector];
            // TODO(jeresig): Maybe find a way to do this such that we can run
            // it in a worker thread.
            var numFound = jQuery(selector, this.userCode).length;
            if (expected === 0 && numFound !== 0 || numFound < expected) {
                return {
                    success: false,
                    message: $._("Your HTML failed to match the following " +
                        "selector: '%(selector)s'. Expected '%(expected)s' " +
                        "elements, found '%(found)s' instead.", {
                            selector: selector,
                            expected: expected,
                            found: numFound
                        })
                };
            }
        }

        return {
            success: true
        };
    },

    /*
     * Returns true if the structure matches the user's HTML
     */
    matches: function(structure) {
        return this.testContext.match(structure).success;
    },

    /*
     * Creates a new test result (i.e. new challenge tab)
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
            structure: this.testContext.cleanStructure(hint),
            alternateMessage: alternateMessage,
            alsoMessage: alsoMessage,
            image: image
        });
    }
};