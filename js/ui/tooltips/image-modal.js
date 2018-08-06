/* global i18n */
import React, { Component } from "react";

import { ExtendedOutputImages } from "../../shared/images.js";
import MediaPickerTooltip from "./media-picker-tooltip.jsx";
import TooltipPositioner from "./tooltip-positioner.js";
import TooltipEngine from "../../ui/tooltip-engine.js";

/*
 This file and sound-modal.js are similar, and they both use
 the same React component for file picking.
 The imageModal is used only in webpages right now.
 In the future, the imageModal might also be used by programs,
 as students seem to prefer that UI to the imagePicker UI.
 */
class ImageModal extends Component {

    props: {
        // Common to all tooltips
        autofillEnabled: boolean,
        isEnabled: boolean,
        eventToCheck: Object,
        aceEditor: Object,
        editorScrollTop: number,
        editorType: string,
        onEventCheck: Function,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        // For Sound and Image Modal
        onModalClose: Function,
        onModalRefCreate: Function,
        // Specific to Imagemodal
        imagesDir: string,
        record: Object,
    };

    constructor(props) {
        super(props);
        this.state = {
            mediaSrc: ""
        }
        this.files = ExtendedOutputImages;
        this.regex = RegExp(/<img\s+[^>]*?\s*src\s*=\s*["']([^"']*)$/);
        /*
        TODO(pamela):
        if (this.options.record) {
            Object.assign(this.options.record.handlers, {
                "imagemodal.show": this.showModal.bind(this),
                "imagemodal.hide": this.hideModal.bind(this),
                "imagemodal.selectImg": this.selectImg.bind(this)
            });
        }*/
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    checkEvent(event) {
        if (!this.regex.test(event.pre)) {
            return this.props.onEventCheck(false);;
        }
        const urlStart = event.col - RegExp.$1.length;
        const url = event.line.slice(urlStart).match(/^[^"']*/)[0];
        const aceLocation = {
            start: urlStart,
            length: url.length,
            row: event.row
        };
        const cursorCol = urlStart + url.length + 1;

        this.updateTooltip(url);
        this.setState({cursorCol, cursorRow: event.row});
        this.props.onEventCheck(true, aceLocation)
    }

    updateTooltip(url) {
        if (url !== this.state.mediaSrc) {
            url = url.trim();
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

    // TODO: Record in a parent instead, via a prop callback
    logForRecording(action, value) {
        const logAction = "imagemodal" + action;
        this.props.record && this.props.record.log(logAction, value);
    }

    renderPreview() {
        const props = {
            errorMessage: this.state.errorMessage,
            mediaDir: this.props.imagesDir,
            mediaClasses: this.files,
            mediaSrc: this.state.mediaSrc,
            mediaType: "image",
            onFileSelect: (fileInfo) => {
                this.activeFileInfo = fileInfo;
                this.logForRecording("selectImg", fileInfo.groupAndName);
            },
            onModalOpen: () => {
                // NOTE(pamela): Wonder-blocks model does not currently have onOpen
                this.logForRecording("show");
            },
            onModalClose: () => {
                this.logForRecording("hide");
                if (!this.activeFileInfo) {return;}
                const updatePath = this.activeFileInfo.fullImgPath;
                this.updateTooltip(updatePath);
                this.props.onTextUpdateRequest(updatePath);
            },
            onModalRefCreate: (ref) => {
                this.props.onModalRefCreate(ref);
            },
        }
        return <MediaPickerTooltip {...props}/>
    }

    render () {
        if (!this.props.isEnabled) {
            return null;
        }
        return <TooltipPositioner
                    aceEditor={this.props.aceEditor}
                    editorScrollTop={this.props.editorScrollTop}
                    children={this.renderPreview()}
                    cursorRow={this.state.cursorRow}
                    cursorCol={this.state.cursorCol}
                    startsOpaque={true}
                    toSide="right"
                />;
    }
}

TooltipEngine.registerTooltip("imageModal", ImageModal);

module.exports = ImageModal;
