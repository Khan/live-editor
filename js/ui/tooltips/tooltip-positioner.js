import React, {Component} from "react";
const ReactDOM = require("react-dom");

const TooltipUtils = require("./tooltip-utils.js");

class TooltipPositioner extends Component {

    props: {
        className: string,
        children: Object,
        aceEditor: Object,
        aceLocation: Object
    };

    /* TODO:
                target: this.editor.session,
            event: "changeScrollTop",
            fn: () => {
                //this.updateTooltipAndPosition();
            }
    */

    render () {
        const aceEditor = this.props.aceEditor;
        const aceLocation = this.props.aceLocation;
        if (aceEditor.getReadOnly()) {
            return null;
        }
        const editorBB = aceEditor.renderer.scroller.getBoundingClientRect();
        const editorHeight = editorBB.height;
        if (typeof aceLocation.tooltipCursor !== "number") {
            aceLocation.tooltipCursor = aceLocation.start + aceLocation.length;
        }
        const coords = aceEditor.renderer.textToScreenCoordinates(
            aceLocation.row,
            aceLocation.tooltipCursor);
        const relativePos = coords.pageY - editorBB.top;
        const top = $(window).scrollTop() + coords.pageY;
        const left = coords.pageX;
        const isVisible = !(relativePos < 0 || relativePos >= editorHeight);
        const visStyle = isVisible ? "visible" : "hidden";
        const classNames = "tooltip " + (this.props.className || "");
        return <div className={classNames}
                    style={{top: top,
                            left: left,
                            visibility: visStyle
                            }}>
                    {this.props.children}
                    <div className="arrow"></div>
                </div>;
    }
}

module.exports = TooltipPositioner;