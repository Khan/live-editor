import React, {Component} from 'react';

class RecordControls extends Component {

    render() {
        // This is just a very simple port from Handlebars
        // If KA/anyone decides to re-enable recording in the future,
        // this should be ported to fully utilize React
        return (
            <div className="scratchpad-dev-record">
                <div className="scratchpad-dev-record-buttons">
                    <button className="scratchpad-dev-new-chunk">
                        {$._("Start New Chunk")}
                    </button>
                    <button className="scratchpad-dev-discard-chunk">
                        {$._("Discard Recorded Chunk")}
                    </button>
                    <button className="scratchpad-dev-save-chunk">
                        {$._("Save Recorded Chunk")}
                    </button>
                    <button className="scratchpad-dev-refresh-editor-state">
                        {$._("Refresh Editor State")}
                    </button>
                </div>
                <div className="show-audio-chunks-wrapper">
                    <p>
                        <span>{$._("Last audio chunk recorded:")}</span>
                        <span className="last-audio-chunk">
                            {$._("Empty")}
                        </span>
                    </p>
                    <p>
                        <span>{$._("All saved audio chunks:")}</span>
                        <span className="saved-audio-chunks">
                        {$._("Empty")}
                        </span>
                    </p>
                </div>
            </div>
        );
    }
}

module.exports = RecordControls;