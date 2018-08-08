import _ from "lodash";
import React, {Component} from "react";

import * as tooltipUtils from "./tooltips/tooltip-utils.js";

export default class TooltipEngine extends Component {

    props: {
        aceEditor: Object,
        record: Object,
        event: Object,
        blurEvent: Object,
        tooltips: Array,
        onScrubbingStart: Function,
        onScrubbingEnd: Function,
        onTextUpdateRequest: Function,
        onTooltipChange: Function,
    }

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

        const isVisible = (e) => {
            return !!( e.offsetWidth || e.offsetHeight || e.getClientRects().length );
        }

        if (blurTarget &&
            (!prevBlurTarget|| blurTarget !== prevBlurTarget) &&
            this.state.currentTooltip &&
            !this.domRef.current.contains(blurTarget) &&
            (!this.state.modalRef ||
            !this.state.modalRef.current ||
            !isVisible(this.state.modalRef.current))) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({currentTooltip: null});
        }
        // Now check for new events that trigger different tooltips
        const newEvent = this.props.event;
        if (this.ignore || !newEvent) {
            return;
        }
        const prevEvent = prevProps.event || {};
        const isDuplicate = (
            newEvent.col === prevEvent.col &&
            newEvent.row === prevEvent.row &&
            newEvent.line === prevEvent.line &&
            newEvent.source === prevEvent.source);
        if (isDuplicate) {
            return;
        }
        if (tooltipUtils.isWithinComment(newEvent.pre)) {
            // if selected text is within a comment,
            // hide current tooltip (if any) and return
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({currentTooltip: null});
            return;
        }
        // eslint-disable-next-line react/no-did-update-set-state
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
            childProps.onScrubbingStart = (readOnly) => {
                this.props.onScrubbingStart(name, readOnly);
            };
            childProps.onScrubbingEnd = (readOnly) => {
                this.props.onScrubbingEnd(name, readOnly);
            };
            childProps.onEventCheck = (foundMatch, aceLocation) => {
                if (foundMatch) {
                    this.setState({
                        currentTooltip: name,
                        possibleTooltips: []});
                    this.props.onTooltipChange(name, aceLocation);
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
            childProps.onModalRefCreate = (ref) => {
                this.setState({modalRef: ref});
            }
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