describe("General Tooltip Tests", function(){
    it("autoSuggest - detection", function() {
        typeLine("rect(44");
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.autoSuggest);
    });

    it("autoSuggest vs numberScrubber (click)", function() {
        var line = "rect(12, 34, 56, 78);";
        var pre = "rect(12";
            
        var e = getTooltipRequestEvent(line, pre);
        TTE.editor._emit("requestTooltip", e)
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.autoSuggest);

        e = getTooltipRequestEvent(line, pre); // Reset propagationStopped
        e.source = {action: "click"};
        TTE.editor._emit("requestTooltip", e)
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.numberScrubber);
    })

    it("Remove succeeds", function() {
        TTE.remove();
        expect($('.tooltip').length).to.be.equal(0);
    });
});