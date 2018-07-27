/* global i18n */
import React, {Component} from "react";
const ReactDOM = require("react-dom");

const MediaPickerTooltip = require("./media-picker-tooltip.jsx");
const OutputSounds = require("../../shared/sounds.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");
const TooltipPositioner = require("./tooltip-positioner.js");
const TooltipUtils = require("./tooltip-utils.js");

class SoundModal extends Component {

    props: {
        isEnabled: boolean,
        eventToCheck: Object,
        aceEditor: Object,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        soundsDir: string
    };

    constructor(props) {
        super(props);
        this.state = {
            aceLocation: {},
            closing: "",
            mediaSrc:  "\"rpg/metal-clink\""
        };
        this.files = OutputSounds;
        this.autofill = true; // TODO: Convert to prop
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    renderPreview () {
        const props = {
            mediaType: "audio",
            soundsDir: this.props.soundsDir,
            mediaClasses: this.files,
            onFileSelect: (fileInfo) => {
                this.activeFileInfo = fileInfo;
            },
            onModalClose: () => {
                console.log("Modal closed!");
                if (!this.activeFileInfo) {return;}
                const updatePath = this.activeFileInfo.groupAndName;
                this.updateTooltip(updatePath);
                this.props.onTextUpdateRequest(this.state.aceLocation, `"${updatePath}"`);
            }
        };
        return <MediaPickerTooltip {...props} />;
    }

    render () {
        if (!this.props.isEnabled) {
            return null;
        }
        return <TooltipPositioner
                    className="mediapicker-preview mediapicker__sound"
                    children={this.renderPreview()}
                    aceEditor={this.props.aceEditor}
                    aceLocation={this.state.aceLocation}/>;
    }

    checkEvent (event) {
        if (!/(\bgetSound\s*\()[^)]*$/.test(event.pre)) {
            return this.props.onEventChecked(false);
        }
        let {pathStart, functionStart, path, closing, shouldFill} = TooltipUtils.getInfoFromFileMatch(event);

        if (shouldFill && this.autofill) {
            closing = ")" + (TooltipUtils.isInParenthesis(
                event.pre.slice(0, functionStart)) ? "" : ";");
            this.props.onTextInsertRequest({
                    row: event.row,
                    column: pathStart
                }, closing);
            path = this.state.mediaSrc;
            this.updateText(path);
        }
        // start, length, shouldFill
        const aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row,
            tooltipCursor: pathStart + path.length + closing.length
        };
        this.updateTooltip(path);
        this.setState({aceLocation: aceLocation, closing: closing});
        this.props.onEventChecked(true);
    }

    updateTooltip (partialPath) {
        let foundPath = this.state.mediaSrc;
        if (partialPath !== foundPath) {
            partialPath = partialPath.replace(/"/g, "");
            if (partialPath === "") {
                this.setState({
                    mediaSrc: "",
                    errorMessage: i18n._("Invalid sound file."),
                    errorType: "notice"
                });
                return;
            }
            foundPath = this.props.soundsDir + partialPath + ".mp3";
        }
        this.setState({
            mediaSrc: foundPath,
            errorMessage: ""
        });
    }
}

TooltipEngine.registerTooltip("soundModal", SoundModal);

module.exports = SoundModal;