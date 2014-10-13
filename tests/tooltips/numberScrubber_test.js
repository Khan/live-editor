describe("numberScrubber - detection", function() {
    var mockedNumberScrubber = getMockedTooltip(tooltipClasses.numberScrubber, ["detector", "initialize"]);

    //numberScrubber
    it("! Before number", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.not.be.ok();
    });

    it("Start of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel ";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.be.ok();
    });

    it("Middle of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 12";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.be.ok();
    });

    it("End of number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 123";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.be.ok();
    });

    it("Start of negative", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel ";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.be.ok();
    });

    it("Middle of negative", function() {
        var line = "Falaffel -123 Falaffel";
        var pre = "Falaffel -1";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.be.ok();
    });

    it("! After number", function() {
        var line = "Falaffel 123 Falaffel";
        var pre = "Falaffel 123 ";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.not.be.ok();
    });

    it("! Random", function() {
        var line = "Alex Rodrigues";
        var pre = "Alex Rod";
        expect(testMockedTooltipDetection(mockedNumberScrubber, line, pre)).to.not.be.ok();
    });
});



describe("numberScrubber - selection (what it replaces)", function() {
    var mockedNumberScrubber = getMockedTooltip(tooltipClasses.numberScrubber, ["detector", "initialize", "updateText"]);

    it("Number", function() {
        var line = "123 1234 -fergus";
        var pre = "123 12";
        var updates = [595];
        var result = "123 595 -fergus";
        testReplace(mockedNumberScrubber, line, pre, updates, result);
    });

    it("Negative number", function() {
        var line = "bob(-124)";
        var pre = "bob(-124";
        var updates = [5956];
        var result = "bob(5956)";
        testReplace(mockedNumberScrubber, line, pre, updates, result);
    });

    it("Subtraction", function() {
        var line = "bob(12-124)";
        var pre = "bob(12-124";
        var updates = [33];
        var result = "bob(12-33)";
        testReplace(mockedNumberScrubber, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = "123 1234 -fergus";
        var pre = "123 12";
        var updates = [595, 3434434, 121212];
        var result = "123 121212 -fergus";
        testReplace(mockedNumberScrubber, line, pre, updates, result);
    });
});