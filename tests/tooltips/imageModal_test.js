describe("imageModal - detection", function() {

    let sandbox;
    let mockedImageModal;

    before(function () {
        sandbox = sinon.sandbox.create();
        mockedImageModal = getMockedTooltip(sandbox, tooltipClasses.imageModal, ["detector"])
    });

    after(function () {
        sandbox.restore();
        mockedImageModal.remove();
    });

    it("! Before open quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src=';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(false);
    });

    it("After open quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);

        var line = '<img src=\'hello world.png\' />';
        var pre = '<img src=\'';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);
    });

    it("Middle", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello ';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);
    });

    it("Before close quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello world.png';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);
    });

    it("Spaces around equal sign", function() {
        var line = '<img src = "hello world.png" />';
        var pre = '<img src = "hello ';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);
    });

    it("! After close quote", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello world.png"';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(false);
    });

    it("With intermediate attributes", function() {
        var line = '<img style="yellow" src="hello world.png" />';
        var pre = '<img style="yellow" src="hello world.';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(true);
    });

    it("! Another tag", function() {
        var line = '<a src="hello world.png" />';
        var pre = '<a src="hello';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(false);
    });

    it("! Another attribute", function() {
        var line = '<img href="hello world.png" />';
        var pre = '<img href="hello';
        expect(testMockedTooltipDetection(sandbox, mockedImageModal, line, pre)).to.be(false);
    });
});



describe("ImageModal - selection (what it replaces)", function() {
    let sandbox;
    let imageModal;

    before(function () {
        sandbox = sinon.sandbox.create();
        imageModal = getTooltip(tooltipClasses.imageModal);
    });

    after(function () {
        sandbox.restore();
        imageModal.remove();
    });

    it("Basic", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello';
        var updates = ['goodbye-world.png'];
        var result = '<img src="goodbye-world.png" />';
        testReplace(sandbox, imageModal, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = '<img src="hello world.png" />';
        var pre = '<img src="hello';
        var updates = ['goodbye-world.png', "", "kill everyone", "smiley.jpg"];
        var result = '<img src="smiley.jpg" />';
        testReplace(sandbox, imageModal, line, pre, updates, result);
    });
});