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
            outputType: "sql",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        if (options.validate) {
            output.initTests(options.validate);
        }

        output.runCode(code, function(errors, testResults) {
            if (options.pass) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.have.length(0);
            }
            done();
        });
    });
};

var test = function(title, code) {
    if (typeof code === "object") {
        code.forEach(function(userCode) {
            test(title, userCode);
        });
        return;
    }

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

var assertTest = function(options) {
    options.test = function(output, errors, testResults, callback) {
        callback();
    };
    runTest(options);
};
