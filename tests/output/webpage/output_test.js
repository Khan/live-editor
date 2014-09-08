var runTest = function(options) {
    if (options.version === undefined) {
        options.version = ScratchpadConfig.prototype.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    // Assume the code is a string, by default
    var code = options.code;

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            el: $("#output-area")[0],
            outputType: "webpage",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            jshintFile: "../../../build/external/jshint/jshint.js"
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code, function(errors) {
            if (options.expected) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.equal([]);
                // In some cases, we actually verify number and line # of errors
                // We generally can't test the text as it varies per JS engine,
                // (changes depending on whether we run tests in browser vs. command-line
                // The column number is more consistent across the engines
                if (options.errors) {
                    expect(errors.length).to.be.equal(options.errors.length);
                    expect(errors[0].column)
                        .to.be.equal(options.errors[0].column);
                }
            }

            if (options.test) {
                if (options.test.length === 2) {
                    options.test(output, done);
                } else {
                    options.test(output);
                    done();
                }
            } else {
                done();
            }
        });
    });
};

var test = function(title, code) {
    runTest({
        title: title,
        code: code,
        expected: true
    });
};

var failingTest = function(title, code, errors) {
    runTest({
        title: title,
        code: code,
        expected: false, 
        errors: errors
    });
};

describe("Output Methods", function() {
    runTest({
        title: "getScreenshot",
        code: "<!DOCTYPE html><html><body></body></html>",
        test: function(output, callback) {
            output.output.getScreenshot(200, function(data) {
                // Testing with a truncated base64 png
                expect(data).to.contain("data:image/png;base64,iVBOR");
                callback();
            });
        }
    });
});
