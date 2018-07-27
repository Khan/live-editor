/* eslint-disable no-var */
/* TODO: Fix the lint errors */
const _ = require("lodash");
const $ = require("jquery");

import React, {Component} from "react";
import ReactDOM from "react-dom";

const ScratchpadAutosuggest = require("../ui/autosuggest.js");
const TooltipUtils = require("./tooltips/tooltip-utils.js");

class TooltipEngine extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentTooltip: null
        };
        this.domRef = React.createRef();
        this.tooltips = {};
        this.ignore = false;

        const record = props.record;
        if (record && !record.handlers.hot) {
            record.handlers.hot = (e) => {
                if (this.state.currentTooltip) {
                    //TODO: TooltipBase.prototype.updateText.call(this.tooltip, e.hot);
                }
            };

            // disable autofill when playback or seeking has started
            ["playStarted", "runSeek"].forEach((event) => {
                record.on(event, () => {
                    this.setState({autofillEnabled: false});
                });
            });

            // enable autofill when playback or seeking has stopped
            ["playPaused", "playStopped", "seekDone"].forEach((event) => {
                record.on(event, () => {
                    this.setState({autofillEnabled: true});
                });
            });
        }
    }

    componentDidUpdate(prevProps) {
        // First check if a blurEvent means we need to disable current tooltip
        const blurTarget = this.props.blurEvent && this.props.blurEvent.target;
        const prevBlurTarget = prevProps.blurEvent && prevProps.blurEvent.target;
        if (blurTarget &&
            (!prevBlurTarget|| blurTarget !== prevBlurTarget) &&
            this.state.currentTooltip &&
            !this.domRef.current.contains(blurTarget) &&
            !this.state.modalIsOpen) {
            this.setState({currentTooltip: null});
        }
        // Now check for new events that trigger different tooltips
        const newEvent = this.props.event;
        if (this.ignore || !newEvent) {
            return;
        }
        const prevEvent = prevProps.event || {};
        var isDuplicate = (
            newEvent.col === prevEvent.col &&
            newEvent.row === prevEvent.row &&
            newEvent.line === prevEvent.line &&
            newEvent.source === prevEvent.source);
        if (isDuplicate) {
            return;
        }
        if (TooltipUtils.isWithinComment(newEvent.pre)) {
            // if selected text is within a comment,
            // hide current tooltip (if any) and return
            this.setState({currentTooltip: null});
            return;
        }
        this.setState({
            eventToCheck: newEvent,
            possibleTooltips: this.props.tooltips
        })
    }

    render() {

       const tooltipsRendered = this.props.tooltips.map((name) => {
            const childProps = Object.assign({
                    key: name,
                    isEnabled: false,
                    autofillEnabled: !this.state.autofillEnabled
                },
                this.props);
            childProps.onScrubbingStarted = () => {
                this.props.onScrubbingStarted(name);
            };
            childProps.onScrubbingEnded = () => {
                this.props.onScrubbingEnded(name);
            };
            childProps.onEventChecked = (foundMatch) => {
                if (foundMatch) {
                    this.setState({
                        currentTooltip: name,
                        possibleTooltips: []});
                } else {
                    this.setState((prevState, props) => ({
                        possibleTooltips: prevState.possibleTooltips.filter(e => e !== name)
                    }));
                }
            };
            childProps.onTextUpdateRequest = (aceLocation, newText, newSelection, avoidUndo) => {
                this.ignore = true;
                this.props.onTextUpdateRequest(aceLocation, newText, newSelection, avoidUndo);
                this.ignore = false;
            };
            childProps.onModalOpened = () => {
                this.setState({modalIsOpen: true});
            };
            childProps.onModalClosed = () => {
                this.setState({modalIsOpen: false});
            };
            if (this.state.currentTooltip === name) {
                childProps.isEnabled = true;
            }
            if (this.state.possibleTooltips && this.state.possibleTooltips[0] === name) {
                childProps.eventToCheck = this.state.eventToCheck;
            }
            this.tooltips[name] = React.createElement(
                TooltipEngine.tooltipClasses[name], childProps, null);
            return this.tooltips[name];
        });
        return <div ref={this.domRef}>{tooltipsRendered}</div>;
    }
}

TooltipEngine.tooltipClasses = {};

TooltipEngine.registerTooltip = function(name, tooltipClass) {
    TooltipEngine.tooltipClasses[name] = tooltipClass;
};

module.exports = TooltipEngine;