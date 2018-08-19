import React from "react";
import ReactDOM from "react-dom";

import {getTooltipEvent} from "../../../tests/tooltips/shared.js";

import NumberScrubber from "./number-scrubber.js";

function renderNumberScrubber(extraProps) {
    const ref = React.createRef();

    const props = Object.assign(
        {},
        {
            ref: ref,
            isEnabled: true,
            editorScrollTop: 0,
            editorType: "ace_pjs",
        },
        extraProps || {},
    );

    ReactDOM.render(
        React.createElement(NumberScrubber, props),
        document.getElementById("live-editor-output"),
    );
    return ref;
}

function removeNumberScrubber() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"),
    );
}

describe("NumberScrubber event checker", function() {
    before(function() {
        renderNumberScrubber();
    });

    after(function() {
        removeNumberScrubber();
    });

    it("shouldn't match when cursor is before number", function(done) {
        const line = "Falaffel -123 Falaffel";
        const pre = "Falaffel";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("should match when cursor is at start of number", function(done) {
        const line = "Falaffel -123 Falaffel";
        const pre = "Falaffel ";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match when cursor is in middle of number", function(done) {
        const line = "Falaffel 123 Falaffel";
        const pre = "Falaffel 12";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match when cursor is at end of number", function(done) {
        const line = "Falaffel 123 Falaffel";
        const pre = "Falaffel 123";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match start of negative number", function(done) {
        const line = "Falaffel -123 Falaffel";
        const pre = "Falaffel ";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match middle of negative number", function(done) {
        const line = "Falaffel -123 Falaffel";
        const pre = "Falaffel -1";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("shouldn't match after number", function(done) {
        const line = "Falaffel 123 Falaffel";
        const pre = "Falaffel 123 ";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("shouldn't match non-numbers like intern names", function(done) {
        const line = "Alex Rodrigues";
        const pre = "Alex Rod";
        renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });
});

describe("NumberScrubber text update requester", function() {
    before(function() {
        renderNumberScrubber();
    });

    after(function() {
        removeNumberScrubber();
    });

    it("should decrement number after left click", function(done) {
        const line = "123 1234 -fergus";
        const pre = "123 12";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("1233");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(false);
                done();
            },
        });
        numberScrubberRef.current.handleLeftClick({});
    });

    it("should increment number after right click", function(done) {
        const line = "123 1234 -fergus";
        const pre = "123 12";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("1235");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(false);
                done();
            },
        });
        numberScrubberRef.current.handleRightClick({});
    });

    it("should increment number while dragging", function(done) {
        const line = "123 1234 -fergus";
        const pre = "123 12";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("1236");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(true);
                done();
            },
        });
        numberScrubberRef.current.handleDrag({}, {x: 4});
    });

    it("should increment number after drag stop (undo-ably)", function(done) {
        const line = "123 1234 -fergus";
        const pre = "123 12";

        let updateNum = 1;
        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onScrubbingStart: () => {},
            onScrubbingEnd: () => {},
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                if (updateNum === 1) {
                    expect(text).to.be("1236");
                    expect(selection).to.be(null);
                    expect(avoidUndo).to.be(true);
                    updateNum++;
                } else if (updateNum === 2) {
                    expect(text).to.be("1234");
                    expect(selection).to.be(null);
                    expect(avoidUndo).to.be(true);
                    updateNum++;
                } else {
                    expect(text).to.be("1236");
                    expect(selection).to.be(null);
                    expect(avoidUndo).to.be(false);
                    done();
                }
            },
        });
        numberScrubberRef.current.handleDrag({}, {x: 4});
        numberScrubberRef.current.handleDragStop({}, {x: 4});
    });

    it("should increment negative number after right click", function(done) {
        const line = "bob(-124)";
        const pre = "bob(-124";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("-123");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(false);
                done();
            },
        });
        numberScrubberRef.current.handleRightClick({});
    });

    it("should increment negative number after right click", function(done) {
        const line = "bob(-124)";
        const pre = "bob(-124";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(4);
                expect(aceLocation.length).to.be(4);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("-123");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(false);
                done();
            },
        });
        numberScrubberRef.current.handleRightClick({});
    });

    it("shouldn't get confused by subtraction", function(done) {
        const line = "bob(12-124)";
        const pre = "bob(12-124";

        const numberScrubberRef = renderNumberScrubber({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(7);
                expect(aceLocation.length).to.be(3);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("125");
                expect(selection).to.be(null);
                expect(avoidUndo).to.be(false);
                done();
            },
        });
        numberScrubberRef.current.handleRightClick({});
    });
});
