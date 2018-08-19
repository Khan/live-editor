import {
    getCurrentTooltip,
    getLine,
    removeLiveEditor,
    renderLiveEditor,
    typeLine,
} from "./shared.js";

describe("ColorPicker tooltip in a real live editor", function() {
    let leRef;

    beforeEach(function() {
        leRef = renderLiveEditor();
    });

    afterEach(function() {
        removeLiveEditor();
    });

    it("should autocomplete after user types fill(", function() {
        typeLine(leRef, "fill(");
        expect(getLine(leRef)).to.be.equal("fill(255, 0, 0);");
    });

    it("should set current tooltip to colorPicker", function() {
        typeLine(leRef, "\ncolor(255, 255");
        expect(getCurrentTooltip(leRef)).to.be.equal("colorPicker");
    });
});
