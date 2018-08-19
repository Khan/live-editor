import {
    getCurrentTooltip,
    getLine,
    removeLiveEditor,
    renderLiveEditor,
    typeLine,
} from "./shared.js";

describe("ImagePicker tooltip in a real live editor", function() {
    let leRef;

    beforeEach(function() {
        leRef = renderLiveEditor();
    });

    afterEach(function() {
        removeLiveEditor();
    });

    it("should autocomplete after user types getImage(", function() {
        typeLine(leRef, 'bob getImage(');
        expect(getLine(leRef)).to.be.equal('bob getImage("cute/None")');
    });

    it("should autocomplete after user assigns getImage(", function() {
        typeLine(leRef, 'var bob = getImage(');
        expect(getLine(leRef)).to.be.equal('var bob = getImage("cute/None");');
    });

    it("should set current tooltip to imagePicker ", function() {
        typeLine(leRef, '\ngetImage("a');
        expect(getCurrentTooltip(leRef)).to.be.equal("imagePicker");
    });
});

