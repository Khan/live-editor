import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

const FullColorPicker = require("./color-picker-full.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");
const TooltipPositioner = require("./tooltip-positioner.js");
const TooltipUtils = require("./tooltip-utils.js");


const stringifyRGB = function(rgb) {
    return rgb.r + ", " + rgb.g + ", " + rgb.b;
}

// A description of general tooltip flow can be found in tooltip-engine.js
class ColorPicker extends Component {

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
        // Specific to a few tooltips
        onScrubbingStart: Function,
        onScrubbingEnd: Function,

    };

    constructor(props) {
        super(props);
        this.state = {
            closing: "",
            color: {r: 255, g: 0, b:0}
        };
        const funcs = (this.props.editorType === "ace_webpage") ? "rgb|rgba" : "background|fill|stroke|color";
        this.regex = RegExp("(\\b(?:"+funcs+")\\s*\\()[^\\)]*$");
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    handleMouseEnter = () => {
        this.setState({showFullPicker: true});
        this.props.onScrubbingStart();
    }

    handleMouseLeave = () => {
        this.setState({showFullPicker: true});
        //TODO:this.props.aceEditor.focus();
        this.props.onScrubbingEnd();
    }

    handleChange = (color, eventType) => {
        this.updateText(color, eventType);
    }

    checkEvent(event) {
        if (!this.regex.test(event.pre)) {
            return this.props.onEventCheck(false);
        }
        const functionStart = event.col - RegExp.lastMatch.length;
        const paramsStart = functionStart + RegExp.$1.length;

        const pieces = /^(.*?)(\);?|$)/.exec(event.line.slice(paramsStart));
        let body = pieces[1];
        let closing = pieces[2];
        let paramsEnd = paramsStart + body.length;
        const functionEnd = paramsStart + pieces[0].length;

        const allColors = body.split(',').map(parseFloat);
        if (allColors.length === 4 && !isNaN(allColors[3])) {
            body = body.slice(0, body.lastIndexOf(','));
            paramsEnd = paramsStart + body.length;
            closing = event.line.slice(paramsEnd, functionEnd);
        }

        const colors = body.split(',').map(function(c) {
            c = parseFloat(c);
            return (isNaN(c) ? 0 : c);
        });
        let rgb = {
            r: Math.min(colors[0] || 0, 255),
            g: Math.min(colors[1] || 0, 255),
            b: Math.min(colors[2] || 0, 255)
        };

        const aceLocation = {
            row: event.row,
            start: paramsStart,
            length: paramsEnd - paramsStart,
        };
        const maxLen = 13; // Max length of any RGB string
        const cursorCol = aceLocation.start + maxLen + closing.length;

        const name = event.line.substring(functionStart, paramsStart - 1);
        let addSemicolon =
            TooltipUtils.isAfterAssignment(event.pre.slice(0, functionStart));
        if (['fill', 'stroke', 'background'].includes(name)) {
            addSemicolon = true;
        }

        if (event.source && event.source.action === "insert" &&
            event.source.lines[0].length === 1 &&
            this.props.editorType === "ace_pjs" && this.props.autofillEnabled) {
            // Auto-close
            if (body.length === 0 && closing.length === 0) {
                closing = ")" + (addSemicolon ? ";" : "");
                this.props.onTextInsertRequest({
                    row: event.row,
                    column: functionEnd
                }, closing);
            }

            // Auto-fill
            if (body.trim().length === 0) {
                rgb = {
                    r: 255,
                    g: 0,
                    b: 0
                };
                this.updateText(rgb);
            }
        }
        this.setState({cursorRow: aceLocation.row, cursorCol, closing, rgb});
        this.props.onEventCheck(true, aceLocation);
    }

    updateText (rgb, eventType) {
        let avoidUndo = false;
        // This system ensures that when users undo, their undo stack will
        // only include the colors before and after scrubs, not mid-scrub colors
        if (eventType === 'startScrub') {
            avoidUndo = true;
            this.props.onScrubbingStart(true);
        } else if (eventType === 'midScrub') {
            avoidUndo = true;
        } else if (eventType === 'stopScrub') {
            // Update with the pre-scrub RGB, still stored in state
            this.props.onTextUpdateRequest(stringifyRGB(this.state.rgb), undefined, true);
            // Now its safe to update the RGB in state
            this.setState({rgb});
            this.props.onScrubbingEnd(true);
        } else if (eventType === 'click') {
            this.props.onScrubbingEnd(true);
            this.setState({rgb});
        }
        this.props.onTextUpdateRequest(stringifyRGB(rgb), undefined, avoidUndo);
    }

    render () {
        if (!this.props.isEnabled) {
            return null;
        }

        let colorPicker;
        if (this.state.showFullPicker) {
            colorPicker = <div className={css(styles.fullDiv)}>
                    <FullColorPicker
                        color={this.state.color}
                        onColorChange={this.handleChange}
                    />
                </div>;
        } else {
            colorPicker = <div className={css(styles.previewDiv)}>
                <div className={css(styles.colorDiv)} />
            </div>
        }
        const wrapped = <div
                            onMouseEnter={ this.handleMouseEnter}
                            onMouseLeave={ this.handleMouseLeave }>
                        {colorPicker}
                        </div>

        return <TooltipPositioner
                    children={wrapped}
                    aceEditor={this.props.aceEditor}
                    editorScrollTop={this.props.editorScrollTop}
                    cursorRow={this.state.cursorRow}
                    cursorCol={this.state.cursorCol}
                    startsOpaque={true}
                    toSide="right"
                />;

    }
}

const styles = StyleSheet.create({
    previewDiv: {
        padding: '5px',
        background: '#000',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
    },
    colorDiv: {
        width: '15px',
        height: '15px',
        borderRadius: '2px',
    },
    fullDiv: {
        borderWidth: 0,
        height: "160px",
        marginLeft: "-1px",
        marginTop: "-1px",
        overflow: "hidden",
        position: "relative",
        width: "152px"
    },
    cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
    }
});

TooltipEngine.registerTooltip("colorPicker", ColorPicker);

module.exports = ColorPicker;
