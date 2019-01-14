describe("imagePicker - detection", function() {

    let sandbox;
    let mockedImagePicker;

    before(function () {
        sandbox = sinon.sandbox.create();
        mockedImagePicker = getMockedTooltip(sandbox, tooltipClasses.imagePicker, ["detector"])
    });

    after(function () {
        sandbox.restore();
        mockedImagePicker.remove();
    });

    it("Doesn't match cursor before open paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(false);
    });

    it("Does match cursor after open paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage(';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(true);
    });

    it("Does match cursor in middle of filename", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(true);
    });

    it("Does match cursor before close paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute/Blank"';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(true);
    });

    it("Doesn't match cursor after close paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute/Blank")';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(false);
    });

    it("Doesn't match cursor in random code", function() {
        var line = 'randomGibberish';
        var pre = 'rand';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(false);
    });

    it("Doesn't match cursor in different function name", function() {
        var line = 'color("hi");';
        var pre = 'color("hi"';
        expect(testMockedTooltipDetection(sandbox, mockedImagePicker, line, pre)).to.be(false);
    });
});



describe("imagePicker - selection (what it replaces)", function() {
    let sandbox;
    let imagePicker;

    before(function () {
        sandbox = sinon.sandbox.create();
        imagePicker = getTooltip(tooltipClasses.imagePicker);
    });

    after(function () {
        sandbox.restore();
        imagePicker.remove();
    });

    it("Basic", function() {
        var line = 'getImage("blank/None");';
        var pre = 'getImage("b';
        var updates = ['avatars-blueleaf'];
        var result = 'getImage("avatars-blueleaf");';
        testReplace(sandbox, imagePicker, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = 'getImage("blank/None");';
        var pre = 'getImage("b';
        var updates = ['bob', 'teddy', 'johnathan'];
        var result = 'getImage("johnathan");';
        testReplace(sandbox, imagePicker, line, pre, updates, result);
    });

    it("Garbled initial state", function() {
        var line = 'getImage(fsdlkfds';
        var pre = 'getImage(';
        var updates = ['pearl'];
        var result = 'getImage("pearl"';
        testReplace(sandbox, imagePicker, line, pre, updates, result);
    });
});



describe("imagePicker - Integration tests (running on a real editor)", function() {
    it("Autocomplete", function() {
        typeLine('bob getImage(');
        expect(getLine()).to.be.equal('bob getImage("cute/None")');
    });

    it("Autocomplete", function() {
        typeLine('var bob = getImage(');
        expect(getLine()).to.be.equal('var bob = getImage("cute/None");');
    });

    it("detection", function() {
        editor.onTextInput('\ngetImage("a');
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.imagePicker);
    });
});