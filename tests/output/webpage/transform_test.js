/*
 * In these tests I strip all spacing to avoid brittleness
 * It shouldn't affect the outcoume of the tests
 */

describe("Test LoopProtect", function(){
	it("Augment for loop", function(){
		var loopProtector = new LoopProtector(function(){});
		var processed = loopProtector.protect("for(;;){}").replace(/\s+/g, "");
		expect(processed).to.be.equal("for(;;){KAInfiniteLoopProtect();}");
	});
	it("Augment while loop", function(){
		var loopProtector = new LoopProtector(function(){});
		var processed = loopProtector.protect("while(true){}").replace(/\s+/g, "");
		expect(processed).to.be.equal("while(true){KAInfiniteLoopProtect();}");
	});
	it("Augment do-while loop", function(){
		var loopProtector = new LoopProtector(function(){});
		var processed = loopProtector.protect("do{}while(true);").replace(/\s+/g, "");
		expect(processed).to.be.equal("do{KAInfiniteLoopProtect();}while(true);");
	});
	it("Augment function declaration", function(){
		var loopProtector = new LoopProtector(function(){});
		var processed = loopProtector.protect("function a(){}").replace(/\s+/g, "");
		expect(processed).to.be.equal("functiona(){KAInfiniteLoopProtect();}");
	});
	it("Augment function expressions", function(){
		var loopProtector = new LoopProtector(function(){});
		var processed = loopProtector.protect("(function(){}());").replace(/\s+/g, "");
		expect(processed).to.be.equal("(function(){KAInfiniteLoopProtect();}());");
	});
	it("Break out and invoke callback", function(){
		var called = false;
		var loopProtector = new LoopProtector(function(){ called = true });
		var processed = loopProtector.protect("while(true){}");
		//debugger;
		var exec = new Function("KAInfiniteLoopProtect", processed);
		try {
			exec(loopProtector.KAInfiniteLoopProtect);
		} catch (e) {
			expect(e).to.be.equal("KA_INFINITE_LOOP");
		}
		expect(called).to.be.equal(true);
	});
});