/* Possibly options:
 *  code: First code to run
 *  code2: Code to run after
 *  validate: StructuredJS tests (see assert_test.js)
 *  assertions: Array of assertions caused by assertEqual() function
 *  assertions2: Second array (after code2 is run)
 *  errors: Array of errors caused by JSHint/BabyHint (see output_test.js),
 *          or a boolean indicating that errors are expected.
 *  test: A callback function to run with all the results
 *  skip: skip the test
 */
var runTest = function(options) {
    if ((!options.errors || !options.errors.length) && !options.noLint) {
        var noLintOpts = _.extend({}, options);
        noLintOpts.noLint = true;
        noLintOpts.title = options.title + " (noLint)";
        runTest(noLintOpts);
    }

    if (options.version === undefined) {
        options.version = ScratchpadConfig.prototype.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    var getCodeFromOptions = function(code) {
        // Assume the code is a string, by default
        // If not then we assume that it's a function so we need to
        // extract the code to run from the serialized function
        if (code && typeof code !== "string") {
            code = code.toString();
            code = code.substr(code.indexOf("{") + 1);
            code = code.substr(0, code.length - 1);
        }
        return code;
    };

    var code1 = getCodeFromOptions(options.code);
    var code2 = getCodeFromOptions(options.code2);

    // Start an asynchronous test
    var itFunc = options.skip ? it.skip : it;
    itFunc(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            outputType: "pjs",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            jshintFile: "../../../build/external/jshint/jshint.js",
            useDebugger: useDebugger
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        if (options.validate) {
            output.initTests(options.validate);
        }

        // Used to check assertions (caused by Program.assertEqual())
        var checkAssertions = function(expectedAssertions, outputAssertions) {
            if (expectedAssertions !== undefined) {
                expect(outputAssertions.length).to.be.equal(
                    expectedAssertions.length);
                if (expectedAssertions.length > 0) {
                    expect(outputAssertions[0].text).to.be.equal(
                        expectedAssertions[0].text);
                }
            }
        };

        var checkErrors = function(expectedErrors, outputErrors) {
            if (!expectedErrors || expectedErrors.length === 0) {
                expect(outputErrors).to.have.length(0);
            } else {
                expect(outputErrors).to.not.equal([]);
                // In some cases, we actually verify number and line # of errors
                // We generally can't test the text as it varies per JS engine,
                // (changes depending on whether we run tests in browser vs.
                // command-line.
                // The column number is more consistent across the engines
                if (expectedErrors.length) {
                    expect(outputErrors.length).to.be.equal(
                        expectedErrors.length);
                    expect(outputErrors[0].column)
                        .to.be.equal(expectedErrors[0].column);
                }
            }
        };

        // Theoretically, jQuery.mouseup should work, but it wasn't working
        //  for me across PhantomJS/browser, and this does.
        var simulateClick = function() {
            var ev = document.createEvent("MouseEvent");
            ev.initMouseEvent(
                "mouseup",
                true, true,
                window, null,
                0, 0, 0, 0,
                false, false, false, false,
                0, null
            );
            output.output.$canvas[0].dispatchEvent(ev);
        };

        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code1, function(errors, testResults) {
            if (options.test) {
                options.test(output, errors, testResults, done);
                return;
            }

            checkErrors(options.errors, errors);
            checkAssertions(options.assertions, output.results.assertions);
            options.simulateClick && simulateClick();

            if (code2) {
                output.runCode(code2, function(errors) {
                    checkErrors(options.errors2, errors);
                    checkAssertions(options.assertions2,
                        output.results.assertions);
                    options.simulateClick && simulateClick();
                    output.output.kill();
                    done();
                });
            } else {
                output.output.kill();
                done();
            }
        });
    });
};


var assertTest = function(options) {
    options.test = function(output, errors, testResults, callback) {
        if (!options.reason) {
            expect(errors.length).to.be.equal(0);
        } else {
            if (options.fromTests) {
                expect(testResults).to.not.equal([]);
                expect(testResults[0].state).to.be.equal("fail");
                expect(testResults[0].results[0].meta.alsoMessage)
                    .to.be.equal(options.reason);
            } else {
                expect(errors).to.not.equal([]);
                if (options.jshint) {
                    expect(errors[0].lint).to.exist;
                    expect(errors[0].lint.reason)
                        .to.be.equal(options.reason);
                } else {
                    var $html = $("<div>" + errors[0].text + "</div>");
                    expect($html.text()).to.be.equal(options.reason);
                }
            }
        }
        callback();
    };
    runTest(options);
};

var test = function(title, code, code2) {
    runTest({
        title: title,
        code: code,
        code2: code2,
        errors: []
    });
};

var failingTest = function(title, code, code2, errors) {
    runTest({
        title: title,
        code: code,
        code2: code2,
        errors: errors || true
    });
};

var assertEqualTest = function(title, code, assertions) {
    runTest({title: options.title, code: code, assertions: assertions});
};