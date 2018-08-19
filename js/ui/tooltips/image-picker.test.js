import React from "react";
import ReactDOM from "react-dom";

import {getTooltipEvent} from "../../../tests/tooltips/shared.js";

import ImagePicker from "./image-picker.js";

function renderImagePicker(extraProps) {
    const ref = React.createRef();

    const props = Object.assign(
        {},
        {
            ref: ref,
            isEnabled: true,
            imagesDir: "../images/",
            editorScrollTop: 0,
            editorType: "ace_pjs",
        },
        extraProps || {},
    );

    ReactDOM.render(
        React.createElement(ImagePicker, props),
        document.getElementById("live-editor-output"),
    );
    return ref;
}

function removeImagePicker() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"),
    );
}

describe("ImagePicker event checker", function() {
    before(function() {
        renderImagePicker();
    });

    after(function() {
        removeImagePicker();
    });

    it("doesn't match cursor before open paren", function(done) {
        const line = 'getImage("cute/Blank");';
        const pre = "getImage";
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("does match cursor after open paren", function(done) {
        const line = 'getImage("cute/Blank");';
        const pre = "getImage(";
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(12);
                done();
            },
        });
    });

    it("does match cursor in middle of filename", function(done) {
        const line = 'getImage("cute/Blank");';
        const pre = 'getImage("cute';
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(12);
                done();
            },
        });
    });

    it("does match cursor before close paren", function(done) {
        const line = 'getImage("cute/Blank");';
        const pre = 'getImage("cute/Blank';
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(12);
                done();
            },
        });
    });

    it("doesn't match cursor after close paren", function(done) {
        const line = 'getImage("cute/Blank");';
        const pre = 'getImage("cute/Blank")';
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("doesn't match cursor in random code", function(done) {
        const line = "randomGibberish";
        const pre = "rand";
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("doesn't match cursor in different function name", function(done) {
        const line = 'color("hi");';
        const pre = 'color("hi"';
        renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });
});

describe("ImagePicker text update requester", function() {
    before(function() {
        renderImagePicker();
    });

    after(function() {
        removeImagePicker();
    });

    it("should auto-fill after user types getImage(", function(done) {
        const line = "getImage(";
        const pre = "getImage(";

        let didInsert;
        renderImagePicker({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(9);
                expect(text).to.be(")");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be('"cute/None"');
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("should auto-fill with semi-colon for assignment", function(done) {
        const line = "var img = getImage(";
        const pre = "var img = getImage(";

        let didInsert;
        renderImagePicker({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(19);
                expect(text).to.be(");");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be('"cute/None"');
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("should handle image update", function(done) {
        const line = 'getImage("blank/None");';
        const pre = 'getImage("b';
        const imagePickerRef = renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(12);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be('"avatars/blue-leaf"');
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                done();
            },
        });
        imagePickerRef.current.handleImageSelect("avatars/blue-leaf");
    });

    it("should handle updating image for nonsense filename", function(done) {
        const line = "getImage(fsdlkfds";
        const pre = "getImage(";
        const imagePickerRef = renderImagePicker({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(8);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be('"avatars/blue-leaf"');
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                done();
            },
        });
        imagePickerRef.current.handleImageSelect("avatars/blue-leaf");
    });
});
