import React, {Component} from "react";

import {OutputImages} from "../../shared/images.js";
import TooltipEngine from "../../ui/tooltip-engine.js";

import ImageScroller from "./image-scroller.js";
import TooltipPositioner from "./tooltip-positioner.js";
import * as tooltipUtils from "./tooltip-utils.js";

// A description of general tooltip flow can be found in tooltip-engine.js
export default class ImagePicker extends Component {
    props: {
        // Common to all tooltips
        autofillEnabled: boolean,
        isEnabled: boolean,
        eventToCheck: Object,
        aceEditor: Object,
        editorScrollTop: number,
        editorType: string,
        onEventCheck: Function,
        onLoseFocus: Function,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        // Specific to ImagePicker
        imagesDir: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            closing: "",
            imageName: "cute/None",
        };
        this.regex = RegExp(/(\bgetImage\s*\()[^)]*$/);

        this.handleImageSelect = this.handleImageSelect.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    // Note: this code is redundant with other tooltips
    componentDidUpdate(prevProps, prevState, snapshot) {
        const currentEvent = this.props.eventToCheck;
        if (!currentEvent) {
            return;
        }
        if (
            !prevProps.eventToCheck ||
            currentEvent.timestamp > prevProps.eventToCheck.timestamp
        ) {
            this.checkEvent(currentEvent);
        }
    }

    checkEvent(event) {
        if (!this.regex.test(event.pre)) {
            return this.props.onEventCheck(false);
        }
        const functionStart = event.col - RegExp.lastMatch.length;
        const paramsStart = functionStart + RegExp.$1.length;
        const pieces = /^(\s*)(["']?[^)]*?["']?)\s*(\);?|$)/.exec(
            event.line.slice(paramsStart),
        );
        const leadingPadding = pieces[1];
        const pathStart = paramsStart + leadingPadding.length;
        let path = pieces[2];
        let closing = pieces[3];

        // TODO: De-dupe this with similar code in other tooltips
        if (
            leadingPadding.length === 0 &&
            path.length === 0 &&
            closing.length === 0 &&
            event.source &&
            event.source.action === "insert" &&
            event.source.lines[0].length === 1 &&
            this.props.autofillEnabled
        ) {
            closing =
                ")" +
                (tooltipUtils.isAfterAssignment(
                    event.pre.slice(0, functionStart),
                )
                    ? ";"
                    : "");
            this.props.onTextInsertRequest(
                {
                    row: event.row,
                    column: pathStart,
                },
                closing,
            );

            path = this.state.imageName;
            this.props.onTextUpdateRequest(`"${path}"`);
        }
        const aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row,
        };
        const cursorCol =
            aceLocation.start + aceLocation.length + closing.length;

        this.updateTooltip(path);
        this.setState({closing, cursorCol, cursorRow: aceLocation.row});
        this.props.onEventCheck(true, aceLocation);
    }

    updateTooltip(rawPath) {
        let foundPath = this.state.imageName;

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
        this.setState({imageName: foundPath});
    }

    handleMouseLeave() {
        // TODO: This may not be needed here
        this.props.onLoseFocus();
        // TODO? this.props.aceEditor.clearSelection();
    }

    handleImageSelect(imageName) {
        this.updateTooltip(`"${imageName}"`);
        this.props.onTextUpdateRequest(`"${imageName}"`);
    }

    renderImageScroller() {
        const props = {
            imageName: this.state.imageName,
            imagesDir: this.props.imagesDir,
            imageGroups: OutputImages,
            onMouseLeave: this.handleMouseLeave,
            onImageSelect: this.handleImageSelect,
        };
        return <ImageScroller {...props} />;
    }

    render() {
        if (!this.props.isEnabled) {
            return null;
        }
        return (
            <TooltipPositioner
                aceEditor={this.props.aceEditor}
                editorScrollTop={this.props.editorScrollTop}
                children={this.renderImageScroller()}
                cursorRow={this.state.cursorRow}
                cursorCol={this.state.cursorCol}
                startsOpaque={true}
                toSide="right"
            />
        );
    }
}

TooltipEngine.registerTooltip("imagePicker", ImagePicker);
