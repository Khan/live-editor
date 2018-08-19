/* eslint-disable */
import React from "react";
import ReactDOM from "react-dom";

import LiveEditorOutput from "../../../js/output/shared/output.js";
import WebpageOutput from "../../../js/output/webpage/webpage-output.js";

LiveEditorOutput.registerOutput("webpage", WebpageOutput);

export function createLiveEditorOutput(extraProps) {
    const ref = React.createRef();

    const props = Object.assign({}, {
        ref,
        outputType: "webpage",
        workersDir: "../../../build/",
        externalsDir: "../../../build/external/",
        imagesDir: "../../../build/images/",
        jshintFile: "../../../build/external/jshint/jshint.js",
        redirectUrl: "http://ka.org/r"
    }, extraProps || {});

    ReactDOM.render(React.createElement(LiveEditorOutput, props),
        document.getElementById("live-editor-output"));
    return ref;
};

export function removeLiveEditorOutput() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"));
}

export function runTest(options) {

    var displayTitle = options.title;

    // Assume the code is a string, by default
    var code = options.code;

    // Start an asynchronous test
    it(displayTitle, function(done) {

        const outputRef = createLiveEditorOutput({
            validate: options.validate,
            onAllDone: (runResults) => {
                const errors = runResults.errors;
                const testResults = runResults.tests;
                const warnings = runResults.warnings;

                // Catch errors and forward them to Mocha
                // Otherwise output.js sometimes swallows them
                try {
                    if (options.expected) {
                        expect(errors).to.have.length(0);
                    } else {
                        expect(errors).to.not.equal([]);
                        // In some cases, we actually verify number and line # of errors
                        if (options.errors) {
                            expect(errors.length)
                                .to.be.equal(options.errors.length);
                            expect(errors[0].row)
                                .to.be.equal(options.errors[0].row);
                            expect(errors[0].column)
                                .to.be.equal(options.errors[0].column);
                            if (options.errors[0].lint) {
                                expect(errors[0].lint.type)
                                    .to.be.equal(options.errors[0].lint.type);
                            }
                            if (options.errors[0].text) {
                                expect(errors[0].text)
                                    .to.be.equal(options.errors[0].text);
                            }
                        } else if (options.warnings) {
                            checkWarnings(options.warnings, warnings);
                        }
                    }

                    if (options.test) {
                        if (options.test.length === 4) {
                            options.test(outputRef, errors, testResults, done);
                        } else {
                            options.test(outputRef, errors, testResults);
                            removeLiveEditorOutput();
                            done();
                        }
                    } else {
                        removeLiveEditorOutput();
                        done();
                    }
                } catch (e) {
                    removeLiveEditorOutput();
                    done(e);
                }
            }
        });

        outputRef.current.runCode(code);
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
        expected: true
    });
};

export function failingTest(title, code, errors) {
    runTest({
        title: title,
        code: code,
        expected: false,
        errors: errors
    });
};

export function warningTest(title, code, warnings) {
    if (typeof code === "object") {
        code.forEach(function(userCode, i) {
            warningTest(title, userCode, warnings[i]);
        });
        return;
    }

    runTest({
        title: title,
        code: code,
        warnings: warnings
    });
}

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
                if (options.lint) {
                    expect(errors[0].lint).to.exist;
                    expect(errors[0].lint.reason)
                        .to.be.equal(options.reason);
                } else {
                    // Strip HTML tags from message before comparing them
                    const errorDiv = document.createElement("div");
                    errorDiv.innerHTML = errors[0].text;
                    expect(errorDiv.innerText).to.be.equal(options.reason);
                }
            }
        }
        callback();
    };
    runTest(options);
};

// Used to check warnings
var checkWarnings = function(expectedWarnings, outputWarnings) {
    if (expectedWarnings !== undefined) {
        expect(outputWarnings.length).to.be.equal(
            expectedWarnings.length);
        for (var i = 0; i < expectedWarnings.length; i++) {
            expect(outputWarnings[i].text).to.be.equal(expectedWarnings[i]);
        }
    }
};

export function isFirefox() {
    return navigator.userAgent.indexOf('Firefox') !== -1;
};
