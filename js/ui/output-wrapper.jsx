const i18n = require("i18n");
import React, {Component} from "react";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";

class OutputWrapper extends Component {
    props: {
        colors: Array<string>,
        execFile: string,
        imagesDir: string,
        canRecord: boolean,
    };

    render() {
        const imagesDir = this.props.imagesDir;

        let outputFrame;
        if (this.props.execFile) {
            // Extra data-src attribute to work around
            // cross-origin access policies
            outputFrame = (
                <iframe
                    id="output-frame"
                    src={this.props.execFile}
                    data-src={this.props.execFile}
                />
            );
        }

        let drawControls;
        let recordButton;
        if (this.props.canRecord) {
            const colorButtons = this.props.colors.map((color) => {
                return (
                    <button
                        key={color}
                        className="draw-color-button"
                        id={color}
                    >
                        {color}
                    </button>
                );
            });

            drawControls = (
                <div id="draw-widgets">
                    <button id="draw-clear-button" className="ui-button">
                        <span className="ui-icon-cancel" />
                    </button>
                    {colorButtons}
                </div>
            );

            recordButton = (
                <button id="record" className="pull-left">
                    {i18n._("Record")}
                </button>
            );
        }

        // This is a simple port from Handlebars
        // TODO: Add event handling in future
        return (
            <div>
                <div id="output">
                    {outputFrame}
                    <canvas
                        className="scratchpad-draw-canvas"
                        style={{display: "none"}}
                        width="400"
                        height="400"
                    />
                    <div className="tipbar-wrapper" />
                    <div className="scratchpad-canvas-loading">
                        <CircularSpinner size="large" />
                        <span className="hide-text">
                            {i18n._("Loading...")}
                        </span>
                    </div>
                </div>
                <div className="scratchpad-toolbar">
                    <div className="error-buddy-resting">
                        <div
                            className="error-buddy-happy"
                            style={{display: "none"}}
                        >
                            <img
                                src={`${imagesDir}creatures/OhNoes-Happy.png`}
                                alt={$._("Error buddy sees no errors")}
                            />
                        </div>
                        <button
                            type="button"
                            className="error-buddy-thinking"
                            style={{display: "none"}}
                        >
                            <img
                                src={`${imagesDir}creatures/OhNoes-Hmm.png`}
                                alt={$._("Error buddy sees a possible error")}
                            />
                            {/*  I18N: The CS error buddy is thinking there might
                            be an error in your code and is waiting for you
                            to fix it */}
                            {i18n._("Hmm...")}
                        </button>
                    </div>
                    <button
                        id="restart-code"
                        className="simple-button pull-right"
                    >
                        <span className="icon-refresh" />
                        {i18n._("Restart")}
                    </button>

                    {drawControls}
                    {recordButton}
                </div>
            </div>
        );
    }
}

module.exports = OutputWrapper;
