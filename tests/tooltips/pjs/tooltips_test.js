describe("General Tooltip Tests", function(){
    it("autoSuggest - detection", function() {
        typeLine("rect(44");
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.autoSuggest);
    });

    it("removing tooltipEngine doesn't throw errors", function() {
    	TTE.remove();
    });
});