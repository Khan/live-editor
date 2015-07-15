/*jshint unused: false*/
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
 *  only: only run this test
 *  setup: custom setup callback, takes a single argument: output
 *  teardown: custom teardown callback, takes a single argument: output
 *  wait: time to wait after first code run, this allows "draw" to be called
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

    var code1 = getCodeFromOptions(options.code);
    var code2 = getCodeFromOptions(options.code2);

    // Start an asynchronous test
    var itFunc = it;
    if (options.skip) {
        itFunc = it.skip;
    } else if (options.only) {
        itFunc = it.only;
    }
 
    itFunc(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            outputType: "pjs",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            soundsDir: "../../../sounds/",
            jshintFile: "../../../build/external/jshint/jshint.js",
            useDebugger: useDebugger
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        if (options.validate) {
            output.initTests(options.validate);
        }

        if (options.setup) {
            options.setup(output);
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


        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code1, function(errors, testResults) {
            if (options.test) {
                options.test(output, errors, testResults, function() {
                    finishTest(done, output, options);
                });
                return;
            }

            checkErrors(options.errors, errors);
            checkAssertions(options.assertions, output.results.assertions);
            options.simulateClick && simulateClick(output);

            if (code2) {
                output.runCode(code2, function(errors) {
                    checkErrors(options.errors2, errors);
                    checkAssertions(options.assertions2,
                        output.results.assertions);
                    options.simulateClick && simulateClick(output);

                    finishTest(done, output, options);
                });
            } else {
                finishTest(done, output, options);
            }
        });
    });
};


var finishTest = function(done, output, options) {
    if (options.wait) {
        setTimeout(function () {
            if (options.teardown) {
                options.teardown(output);
            }
            output.output.kill();
            done();
        }, options.wait);
    } else {
        if (options.teardown) {
            options.teardown(output);
        }
        output.output.kill();
        done();
    }
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
                    expect(errors[0].lint).to.be.ok();
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

/* Possible Options:
 *  reason: List of expected lint output errors (sorted by priority)
 *  fromTests: If true, compare reason to execution results
 *  jshint: If true, code should be run through JSHint
 *  title: Title of test
 *  code: Code to be run through linter, output is compared to reason
 */
var allErrorsTest = function(options) {
    options.test = function(output, errors, testResults, callback) {
            if (options.reasons.length === 0) {
                expect(errors.length).to.be.equal(0);
            } else {
                if (options.fromTests) {
                    expect(testResults.length).to.equal(options.reasons.length);
                    _.each(testResults, function(result, i) {
                        expect(testResults).to.not.equal([]);
                        expect(result.state).to.be.equal("fail");
                        expect(result.results.meta.alsoMessage)
                            .to.be.equal(options.reasons[i]);
                    });
                } else {
                    expect(errors).to.not.equal([]);
                    expect(errors.length).to.equal(options.reasons.length);
                    if (options.jshint) {
                        _.each(errors, function(error, i) {
                            expect(error.lint).to.be.ok();
                            expect(error.lint.reason).to.be.equal(options.reasons[i]);
                        });
                    } else {
                        _.each(errors, function(error, i) {
                            var $html = $("<div>" + error.text + "</div>");
                            expect($html.text()).to.be.equal(options.reasons[i]);
                        });
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

var supportsMpegAudio = function() {
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
};

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

// Theoretically, jQuery.mouseup should work, but it wasn't working
//  for me across PhantomJS/browser, and this does.
var simulateClick = function(output) {
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
