var runTest = function(options) {
    if (options.version === undefined) {
        options.version = ScratchpadConfig.prototype.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    // Assume the code is a string, by default
    var code = options.code;

    // If not then we assume that it's a function so we need to
    // extract the code to run from the serialized function
    if (typeof code !== "string") {
        code = code.toString();
        code = code.substr(code.indexOf("{") + 1);
        code = code.substr(0, code.length - 1);
    }

    // Assume the code is a string, by default
    var code2 = options.code2;

    // If not then we assume that it's a function so we need to
    // extract the code to run from the serialized function
    if (code2 && typeof code2 !== "string") {
        code2 = code2.toString();
        code2 = code2.substr(code2.indexOf("{") + 1);
        code2 = code2.substr(0, code2.length - 1);
    }

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            outputType: "pjs",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            jshintFile: "../../../build/external/jshint/jshint.js"
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        if (options.validate) {
            output.initTests(options.validate);
        }

        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code, function(errors, testResults) {
            if (options.test) {
                options.test(output, errors, testResults, done);
                return;
            }

            if (options.expected) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.equal([]);
                // In some cases, we actually verify number and line # of errors
                // We generally can't test the text as it varies per JS engine,
                // (changes depending on whether we run tests in browser vs.
                // command-line.
                // The column number is more consistent across the engines
                if (options.errors) {
                    expect(errors.length).to.be.equal(options.errors.length);
                    expect(errors[0].column)
                        .to.be.equal(options.errors[0].column);
                }
            }

            if (code2) {
                output.runCode(code2, function(errors) {
                    if (options.expected) {
                        expect(errors).to.have.length(0);
                    } else {
                        expect(errors).to.have.length.above(0);
                    }

                    done();
                });
            } else {
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
        expected: true
    });
};

var failingTest = function(title, code, code2, errors) {
    runTest({
        title: title,
        code: code,
        code2: code2,
        expected: false, 
        errors: errors
    });
};