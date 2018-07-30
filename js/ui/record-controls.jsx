/* global MultiRecorder */

import React, {Component} from "react";

import RecordChunks from "../shared/record-chunks.js";

/* Builds up audio and the command chunks for our recording, coordinates
 *  the process.
 *
 *  Heads-up that bugs with recording in chunks sometimes occur due to
 *  buggy playback with the Record object, which also occurs when playing
 *  normal talkies. Recording in chunks depends on Record playback to
 *  restore state after a discard, and so any Record bugs also cause bugs in
 *  recording in chunks.
 */
class RecordControls extends Component {

    constructor(props) {
        super(props);
        this.state = {
            newChunkLabel: i18n._("Start new chunk"),
            lastChunkHTML: i18n._("Empty"),
            allChunksHTML: i18n._("Empty")
        }
        this.handleNewClick = this.handleNewClick.bind(this);
        this.handleDiscardClick = this.handleDiscardClick.bind(this);
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);

        this.disableChunkButtons(true, true, true, true, false);

        this.savedAudioRef = React.createRef();

        // TODO: Handle interaction with outside views/models via callbacks
        this.editor = this.props.editor;
        this.record = this.props.record;
        this.config = this.props.config;
        this.drawCanvas = options.drawCanvas;
        this.audioChunks = new RecordChunks();

        // TODO: Move these into state
        this.recordInProgress = false;
        this.commandChunks = [];
        this.startingCode = "";
        this.lastSavedCode = this.editor.text();
    }

    componentDidMount() {
        this.initializeRecordingAudio();
    }

    render() {
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
        return (
            <div className="scratchpad-dev-record">
                <div className="scratchpad-dev-record-buttons">
                    <Button
                        className="scratchpad-dev-new-chunk"
                        onClick={this.handleNewClick}
                        disabled={this.state.disableNew}
                    >
                        {this.state.newChunkLabel}
                    </Button>
                    <Button
                        className="scratchpad-dev-discard-chunk"
                        onClick={this.handleDiscardClick}
                        disabled={this.state.disableDiscard}
                    >
                        {i18n._("Discard Recorded Chunk")}
                    </Button>
                    <Button
                        className="scratchpad-dev-save-chunk"
                        onClick={this.handleSaveClick}
                        disabled={this.state.disableSave}
                    >
                        {i18n._("Save Recorded Chunk")}
                    </Button>
                    <Button
                        className="scratchpad-dev-refresh-editor-state"
                        onClick={this.handleRefreshClick}
                        disabled={this.state.disableRefresh}
                    >
                        {i18n._("Refresh Editor State")}
                    </Button>
                </div>
                <div className="show-audio-chunks-wrapper">
                    <p>
                        <span>{i18n._("Last audio chunk recorded:")}</span>
                        <span
                            className="last-audio-chunk"
                            dangerouslySetInnerHTML={this.state.lastChunkHTML}
                        />
                    </p>
                    <p>
                        <span>{i18n._("All saved audio chunks:")}</span>
                        <span
                            ref={this.savedAudioRef}
                            className="saved-audio-chunks"
                            dangerouslySetInnerHTML={this.state.allChunksHTML}
                        />
                    </p>
                </div>
            </div>
        );
    }

    /* Set up everything and get permission for recording. */
    initializeRecordingAudio() {
        // Start recording the presenter's audio
        this.multirecorder = new MultiRecorder({
            workerPath: this.props.workersDir + "shared/multirecorder-worker.js"
        });
        this.disableChunkButtons(false, true, true, true, true);
    }

    /* Start recording audio after a brief countdown for preparation.
     *   Leads to startRecordingCommands() being called,
     *   so no need to call startRecordingCommands manually.
     */
    startRecordingAudio() {
        this.lastSavedCode = this.editor.text();
        this.multirecorder.startRecording(1)
            .progress((seconds) => {
                this.setState({newChunkLabel: seconds + "..."});
            })
            .done(() => {
                this.disableChunkButtons(false, true, true, true, true);
                this.record.recordingAudio = true;
                this.setState({newChunkLabel: "Stop recording chunk"});
                this.startRecordingCommands();
            });
    }

    /* Stop recording audio. Called from ScratchpadUI as a result of the
     *  call to stopRecordingCommands. */
    stopRecordingAudio() {
        this.multirecorder.stopRecording()
            .done((recording) => {
                this.audioChunks.setCurrentChunk(recording);
                this.setState({lastChunkHTML: recording.createAudioPlayer()});
            });
    }

    /* Display a sound player with all the saved audio chunks. */
    showSavedAudioChunks() {
        this.getFinalAudioRecording((saved) => {
            this.setState({allChunksHTML: saved.createAudioPlayer()});
        });
    }

    /* Hack to return the duration of the saved audio, if it exists.
     *
     * Depends on the savedAudioChunkElem always being updated when we
     * add a new saved audio chunk. Note that we do not set the duration
     * right after creating the savedAudioChunkElem because the elem has
     * to load and become ready first. Between creating the elem and calling
     * this function, the hacky assumption is that it has been "long enough"
     * for the audio elem to load. This is pretty gross.
     */
    getDurationMsOfSavedAudio() {
        let durationMs = 0;
        const audioElem = savedAudioRef.current.getElementsByTagName("audio");
        if (audioElem && audioElem.length > 0) {
            durationMs = audioElem[0].duration * 1000;
        }
        return durationMs;
    }

    /* Start recording user commands. Should only be called from
     *  startRecordingAudio. */
    startRecordingCommands() {
        if (this.record.hasNoChunks()) {
            // Save the initial code state
            //this.scratchpad.get("revision")
            //    .set("code", this.editor.text());
            this.startingCode = this.editor.text();
            const newVersion = this.config.curVersion();
            // Make sure we record using the scratchpad version
            this.config.switchVersion(newVersion);
            this.record.setActualInitData({
                configVersion: newVersion,
                code: this.startingCode
            });
        }

        // Focus on the editor
        this.editor.focus();
        // Start recording
        this.record.startRecordChunk(this.getDurationMsOfSavedAudio());
        // Every chunk should start the cursor at 0, 0 and log the event.
        this.record.log("select", 0, 0);
        this.editor.setCursor({row: 0, column: 0});
    }

    /* Stop recording commands. This will trigger an event sequence that
     *    will lead to stopRecordingAudio being called as well.
     *
     * Currently assumes that when we stop recording commands, we want
     * to upload the recording.
     */
    stopRecordingCommands() {
        this.record.stopRecordChunk();
    }

    /* Return the final audio recording, with all the audio chunks stitched
     *  together. */
    getFinalAudioRecording(callback) {
        this.multirecorder.combineRecordings(this.audioChunks.getAllChunks())
            .done(callback);
    }

    /* Return the final commands recording, with all the command chunks
     *  stitched together. */
    getFinalCommandRecording() {
        return this.record.dumpRecording();
    }

    /* Start recording a new chunk, or stop recording the current chunk
     *  (the button toggles) */
    handleNewClick() {
        if (this.audioChunks.currentChunkExists()) {
            return;
        }
        if (!this.recordInProgress) {
            // Start recording an new chunk
            this.editor.editor.setReadOnly(false);
            this.recordInProgress = true;
            this.startRecordingAudio();
        } else {
            // Stop recording the current chunk
            this.recordInProgress = false;
            this.stopRecordingCommands();  // Leads to stopRecordingAudio
            this.disableChunkButtons(true, false, false, true, true);
            this.setState({newChunkLabel: "Start new chunk"});
        }
    }

    /* Discard the chunk we just recorded.
     *  Requires replaying all of the existing commands again to get the
     *  code + canvas back into the right state.
     *  Unfortunately, this is the biggest source of bugs right now since
     *  Record playback is separately buggy :/
     */
    handleDiscardClick() {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.discardCurrentChunk();
        this.record.discardRecordChunk();
        this.setState({lastChunkHTML: ""});
        this.refreshEditor();
    }

    /* Save the chunk we just recorded. */
    handleSaveClick() {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.saveCurrentChunk();
        this.record.saveRecordChunk();
        this.lastSavedCode = this.editor.text();
        this.disableChunkButtons(false, true, true, false, false);
        this.showSavedAudioChunks();
        this.setState({lastChunkHTML: ""});
    }

    handleRefreshClick() {
        this.refreshEditor();
    }

    /* Play back all the saved chunks to get back to the last
     *  saved state. */
    refreshEditor() {
        this.record.loadRecording(this.record.dumpRecording());
        this.editor.editor.setReadOnly(false);
        this.record.initData = this.record.actualInitData;
        // Add an empty command to force the Record playback to
        // keep playing until the audio track finishes playing
        if (this.record.commands) {
            this.record.commands.push([
                this.getDurationMsOfSavedAudio(), "seek"
            ]);
        }
        // Start the play head at 0
        this.record.time = 0;

        // Reset the editor
        this.editor.text(this.startingCode);
        // Clear and hide the drawing area
        this.drawCanvas.clear(true);
        this.drawCanvas.endDraw();
        this.record.seekTo(this.getDurationMsOfSavedAudio());

        // Set a timeout just to wait for all the commands to finish..
        setTimeout(() => {
            this.disableChunkButtons(false, true, true, false, false);
        }, 1000);
    }

    /*
     * Quick way to set the disabled state for lots of recording-related
     *  buttons at once.
     */
    disableChunkButtons(disableNew, disableDiscard, disableSave, disableRefresh) {
        this.setState({disableNew, disableDiscard, disableSave, disableRefresh});
    }
}

module.exports = RecordControls;