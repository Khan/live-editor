import {
    clickEditor,
    getCurrentTooltip,
    removeLiveEditor,
    renderLiveEditor,
    typeLine,
} from "./shared.js";

describe("The ACE editor tooltip engine", function(){
    let leRef;

    beforeEach(function() {
        leRef = renderLiveEditor();
    });

    afterEach(function() {
        removeLiveEditor();
    });

    it("should set current tooltip to autoSuggest when needed", function() {
        typeLine(leRef, "rect(44");
        expect(getCurrentTooltip(leRef)).to.be.equal("autoSuggest");
    });

    it("should set current tooltip to numberScrubber for clicks", function() {
        typeLine(leRef, "rect(12, 3");
        expect(getCurrentTooltip(leRef)).to.be.equal("autoSuggest");

        clickEditor(leRef, 1, 10);
        expect(getCurrentTooltip(leRef)).to.be.equal("numberScrubber");
    });
});
