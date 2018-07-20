import React, {Component} from "react";

/*
A comment on the chunk buttons:

These buttons let you record in chunks, rather than
having to get everything right in one go. There is no
way to edit a chunk once you save it.
Also, because command playback has some weird bugs, sometimes
discarding a chunk might get you in a bad state.
If that happens, just hit "Refresh editor state" and hope for
the best. This system is brittle -- just record
everything in one chunk if you want the old system back.

DO NOT TOUCH THE EDITOR (or the canvas) between
chunks -- especially not the cursor or selection.

If you do, you might destroy your whole recording -- try
hitting "Refresh Editor State" to recover.

TODO: Display comments in UI, or improve recording flow.
*/

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
                        <span className="last-audio-chunk">{$._("Empty")}</span>
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
