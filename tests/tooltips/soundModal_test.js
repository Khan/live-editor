describe("soundModal - detection", function() {
    let sandbox;
    let mockedSoundModal;

    before(function () {
        sandbox = sinon.sandbox.create();
        mockedSoundModal = getMockedTooltip(sandbox, tooltipClasses.soundModal, ["detector"])
    });

    after(function () {
        sandbox.restore();
        mockedSoundModal.remove();
    });

    // These tests are basically the same as the tests in imagePicker_test.js
    it("Doesn't match cursor before open paren", function() {
        var line = 'getSound("rpg/giant-no");';
        var pre = 'getSound';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(false);
    });

    it("Does match cursor after open paren", function() {
        var line = 'getSound("rpg/giant-no");';
        var pre = 'getSound(';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(true);
    });

    it("Does match cursor in middle of filename", function() {
        var line = 'getSound("rpg/giant-no");';
        var pre = 'getSound("rpg';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(true);
    });

    it("Does match cursor before close paren", function() {
        var line = 'getSound("rpg/giant-no");';
        var pre = 'getSound("rpg/giant-no"';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(true);
    });

    it("Doesn't match cursor after close paren", function() {
        var line = 'getSound("rpg/giant-no");';
        var pre = 'getSound("rpg/giant-no")';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(false);
    });

    it("Doesn't match cursor in random code", function() {
        var line = 'randomGibberish';
        var pre = 'rand';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(false);
    });

    it("Doesn't match cursor in different function name", function() {
        var line = 'color("hi");';
        var pre = 'color("hi"';
        expect(testMockedTooltipDetection(sandbox, mockedSoundModal, line, pre)).to.be(false);
    });
});


describe("imagePicker - Integration tests (running on a real editor)", function() {
    it("Autocomplete", function() {
        typeLine('var s = getSound(');
        expect(getLine()).to.be.equal('var s = getSound("rpg/metal-clink");');
    });

    it("detection", function() {
        editor.onTextInput('\ngetSound("a');
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.soundModal);
    });
});