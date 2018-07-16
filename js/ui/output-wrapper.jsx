import React, {Component} from 'react';

class OutputWrapper extends Component {

    render() {
        const imagesDir = this.props.imagesDir;

        let outputFrame;
        if (this.props.execFile) {
            // Extra data-src attribute to work around
            // cross-origin access policies
            outputFrame = <iframe id="output-frame"
                src={this.props.execFile}
                data-src={this.props.execFile}></iframe>
        }

        let drawControls, recordButton;
        if (this.props.canRecord) {
            const colorButtons = this.props.colors.map((color) => {
                <a key={color} href="" className="draw-color-button" id={color}>
                    <span></span>
                </a>
            });

            drawControls = <div id="draw-widgets">
                <a href="" id="draw-clear-button" className="ui-button">
                    <span className="ui-icon-cancel"></span>
                </a>
                {colorButtons}
            </div>;

            recordButton = <button id="record" className="pull-left">
                {i18n._("Record")}
            </button>;
        };

        // This is a simple port from Handlebars
        // TODO: Add event handling in future
        return (
            <div>
                <div id="output">
                    {outputFrame}
                    <canvas className="scratchpad-draw-canvas" style={{display: "none"}}
                        width="400" height="400"/>
                    <div className="tipbar-wrapper"/>
                    <div className="scratchpad-canvas-loading">
                        <img src={`${imagesDir}/spinner-large.gif`}/>
                        <span className="hide-text">
                            {i18n._("Loading...")}
                        </span>
                    </div>
                </div>
                <div className="scratchpad-toolbar">
                    <div className="error-buddy-resting">
                        <div className="error-buddy-happy" style={{display: "none"}}>
                            <img src={`${imagesDir}/creatures/OhNoes-Happy.png`}/>
                        </div>
                        <a className="error-buddy-thinking" style={{display: "none"}} href="javascript:void(0)">
                            <img src={`${imagesDir}/creatures/OhNoes-Hmm.png`}/>
                            {/*  I18N: The CS error buddy is thinking there might
                            be an error in your code and is waiting for you
                            to fix it */}
                            {i18n._("Hmm...")}
                        </a>
                    </div>
                    <button id="restart-code"
                        className="simple-button pull-right">
                        <span className="icon-refresh"></span>
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