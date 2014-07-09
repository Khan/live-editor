// Note: All time measurements are handled in milliseconds


/* The main consequence of this being a Model instead of a global object
 * is scope -- calling record.play as a method needs to still be bound such that
 * 'this' is the Backbone model. I.e.:
 *       setTimeout(model.record, 30) = BAD, will break
 *       setTimeout(function() {model.record;}, 30) = FINE, will work.
 * There may be other places that need to be updated so the scope is correct.
 */
window.ScratchpadRecord = Backbone.Model.extend({

    initialize: function() {
        // Instance variables, not attributes.
        // Recording handlers, handle both recording and playback
        this.handlers = {};
        // Cache recording state for seeking
        this.seekCache = {};
        this.seekCacheInterval = 20;
        this.initData = {};
        this.seekTime = null;
        // Collection of caching functionality implemented by content
        // producers (for example: ScratchpadCanvas and ScratchpadEditor)
        this.seekCachers = {};

        // Set up for recording in chunks
        // Array of command arrays for each chunk. Only holds chunks that
        // have been saved.
        this.allSavedCommands = [];
        this.actualInitData;  // The init data from the first chunk
    },

    setActualInitData: function(actualData) {
        this.actualInitData = actualData;
    },

    hasNoChunks: function() {
        return _.isEmpty(this.allSavedCommands);
    },

    numChunksSaved: function() {
        return this.allSavedCommands.length;
    },

    startRecordChunk: function(audioOffset) {
        // Set the audio offset to the audioOffset passed in, unless the
        // most recent command recorded (ie, in the previous chunk) has
        // a timestamp later than audioOffset (which really should not
        // usually happen) -- in that case, use the command's timestamp.
        audioOffset = Math.max(audioOffset, timeOfLastCommand());
        Record._resetForNewChunk();
        this.record(audioOffset);

        function timeOfLastCommand() {
            var lastTime = 0;
            if (this.allSavedCommands && this.allSavedCommands.length > 0) {
                if (_.last(this.allSavedCommands).length > 0) {
                    lastTime = _.last(_.last(this.allSavedCommands)).time;
                }
            }
            return lastTime;
        }
    },

    stopRecordChunk: function() {
        this.stopRecord();
    },

    saveRecordChunk: function() {
        this.allSavedCommands.push(this.commands);
        // Set the offset as the time that the chunk we just recorded goes up
        // to, counting from the start of the full recording (full duration)
        this._resetForNewChunk();
    },


    discardRecordChunk: function() {
        // Reset the current stop time to be the same as the duration up to
        // the start of the chunk we just recorded (not the end since
        // we discard the chunk just recorded)
        this._resetForNewChunk();
    },

    _resetForNewChunk: function() {
        this.commands = [];
        this.initData = {};
    },

    /*
     * Offset in milliseconds allows us to pause/resume recording at a certain
     *  offset into the program. See Record.log for how startTime is used
     *  to compute the current time in the recording for each command.
     */
    record: function(offset) {
        offset = offset || 0;
        if (!this.recording) {
            this.commands = [];
            this.recording = true;
            this.startTime = (new Date).getTime() - offset;
            this.trigger("recordStarted");
        }
    },

    stopRecord: function() {
        if (this.recording) {
            this.recording = false;
            this.recorded = true;
            this.trigger("recordEnded");
        }
    },

    loadRecording: function(commands) {
        if (commands && commands.commands && commands.init) {
            this.initData = commands.init;
            commands = commands.commands;
        }
        this.commands = commands;
    },

    dumpRecording: function() {
        if (this.actualInitData) {
            // Update for recording in chunks.
            this.initData = this.actualInitData;

            // Combine all of the command arrays into one array.
            this.commands = _.flatten(this.allSavedCommands, true);
        }

        return {
            init: this.initData,
            commands: this.commands
        };
    },

    getVersion: function() {
        return this.initData.configVersion || 0;
    },

    // Position the seek cursor and make sure that the seek render
    // occurs within the next 200ms
    seekTo: function(time) {
        if (this.seekRunning) {
            return false;
        }

        // Initialize and seek to the desired position
        this.seekRunning = true;
        this.seekTime = time;
        this.pauseTime = (new Date()).getTime();
        this.playStart = this.pauseTime - time;

        if (!this.seekInterval) {
            // Make sure that we don't attempt to seek too frequently
            this.seekInterval = setInterval(_.bind(function() {
                if (this.seekTime !== null) {
                    this.runSeek(this.seekTime);
                    this.seekTime = null;
                }
            }, this), 200);
        }
    },

    // Execute the actual seek commands
    runSeek: function(time) {
        this.trigger("runSeek", time);

        // Set an initial cache before seeking
        this.cache(-1 * this.seekCacheInterval);

        var seekPos = this.commands.length;

        // Locate the command that we're up to
        for (var i = 0; i < this.commands.length; i++) {
            if (this.commands[i].time > time) {
                seekPos = i - 1;
                break;
            }
        }

        // Attempt to locate the most recent seek cache
        var lastCache = Math.floor(seekPos / this.seekCacheInterval);
        var foundCache = null;
        var cacheOffset = 0;

        for (var i = lastCache; i >= 0; i--) {
            if (this.seekCache[i]) {
                foundCache = i;
                break;
            }
        }

        // Restore from the most recent cache
        if (foundCache !== null) {
            this.cacheRestore(foundCache);
            cacheOffset = (foundCache * this.seekCacheInterval) + 1;

        // Otherwise restore from the first cache state
        // The first cache is at -1 as the cache at position 0 is the
        // cache of running the first command
        } else {
            this.cacheRestore(-1 * this.seekCacheInterval);
        }

        this.runSeekCommands(cacheOffset, seekPos);

        // The play position is always the next command time to check
        // (see the logic in playInterval)
        this.playPos = seekPos + 1;
    },

    runSeekCommands: function(offset, seekPos) {
        // Execute commands and build cache, bringing state up to current
        for (var i = offset; i <= seekPos; i++) {
            var async = (_.bind(function(i) {
                var cmd = this.commands[i];

                if (cmd) {
                    this.runCommand(cmd);

                    if (cmd.copy || cmd.cut || cmd.paste || cmd.key) {
                        setTimeout(_.bind(function() {
                            this.cache(i);
                            this.runSeekCommands(i + 1, seekPos);
                        }, this), 1);

                        return true;
                    }
                    
                    this.cache(i);
                }
            }, this))(i);

            // If we run an async command, the setTimeout takes care of all
            // remaining seek commands, so stop.
            if (async) {
                return;
            }
        }

        this.seekRunning = false;

        this.trigger("seekDone");
    },



    // Cache the result of the specified command
    // (Specified using the position of the command)
    cache: function(cmdPos) {
        // Start to build new caches, only if we should
        if (cmdPos % this.seekCacheInterval === 0) {
            var cachePos = Math.floor(cmdPos / this.seekCacheInterval);
            if (!this.seekCache[cachePos]) {
                this.seekCache[cachePos] = {};

                // Run all the seek cachers and cache the current data
                _.each(this.seekCachers, function(seekCacher, namespace) {
                    this.seekCache[cachePos][namespace] =
                        seekCacher.getState();
                }, this);
            }
        }
    },

    // Restore the state from a seek cache
    // (specified using the seek cache number)
    cacheRestore: function(cachePos) {
        if (this.seekCache[cachePos]) {
            // Run all the seek cachers and restore the current data
            _.each(this.seekCachers, function(seekCacher, namespace) {
                var cacheData = this.seekCache[cachePos][namespace];

                if (cacheData) {
                    seekCacher.restoreState(cacheData);
                }
            }, this);
        }
    },

    play: function() {
        // Don't play if we're already playing or recording
        if (this.recording || this.playing || !this.commands ||
                this.seekRunning || this.commands.length === 0) {
            return;
        }

        // Initialize state before playback
        this.trigger("playInit");

        var startTime = (this.playStart ? this.pauseTime - this.playStart : 0);

        // Make sure everything is reset before playing
        this.seekTo(startTime);

        this.playing = true;
        this.playPos = this.playPos || 0;
        this.playStart = (new Date).getTime() - startTime;

        this.playInterval = setInterval(_.bind(function() {
            if (this.seekRunning) {
                // Never run play commands while a seek is still running its
                // own commands, otherwise they'll stomp on each other.
                return;
            }

            var evt = this.commands[this.playPos];

            if (evt && this.currentTime() >= evt.time) {
                this.runCommand(evt);
                this.cache(this.playPos);

                if (++this.playPos === this.commands.length) {
                    this.stopPlayback(true);
                    this.trigger("playEnded");
                }
            }
        }, this), 1);

        this.trigger("playStarted", startTime > 0);
    },

    pausePlayback: function(end) {
        clearInterval(this.playInterval);

        this.playing = false;
        this.playInterval = null;
        this.pauseTime = (new Date).getTime();

        if (!end) {
            this.trigger("playPaused");
        }
    },

    stopPlayback: function(end) {
        this.pausePlayback(end);

        if (!end) {
            this.trigger("playStopped");
        }

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;

        clearInterval(this.seekInterval);
        this.seekInterval = null;
    },

    reset: function() {
        this.initData = {};
        this.commands = [];
        this.seekCache = {};

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;
        this.seekTime = null;
        this.playing = false;
        this.recording = false;
        this.recorded = false;

        clearInterval(this.seekInterval);
        this.seekInterval = null;
    },

    currentTime: function() {
        return (new Date).getTime() - this.playStart;
    },

    runCommand: function(evt) {
        if (evt) {
            for (var handler in this.handlers) {
                if (typeof evt[handler] !== "undefined") {
                    try {
                        return this.handlers[handler](evt);
                    } catch (e) {
                        // These errors sometimes happen if the Record
                        // playback state gets corrupted.
                        KAConsole.log("Scratchpad playback error: ");
                        KAConsole.log(e);
                    }
                }
            }
        }
    },

    log: function(e) {
        if (!this.playing && this.recording && this.commands) {
            e.time = (new Date).getTime() - this.startTime;
            this.commands.push(e);
            return true;
        }
    },

    pauseLog: function() {
        this.oldRecording = this.recording;
        this.recording = false;
    },

    resumeLog: function() {
        this.recording = this.oldRecording;
    },

    dump: function() {
        if (this.commands) {
            return this.commands.map(function(item) {
                var ret = [];

                for (var prop in item) {
                    if (prop !== "time") {
                        ret.push(prop + ":" + item[prop]);
                    }
                }

                return ret.join();
            }).join();
        }
    }
});

/* Manages the audio chunks as we build up this recording. */
window.ScratchpadAudioChunks = Backbone.Model.extend({

    initialize: function(options) {
        // The saved audio chunks
        this.audioChunks = [];
        // The current chunk we have not yet saved or discarded
        this.currentChunk = null;
    },

    setCurrentChunk: function(recording) {
        this.currentChunk = recording;
    },

    currentChunkExists: function() {
        return !_.isNull(this.currentChunk);
    },

    startNewChunk: function() {
        this.currentChunk = null;
    },

    discardCurrentChunk: function() {
        this.currentChunk = null;
    },

    saveCurrentChunk: function() {
        if (!this.currentChunk) {
            //KAConsole.log("Tried to save non-existent current chunk");
            return;
        }
        this.audioChunks.push(this.currentChunk);
        this.currentChunk = null;
    },

    /* Return the array of audio chunks, not yet stitched together. */
    getAllChunks: function() {
        return this.audioChunks;
    }
});


/* Builds up audio and the command chunks for our recording, coordinates
 *  the process.
 *
 *  Heads-up that bugs with recording in chunks sometimes occur due to
 *  buggy playback with the Record object, which also occurs when playing
 *  normal talkies. Recording in chunks depends on Record playback to
 *  restore state after a discard, and so any Record bugs also cause bugs in
 *  recording in chunks.
 */
window.ScratchpadRecordView = Backbone.View.extend({
    //template: Templates.get("scratchpads.dev-record"),

    initialize: function(options) {
        //this.$el.html(this.template());
        this.$recordButton = this.options.recordButton;
        this.$finalSaveButton = this.options.saveButton;
        this.scratchpad = this.options.scratchpad;
        this.audioChunks = new ScratchpadAudioChunks();
        this.recordInProgress = false;
        this.commandChunks = [];
        this.startingCode = "";
        this.$editor = this.options.editor;
        this.lastSavedCode = ScratchpadUI.editor.text();
        this.$lastAudioChunkElem = this.$el.find(".last-audio-chunk");
        // Note: $savedAudioChunksElem HAS to be displayed in order for us to
        //  get the duration. Hack -- look at other ways to get the duration.
        this.$savedAudioChunksElem = this.$el.find(".saved-audio-chunks");
        this.initializeButtons();
    },

    initializeButtons: function() {
        // Set up the buttons
        this.$newChunkButton = this.$el.find(".scratchpad-dev-new-chunk");
        this.$discardChunkButton =
            this.$el.find(".scratchpad-dev-discard-chunk");
        this.$saveChunkButton = this.$el.find(".scratchpad-dev-save-chunk");
        this.$refreshEditorButton =
            this.$el.find(".scratchpad-dev-refresh-editor-state");
        // Disable chunk buttons to start
        this.disableChunkButtons(true, true, true, true, false);
        // Bind event listeners
        this.$newChunkButton.on("click", _.bind(this.newChunk, this));
        this.$discardChunkButton.on("click", _.bind(this.discardChunk, this));
        this.$saveChunkButton.on("click", _.bind(this.saveChunk, this));
        this.$refreshEditorButton.on("click", _.bind(this.refreshEditor, this));
    },

    /* Set up everything and get permission for recording. */
    initializeRecordingAudio: function() {
        // Start recording the presenter's audio
        this.multirecorder = new MultiRecorder(
            {workerPath: "../../third_party/javascript-khansrc/multirecorderjs/multirecorder-worker.js"});
        this.$recordButton.text("Use the chunks (and give permission)");
        this.setButtonDisableStatus(this.$recordButton, true);
        this.disableChunkButtons(false, true, true, true, true);
    },

    /* Start recording audio after a brief countdown for preparation.
     *   Leads to startRecordingCommands() being called,
     *   so no need to call startRecordingCommands manually.
     */
    startRecordingAudio: function() {
        this.lastSavedCode = ScratchpadUI.editor.text();
        this.multirecorder.startRecording(1)
            .progress(_.bind(function(seconds) {
                this.$newChunkButton.text(seconds + "...");
            }, this))
            .done(_.bind(function() {
                this.disableChunkButtons(false, true, true, true, true);
                Record.recordingAudio = true;
                this.$newChunkButton.html("Stop recording chunk");
                this.startRecordingCommands();
            }, this))
            .fail(function(error) {
                KAConsole.error(error);
            });
    },

    /* Stop recording audio. Called from ScratchpadUI as a result of the
     *  call to stopRecordingCommands. */
    stopRecordingAudio: function() {
        this.multirecorder.stopRecording()
            .done(_.bind(function(recording) {
                this.audioChunks.setCurrentChunk(recording);
                this.$lastAudioChunkElem.html(recording.createAudioPlayer());
            }, this));
    },

    /* Display a sound player with all the saved audio chunks. */
    showSavedAudioChunks: function() {
        this.getFinalAudioRecording(_.bind(function(saved) {
            this.$savedAudioChunksElem.html(saved.createAudioPlayer());
        }, this));
    },


    /* Hack to return the duration of the saved audio, if it exists.
     *
     * Depends on the savedAudioChunkElem always being updated when we
     * add a new saved audio chunk. Note that we do not set the duration
     * right after creating the savedAudioChunkElem because the elem has
     * to load and become ready first. Between creating the elem and calling
     * this function, the hacky assumption is that it has been "long enough"
     * for the audio elem to load. This is pretty gross.
     */
    getDurationMsOfSavedAudio: function() {
        var durationMs = 0;
        var audioElem = $(this.$savedAudioChunksElem).find("audio");
        if (audioElem && audioElem.length > 0) {
            durationMs = audioElem[0].duration * 1000;
        }
        return durationMs;
    },

    /* Start recording user commands. Should only be called from
     *  startRecordingAudio. */
    startRecordingCommands: function() {
        if (Record.hasNoChunks()) {
            // Save the initial code state
            this.scratchpad.get("revision")
                .set("code", ScratchpadUI.editor.text());
            this.startingCode = ScratchpadUI.editor.text();
            var newVersion = this.scratchpad.getVersion();
            // Make sure we record using the scratchpad version
            ScratchpadConfig.switchVersion(newVersion);
            Record.setActualInitData({
                configVersion: newVersion,
                code: this.startingCode
            });
        }

        // Focus on the editor
        ScratchpadUI.editor.focus();
        // Start recording
        Record.startRecordChunk(this.getDurationMsOfSavedAudio());
        // Every chunk should start the cursor at 0, 0 and log the event.
        Record.log({start: {column: 0, row: 0}});
        ScratchpadUI.editor.setCursor({row: 0, column: 0});
    },

    /* Stop recording commands. This will trigger an event sequence that
     *    will lead to stopRecordingAudio being called as well.
     *
     * Currently assumes that when we stop recording commands, we want
     * to upload the recording.
     */
    stopRecordingCommands: function() {
        Record.stopRecordChunk();
    },

    /* Return the final audio recording, with all the audio chunks stitched
     *  together. */
    getFinalAudioRecording: function(callback) {
        this.multirecorder.combineRecordings(this.audioChunks.getAllChunks())
            .done(callback);
    },

    /* Return the final commands recording, with all the command chunks
     *  stitched together. */
    getFinalCommandRecording: function() {
        return Record.dumpRecording();
    },

    /* Start recording a new chunk, or stop recording the current chunk
     *  (the button toggles) */
    newChunk: function() {
        if (this.audioChunks.currentChunkExists()) {
            return;
        }
        if (!this.recordInProgress) {
            // Start recording an new chunk
            ScratchpadUI.editor.editor.setReadOnly(false);
            this.recordInProgress = true;
            this.startRecordingAudio();
        } else {
            // Stop recording the current chunk
            this.recordInProgress = false;
            this.stopRecordingCommands();  // Leads to stopRecordingAudio
            this.disableChunkButtons(true, false, false, true, true);
            this.$newChunkButton.html("Start new chunk");
        }
    },

    /* Discard the chunk we just recorded.
     *  Requires replaying all of the existing commands again to get the
     *  code + canvas back into the right state.
     *  Unfortunately, this is the biggest source of bugs right now since
     *  Record playback is separately buggy :/
     */
    discardChunk: function(evt) {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.discardCurrentChunk();
        Record.discardRecordChunk();
        this.$lastAudioChunkElem.empty();
        this.refreshEditor();
    },

    /* Save the chunk we just recorded. */
    saveChunk: function(evt) {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.saveCurrentChunk();
        Record.saveRecordChunk();
        this.lastSavedCode = ScratchpadUI.editor.text();
        this.disableChunkButtons(false, true, true, false, false);
        this.showSavedAudioChunks();
        this.$lastAudioChunkElem.empty();
    },

    /* Play back all the saved chunks to get back to the last
     *  saved state. */
    refreshEditor: function(evt) {
        Record.loadRecording(Record.dumpRecording());
        ScratchpadUI.editor.editor.setReadOnly(false);
        Record.initData = Record.actualInitData;
        // Add an empty command to force the Record playback to
        // keep playing until the audio track finishes playing
        if (Record.commands) {
            Record.commands.push({ time: this.getDurationMsOfSavedAudio() });
        }
        // Start the play head at 0
        Record.time = 0;

        // Reset the editor
        ScratchpadUI.editor.text(this.startingCode);
        // Clear and hide the drawing area
        ScratchpadUI.drawCanvas.clear(true);
        ScratchpadUI.drawCanvas.endDraw();
        Record.runSeek(this.getDurationMsOfSavedAudio());

        // Set a timeout just to wait for all the commands to finish..
        setTimeout(_.bind(function() {
            this.disableChunkButtons(false, true, true, false, false);
        }, this), 1000);
    },

    /*
     * Quick way to set the disabled state for lots of recording-related
     *  buttons at once.
     */
    disableChunkButtons: function(newBool, discardBool, saveBool, refreshBool, finalBool) {
        this.setButtonDisableStatus(this.$newChunkButton, newBool);
        this.setButtonDisableStatus(this.$discardChunkButton, discardBool);
        this.setButtonDisableStatus(this.$saveChunkButton, saveBool);
        this.setButtonDisableStatus(this.$refreshEditorButton, refreshBool);
        this.setButtonDisableStatus(this.$finalSaveButton, finalBool);
    },

    /* Updated the button to the disabledStatus, if defined. */
    setButtonDisableStatus: function($button, disabledStatus) {
        if (!_.isUndefined(disabledStatus)) {
            $button.prop("disabled", disabledStatus);
        }
    }

});
