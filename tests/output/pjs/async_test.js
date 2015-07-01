/**
 * The purpose of this file is to test which errors output.runCode passes to
 * the callback when different combinations of lint and/or runtime errors 
 * occur.  In particular we want to ensure that the errors we getting in the 
 * callback don't include stale errors so that we can avoid the issue raised in
 * https://github.com/Khan/live-editor/issues/285.
 */
describe("async error order tests", function () {

    var output;
        
    beforeEach(function () {
        output = new LiveEditorOutput({
            outputType: "pjs",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            soundsDir: "../../../sounds/",
            jshintFile: "../../../build/external/jshint/jshint.js",
            useDebugger: false
        });

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
