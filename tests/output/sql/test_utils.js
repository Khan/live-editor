/* jshint unused:false */
var runTest = function(options) {

    var displayTitle = options.title;

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

        if (options.validate) {
            output.initTests(options.validate);
        }

        output.runCode(code, function(errors, testResults) {
            if (options.test) {
                options.test(output, errors, testResults, function() {
                    done();
                });
                return;
            }

            if (options.pass) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.have.length(0);
                _.each(options.expectedErrors, function(expectedError, i) {
                    expect(errors[i].text.indexOf(expectedError)).to.not.be(-1);
                });
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
        pass: true,
        expected: true
    });
};

var failingTest = function(title, code, errors) {
    runTest({
        title: title,
        code: code,
        expected: false,
        pass: false,
        expectedErrors: errors
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
