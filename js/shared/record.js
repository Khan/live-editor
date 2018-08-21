import { Model } from "backbone-model";

// Note: All time measurements are handled in milliseconds
const ScratchpadRecordModel = Model.extend({
    initialize: function() {
        // Instance variables, not attributes.
        // Recording handlers, handle both recording and playback
        this.handlers = {
            // Used for continuing playback until the audio is done
            seek: function() {}
        };

        // Cache recording state for seeking
        this.seekCache = {};
        this.seekCacheInterval = 20;
        this.initData = {};

        // Collection of caching functionality implemented by content
        // producers (for example: ScratchpadCanvas and ScratchpadEditor)
        this.seekCachers = {};

        // Set up for recording in chunks
        // Array of command arrays for each chunk. Only holds chunks that
        // have been saved.
        this.allSavedCommands = [];
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
        this._resetForNewChunk();
        this.record(audioOffset);

        function timeOfLastCommand() {
            var lastTime = 0;
            if (this.allSavedCommands && this.allSavedCommands.length > 0) {
                if (_.last(this.allSavedCommands).length > 0) {
                    lastTime = _.last(_.last(this.allSavedCommands))[0];
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
        var multiplier = 1;
        if (commands && commands.commands && commands.init) {
            this.initData = commands.init;
            multiplier = commands.multiplier;
            commands = commands.commands;
        }
        // Multiply the command timestamp by the multiplier
        if (multiplier !== 1) {
            for (var i = 0; i < commands.length; i++) {
                commands[i][0] = Math.floor(commands[i][0] * multiplier);
            }
        }
        this.commands = commands;
        // Make no more than 50 seek caches
        this.seekCacheInterval = Math.ceil(commands.length / 50);
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

    // Seek to a given position in the playback, executing all the
    // commands in the interim
    seekTo: function(time) {
        // Initialize and seek to the desired position
        this.pauseTime = (new Date()).getTime();
        this.playStart = this.pauseTime - time;

        // Set an initial cache before seeking
        this.cache(-1 * this.seekCacheInterval);

        var seekPos = this.commands.length - 1;

        // Locate the command that we're up to
        for (var i = 0; i < this.commands.length; i++) {
            if (this.commands[i][0] > time) {
                seekPos = i - 1;
                break;
            }
        }

        // The play position is always the next command time to check
        // (see the logic in playInterval)
        this.playPos = seekPos + 1;

        this.trigger("runSeek");

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

        // Execute commands and build cache, bringing state up to current
        for (var i = cacheOffset; i <= seekPos; i++) {
            this.runCommand(this.commands[i]);
            this.cache(i);
        }

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
                this.commands.length === 0) {
            return;
        }

        // Initialize state before playback
        this.trigger("playInit");

        var startTime = (this.playStart ? this.pauseTime - this.playStart : 0);

        this.playing = true;
        this.playPos = this.playPos || 0;
        this.playStart = (new Date).getTime() - startTime;

        this.playInterval = setInterval(_.bind(function() {
            var evt = this.commands[this.playPos];

            while (evt && this.currentTime() >= evt[0]) {
                this.runCommand(evt);
                this.cache(this.playPos);

                this.playPos += 1;

                if (this.playPos === this.commands.length) {
                    this.stopPlayback(true);
                    this.trigger("playEnded");
                    return;
                }

                evt = this.commands[this.playPos];
            }
        }, this), 5);

        this.trigger("playStarted", startTime > 0);

        // Make sure everything is reset before playing
        this.seekTo(startTime);
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
    },

    reset: function() {
        this.initData = {};
        this.commands = [];
        this.seekCache = {};

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;
        this.playing = false;
        this.recording = false;
        this.recorded = false;
    },

    currentTime: function() {
        return (new Date).getTime() - this.playStart;
    },

    runCommand: function(evt) {
        // Commands are stored in the format:
        // [time, name, arguments...]
        var handler = this.handlers[evt[1]];

        if (handler) {
            return handler.apply(this.handlers, evt.slice(2));
        }

        console.error("Command not found:", evt[1]);
    },

    log: function() {
        if (!this.playing && this.recording && this.commands) {
            // Commands are stored in the format:
            // [time, name, arguments...]

            // By only rechecking the time when asynchrynous code executes we guarantee that
            // all event which occured as part of the same action
            // (and therefore the same paint) have the same timestamp. Meaning they will be
            // together during playback and not allow paints of intermediate states.
            // Specifically this applies to replace (which is a remove and an insert back to back)
            if (this.synchronizedTime === undefined) {
                this.synchronizedTime = Math.floor((new Date).getTime() - this.startTime);
                setTimeout(function() {
                    this.synchronizedTime = undefined;
                }.bind(this), 0);
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this.synchronizedTime);
            this.commands.push(args);
            return true;
        }
    },

    pauseLog: function() {
        this.oldRecording = this.recording;
        this.recording = false;
    },

    resumeLog: function() {
        this.recording = this.oldRecording;
    }
});

export default ScratchpadRecordModel;