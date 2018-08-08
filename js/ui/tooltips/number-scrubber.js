/* global ace */
import Draggable from "react-draggable";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

import TooltipEngine from "../../ui/tooltip-engine.js";

import TooltipPositioner from "./tooltip-positioner.js";

// Returns the number of decimal places shown in a string representation of
// a number.
const decimalCount = function(strNumber) {
    const decIndex = strNumber.indexOf(".");
    return decIndex === -1 ? 0 : strNumber.length - (decIndex + 1);
};

// A description of general tooltip flow can be found in tooltip-engine.js
// NOTE(pamela): This used to support a "clickOnly" mode, used by the
//  StructuredBlocks editor, where people could click to increase/decrease.
//  I have removed that mode since we're no longer maintaining StructuredBlocks,
//  but if we ever bring that back, please look at the code before my change
//  and implement accordingly.
export default class NumberScrubber extends Component {
    props: {
        // Common to all tooltips
        autofillEnabled: boolean,
        isEnabled: boolean,
        editorScrollTop: number,
        eventToCheck: Object,
        aceEditor: Object,
        onEventCheck: Function,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        onScrubbingStart: Function,
        onScrubbingEnd: Function,
    };

    constructor(props) {
        super(props);
        this.state = {
            aceLocation: {},
        };
        this.scrubberRef = React.createRef();
        this.handleLeftClick = this.handleLeftClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragStop = this.handleDragStop.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    getTextAtAceLocation() {
        const editor = this.props.aceEditor;
        const Range = ace.require("ace/range").Range;
        const loc = this.state.aceLocation;
        const range = new Range(
            loc.row,
            loc.start,
            loc.row,
            loc.start + loc.length,
        );
        return editor.getSession().getTextRange(range);
    }

    // This function returns different values if alt and/or shift are
    // pressed: alt -> -1, shift -> 1, alt + shift -> 0.
    // If there no modifier keys are pressed, the result is based on the
    // number of decimal places.
    getExponent(evt) {
        let exp = -this.state.decimals;
        if (evt.shiftKey && evt.altKey) {
            exp = 0;
        } else if (evt.shiftKey) {
            exp = 1;
        } else if (evt.altKey) {
            exp = -1;
        }
        return exp;
    }

    handleDragStart(evt) {
        this.setState({isDragging: true});
        this.props.onScrubbingStart(true);
    }

    handleDrag(evt, data) {
        const dX = data.x;
        const exp = this.getExponent(evt);
        const decimals = Math.max(0, -exp);
        const intermediateValue =
            this.state.value + Math.round(dX / 2.0) * Math.pow(10, exp);
        this.requestTextUpdate(intermediateValue.toFixed(decimals), true);
        this.setState({decimals, intermediateValue});
    }

    handleDragStop(evt, data) {
        const exp = this.getExponent(evt);
        const decimals = Math.max(0, -exp);
        if (this.state.intermediateValue) {
            // First put back the original value from
            // before we started the un-undo manipulations:
            this.requestTextUpdate(this.state.value, true);
            // Then make one undo-able replacement placing the drag's final value:
            this.requestTextUpdate(
                this.state.intermediateValue.toFixed(decimals),
            );
            this.updateTooltip(this.state.intermediateValue, decimals);
        }
        // TODO? use a timeout because $leftButton.click and $rightButton.click
        // are called after stop
        this.setState({
            isDragging: false,
            value: this.state.intermediateValue,
            decimals,
        });
        this.props.onScrubbingEnd(true);
    }

    handleSingleClick(num, evt) {
        const exp = evt ? this.getExponent(evt) : -this.state.decimals;
        const decimals = Math.max(0, -exp);
        const intermediateValue = this.state.value + num * Math.pow(10, exp);
        this.requestTextUpdate(intermediateValue.toFixed(decimals));
        this.updateTooltip(intermediateValue, decimals);
    }

    handleLeftClick(evt) {
        if (!this.state.isDragging) {
            this.handleSingleClick(-1, evt);
        }
    }

    handleRightClick(evt) {
        if (!this.state.isDragging) {
            this.handleSingleClick(1, evt);
        }
    }

    checkEvent(event) {
        // Does not match letters followed by numbers "<h1", "var val2", etc.
        // Matches numbers in any other context. The cursor can be anywhere from just ahead
        // of the (optional) leading negative to just after the last digit.
        if (
            /[a-zA-Z]\d+$/.test(event.pre) ||
            (/[a-zA-Z]$/.test(event.pre) && /^\d/.test(event.post)) ||
            !(/\d$/.test(event.pre) || /^-?\d/.test(event.post))
        ) {
            return this.props.onEventCheck(false);
        }
        const reversedPre = event.pre
            .split("")
            .reverse()
            .join("");
        const numberStart =
            event.col - /^[\d.]*(-(?!\s*\w))?/.exec(reversedPre)[0].length;
        const number = /^-?[\d.]+/.exec(event.line.slice(numberStart))[0];
        const aceLocation = {
            start: numberStart,
            length: number.length,
            row: event.row,
        };
        this.updateTooltip(parseFloat(number), decimalCount(number));
        this.props.onEventCheck(true, aceLocation);
        this.setState({cursorRow: aceLocation.row, cursorCol: event.col});
    }

    requestTextUpdate(newText, avoidUndo) {
        this.props.onTextUpdateRequest(newText, null, avoidUndo);
    }

    updateTooltip(value, decimals) {
        this.setState({
            value: value,
            decimals: decimals <= 5 ? decimals : 5,
            dragPosition: 0,
        });
    }

    render() {
        if (!this.props.isEnabled) {
            return null;
        }

        const svgProps = {
            width: "12px",
            height: "12px",
            viewBox: "-25, -25, 150, 150",
        };
        const leftArrow = (
            <svg {...svgProps}>
                <polygon points="0,50 100,0 100, 100" fill="white" />
            </svg>
        );
        const rightArrow = (
            <svg {...svgProps}>
                <polygon points="0,50 100,0 100, 100" fill="white" />
            </svg>
        );
        const centerDiamond = (
            <svg {...svgProps}>
                <polygon points="50,0 100,50 50,100 0,50" fill="white" />
            </svg>
        );

        const scrubber = (
            <div className={css(styles.handle)} ref={this.scrubberRef}>
                <span
                    className={css(styles.button)}
                    role="button"
                    onClick={this.handleLeftClick}
                >
                    {leftArrow}
                </span>
                <span>{centerDiamond}</span>
                <span
                    className={css(styles.button, styles.flippedArrow)}
                    role="button"
                    onClick={this.handleRightClick}
                >
                    {rightArrow}
                </span>
            </div>
        );

        const posProp = this.state.isDragging ? null : {position: {x: 0, y: 0}};
        const draggableScrubber = (
            <Draggable
                axis="x"
                onStart={this.handleDragStart}
                onDrag={this.handleDrag}
                onStop={this.handleDragStop}
                {...posProp}
            >
                {scrubber}
            </Draggable>
        );

        return (
            <TooltipPositioner
                className={css(styles.scrubber)}
                children={draggableScrubber}
                aceEditor={this.props.aceEditor}
                editorScrollTop={this.props.editorScrollTop}
                cursorRow={this.state.cursorRow}
                cursorCol={this.state.cursorCol}
            />
        );
    }
}

TooltipEngine.registerTooltip("numberScrubber", NumberScrubber);

const styles = StyleSheet.create({
    scrubber: {
        borderRadius: "10px",
        cursor: "ew-resize",
        tapHighlightColor: "rgba(0,0,0,0)",
        userSelect: "none",
    },
    handle: {
        background: "black",
        borderRadius: "10px",
        color: "white",
        textAlign: "center",
        fontSize: "12px",
        lineHeight: "12px",
        cursor: "ew-resize",
        userSelect: "none",
        tapHighlightColor: "rgba(0,0,0,0)",
        zIndex: 100,
    },
    button: {
        cursor: "pointer",
    },
    flippedArrow: {
        display: "inline-block",
        transform: "scaleX(-1.0)",
    },
});