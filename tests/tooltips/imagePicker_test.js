describe("imagePicker - detection", function() {
    var mockedImagePicker = getMockedTooltip(tooltipClasses.imagePicker, ["detector"]);

    it("! Before open paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(false);
    });

    it("After open paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage(';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(true);
    });

    it("Middle", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(true);
    });

    it("Before close paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute/Blank"';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(true);
    });

    it("! After close paren", function() {
        var line = 'getImage("cute/Blank");';
        var pre = 'getImage("cute/Blank")';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(false);
    });

    it("! Random", function() {
        var line = 'randomGibberish';
        var pre = 'rand';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(false);
    });

    it("! Different function name", function() {
        var line = 'color("hi");';
        var pre = 'color("hi"';
        expect(testMockedTooltipDetection(mockedImagePicker, line, pre)).to.be(false);
    });
});



describe("imagePicker - selection (what it replaces)", function() {
    var mockedImagePicker = getMockedTooltip(tooltipClasses.imagePicker, ["detector", "updateText", "initialize"]);

    it("Basic", function() {
        var line = 'getImage("blank/None");';
        var pre = 'getImage("b';
        var updates = ['avatars-blueleaf'];
        var result = 'getImage("avatars-blueleaf");';
        testReplace(mockedImagePicker, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = 'getImage("blank/None");';
        var pre = 'getImage("b';
        var updates = ['bob', 'teddy', 'johnathan'];
        var result = 'getImage("johnathan");';
        testReplace(mockedImagePicker, line, pre, updates, result);
    });

    it("Garbled initial state", function() {
        var line = 'getImage(fsdlkfds';
        var pre = 'getImage(';
        var updates = ['pearl'];
        var result = 'getImage("pearl"';
        testReplace(mockedImagePicker, line, pre, updates, result);
    });
});



describe("imagePicker - Integration tests (running on a real editor)", function() {
    it("Autocomplete", function() {
        typeLine('bob getImage(');
        expect(getLine()).to.be.equal('bob getImage("cute/None");');
    });

    it("detection", function() {
        editor.onTextInput('\ngetImage("a');
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.imagePicker);
    });
});