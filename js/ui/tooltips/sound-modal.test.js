import React from "react";
import ReactDOM from "react-dom";

import {getTooltipEvent} from "../../../tests/tooltips/shared.js";

import SoundModal from "./sound-modal.js";

function renderSoundModal(extraProps) {
    const ref = React.createRef();

    const props = Object.assign(
        {},
        {
            ref: ref,
            isEnabled: true,
            editorScrollTop: 0,
            editorType: "ace_webpage",
            soundsDir: "../sounds/",
        },
        extraProps || {},
    );

    ReactDOM.render(
        React.createElement(SoundModal, props),
        document.getElementById("live-editor-output"),
    );
    return ref;
}

function removeSoundModal() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"),
    );
}

// These tests are basically the same as the tests in image-modal.test.js
describe("SoundModal event checker", function() {
    before(function() {
        renderSoundModal();
    });

    after(function() {
        removeSoundModal();
    });

    it("shouldn't match cursor before open paren", function(done) {
        const line = 'getSound("rpg/giant-no");';
        const pre = "getSound";
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("should match cursor after open paren", function(done) {
        const line = 'getSound("rpg/giant-no");';
        const pre = "getSound(";
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(14);
                done();
            },
        });
    });

    it("should match cursor in middle of filename", function(done) {
        const line = 'getSound("rpg/giant-no");';
        const pre = 'getSound("rpg';
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(14);
                done();
            },
        });
    });

    it("should match cursor right before close paren", function(done) {
        const line = 'getSound("rpg/giant-no");';
        const pre = 'getSound("rpg/giant-no"';
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(9);
                expect(aceLocation.length).to.be(14);
                done();
            },
        });
    });

    it("shouldn't match cursor right after close paren", function(done) {
        const line = 'getSound("rpg/giant-no");';
        const pre = 'getSound("rpg/giant-no")';
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("shouldn't match cursor in random code", function(done) {
        const line = "randomGibberish";
        const pre = "rand";
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("shouldn't match cursor in different function name", function(done) {
        const line = 'color("hi");';
        const pre = 'color("hi';
        renderSoundModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });
});

describe("SoundModal text update requester", function() {
    before(function() {
        renderSoundModal();
    });

    after(function() {
        removeSoundModal();
    });

    it("should auto-fill with ; after user types getSound(", function(done) {
        const line = "getSound(";
        const pre = "getSound(";

        let didInsert;
        renderSoundModal({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(9);
                expect(text).to.be(");");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be(`"rpg/metal-clink"`);
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("should auto-fill without ; when user types playSound", function(done) {
        const line = "playSound(getSound(";
        const pre = "playSound(getSound(";

        let didInsert;
        renderSoundModal({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextInsertRequest: (location, text) => {
                expect(location.row).to.be(1);
                expect(location.column).to.be(19);
                expect(text).to.be(")");
                didInsert = true;
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be(`"rpg/metal-clink"`);
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                expect(didInsert).to.be(true);
                done();
            },
        });
    });

    it("should handle sound file picking", function(done) {
        const line = `playSound(getSound("rpg/metal-clink"));`;
        const pre = `playSound(getSound("`;

        const soundModalRef = renderSoundModal({
            autofillEnabled: true,
            eventToCheck: getTooltipEvent(line, pre, true),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be(`"${fileInfo.groupAndName}"`);
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                done();
            },
        });
        const fileInfo = {
            fullPath: "../../build/sounds/rpg/coin-jingle.mp3",
            groupAndName: "rpg/coin-jingle",
            name: "coin-jingle",
        };
        soundModalRef.current.handleFileSelect(fileInfo);
        soundModalRef.current.handleModalClose();
    });
});
