/* eslint-disable */
import {createLiveEditorOutput, getCodeFromOptions, removeLiveEditorOutput} from "./test_utils.js";
import LoopProtector from "../../../js/output/shared/loop-protect.js";

/**
 * This file contains tests that are difficult to write using the normal test
 * helpers from test_utils.js.  The tests require custom asynchronous code in
 * order to reproduce failures.
 */

// Test which errors output.runCode passes to the callback when different
// combinations of lint and/or runtime errors occur.  In particular we want to
// ensure that the errors we getting in the callback don't include stale errors
// so that we can avoid the issue raised in
// https://github.com/Khan/live-editor/issues/285
describe("async error order tests", function() {
    it("should work without any errors", function(done) {
        let lintDone = false;
        let buildDone = false;
        const outputRef = createLiveEditorOutput({
            onLintDone: () => {
                lintDone = true;
            },
            onRunDone: () => {
                buildDone = true;
            },
            onAllDone: (runResults) => {
                expect(runResults.errors.length).to.be(0);
                expect(lintDone).to.be(true);
                expect(buildDone).to.be(true);
                done();
            },
        });
        outputRef.current.runCode("var a = 5;");
    });

    it("should work with runtime errors only", function(done) {
        let lintDone = false;
        let buildDone = false;
        const outputRef = createLiveEditorOutput({
            onLintDone: (lintErrors, lintWarnings) => {
                lintDone = true;
                expect(lintErrors.length).to.be(0);
            },
            onRunDone: (runResults) => {
                buildDone = true;
                expect(runResults.errors.length).to.be(1);
                expect(runResults.errors[0].source).to.be("native");
            },
            onAllDone: (runResults) => {
                expect(lintDone).to.be(true);
                expect(buildDone).to.be(true);
                done();
            },
        });
        outputRef.current.runCode(
            "var a = function(go, bFunc) {bFunc(true, a);};a();",
        );
    });

    it("should work with lint errors", function(done) {
        let lintDone = false;
        let buildDone = false;
        const outputRef = createLiveEditorOutput({
            onLintDone: (lintErrors, lintWarnings) => {
                lintDone = true;
                console.log("linted");
                expect(lintErrors.length).to.be(1);
            },
            onRunDone: (runResults) => {
                buildDone = true;
                console.log("ran!");
                expect(runResults.errors.length).to.be(1);
                expect(runResults.errors[0].source).to.be("jshint");
            },
            onAllDone: () => {
                console.log("all done!");
                expect(lintDone).to.be(true);
                expect(buildDone).to.be(true);
                done();
            },
        });
        outputRef.current.runCode("var x = 5");
    });

    it("should work with runtime followed by lint errors", function(done) {
        let lintCalls = 0;
        let buildCalls = 0;
        let runNum = 0;
        const outputRef = createLiveEditorOutput({
            onLintDone: (lintErrors, lintWarnings) => {
                lintCalls++;
                if (runNum === 0) {
                    expect(lintErrors.length).to.be(0);
                } else {
                    expect(lintErrors.length).to.be(1);
                }
            },
            onRunDone: (runResults) => {
                buildCalls++;
                if (runNum === 0) {
                    expect(runResults.errors.length).to.be(1);
                    expect(runResults.errors[0].source).to.be("native");
                } else {
                    expect(runResults.errors.length).to.be(1);
                    expect(runResults.errors[0].source).to.be("jshint");
                }
            },
            onAllDone: () => {
                runNum++;
                if (runNum === 1) {
                    outputRef.current.runCode("var x = 5");
                } else {
                    expect(lintCalls).to.be(2);
                    expect(buildCalls).to.be(2);
                    done();
                }
            },
        });
        outputRef.current.runCode(
            "var a = function(go, bFunc) {bFunc(true, a);};a();");
    });
});


describe("LoopProtector", function() {

    it("should stop Infinite Loops in event handlers", function (done) {
        const code = getCodeFromOptions(function() {
            var mouseClicked = function() {
                var i = 0;
                while (true) {
                    i++;
                }
            };
        });

        const code2 = getCodeFromOptions(function() {
            mouseClicked();
        });

        let runNum = 0;
        const outputRef = createLiveEditorOutput({
            onAllDone: (runResults) => {
                if (runNum === 0) {
                    expect(runResults.errors.length).to.be(0);
                    outputRef.current.runCode(code2);
                }
                runNum++;
            }
        });

        const injector = outputRef.current.outputTypeRef.current.injector;
        injector.loopProtector = new LoopProtector(function (error) {
            expect(error.infiniteLoopNodeType).to.equal("WhileStatement");
            expect(error.row).to.equal(3);
            done();
        }, {initialTimeout: 200, frameTimeout: 50}, true);

        outputRef.current.runCode(code);
    });

    it("should handle deleting all code and undoing it", function(done) {

        const code = getCodeFromOptions(function() {
            fill(255, 0, 255);

            var draw = function() {
                background(255, 255, 255);
                ellipse(36, 45, 12, 12);
            };
        });

        let runNum = 0;
        const outputRef = createLiveEditorOutput({
            onAllDone: (runResults) => {
                // We expect no errors on any runs
                expect(runResults.errors.length).to.be(0);
                if (runNum === 0) {
                    // We simulate deleting after first run
                    outputRef.current.runCode("");
                } else if (runNum === 1) {
                    // We simulate undoing deleting after second run
                    outputRef.current.runCode(code);
                } else if (runNum === 2) {
                    // And now we're all done!
                    done();
                }
                runNum++;
            }
        });

        outputRef.current.runCode(code);
    });

    it("should stop Infinite Loops", function (done) {

        const code = getCodeFromOptions(function () {
            var x = 0;
            while (x < 400) {
                ellipse(100, 100, 100, x);
            }
        });

        const outputRef = createLiveEditorOutput({
            onAllDone(runResults) {
                console.log(runResults);
                expect(runResults.errors[0].infiniteLoopNodeType).to.equal("WhileStatement");
                expect(runResults.errors[0].row).to.equal(2);
                done();
            }
        });

        const injector = outputRef.current.outputTypeRef.current.injector;
        injector.loopProtector = new LoopProtector(function (error) {
            // caught by the onAllDone callback
        }, {initialTimeout: 200, frameTimeout: 50}, true);

        outputRef.current.runCode(code);
    });

    it("should stop Infinites Loop with width/height", function (done) {

        const code = getCodeFromOptions(function () {
            var x = 0;
            while (x < width/20) {
                ellipse(100, 100, 100, x);
            }
        });

        const outputRef = createLiveEditorOutput({
            onAllDone(runResults) {
                expect(runResults.errors[0].infiniteLoopNodeType).to.equal("WhileStatement");
                expect(runResults.errors[0].row).to.equal(2);
                done();
            }
        });

        const injector = outputRef.current.outputTypeRef.current.injector;
        injector.loopProtector = new LoopProtector(function (error) {
            // caught by the onAllDone callback
        }, {initialTimeout: 200, frameTimeout: 50}, true);

        outputRef.current.runCode(code);
    });

    it("should stop Infinite Loop Inside Draw Function", function (done) {

        const code = getCodeFromOptions(function () {
            var draw = function() {
                var y = 40;
                while (y < 300) {
                    var message = "hello" + y;
                    text(message, 30, y);
                }
            };
        });

        const outputRef = createLiveEditorOutput({
            onAllDone(runResults) {
                expect(runResults.errors[0].infiniteLoopNodeType).to.equal("WhileStatement");
                expect(runResults.errors[0].row).to.equal(3);
                done();
            }
        });

        const injector = outputRef.current.outputTypeRef.current.injector;
        injector.loopProtector = new LoopProtector(function (error) {
            // caught by the onAllDone callback
        }, {initialTimeout: 200, frameTimeout: 50}, true);

        outputRef.current.runCode(code);
    });
});

describe("draw update tests", function() {
    let outputRef, ellipseSpy, backgroundSpy, noiseSpy;

    const createOutput = function(onAllDone) {
        outputRef = createLiveEditorOutput({onAllDone});
        const processing = outputRef.current.outputTypeRef.current.processing;
        sinon.spy(processing, "ellipse");
        ellipseSpy = processing.ellipse;
        sinon.spy(processing, "background");
        backgroundSpy = processing.background;
        sinon.spy(processing, "noise");
        noiseSpy = processing.noise;
        return outputRef;
    };

    afterEach(function() {
        const processing = outputRef.current.outputTypeRef.current.processing;
        processing.ellipse.restore();
        processing.background.restore();
        processing.noise.restore();
        outputRef = null;
        removeLiveEditorOutput();
    });

    it("should draw using updated global variables", function(done) {
        var code1 = getCodeFromOptions(function () {
            var diameter = 10;
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        var code2 = getCodeFromOptions(function () {
            var diameter = 20;
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        let runNum = 0;
        const outputRef = createOutput(() => {
            if (runNum === 0) {
                expect(ellipseSpy.calledWith(200, 200, 10, 10)).to.be(true);
                outputRef.current.runCode(code2);
            } else if (runNum === 1) {
                // Wait for it to tick forward a frame
                setTimeout(() => {
                    expect(ellipseSpy.calledWith(200, 200, 20, 20)).to.be(true);
                    done();
                }, 50);
            }
            runNum++;
        });
        outputRef.current.runCode(code1);
    });

    it("should change the background when draw changes", function(done) {
        var code1 = getCodeFromOptions(function () {
            var draw = function() {
                background(255,0,0);
            };
        });

        var code2 = getCodeFromOptions(function () {
            var draw = function() {
                background(0,0,255);
            };
        });

        let runNum = 0;
        const outputRef = createOutput(() => {
            if (runNum === 0) {
                expect(backgroundSpy.calledWith(255,0,0)).to.be(true);
                outputRef.current.runCode(code2);
            } else if (runNum === 1) {
                expect(backgroundSpy.calledWith(0,0,255)).to.be(true);
                done();
            }
            runNum++;
        });
        outputRef.current.runCode(code1);
    });

    it("should re-run global calls when only global calls have been changed", function(done) {
        var code1 = getCodeFromOptions(function () {
            var diameter = 10;
            background(255,0,0);
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        var code2 = getCodeFromOptions(function () {
            var diameter = 10;
            background(0,0,255);
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        let runNum = 0;
        const outputRef = createOutput(() => {
            if (runNum === 0) {
                expect(backgroundSpy.calledWith(255,0,0)).to.be(true);
                outputRef.current.runCode(code2);
            } else if (runNum === 1) {
                expect(backgroundSpy.calledWith(0,0,255)).to.be(true);
                done();
            }
            runNum++;
        });
        outputRef.current.runCode(code1);
    });


    it("should re-run unsafe calls in the outermost scope", function(done) {
        var code1 = getCodeFromOptions(function () {
            var diameter = noise(50);
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        var code2 = getCodeFromOptions(function () {
            var diameter = noise(100);
            var draw = function() {
                ellipse(200, 200, diameter, diameter);
            };
        });

        let runNum = 0;
        const outputRef = createOutput(() => {
            if (runNum === 0) {
                expect(noiseSpy.calledWith(50)).to.be(true);
                expect(noiseSpy.callCount).to.be(1);
                outputRef.current.runCode(code2);
            } else if (runNum === 1) {
                expect(noiseSpy.calledWith(100)).to.be(true);
                expect(noiseSpy.callCount).to.be(2);
                done();
            }
            runNum++;
        });
        outputRef.current.runCode(code1);
    });

    it("should handle adding new methods", function(done) {
        var code1 = getCodeFromOptions(function () {
            var Dot = function(x, y) {
                this.x = x;
                this.y = y;
            };
            var dot = new Dot(200,200);
            var draw = function() {
            };
        });

        var code2 = getCodeFromOptions(function () {
            var Dot = function(x, y) {
                this.x = x;
                this.y = y;
            };
            Dot.prototype.draw = function() {
                ellipse(this.x, this.y, 100, 100);
            };
            var dot = new Dot(200,200);
            var draw = function() {
                dot.draw();
            };
        });

        let runNum = 0;
        const outputRef = createOutput(() => {
            if (runNum === 0) {
                outputRef.current.runCode(code2);
            } else if (runNum === 1) {
                expect(ellipseSpy.called).to.be(true);
                done();
            }
            runNum++;
        });
        outputRef.current.runCode(code1);
    });
});
