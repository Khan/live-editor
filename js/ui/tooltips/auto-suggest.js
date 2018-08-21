import React, {Component} from "react";

import AutoSuggestData from "../autosuggest-data.js";
import TooltipEngine from "../tooltip-engine.js";

import AutoSuggestPopup from "./auto-suggest-popup.js";
import TooltipPositioner from "./tooltip-positioner.js";
import * as tooltipUtils from "./tooltip-utils.js";

// A description of general tooltip flow can be found in tooltip-engine.js
export default class AutoSuggest extends Component {
    props: {
        // Common to all tooltips
        autofillEnabled: boolean,
        isEnabled: boolean,
        editorScrollTop: number,
        eventToCheck: Object,
        aceEditor: Object,
        onEventCheck: Function,
        onLoseFocus: Function,
    };

    constructor(props) {
        super(props);
        this.state = {
            aceLocation: {},
            isHidden: false,
            mouseDown: false,
        };
        this.regex = RegExp(/(\b[^\d\W][\w]*)\s*(\({1}\s*\){1})*\s*([^\]]*)$/);
        this.handleDocMouseDown = this.handleDocMouseDown.bind(this);
        this.handleDocMouseUp = this.handleDocMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keyup", this.handleKeyup);
        document.addEventListener("mousedown", this.handleDocMouseDown);
        document.addEventListener("mouseup", this.handleDocMouseUp);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.eventToCheck) {
            this.checkEvent(this.props.eventToCheck);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.handleKeyup);
        document.removeEventListener("mousedown", this.handleDocMouseDown);
        document.removeEventListener("mouseup", this.handleDocMouseUp);
    }

    checkEvent(event) {
        // STOPSHIP(pamela): Disable while playing
        // TODO: Update this to support auto-suggest tooltip for inner functions
        // passed as params, like fill(color()).
        if (
            !this.regex.test(event.pre) ||
            !tooltipUtils.isInParenthesis(RegExp.$3)
        ) {
            return this.props.onEventCheck(false);
        }
        // Ignore changeCursor events when the mouse button is down,
        // and ignore click events (as we give those to number-scrubber)
        if (
            (event.source &&
                event.source.type === "changeCursor" &&
                this.state.mouseDown) ||
            (event.source && event.source.action === "click")
        ) {
            return this.props.onEventCheck(false);
        }
        const functionName = RegExp.$1;
        const paramsToCursor = RegExp.$3;
        const functionData = this.lookupParams(functionName);
        if (!functionData) {
            return this.props.onEventCheck(false);
        }
        const aceLocation = {
            start: event.col,
            length: 0,
            row: event.row,
        };
        const cursorCol = event.col;
        this.props.onEventCheck(true, aceLocation);
        this.setState({
            cursorRow: aceLocation.row,
            cursorCol,
            isHidden: false,
            functionData,
            paramsToCursor,
        });
    }

    /**
     * Returns the data for the specified function name
     * @param lookup The function to lookup
     */
    lookupParams(lookupFunction) {
        // This only looks through functions now, it could be extended
        // in future to look up keywords
        return AutoSuggestData._pjsFunctions.whitelist.find((func) => {
            return func.name.split("(")[0] === lookupFunction;
        });
    }

    handleDocMouseDown() {
        this.setState({mouseDown: true});
        this.props.onLoseFocus();
    }

    handleDocMouseUp() {
        this.setState({mouseDown: true});
    }

    handleKeyUp(e) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            this.setState({isHidden: true});
        }
    }

    handleMouseDown() {
        this.setState({isHidden: true});
    }

    render() {
        // STOPSHIP(pamela): Hide this tooltip while playing
        if (!this.props.isEnabled || this.state.isHidden) {
            return null;
        }
        const popup = (
            <AutoSuggestPopup
                functionData={this.state.functionData}
                paramsToCursor={this.state.paramsToCursor}
                onMouseDown={this.handleMouseDown}
            />
        );
        return (
            <TooltipPositioner
                children={popup}
                aceEditor={this.props.aceEditor}
                editorScrollTop={this.props.editorScrollTop}
                cursorRow={this.state.cursorRow}
                cursorCol={this.state.cursorCol}
                startsOpaque={true}
            />
        );
    }
}

TooltipEngine.registerTooltip("autoSuggest", AutoSuggest);
