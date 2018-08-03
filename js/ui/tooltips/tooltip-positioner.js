import React, {Component} from "react";

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
        // TODO: We should sometimes disable if aceEditor is readonly
        // But we can't disable always because we actually SET IT to readOnly
        // during number scrubbing (if aceEditor.isReadOnly())
        // Maybe only during playback, we disable entirely?
        if (!aceLocation) {
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
                    <div className="arrow"/>
                </div>;
    }
}

module.exports = TooltipPositioner;