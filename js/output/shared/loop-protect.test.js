/* eslint-disable */
/*
 * In these tests I strip all spacing to avoid brittleness
 * It shouldn't affect the outcome of the tests
 */
import LoopProtector from "./loop-protect.js";

describe("LoopProtector", function() {
    it("can augment for loop", function() {
        const loopProtector = new LoopProtector(function() {});
        const processed = loopProtector
            .protect("for(;;){}")
            .replace(/\s+/g, "");
        expect(processed).to.be.equal("for(;;){KAInfiniteLoopProtect();}");
    });
    it("can augment while loop", function() {
        const loopProtector = new LoopProtector(function() {});
        const processed = loopProtector
            .protect("while(true){}")
            .replace(/\s+/g, "");
        expect(processed).to.be.equal("while(true){KAInfiniteLoopProtect();}");
    });
    it("can augment do-while loop", function() {
        const loopProtector = new LoopProtector(function() {});
        const processed = loopProtector
            .protect("do{}while(true);")
            .replace(/\s+/g, "");
        expect(processed).to.be.equal(
            "do{KAInfiniteLoopProtect();}while(true);",
        );
    });
    it("can augment function declaration", function() {
        const loopProtector = new LoopProtector(function() {});
        const processed = loopProtector
            .protect("function a(){}")
            .replace(/\s+/g, "");
        expect(processed).to.be.equal("functiona(){KAInfiniteLoopProtect();}");
    });
    it("can augment function expressions", function() {
        const loopProtector = new LoopProtector(function() {});
        const processed = loopProtector
            .protect("(function(){}());")
            .replace(/\s+/g, "");
        expect(processed).to.be.equal(
            "(function(){KAInfiniteLoopProtect();}());",
        );
    });
    it("can break out and invoke callback", function() {
        let called = false;
        const loopProtector = new LoopProtector(function() {
            called = true;
        });
        const processed = loopProtector.protect("while(true){}");
        //debugger;
        const exec = new Function("KAInfiniteLoopProtect", processed);
        try {
            exec(loopProtector.KAInfiniteLoopProtect);
        } catch (e) {
            expect(e.message).to.be.equal("KA_INFINITE_LOOP");
        }
        expect(called).to.be.equal(true);
    });
});
