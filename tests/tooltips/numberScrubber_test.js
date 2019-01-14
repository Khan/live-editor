describe("numberScrubber - detection", function() {

    let sandbox;
    let mockedNumberScrubber;

    before(function () {
        sandbox = sinon.sandbox.create();
        mockedNumberScrubber = getMockedTooltip(sandbox, tooltipClasses.numberScrubber, ["detector", "initialize"])
    });

    after(function () {
        sandbox.restore();
        mockedNumberScrubber.remove();
    });

    //numberScrubber
    it("! Before number", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(false);
    });

    it("Start of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel ";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(true);
    });

    it("Middle of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 12";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(true);
    });

    it("End of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 123";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(true);
    });

    it("Start of negative", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel ";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(true);
    });

    it("Middle of negative", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel -1";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(true);
    });

    it("! After number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 123 ";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(false);
    });

    it("! Random", function() {
        var line = "Alex Rodrigues";
        var pre = "Alex Rod";
        expect(testMockedTooltipDetection(sandbox, mockedNumberScrubber, line, pre)).to.be(false);
    });
});



describe("numberScrubber - selection (what it replaces)", function() {

    let sandbox;
    let numberScrubber;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        numberScrubber = getTooltip(tooltipClasses.numberScrubber);
    });

    afterEach(function () {
        sandbox.restore();
        numberScrubber.remove();
    });

    it("Number", function() {
        var line = "123 1234 -fergus";
        var pre = "123 12";
        var updates = [595];
        var result = "123 595 -fergus";
        testReplace(sandbox, numberScrubber, line, pre, updates, result);
    });

    it("Negative number", function() {
        var line = "bob(-124)";
        var pre = "bob(-124";
        var updates = [5956];
        var result = "bob(5956)";
        testReplace(sandbox, numberScrubber, line, pre, updates, result);
    });

    it("Subtraction", function() {
        var line = "bob(12-124)";
        var pre = "bob(12-124";
        var updates = [33];
        var result = "bob(12-33)";
        testReplace(sandbox, numberScrubber, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = "123 1234 -fergus";
        var pre = "123 12";
        var updates = [595, 3434434, 121212];
        var result = "123 121212 -fergus";
        testReplace(sandbox, numberScrubber, line, pre, updates, result);
    });
});