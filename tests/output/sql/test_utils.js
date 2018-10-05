import LiveEditorOutput from "../../../js/output/shared/output.js";
import SQLOutput from "../../../js/output/sql/sql-output.js";

LiveEditorOutput.registerOutput("sql", SQLOutput);

export function createLiveEditorOutput(extraOptions) {

    const options = Object.assign({}, {
        el: document.getElementById("live-editor-output"),
        outputType: "sql",
        workersDir: "../../../build/",
        externalsDir: "../../../build/external/",
        imagesDir: "../../../build/images/",
    }, extraOptions || {});

    return new LiveEditorOutput(options);
};

/* jshint unused:false */
export function runTest(options) {

    var displayTitle = options.title;

    // Assume the code is a string, by default
    var code = options.code;

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = createLiveEditorOutput({validate: options.validate})

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

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

export function test(title, code) {
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

export function failingTest(title, code, errors) {
    runTest({
        title: title,
        code: code,
        expected: false,
        pass: false,
        expectedErrors: errors || []
    });
};

export function assertTest(options) {
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
            }
        }
        callback();
    };
    runTest(options);
};
