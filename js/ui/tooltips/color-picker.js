/* global ace */
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

const FullColorPicker = require("./color-picker-full.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");
const TooltipPositioner = require("./tooltip-positioner.js");
const TooltipUtils = require("./tooltip-utils.js");

// A description of general tooltip flow can be found in tooltip-engine.js
class ColorPicker extends Component {

    props: {
        // Common to all tooltips
        autofillEnabled: boolean,
        isEnabled: boolean,
        eventToCheck: Object,
        editor: Object,
        onEventCheck: Function,
        onTextInsertRequest: Function,
        onTextUpdateRequest: Function,
        onScrubbingStart: Function,
        onScrubbingEnd: Function,
        // Specific to ColorPicker
        editorType: string,

    };

    constructor(props) {
        super(props);
        this.state = {
            aceLocation: {},
            closing: "",
            currentColor: "255, 0, 0"
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
        this.props.aceEditor.focus();
        this.props.onScrubbingEnd();
    }

    handleChange = (color) => {
        this.setState({ color: color.rgb })
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
            start: paramsStart,
            length: paramsEnd - paramsStart,
            row: event.row
        };
        aceLocation.tooltipCursor = aceLocation.start + aceLocation.length + closing.length;

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

        this.updateTooltip(rgb);
        this.setState({aceLocation: aceLocation, closing: closing});
        this.props.onEventCheck(true);
    }

    updateTooltip (rgb) {
        this.setState({currentColor: rgb});
    }

    updateText (rgb, undoMode) {
        let avoidUndo = false;
        if (undoMode === 'startScrub') {
            // TODO: Next 4 lines of code needs refactoring with textAtAceLocation() in number-scrubber.js.
            // TODO: Sort out this, self, ace, to make it callable from both places, and put it in tooltip-engine.js.
            const Range = ace.require("ace/range").Range;
            const loc = this.state.aceLocation;
            const range = new Range(loc.row, loc.start, loc.row, loc.start + loc.length);
            this.originalText = this.props.aceEditor.getSession().getTextRange(range);
            this.wasReadOnly = this.props.aceEditor.getReadOnly();
            this.props.aceEditor.setReadOnly(true);
            avoidUndo = true;
        } else if (undoMode === 'midScrub') {
            avoidUndo = true;
        } else if (undoMode === 'stopScrub') {
            this.props.onTextUpdateRequest(this.state.aceLocation, this.originalText, undefined, true);
            this.props.aceEditor.setReadOnly(this.wasReadOnly);
        }
        const newText = rgb.r + ", " + rgb.g + ", " + rgb.b;
        this.props.onTextUpdateRequest(this.state.aceLocation, nextText, undefined, avoidUndo);
        // Calculate new location according to new text
        const newLocation = this.state.aceLocation;
        newLocation.length = newText.length;
        newLocation.tooltipCursor = this.state.aceLocation.start + this.state.aceLocation.length + this.state.closing.length;
        this.setState({aceLocation: newLocation});
    }


    render () {
        if (!this.props.isEnabled) {
            return null;
        }

        let colorPicker;
        if (this.state.showFullPicker) {
            colorPicker = <div className={css(styles.popover)}>
                    <FullColorPicker color={this.state.currentColor} onChange={this.handleChange}/>
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
                    className="picker"
                    children={wrapped}
                    aceEditor={this.props.aceEditor}
                    aceLocation={this.state.aceLocation}/>;

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
    popover: {
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
