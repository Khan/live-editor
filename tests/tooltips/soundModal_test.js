import {
    getCurrentTooltip,
    getLine,
    removeLiveEditor,
    renderLiveEditor,
    typeLine,
} from "./shared.js";

describe("SoundModal tooltip in a real live editor", function() {
    let leRef;

    beforeEach(function() {
        leRef = renderLiveEditor();
    });

    afterEach(function() {
        removeLiveEditor();
    });

    it("should autocomplete after user types getSound(", function() {
        typeLine(leRef, 'var s = getSound(');
        expect(getLine(leRef)).to.be.equal('var s = getSound("rpg/metal-clink");');
    });

    it("should set current tooltip to soundModal ", function() {
        typeLine(leRef, '\ngetSound("a');
        expect(getCurrentTooltip(leRef)).to.be.equal("soundModal");
    });
});