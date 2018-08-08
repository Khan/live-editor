import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

import Utils from "../../shared/utils.js";

class TooltipPositioner extends Component {

    props: {
        aceEditor: Object,
        children: Object,
        cursorRow: number,
        cursorCol: number,
        editorScrollTop: number,
        startsOpaque: boolean,
        toSide: string, // What side of the text is the tooltip on? top/right
    };

    static defaultProps = {
        toSide: "top"
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if (this.props.cursorRow && this.props.cursorCol) {
            this.calculatePosition();
        }
    }

    componentDidUpdate(prevProps) {
        // We only need to re-calculate if the row/col/scrollTop changed
        if (this.props.cursorCol !== prevProps.cursorCol ||
            this.props.cursorRow !== prevProps.cursorRow ||
            this.props.editorScrollTop !== prevProps.editorScrollTop) {
            this.calculatePosition();
        }
    }

    // Cancel default selection on tooltips
    handleMouseDown(e) {
        e.preventDefault();
    }

    calculatePosition() {
        const editorBB = this.props.aceEditor.renderer.scroller.getBoundingClientRect();
        const editorHeight = editorBB.height;
        const coords = this.props.aceEditor.renderer.textToScreenCoordinates(
            this.props.cursorRow,
            this.props.cursorCol);
        const relativePos = coords.pageY - editorBB.top;
        const top = Utils.getScrollTop() + coords.pageY;
        const left = coords.pageX;
        const isVisible = !(relativePos < 0 || relativePos >= editorHeight);
        this.setState({top, left, isVisible})
    }

    render () {
        // TODO: We should sometimes disable if aceEditor is readonly
        // But we can't disable always because we actually SET IT to readOnly
        // during number scrubbing (if aceEditor.isReadOnly())
        // Maybe only during playback, we disable entirely?

        if (this.state.top === undefined) {
            return null;
        }
        const visStyle = this.state.isVisible ? "visible" : "hidden";
        const tooltipStyle = styles[this.props.toSide + "Tooltip"];
        const opacityStyle = this.props.startsOpaque && styles.tooltipOpaque;
        const arrowSideStyle = styles[this.props.toSide + "TooltipArrow"];
        return <div className={css(styles.tooltip, tooltipStyle, opacityStyle)}
                    style={{top: this.state.top,
                            left: this.state.left,
                            visibility: visStyle
                            }}
                    onMouseDown={this.handleMouseDown}
                >
                    {this.props.children}
                    <div className={css(styles.arrow, arrowSideStyle)}/>
                </div>;
    }
}
const styles = StyleSheet.create({
    tooltip: {
        background: "black",
        borderRadius: "7px",
        boxShadow: "0px 0px 8px #000000",
        boxSizing: "content-box",
        display: "block",
        fontSize: "12px",
        lineHeight: "12px",
        opacity: 0.2,
        padding: "5px",
        position: "absolute",
        tapHighlightColor: "rgba(0,0,0,0)",
        userSelect: "none",
        width: "auto",
        zIndex: "100",
        ":hover": {
            opacity: 1
        }
    },
    tooltipOpaque: {
        opacity: 1
    },
    arrow: {
        position: "absolute"
    },
    topTooltip: {
        marginLeft: "-28px",
        marginTop: "-37px",
    },
    topTooltipArrow: {
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderTop: "8px solid black",
        bottom: "-8px",
        left: "21px",
    },
    rightTooltip: {
        marginLeft: "13px",
        marginTop: "-5px"
    },
    rightTooltipArrow: {
        borderBottom: "8px solid transparent",
        borderLeft: "none",
        borderRight: "8px solid black",
        borderTop: "8px solid transparent",
        bottom: "auto",
        left: "-7px",
        top: "5px"
    },
});

module.exports = TooltipPositioner;