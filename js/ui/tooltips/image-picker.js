import React, {Component} from "react";

const ImageScroller = require("./image-scroller.jsx")
const OutputImages = require("../../shared/images.js").OutputImages;
const TooltipEngine = require("../../ui/tooltip-engine.js");
const TooltipPositioner = require("./tooltip-positioner.js");
const TooltipUtils = require("./tooltip-utils.js");

// A description of general tooltip flow can be found in tooltip-engine.js
class ImagePicker extends Component {

    props: {
        // Common to all tooltips
        isEnabled: boolean,
        autofillEnabled: boolean,
        eventToCheck: Object,
        aceEditor: Object,
        onEventChecked: Function,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        // Specific to ImagePicker
        imagesDir: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentImage: "cute/None",
            aceLocation: {},
            closing: ""
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    renderImageScroller() {
        const props = {
            currentImage: this.state.currentImage,
            imagesDir: this.props.imagesDir,
            imageGroups: OutputImages,
            onMouseLeave: () => {
                // TODO: Propagate to parent of parent?
                this.props.aceEditor.clearSelection();
                this.props.aceEditor.focus();
            },
            onImageSelect: (imageName) => {
                this.updateText(imageName);
                this.updateTooltip(`"${imageName}"`);
            }
        };
        return <ImageScroller {...props} />;
    }

    checkEvent(event) {
        if (!/(\bgetImage\s*\()[^)]*$/.test(event.pre)) {
            return this.props.onEventChecked(false);
        }
        const functionStart = event.col - RegExp.lastMatch.length;
        const paramsStart = functionStart + RegExp.$1.length;
        const pieces = /^(\s*)(["']?[^)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
        const leadingPadding = pieces[1];
        const pathStart = paramsStart + leadingPadding.length;
        let path = pieces[2];
        let closing = pieces[3];
        const aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row
        };
        aceLocation.tooltipCursor = aceLocation.start + aceLocation.length + closing.length;

        // TODO(kevinb) extract this into a method on TooltipBase
        if (leadingPadding.length === 0 &&
            path.length === 0 &&
            closing.length === 0 &&
            event.source && event.source.action === "insert" &&
            event.source.lines[0].length === 1 && this.props.autofillEnabled) {

            closing = ")" + (TooltipUtils.isAfterAssignment(event.pre.slice(0, functionStart)) ? ";" : "");
            this.props.onTextInsertRequest({
                row: event.row,
                column: pathStart
            }, closing);

            path = this.state.currentImage;
            this.updateText(path);
        }
        this.updateTooltip(path);
        this.setState({aceLocation: aceLocation, closing: closing});
        this.props.onEventChecked(true);
    }

    updateTooltip(rawPath) {
        let foundPath = this.state.currentImage;

        const path = /^["']?(.*?)["']?$/.exec(rawPath)[1];
        const pathParts = path.split("/");
        const groupName = pathParts[0];
        const fileName = pathParts[1];
        OutputImages.forEach((group) => {
            if (group.groupName === groupName) {
                group.images.forEach((imageName) => {
                    if (imageName === fileName) {
                        foundPath = groupName + "/" + fileName;
                    }
                });
            }
        });
        this.setState({currentImage: foundPath});
    }

    updateText(newPath) {
        // This can be a prop passed along
        if (!this.props.autofillEnabled) {
            return;
        }
        const newText = '"' + newPath + '"';
        this.props.onTextUpdateRequest(this.state.aceLocation, newText);
        // Calculate new location according to new text
        const newLocation = this.state.aceLocation;
        newLocation.length = newText.length;
        newLocation.tooltipCursor = this.state.aceLocation.start + this.state.aceLocation.length + this.state.closing.length;
        this.setState({aceLocation: newLocation});
    }

    render() {
        if (!this.props.isEnabled) {
            return null;
        }
        return <TooltipPositioner
                    className="mediapicker"
                    children={this.renderImageScroller()}
                    aceEditor={this.props.aceEditor}
                    aceLocation={this.state.aceLocation}/>;
    }
}

TooltipEngine.registerTooltip("imagePicker", ImagePicker);

module.exports = ImagePicker;