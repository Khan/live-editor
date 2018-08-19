import React from "react";
import ReactDOM from "react-dom";

import {getTooltipEvent} from "../../../tests/tooltips/shared.js";

import ImageModal from "./image-modal.js";

function renderImageModal(extraProps) {
    const ref = React.createRef();

    const props = Object.assign(
        {},
        {
            ref: ref,
            isEnabled: true,
            editorScrollTop: 0,
            editorType: "ace_webpage",
        },
        extraProps || {},
    );

    ReactDOM.render(
        React.createElement(ImageModal, props),
        document.getElementById("live-editor-output"),
    );
    return ref;
}

function removeImageModal() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor-output"),
    );
}

describe("ImageModal event checker", function() {
    before(function() {
        renderImageModal();
    });

    after(function() {
        removeImageModal();
    });

    it("shouldn't match before open quote", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = "<img src=";
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("should match just after open quote", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(10);
                done();
            },
        });
    });

    it("should match in the middle of URL", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="hello ';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(10);
                done();
            },
        });
    });

    it("should match just before close quote", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="hello world.png';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(10);
                done();
            },
        });
    });

    it("should match even if spaces are around equal sign", function(done) {
        const line = '<img src = "hello world.png" />';
        const pre = '<img src = "hello ';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(12);
                done();
            },
        });
    });

    it("shouldn't match after close quote", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="hello world.png"';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("should match even if img tag has other attributes", function(done) {
        const line = '<img style="yellow" src="hello world.png" />';
        const pre = '<img style="yellow" src="hello world.';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(25);
                done();
            },
        });
    });

    it("shouldn't match a non-img tag", function(done) {
        const line = '<a src="hello world.png" />';
        const pre = '<a src="hello';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });

    it("shouldn't match a non-src attribute in img tag", function(done) {
        const line = '<img href="hello world.png" />';
        const pre = '<img href="hello';
        renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(false);
                done();
            },
        });
    });
});

describe("ImageModal text update requester", function() {
    before(function() {
        renderImageModal();
    });

    after(function() {
        removeImageModal();
    });

    it("should request updating with the full image path", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="hello ';
        const imageModalRef = renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(10);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be.equal(fileInfo.fullImgPath);
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                done();
            },
        });

        const fileInfo = {
            fullImgPath: "../../build/images/avatars/aqualine-seedling.png",
            fullThumbPath: "../../build/images/avatars/aqualine-seedling.png",
            groupAndName: "avatars/aqualine-seedling",
            name: "aqualine-seedling",
        };
        imageModalRef.current.handleFileSelect(fileInfo);
        imageModalRef.current.handleModalClose();
    });

    it("should request updating with most recent image", function(done) {
        const line = '<img src="hello world.png" />';
        const pre = '<img src="hello ';
        const imageModalRef = renderImageModal({
            eventToCheck: getTooltipEvent(line, pre),
            onEventCheck: (didMatch, aceLocation) => {
                expect(didMatch).to.be(true);
                expect(aceLocation.row).to.be(1);
                expect(aceLocation.start).to.be(10);
            },
            onTextUpdateRequest: (text, selection, avoidUndo) => {
                expect(text).to.be.equal(fileInfo2.fullImgPath);
                expect(selection).to.be(undefined);
                expect(avoidUndo).to.be(undefined);
                done();
            },
        });

        const fileInfo1 = {
            fullImgPath: "../../build/images/avatars/aqualine-seed.png",
            fullThumbPath: "../../build/images/avatars/aqualine-seed.png",
            groupAndName: "avatars/aqualine-seed",
            name: "aqualine-seed",
        };
        const fileInfo2 = {
            fullImgPath: "../../build/images/avatars/aqualine-seedling.png",
            fullThumbPath: "../../build/images/avatars/aqualine-seedling.png",
            groupAndName: "avatars/aqualine-seedling",
            name: "aqualine-seedling",
        };
        imageModalRef.current.handleFileSelect(fileInfo1);
        imageModalRef.current.handleFileSelect(fileInfo2);
        imageModalRef.current.handleModalClose();
    });
});
