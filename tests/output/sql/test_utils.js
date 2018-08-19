/* eslint-disable */
import React from "react";
import ReactDOM from "react-dom";

import LiveEditorOutput from "../../../js/output/shared/output.js";
import SQLOutput from "../../../js/output/sql/sql-output.js";

LiveEditorOutput.registerOutput("sql", SQLOutput);

function createLiveEditorOutput(extraProps) {
    const ref = React.createRef();

    const props = Object.assign({}, {
        ref,
        outputType: "sql",
        imagesDir: "../../../build/images/",
        workersDir: "../../../build/",
        externalsDir: "../../../build/external/",
    }, extraProps || {});

    ReactDOM.render(React.createElement(LiveEditorOutput, props),
        document.getElementById("live-editor-output"));
    return ref;
};

function removeLiveEditorOutput() {
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

                if (options.test) {
                    options.test(outputRef, errors, testResults, function() {
                        removeLiveEditorOutput();
                        done();
                    });
                    return;
                }

                if (options.pass) {
                    expect(errors).to.have.length(0);
                } else {
                    expect(errors).to.not.have.length(0);
                    options.expectedErrors.forEach((expectedError, i) => {
                        expect(errors[i].text.indexOf(expectedError)).to.not.be(-1);
                    });
                }
                removeLiveEditorOutput();
                done();
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
