/* global i18n */
import React, {Component} from "react";

import {ExtendedOutputImages} from "../../shared/images.js";
import MediaPickerTooltip from "./media-picker-tooltip.jsx";
import ScratchpadAutosuggest from "../../ui/autosuggest.js";
import TooltipBase from "../../ui/tooltip-base.js";
import TooltipEngine from "../../ui/tooltip-engine.js";

/* This file and sound-modal.js are similar, and they both use
 the same React component for file picking.
 The imageModal is used only in webpages right now.
 In the future, the imageModal might also be used by programs,
 as students seem to prefer that UI to the imagePicker UI.
 */
class ImageModal extends Component {

    props: {
        isEnabled: boolean,
        eventToCheck: Object,
        aceEditor: Object,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        soundsDir: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            mediaSrc: ""
        }
        /*
        this.options = options;
        this.options.files = ExtendedOutputImages;
        this.parent = options.parent;
        this.autofill = true;
        this.render();
        this.bindToRequestTooltip();
        if (this.options.record) {
            Object.assign(this.options.record.handlers, {
                "imagemodal.show": this.showModal.bind(this),
                "imagemodal.hide": this.hideModal.bind(this),
                "imagemodal.selectImg": this.selectImg.bind(this)
            });
        }*/
    }

    checkEvent(event) {
        if (!/<img\s+[^>]*?\s*src\s*=\s*["']([^"']*)$/.test(event.pre)) {
            return;
        }
        const urlStart = event.col - RegExp.$1.length;
        const url = event.line.slice(urlStart).match(/^[^"']*/)[0];
        this.aceLocation = {
            start: urlStart,
            length: url.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + 1;

        this.updateTooltip(url);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    }

    updateTooltip(url) {
        if (url !== this.currentUrl) {
            this.currentUrl = url.trim();
            if (url === "") {
                    this.renderPreview({
                        mediaSrc: "",
                        errorMessage: i18n._("Enter an image URL."),
                        errorType: "notice"
                    });
                return;
            }
            const allowedHosts = /(\.|^)?(khanacademy\.org|kastatic\.org|kasandbox\.org|ka-perseus-images\.s3\.amazonaws\.com|wikimedia\.org|localhost:\d+)$/i;
            const match = /\/\/([^/]*)(?:\/|\?|#|$)/.exec(url);
            const host = match ? match[1] : "";
            if (!host || allowedHosts.test(host)) {
                this.renderPreview({
                    mediaSrc: url,
                    errorMessage: ""
                });
            } else {
                this.renderPreview({
                    mediaSrc: "",
                    errorMessage: i18n._("Sorry! That server is not permitted."),
                    errorType: "error"
                });
            }
        }
    }

    renderPreview(props) {
        props = props || {};
        props.mediaType = "image";
        props.onFileSelect = (fileInfo) => {
            this.activeFileInfo = fileInfo;
            this.logForRecording("selectImg", fileInfo.groupAndName);
        };
        props.onModalShow = () => {
            this.props.onModalOpened();
            this.logForRecording("show");
        };
        props.onModalClose = () => {
            this.props.onModalClosed();
            this.logForRecording("hide");
            if (!this.activeFileInfo) {return;}
            const updatePath = this.activeFileInfo.fullImgPath;
            this.updateTooltip(updatePath);
            this.updateText(updatePath);
        }
        props.imagesDir = this.options.imagesDir;
        props.mediaClasses = this.options.files;

        ReactDOM.render(
            React.createElement(MediaPickerTooltip, props, null),
            this.$el.find(".media-preview-wrapper")[0]);
    }

    render() {
        this.$el = $("<div class='tooltip mediapicker-preview'>" +
                    "<div class='media-preview-wrapper'/>" +
                    "<div class='arrow'></div></div>")
            .addClass("mediapicker__image")
            .appendTo("body").hide();
        this.renderPreview();
    }

    remove() {
        ReactDOM.unmountComponentAtNode(this.$(".media-preview-wrapper")[0]);
        this.$el.remove();
        this.unbindFromRequestTooltip();
    }

    // Related to talkthrough playback:
    // TODO

    showModal() {
        // TODO: how to open programmatically?
    },

    hideModal() {
        // TODO: how to hide programmatically?
    },

    selectFile(dataPath) {
        // TODO: How to update programmatically?
        const $file = this.$(".mediapicker-modal-file[data-path='"+dataPath+"']");
        const $pane = $file.closest(".tab-pane");
        const $tab = this.$("a[href='#"+$pane.attr("id")+"']");
        $tab.tab("show");
        $pane.find(".mediapicker-modal-content").scrollTop(
            $file.position().top - 100);
        return $file;
    }

    selectImg(dataPath) {
        const $file = this.selectFile(dataPath);
        $file.find("img").click();
    }

    logForRecording(action, value) {
        const logAction = "imagemodal" + action;
        this.options.record && this.options.record.log(logAction, value);
    }
}

TooltipEngine.registerTooltip("imageModal", ImageModal);

module.exports = ImageModal;
