import React, {Component} from 'react';

class EditorWrapper extends Component {

    render() {
        const imagesDir = this.props.imagesDir;
        return (
            <div>
                <div className="scratchpad-editor-tabs">
                    <div id="scratchpad-code-editor-tab" className="scratchpad-editor-tab">
                        <div className="scratchpad-editor scratchpad-ace-editor"/>
                        <div className="overlay disable-overlay" style={{display: "none"}}/>
                        <div className="scratchpad-editor-bigplay-loading" style={{display: "none"}}>
                            <img src={`${imagesDir}/spinner-large.gif`}/>
                            <span className="hide-text">
                                { i18n._("Loading...") }
                            </span>
                        </div>

                        {/* Needed for Flash fallback for SoundManager2 */}
                        <div id="sm2-container">
                            {i18n._("Enable Flash to load audio:")}
                            <br/>
                        </div>

                        <button className="scratchpad-editor-bigplay-button" style={{display: "none"}}>
                            <span className="icon-play"></span>
                            <span className="hide-text">{i18n._("Play")}</span>
                        </button>
                    </div>
                </div>
                <div className="scratchpad-toolbar">
                    <div className="scratchpad-playbar" style={{display: "none"}}>
                        <div className="scratchpad-playbar-area" style={{display: "none"}}>
                            <button
                                className="primary scratchpad-playbar-play"
                                type="button">
                                <span className="icon-play"></span>
                            </button>
                            <div className="scratchpad-playbar-progress"></div>
                            <span className="scratchpad-playbar-timeleft"></span>
                        </div>
                        <div className="loading-msg">
                            {i18n._("Loading audio...")}
                        </div>
                    </div>
                    <div className="scratchpad-debugger"></div>
                </div>
                <div className="scratchpad-toolbar scratchpad-dev-record-row" style={{display: "none"}}/>
            </div>
        );
    }
}

module.exports = EditorWrapper;