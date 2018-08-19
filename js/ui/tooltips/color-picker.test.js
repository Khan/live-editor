import React from "react";
import ReactDOM from "react-dom";

import {getTooltipEvent} from "../../../tests/tooltips/shared.js";

import ColorPicker from "./color-picker.js";

function renderColorPicker(extraProps) {
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
        React.createElement(ColorPicker, props),
        document.getElementById("live-editor-output"),
    );
    return ref;
}

function removeColorPicker() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"),
    );
}

describe("ColorPicker event checker", function() {
    before(function() {
        renderColorPicker();
    });

    after(function() {
        removeColorPicker();
    });

    it("shouldn't match before first open param for fill", function(done) {
        const line = "fill(255, 244, 0, 21);";
        const pre = "fill";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("should match after first open param for fill", function(done) {
        const line = "fill(255, 244, 0, 21);";
        const pre = "fill(";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match in the middle of typing color arguments", function(done) {
        const line = "fill(255, 244, 0, 21);";
        const pre = "fill(255, ";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("should match before the close paren", function(done) {
        const line = "fill(255, 244, 0, 21);";
        const pre = "fill(255, 244, 0, 21";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                done();
            },
        });
    });

    it("shouldn't match after the close paren", function(done) {
        const line = "fill(255, 244, 0, 21);";
        const pre = "fill(255, 244, 0, 21)";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    ["fill", "background", "stroke", "color"].forEach(function(fn) {
        it("should match ProcessingJS function name: " + fn, function(done) {
            const line = fn + "();";
            const pre = fn + "(";
            renderColorPicker({
                eventToCheck: getTooltipEvent(line, pre),
                onEventCheck: (didMatch, aceLocation) => {
                    expect(didMatch).to.be(true);
                    done();
                },
            });
        });
    });

    it("shouldn't match non-color function names like rect", function(done) {
        const line = "rect(255, 244, 0, 21);";
        const pre = "rect(255, ";
        renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });
});

describe("ColorPicker text update requester", function() {
    before(function() {
        renderColorPicker();
    });

    after(function() {
        removeColorPicker();
    });

    it("should auto-fill after user types fill(", function(done) {
        const line = "fill(";
        const pre = "fill(";

        let didInsert;
        renderColorPicker({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(5);
                expect(text).to.be(");");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("255, 0, 0");
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(false);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("shouldn't auto close when user types color(", function(done) {
        const line = "color(";
        const pre = "color(";

        let didInsert;
        renderColorPicker({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(6);
                expect(text).to.be(")");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("255, 0, 0");
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(false);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("should request a text update (startScrub)", function(done) {
        const line = "fill(255, 0, 0);";
        const pre = "fill(25";
        let didScrubStart = false;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onScrubbingStart: (avoidUndo) => {
                expect(avoidUndo).to.be(true);
                didScrubStart = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("40, 50, 60");
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(true);
                expect(didScrubStart).to.be(true);
                done();
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "startScrub");
    });

    it("should request a text update (midScrub)", function(done) {
        const line = "fill(255, 0, 0);";
        const pre = "fill(25";
        let didScrubStart = false;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onScrubbingStart: (avoidUndo) => {
                didScrubStart = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("40, 50, 60");
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(true);
                expect(didScrubStart).to.be(false);
                done();
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "midScrub");
    });

    it("should request two text updates (stopScrub)", function(done) {
        const line = "fill(255, 0, 0);";
        const pre = "fill(25";
        let didScrubEnd = false;
        let updateNum = 1;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onScrubbingEnd: (avoidUndo) => {
                expect(avoidUndo).to.be(true);
                didScrubEnd = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(selection).to.be(undefined);
                if (updateNum === 1) {
                    expect(text).to.be("255, 0, 0");
                    expect(avoidUndo).to.be(true);
                } else {
                    expect(text).to.be("40, 50, 60");
                    expect(avoidUndo).to.be(false);
                    expect(didScrubEnd).to.be(true);
                    done();
                }
                updateNum++;
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "stopScrub");
    });

    it("should request one text update (click)", function(done) {
        const line = "fill(255, 0, 0);";
        const pre = "fill(25";
        let didScrubEnd = false;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onScrubbingEnd: (avoidUndo) => {
                expect(avoidUndo).to.be(true);
                didScrubEnd = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("40, 50, 60");
                expect(avoidUndo).to.be(false);
                expect(didScrubEnd).to.be(true);
                done();
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "click");
    });

    it("should ignore garbage", function(done) {
        const line = "fill(255, 0, 0, blue);";
        const pre = "fill(25";
        let didScrubEnd = false;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.length).to.be(15);
            },
            onScrubbingEnd: (avoidUndo) => {
                expect(avoidUndo).to.be(true);
                didScrubEnd = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("40, 50, 60");
                expect(avoidUndo).to.be(false);
                expect(didScrubEnd).to.be(true);
                done();
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "click");
    });

    it("should keep alpha number intact", function(done) {
        const line = "fill(255, 0, 0, 100);";
        const pre = "fill(25";
        let didScrubEnd = false;
        const colorPickerRef = renderColorPicker({
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.length).to.be(9);
            },
            onScrubbingEnd: (avoidUndo) => {
                expect(avoidUndo).to.be(true);
                didScrubEnd = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be("40, 50, 60");
                expect(avoidUndo).to.be(false);
                expect(didScrubEnd).to.be(true);
                done();
            },
        });
        const newRGB = {r: 40, g: 50, b: 60};
        colorPickerRef.current.handleChange(newRGB, "click");
    });
});
