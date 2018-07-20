const {
    TTE,
    uniqueEditor,
    typeLine,
    getTooltipRequestEvent
} = require("./shared.js");

describe("tooltips_test - test ACE anti-undo hack", function() {
    var editor, tte, session;

    beforeEach(function () {
        var ue = uniqueEditor();
        editor = ue.editor;
        tte = ue.tooltipEngine;
        session = editor.getSession();
    });

    afterEach(function (done) {
        setTimeout(function() {
            try {
                tte.remove();
            } catch(e) {
                console.warn(e);
            }
            done();
        }, 0)
    });

    it("ACE anti-undo hack still works", function(done) {
        editor.setValue("");
        editor.onTextInput("a(12");
        expect(tte.currentTooltip).to.be.equal(tte.tooltips.numberScrubber);
        setTimeout(function () {
            tte.currentTooltip.updateText("14");
            expect(session.getValue()).to.be.equal("a(14");
            setTimeout(function () {
                tte.currentTooltip.updateText("24");
                expect(session.getValue()).to.be.equal("a(24");
                setTimeout(function() {
                    editor.undo();
                    expect(session.getValue()).to.be.equal("a(14");
                    setTimeout(function() {
                        editor.undo();
                        expect(session.getValue()).to.be.equal("a(12");
                        setTimeout(function() {
                            editor.undo();
                            expect(session.getValue()).to.be.equal("");
                            done();
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        }, 0);
    });

    it("should undo multiple changes with avoidUndo = true", function (done) {
        editor.setValue("");
        editor.onTextInput("a(12");
        expect(tte.currentTooltip).to.be.equal(tte.tooltips.numberScrubber);
        setTimeout(function () {
            tte.currentTooltip.updateText("14");
            expect(session.getValue()).to.be.equal("a(14");
            setTimeout(function () {
                tte.currentTooltip.updateText("24", null, true);
                expect(session.getValue()).to.be.equal("a(24");
                setTimeout(function () {
                    tte.currentTooltip.updateText("34", null, true);
                    expect(session.getValue()).to.be.equal("a(34");
                    setTimeout(function() {
                        editor.undo();
                        expect(session.getValue()).to.be.equal("a(12");
                        setTimeout(function() {
                            editor.undo();
                            expect(session.getValue()).to.be.equal("");
                            done();
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        }, 0);
    });
});

describe("General Tooltip Tests", function(){
    it("autoSuggest - detection", function() {
        typeLine("rect(44");
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.autoSuggest);
    });

    it("autoSuggest vs numberScrubber (click)", function() {
        var line = "rect(12, 34, 56, 78);";
        var pre = "rect(12";

        var e = getTooltipRequestEvent(line, pre);
        TTE.editor._emit("requestTooltip", e);
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.autoSuggest);

        e = getTooltipRequestEvent(line, pre); // Reset propagationStopped
        e.source = {action: "click"};
        TTE.editor._emit("requestTooltip", e);
        expect(TTE.currentTooltip).to.be.equal(TTE.tooltips.numberScrubber);
    });

    it("Remove succeeds", function(done) {
        TTE.remove();
        setTimeout(function () {
            expect($('.tooltip').length).to.be.equal(0);
            done();
        }, 0)
    });

});
