describe("colorPicker - detection", function() {
    var mockedColorPicker = getMockedTooltip(tooltipClasses.colorPicker, ["detector", "initialize"]);

    it("! Before open Paren", function() {
        var line = "fill(255, 244, 0, 21);";
        var pre = "fill";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(false);
    });

    it("After open Paren", function() {
        var line = "fill(255, 244, 0, 21);";
        var pre = "fill(";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(true);
    });

    it("Middle", function() {
        var line = "fill(255, 244, 0, 21);";
        var pre = "fill(255, ";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(true);
    });

    it("Before close paren", function() {
        var line = "fill(255, 244, 0, 21);";
        var pre = "fill(255, 244, 0, 21";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(true);
    });

    it("! After close paren", function() {
        var line = "fill(255, 244, 0, 21);";
        var pre = "fill(255, 244, 0, 21)";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(false);
    });

    it("All function names", function() {
        _.each(["fill", "background", "stroke", "color"], function(fn) {
            var line = fn + "();";
            var pre = fn + "(";
            expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(true);
        });
    });

    it("! Different function name", function() {
        var line = "rect(255, 244, 0, 21);";
        var pre = "rect(255, ";
        expect(testMockedTooltipDetection(mockedColorPicker, line, pre)).to.be(false);
    });
});



describe("colorPicker - selection (what it replaces)", function() {
    var mockedColorPicker = getMockedTooltip(tooltipClasses.colorPicker, ["detector", "updateText", "initialize"]);

    it("Basic", function() {
        var line = "fill(255, 0, 0);";
        var pre = "fill(25";
        var updates = [{
            r: 40,
            g: 50,
            b: 60
        }];
        var result = "fill(40, 50, 60);";
        testReplace(mockedColorPicker, line, pre, updates, result);
    });

    it("Many replaces", function() {
        var line = "fill(255, 0, 0);";
        var pre = "fill(25";
        var updates = [{
            r: 40,
            g: 50,
            b: 60
        }, {
            r: 0,
            g: 0,
            b: 0
        }, {
            r: 255,
            g: 254,
            b: 253
        }];
        var result = "fill(255, 254, 253);";
        testReplace(mockedColorPicker, line, pre, updates, result);
    });

    it("Alpha", function() {
        var line = "fill(255, 0, 0, 100);";
        var pre = "fill(25";
        var updates = [{
            r: 40,
            g: 50,
            b: 60
        }];
        var result = "fill(40, 50, 60, 100);";
        testReplace(mockedColorPicker, line, pre, updates, result);
    });

    it("Not preserving garbage", function() {
        var line = "fill(255, 0, 0, 100, blue);";
        var pre = "fill(25";
        var updates = [{
            r: 40,
            g: 50,
            b: 60
        }];
        var result = "fill(40, 50, 60);";
        testReplace(mockedColorPicker, line, pre, updates, result);
    });
});

describe("colorPicker - Integration tests (running on a real editor)", function() {
    it("Autocomplete", function() {
        typeLine("fill(");
        expect(getLine()).to.be.equal("fill(255, 0, 0);");
    });

    it("detection", function() {
        editor.onTextInput("\ncolor(255, 255");
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.colorPicker);
    });
});
