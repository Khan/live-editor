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
describe("async error order tests", function () {

    var output;
        
    beforeEach(function () {
        output = createLiveEditorOutput();

        // have cleanErrors pass through errors so that they're easy to verify
        sinon.stub(output, "cleanErrors", function (errors) {
            return errors;
        });
    });
    
    it("should work without any errors", function (done) {
        
        var lintStub = sinon.stub(output.output, "lint");
        var runCodeStub = sinon.stub(output.output, "runCode", function(userCode, callback) {
            callback([]); // no runtime errors
        });
        
        var deferred = $.Deferred();
        lintStub.returns(deferred);
        deferred.resolve([]);  // lint errors
        
        output.runCode("var a = 5;", function(errors, testResults) {
            expect(errors.length).to.be(0);
            expect(lintStub.called).to.be(true);
            expect(runCodeStub.called).to.be(true);
            
            done();
        });
    });

    it("should work with runtime errors only", function (done) {

        var lintStub = sinon.stub(output.output, "lint");
        var runCodeStub = sinon.stub(output.output, "runCode", function(userCode, callback) {
            callback(["runtime error"]);    // runtime errors
        });

        var deferred = $.Deferred();
        lintStub.returns(deferred);
        deferred.resolve([]);  // lint errors

        output.runCode("var a = 5;", function(errors, testResults) {
            expect(errors).to.contain("runtime error");
            expect(errors).to.not.contain("lint error");
            expect(lintStub.called).to.be(true);
            expect(runCodeStub.called).to.be(true);

            done();
        });
    });

    it("should work with lint errors", function (done) {

        var lintStub = sinon.stub(output.output, "lint");
        var runCodeStub = sinon.stub(output.output, "runCode", function(userCode, callback) {
            callback([]);    // runtime errors
        });

        var deferred = $.Deferred();
        lintStub.returns(deferred);
        deferred.resolve(["lint error"]);  // lint errors

        output.runCode("var a = 5;", function(errors, testResults) {
            expect(errors).to.contain("lint error");
            expect(errors).to.not.contain("runtime error");
            expect(lintStub.called).to.be(true);
            expect(runCodeStub.called).to.be(false);

            done();
        });
    });

    it("should work with lint and runtime errors", function (done) {

        var lintStub = sinon.stub(output.output, "lint");
        var runCodeStub = sinon.stub(output.output, "runCode", function(userCode, callback) {
            callback(["runtime error"]);    // runtime errors
        });

        var deferred = $.Deferred();
        lintStub.returns(deferred);
        deferred.resolve([]);  // no lint errors

        output.runCode("var a = 5;", function(errors, testResults) {
            expect(errors).to.contain("runtime error");
            expect(errors).to.not.contain("lint error");
            expect(lintStub.called).to.be(true);
            expect(runCodeStub.called).to.be(true);

            // there doesn't seem to be an easy way to redefine what function
            // is as a replacement for the original "runCode" so we have to 
            // first restore the original function before we can re-stub it
            output.output.runCode.restore();
            runCodeStub = sinon.stub(output.output, "runCode", function(userCode, callback) {
                callback([]);    // runtime errors
            });

            var deferred = $.Deferred();
            lintStub.returns(deferred);
            deferred.resolve(["lint error"]);  // lint errors
            
            output.runCode("var b = 10;", function(errors, testResults) {
                // the runtime error is from 'var a = 5;' which is stale
                // so it should not appear.
                expect(errors).to.not.contain("runtime error");
                // the lint error is from 'var b = 10;' which is the most
                // recent code so it should appear.
                expect(errors).to.contain("lint error");
                expect(lintStub.called).to.be(true);
                expect(runCodeStub.called).to.be(false);
                
                done();
            });
        });
    });
});

describe("Code Injection", function() {
    
    // This tests reproduces the "string not a function" error from
    // https://github.com/Khan/live-editor/issues/279.
    it("should not throw 'string is not a function'", function (done) {
        var output = createLiveEditorOutput();

        var code = getCodeFromOptions(function() {
            var stars = [];
            var Star = function(x, y) { this.x = x; this.y = y; };
            Star.prototype.draw = function() { ellipse(this.x, this.y, 10, 10); };
            for (var i = 0; i < 20; i++) {
                // The Star constructor must be called with random value to
                // reproduce the error.
                stars.push(new Star(random(0, width), random(0, height)));
            }
            draw = function() {
                background(0, 0, 0);
                for (var i = 0; i < stars.length; i++) { stars[i].draw(); }
            };
    
        });
        
        var error;
        var listener = window.addEventListener('error', function(e) {
            error = e;
            window.removeEventListener('error', listener);
        }); 
    
        output.runCode(code, function(errors, testResults) {
            expect(errors.length).to.be(0);
            
            // The same code can be re-used, we just need to run the code twice
            // to produce the error.
            output.runCode(code, function(errors, testResults) {
                expect(errors.length).to.be(0);
                setTimeout(function () {
                    // If we call done asynchronously when we get an error then
                    // mocha will report two results for this test: one that's
                    // failed and another that's succeed.  This is probably a
                    // mocha bug.  TODO(kevinb) try upgrading mocha
                    if (!error) {
                        done();
                    }
                }, 1000);
            });
        });
    });
});

describe("LoopProtector", function() {
    it("should throw KA_INFINITE_LOOP", function (done) {
        var output = createLiveEditorOutput();

        var code = getCodeFromOptions(function() {
            var mouseClicked = function() {
                var i = 0;
                while (true) {
                    i++;
                }
            };
        });

        var asyncError;
        var listener = window.addEventListener('error', function(e) {
            asyncError = e.error;
            window.removeEventListener('error', listener);
        });

        // TODO(kevinb) update async tests to listen for postMessage events
        // This is so that we can use the same mechanism that LiveEditor uses
        // to get asynchronous errors
        output.runCode(code, function(errors, testResults) {
            expect(errors.length).to.be(0);
            simulateClick(output);
            
            setTimeout(function () {
                expect(asyncError.message).to.equal("KA_INFINITE_LOOP");
                expect(asyncError.location.type).to.equal("WhileStatement");
                expect(asyncError.location.loc.start.line).to.equal(4);
                done();
            }, 100);
        });
    });
    
    it("should handle deleting all code and undoing it", function(done) {
        var output = createLiveEditorOutput();

        var code = getCodeFromOptions(function() {
            fill(255, 0, 255);

            var draw = function() {
                background(255, 255, 255);
                ellipse(36, 45, 12, 12);
            };
        });

        output.runCode(code, function(errors, testResults) {
            expect(errors.length).to.be(0);
            // simulate deleting all the code...
            output.runCode("", function(errors, testResults) {
                setTimeout(function() {
                    expect(errors.length).to.be(0);
                    // ...and then undoing it
                    setTimeout(function() {
                        output.runCode(code, function(errors, testResults) {
                            expect(errors.length).to.be(0);
                            done();
                        });
                    }, 500);
                }, 200);
            });
        });
    });
});
