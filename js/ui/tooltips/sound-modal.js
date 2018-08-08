/* global i18n */
import React, {Component} from "react";

import OutputSounds from "../../shared/sounds.js";
import TooltipEngine from "../../ui/tooltip-engine.js";

import MediaPickerTooltip from "./media-picker-tooltip.js";
import TooltipPositioner from "./tooltip-positioner.js";
import * as tooltipUtils from "./tooltip-utils.js";

export default class SoundModal extends Component {
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
        onModalRefCreate: Function,
        // Specific to SoundModal
        soundsDir: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            closing: "",
            mediaSrc: '"rpg/metal-clink"',
        };
        this.files = OutputSounds;
        this.regex = RegExp(/(\bgetSound\s*\()[^)]*$/);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    checkEvent(event) {
        if (!this.regex.test(event.pre)) {
            return this.props.onEventCheck(false);
        }
        // eslint-disable-next-line prefer-const
        let {
            pathStart,
            functionStart,
            path,
            closing,
            shouldFill,
        } = tooltipUtils.getInfoFromFileMatch(event);

        if (shouldFill && this.props.autofillEnabled) {
            closing =
                ")" +
                (tooltipUtils.isInParenthesis(event.pre.slice(0, functionStart))
                    ? ""
                    : ";");
            this.props.onTextInsertRequest(
                {
                    row: event.row,
                    column: pathStart,
                },
                closing,
            );
            path = this.state.mediaSrc;
            this.updateText(path);
        }

        const aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row,
        };
        const cursorCol = pathStart + path.length + closing.length;

        this.updateTooltip(path);
        this.setState({closing, cursorCol, cursorRow: aceLocation.row});
        this.props.onEventCheck(true, aceLocation);
    }

    updateTooltip(partialPath) {
        let foundPath = this.state.mediaSrc;
        if (partialPath !== foundPath) {
            partialPath = partialPath.replace(/"/g, "");
            if (partialPath === "") {
                this.setState({
                    mediaSrc: "",
                    errorMessage: i18n._("Invalid sound file."),
                    errorType: "notice",
                });
                return;
            }
            foundPath = this.props.soundsDir + partialPath + ".mp3";
        }
        this.setState({
            mediaSrc: foundPath,
            errorMessage: "",
        });
    }

    renderPreview() {
        const props = {
            errorMessage: this.state.errorMessage,
            mediaClasses: this.files,
            mediaDir: this.props.soundsDir,
            mediaSrc: this.state.mediaSrc,
            mediaType: "audio",
            onFileSelect: (fileInfo) => {
                this.activeFileInfo = fileInfo;
            },
            onModalClose: () => {
                if (!this.activeFileInfo) {
                    return;
                }
                const updatePath = this.activeFileInfo.groupAndName;
                this.updateTooltip(updatePath);
                this.props.onTextUpdateRequest(`"${updatePath}"`);
            },
            onModalRefCreate: (ref) => {
                this.props.onModalRefCreate(ref);
            },
        };
        return <MediaPickerTooltip {...props} />;
    }

    render() {
        if (!this.props.isEnabled) {
            return null;
        }
        return (
            <TooltipPositioner
                aceEditor={this.props.aceEditor}
                editorScrollTop={this.props.editorScrollTop}
                children={this.renderPreview()}
                cursorRow={this.state.cursorRow}
                cursorCol={this.state.cursorCol}
                startsOpaque={true}
                toSide="right"
            />
        );
    }
}

TooltipEngine.registerTooltip("soundModal", SoundModal);
