describe("imageModal - detection", function() {
    var mockedImageModal = getMockedTooltip(tooltipClasses.imageModal, ["detector"]);

    it("! Before open quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src=';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.not.be.ok();
    });

    it("After open quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.be.ok();

        var line = '<img src=\'hello world.png\' />';
        var pre = '<img src=\'';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.be.ok();
    });

    it("Middle", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello ';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.be.ok();
    });

    it("Before close quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello world.png';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.be.ok();
    });

    it("! After close quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello world.png"';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.not.be.ok();
    });

    it("With intermediate attributes", function() {
        var line = '<img style="yellow" src="hello world.png" />';
        var pre = '<img style="yellow" src="hello world.';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.be.ok();
    });

    it("! Another tag", function() {
        var line = '<a src="hello world.png" />';
        var pre = '<a src="hello';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.not.be.ok();
    });

    it("! Another attribute", function() {
        var line = '<img href="hello world.png" />';
        var pre = '<img href="hello';
        expect(testMockedTooltipDetection(mockedImageModal, line, pre)).to.not.be.ok();
    });
});



describe("ImageModal - selection (what it replaces)", function() {
    var mockedImageModal = getMockedTooltip(tooltipClasses.imageModal, ["detector", "updateText", "initialize"]);

    it("Basic", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello';
        var updates = ['goodbye-world.png'];
        var result = '<img src="goodbye-world.png" />';
        testReplace(mockedImageModal, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello';
        var updates = ['goodbye-world.png', "", "kill everyone", "smiley.jpg"];
        var result = '<img src="smiley.jpg" />';
        testReplace(mockedImageModal, line, pre, updates, result);
    });
});