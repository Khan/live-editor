// TODO:
// - DOM strings
// - bind
// - ScratchpadConfig
// - Record

window.LiveEditor = Backbone.View.extend({
    dom: {
        DRAW_CANVAS: ".scratchpad-draw-canvas",
        DRAW_COLOR_BUTTONS: "#draw-widgets a.draw-color-button",
        EDITOR: ".scratchpad-editor",
        CANVAS_LOADING: ".scratchpad-canvas-loading",
        BIG_PLAY_LOADING: ".scratchpad-editor-bigplay-loading",
        BIG_PLAY_BUTTON: ".scratchpad-editor-bigplay-button",
        PLAYBAR: ".scratchpad-playbar",
        PLAYBAR_AREA: ".scratchpad-playbar-area",
        PLAYBAR_OPTIONS: ".scratchpad-playbar-options",
        PLAYBAR_LOADING: ".scratchpad-playbar .loading-msg",
        PLAYBAR_PROGRESS: ".scratchpad-playbar-progress",
        PLAYBAR_PLAY: ".scratchpad-playbar-play",
        PLAYBAR_TIMELEFT: ".scratchpad-playbar-timeleft",
        PLAYBAR_UI: ".scratchpad-playbar-play, .scratchpad-playbar-progress"
    },

    initialize: function(options) {
        this.execDir = this._qualifyURL(options.execDir);
        this.externalsDir = this._qualifyURL(options.externalsDir);
        this.imagesDir = this._qualifyURL(options.imagesDir);
        this.tmplDir = this._qualifyURL(options.tmplDir);

        this.initialCode = options.code;
        this.recordingCommands = options.recordingCommands;
        this.recordingMP3 = options.recordingMP3;

        this.render();

        this.config = new ScratchpadConfig({
            version: options.version
        });

        this.record = new ScratchpadRecord();

        // Set up the Canvas drawing area
        this.drawCanvas = new ScratchpadDrawCanvas({
            el: this.dom.DRAW_CANVAS,
            record: this.record
        });

        this.drawCanvas.on({
            // Drawing has started
            drawStarted: function() {
                // Activate the canvas
                $(this.dom.DRAW_CANVAS).show();
            },

            // Drawing has ended
            drawEnded: function() {
                // Hide the canvas
                $(this.dom.DRAW_CANVAS).hide();
            },

            // A color has been chosen
            colorSet: function(color) {
                // Deactivate all the color buttons
                $(this.dom.DRAW_COLOR_BUTTONS)
                    .removeClass("ui-state-active");

                // If a new color has actually been chosen
                if (color !== null) {
                    // Select that color and activate the button
                    $("#" + color).addClass("ui-state-active");
                }
            }
        });

        // Set up the editor
        this.editor = new ScratchpadEditor({
            el: this.dom.EDITOR,
            autoFocus: options.autoFocus,
            config: this.config,
            record: this.record
        });

        var codeOptions = { code: options.code || "" };

        this.trigger("initCode", codeOptions);
        //ScratchpadUI.stashedCode = codeOptions.code;

        var code = codeOptions.code;

        // If there is no user specific code, then we should grab the code out of
        // the revision
        //if (!this.blank && !queryString.code) {
        //    code = code || queryString.code || revision.get("code") || "";
        //}

        // Load the text into the editor
        if (code !== undefined) {
            this.editor.text(code);
            this.editor.originalCode = code;
        }

        // Focus on the editor
        this.editor.focus();

        if (options.cursor) {
            // Restore the cursor position
            this.editor.setCursor(options.cursor);

        } else {
            // Set an initial starting selection point
            this.editor.editor.selection.setSelectionRange({
                start: {row: 0, column: 0},
                end: {row: 0, column: 0}
            });
        }

        // Hide the overlay
        $("#page-overlay").hide();

        // TODO(jeresig): hotNumber initializes in the wrong position
        // this should be changed to wait until rendering of Ace is complete
        /*
        setTimeout(function() {
            this.editor.$el.hotNumber({
                reload: true,
                editor: this.editor.editor
            });
        }.bind(this), 100);
        */

        // Change the width and height of the output frame if it's been
        // changed by the user, via the query string, or in the settings
        this.updateCanvasSize(options.width, options.height);

        this.bind();
        this.setupAudio();
    },

    render: function() {
        this.$el.html(Handlebars.templates["live-editor"]({}));
    },

    bind: function() {
        var self = this;
        var $el = this.$el;
        var dom = this.dom;

        // Make sure that disabled buttons can't still be used
        $el.delegate(".simple-button.disabled, .ui-state-disabled", "click", function(e) {
            e.stopImmediatePropagation();
            return false;
        });

        // Handle the restart button
        $el.delegate("#restart-code", "click",
            this.restartCode.bind(this));

        $(window).on("message", this.listenMessages.bind(this));

        var toExec = false;

        // When the frame loads, execute the code
        $("#output-frame").on("load", function() {
            toExec = true;
            // TODO(leif): properly handle case where the user's code doesn't
            // initially compile. There is currently a race condition in which
            // the output frame is not ready for execution
        });

        // Whenever the user changes code, execute the code
        this.editor.editor.on("change", function() {
            toExec = true;
        });

        // Attempt to run the code every 100ms or so
        setInterval(function() {
            if (toExec !== null) {
                this.runCode(toExec === true ?
                    this.editor.text() :
                    toExec);

                toExec = null;
            }
        }.bind(this), 100);

        $(this.config).on("versionSwitched", function(e, version) {
            // Re-run the code after a version switch
            toExec = true;

            // Run the JSHint config
            this.config.runVersion(version, "jshint");
        }.bind(this));

        if (this.hasAudio()) {
            $el.find(dom.DRAW_CANVAS).show();
            $el.find(".overlay").show();
            $el.find(dom.BIG_PLAY_LOADING).show();
            $el.find(dom.PLAYBAR).show();
        }

        // Set up color button handling
        $el.find(dom.DRAW_COLOR_BUTTONS).each(function() {
            $(this).addClass("ui-button")
                .children().css("background", this.id);
        });

        // Set up toolbar buttons
        $el.buttonize();

        // Handle color button clicks during recording
        $el.on("buttonClick", "a.draw-color-button", function() {
            self.drawCanvas.setColor(this.id);
            self.editor.focus();
        });

        // If the user clicks the disable overlay (which is laid over
        // the editor and canvas on playback) then pause playback.
        $el.on("click", ".disable-overlay", function() {
            self.record.pausePlayback();
        });

        // Set up the playback progress bar
        $el.find(dom.PLAYBAR_PROGRESS).slider({
            range: "min",
            value: 0,
            min: 0,
            max: 100,

            // Bind events to the progress playback bar
            // When a user has started dragging the slider
            start: function() {
                // Prevent slider manipulation while recording
                if (self.record.recording) {
                    return false;
                }

                self.record.seeking = true;

                // Pause playback and remember if we were playing or were paused
                self.wasPlaying = self.record.playing;
                self.record.pausePlayback();
            },

            // While the user is dragging the slider
            slide: function(e, ui) {
                // Slider position is set in seconds
                var sliderPos = ui.value * 1000;

                // Seek the player and update the time indicator
                // Ignore values that match endTime - sometimes the
                // slider jumps and we should ignore those jumps
                // It's ok because endTime is still captured on 'change'
                if (sliderPos !== self.record.endTime()) {
                    self.updateTimeLeft(sliderPos);
                    self.seekTo(sliderPos);
                }
            },

            // When the sliding has stopped
            stop: function(e, ui) {
                self.record.seeking = false;
                self.updateTimeLeft(ui.value * 1000);

                // If we were playing when we started sliding, resume playing
                if (self.wasPlaying) {
                    // Set the timeout to give time for the events to catch up
                    // to the present -- if we start before the events have
                    // finished, the scratchpad editor code will be in a bad
                    // state. Wait roughly a second for events to settle down.
                    setTimeout(function() {
                        self.record.play();
                    }, 1000);
                }
            }
        });

        var handlePlayClick = function() {
            if (self.record.playing) {
                self.record.pausePlayback();
            } else {
                self.record.play();
            }
        };

        // Handle the play button
        $el.find(dom.PLAYBAR_PLAY)
            .off("click.play-button")
            .on("click.play-button", handlePlayClick);

        var handlePlayButton = function() {
            // Show the playback bar and hide the loading message
            $el.find(dom.PLAYBAR_LOADING).hide();
            $el.find(dom.PLAYBAR_AREA).show();

            // Handle the big play button click event
            $el.find(dom.BIG_PLAY_BUTTON)
                .off("click.big-play-button")
                .on("click.big-play-button", function() {
                $el.find(dom.BIG_PLAY_BUTTON).hide();
                handlePlayClick();
            });

            $el.find(dom.PLAYBAR_PLAY).on("click", function() {
                $el.find(dom.BIG_PLAY_BUTTON).hide();
            });

            // Hide upon interaction with the editor
            $el.find(dom.EDITOR).on("click", function() {
                $el.find(dom.BIG_PLAY_BUTTON).hide();
            });

            // Switch from loading to play
            $el.find(dom.BIG_PLAY_LOADING).hide();
            $el.find(dom.BIG_PLAY_BUTTON).show();

            self.off("readyToPlay", handlePlayButton);
        };

        // Set up all the big play button interactions
        this.on("readyToPlay", handlePlayButton);

        // Handle the clear button click during recording
        $el.on("buttonClick", "#draw-clear-button", function() {
            self.drawCanvas.clear();
            self.drawCanvas.endDraw();
            self.editor.focus();
        });

        // Handle the restart button
        $el.on("click", "#restart-code", function() {
            self.record.log({ restart: true });
        });

        // Bind the handler to start a new recording
        $el.find("#record").on("click", function() {
            self.recordHandler()
        });

        // Load the recording playback commands as well, if applicable
        if (this.recordingCommands) {
            this.record.loadRecording({
                init: {
                    code: this.initialCode
                },
                commands: this.recordingCommands
            });
        }
    },

    hasAudio: function() {
        return !!this.recordingMP3;
    },

    setupAudio: function() {
        if (!this.hasAudio()) {
            return;
        }

        var self = this;
        var rebootTimer;

        soundManager.setup({
            url: this.externalsDir + "/soundmanager/",
            debugMode: false,
            // Un-comment this to test Flash on FF:
            // debugFlash: true, preferFlash: true, useHTML5Audio: false,
            // See sm2-container in play-page.handlebars and flashblock.css
            useFlashBlock: true,
            // Sometimes when Flash is blocked or the browser is slower,
            //  soundManager will fail to initialize at first,
            //  claiming no response from the Flash file.
            // To handle that, we attempt a reboot 3 seconds after each 
            //  timeout, clearing the timer if we get an onready during
            //  that time (which happens if user un-blocks flash).
            onready: function() {
                window.clearTimeout(rebootTimer);
                self.audioInit();
            },
            ontimeout: function(error) {
                // The onready event comes pretty soon after the user
                //  clicks the flashblock, but not instantaneous, so 3
                //  seconds seems a good amount of time to give them the
                //  chance to click it before we remove it. It's possible
                //  they may have to click twice sometimes
                //  (but the second time time will work).
                window.clearTimeout(rebootTimer);
                rebootTimer = window.setTimeout(function() {
                    // Clear flashblocker divs
                    $("#sm2-container div").remove();
                    soundManager.reboot();
                }, 3000);
            }
        });
        soundManager.beginDelayedInit();
    },

    audioInit: function() {
        if (!this.hasAudio()) {
            return;
        }

        var self = this;
        var record = this.record;

        // Reset the wasPlaying tracker
        this.wasPlaying = undefined;

        // Start the play head at 0
        record.time = 0;

        this.player = soundManager.createSound({
            // SoundManager errors if no ID is passed in,
            // even though we don't use it
            // The ID should be a string starting with a letter.
            id: "sound" + (new Date()).getTime(),

            url: this.recordingMP3,

            // Load the audio automatically
            autoLoad: true,

            // While the audio is playing update the position on the progress
            // bar and update the time indicator
            whileplaying: function() {
                self.updateTimeLeft(record.currentTime());

                if (!record.seeking) {
                    // Slider takes values in seconds
                    $(self.dom.PLAYBAR_PROGRESS).slider("option", "value",
                        record.currentTime() / 1000);
                }

                record.trigger("playUpdate");
            }.bind(this),

            // Hook audio playback into Record command playback
            // Define callbacks rather than sending the function directly so
            // that the scope in the Record methods is correct.
            onplay: function() {
                record.play();
            },
            onresume: function() {
                record.play();
            },
            onpause: function() {
                record.pausePlayback();
            },
            onload: function() {
                record.durationEstimate = record.duration = this.duration;
                record.trigger("loaded");
            },
            whileloading: function() {
                record.duration = null;
                record.durationEstimate = this.durationEstimate;
                record.trigger("loading");
            },
            // When audio playback is complete, notify everyone listening
            // that playback is officially done
            onfinish: function() {
                record.trigger("playPaused");
                record.trigger("playStopped");
                record.trigger("playEnded");
            },
            onsuspend: function() {
                // Suspend happens when the audio can't be loaded automatically
                // (such is the case on iOS devices). Thus we trigger a
                // readyToPlay event anyway and let the load happen when the
                // user clicks the play button later on.
                self.trigger("readyToPlay");
            }
        });

        // Wait to start playback until we at least have some
        // bytes from the server (otherwise the player breaks)
        var checkStreaming = setInterval(function() {
            // We've loaded enough to start playing
            if (self.player && self.player.bytesLoaded > 0) {
                clearInterval(checkStreaming);
                self.trigger("readyToPlay");
            }
        }, 16);

        this.bindRecordHandlers();
    },

    bindRecordHandlers: function() {
        if (this.recordHandlersBound) {
            return;
        }

        this.recordHandlersBound = true;

        var self = this;
        var record = this.record;

        // Bind events to the Record object, to track when playback events occur
        if (this.player) {
            this.record.bind({
                loading: function() {
                    self.updateDurationDisplay();
                },

                loaded: function() {
                    // Add an empty command to force the Record playback to
                    // keep playing until the audio track finishes playing
                    if (record.commands) {
                        record.commands.push({
                            time: record.endTime()
                        });
                    }
                    self.updateDurationDisplay();
                },

                // When play has started
                playStarted: function() {
                    // If the audio player is paused, resume playing
                    if (self.player.paused) {
                        self.player.resume();

                    // Otherwise we can assume that we need to start playing from the top
                    } else if (self.player.playState === 0) {
                        self.player.play();
                    }
                },

                // Pause when recording playback pauses
                playPaused: function() {
                    self.player.pause();
                }
            });
        }

        /*
         * Bind events for tracking the time that the user has spent listening
         * to the talkie.
         */
        record.bind({
            playStarted: function() {
                // Record when the audio started (unless recording).
                if (!record.recordingAudio) {
                    self.listenStart = (new Date()).getTime();
                }
            },

            playPaused: function() {
                // Update how long the user has been listening.
                self.checkForListenedTime();
            }
        });

        /*
         * Bind events to Record (for recording and playback)
         * and to ScratchpadCanvas (for recording and playback)
         */

        record.bind({
            // Playback of a recording has begun
            playStarted: function(e, resume) {
                // Re-init if the recording version is different from
                // the scratchpad's normal version
                self.config.switchVersion(record.getVersion());

                // We're starting over so reset the editor and
                // canvas to its initial state
                if (!record.recording && !resume) {
                    // Reset the editor
                    self.editor.reset(record.initData.code, false);

                    // Clear and hide the drawing area
                    self.drawCanvas.clear(true);
                    self.drawCanvas.endDraw();
                }

                if (!record.recording) {
                    // Disable the record button during playback
                    $("#record").addClass("disabled");
                }

                // During playback disable the restart button
                $("#restart-code").addClass("disabled");

                if (!record.recording) {
                    // Turn on playback-related styling
                    $("html").addClass("playing");

                    // Show an invisible overlay that blocks interactions with the
                    // editor and canvas areas (preventing the user from being able to
                    // disturb playback)
                    $(".disable-overlay").show();
                }

                self.editor.unfold();

                // Activate the play button
                $(self.dom.PLAYBAR_PLAY)
                    .find("span")
                    .removeClass("glyphicon-play icon-play")
                    .addClass("glyphicon-pause icon-pause");
            },

            playEnded: function() {
                // Re-init if the recording version is different from
                // the scratchpad's normal version
                //self.config.switchVersion(
                    //ScratchpadUI.scratchpad.getVersion());
            },

            // Playback of a recording has been paused
            playPaused: function() {
                // Turn off playback-related styling
                $("html").removeClass("playing");

                // Disable the blocking overlay
                $(".disable-overlay").hide();

                // Allow the user to restart the code again
                $("#restart-code").removeClass("disabled");

                // Re-enable the record button after playback
                $("#record").removeClass("disabled");

                // Deactivate the play button
                $(self.dom.PLAYBAR_PLAY)
                    .find("span")
                    .addClass("glyphicon-play icon-play")
                    .removeClass("glyphicon-pause icon-pause");
            },

            // Recording has begun
            recordStarted: function() {
                // Let the output know that recording has begun
                self.postFrame({ recording: true });

                $("#draw-widgets").removeClass("hidden").show();

                // Hides the invisible overlay that blocks interactions with the
                // editor and canvas areas (preventing the user from being able to
                // disturb the recording)
                $(".disable-overlay").hide();

                // Allow the editor to be changed
                self.editor.editor.setReadOnly(false);

                // Turn off playback-related styling
                // (hides hot numbers, for example)
                $("html").removeClass("playing");

                // Reset the canvas to its initial state only if this is the
                // very first chunk we are recording.
                if (record.hasNoChunks()) {
                    self.drawCanvas.clear(true);
                    self.drawCanvas.endDraw();
                }

                // Disable the save button
                $("#save-button, #fork-button").addClass("disabled");

                // Activate the recording button
                $("#record").addClass("toggled");
            },

            // Recording has ended
            recordEnded: function() {
                // Let the output know that recording has ended
                self.postFrame({ recording: false });

                if (record.recordingAudio) {
                    self.recordView.stopRecordingAudio();
                }

                // Re-enable the save button
                $("#save-button, #fork-button").removeClass("disabled");

                // Enable playbar UI
                $(self.dom.PLAYBAR_UI).removeClass("ui-state-disabled");

                // Return the recording button to normal
                $("#record").removeClass("toggled disabled");

                // Stop any sort of user playback
                record.stopPlayback();

                // Show an invisible overlay that blocks interactions with the
                // editor and canvas areas (preventing the user from being able to
                // disturb the recording)
                $(".disable-overlay").show();

                // Turn on playback-related styling (hides hot numbers, for example)
                $("html").addClass("playing");

                // Prevent the editor from being changed
                self.editor.editor.setReadOnly(true);

                $("#draw-widgets").addClass("hidden").hide();

                // Because we are recording in chunks, do not reset the canvas to
                // its initial state, but do redraw.
                self.drawCanvas.endDraw();
                self.drawCanvas.redraw();
            }
        });

        // When a restart occurs during playback, restart the output
        record.handlers.restart = function() {
            var $restart = $("#restart-code");

            if (!$restart.hasClass("hilite")) {
                $restart.addClass("hilite green");
                setTimeout(function() {
                    $restart.removeClass("hilite green");
                }, 300);
            }

            self.postFrame({ restart: true });
        };

        // Force the recording to sync to the current time of the audio playback
        record.currentTime = function() {
            return self.player ?
                self.player.position : 0;
        };

        // Create a function for retreiving the track end time
        // Note that duration will be set to the duration estimate while
        // the track is still loading, and only set to actual duration
        // once its loaded.
        record.endTime = function() {
            return this.duration || this.durationEstimate;
        };
    },

    recordHandler: function(callback) {
        // If we're already recording, stop
        if (this.record.recording) {
            // Note: We should never hit this case when recording chunks.
            this.recordView.stopRecordingCommands();
            return;
        }

        var self = this;
        var saveCode = this.editor.text();

        // You must have some code in the editor before you start recording
        // otherwise the student will be starting with a blank editor,
        // which is confusing
        if (!saveCode) {
            callback({error: "empty"});

        } else if (this.config.curVersion() !== this.config.latestVersion()) {
            callback({error: "outdated"});

        } else if (!revision || !revision.hasAudio()) {
            this.startRecording();
            this.editor.focus();

        } else {
            callback({error: "exists"});
        }
    },

    startRecording: function() {
        this.bindRecordHandlers();

        if (!this.recordView) {
            var $el = this.$el;
            this.recordView = new ScratchpadRecordView({
                el: $el.find(".scratchpad-dev-record-row"),
                recordButton: $el.find("#record"),
                saveButton: $("#save-button"),
                record: this.record,
                editor: this.editor,
                config: this.config,
                drawCanvas: this.drawCanvas
            });
        }

        this.recordView.initializeRecordingAudio();
    },

    saveRecording: function(callback) {
        // If no command or audio recording was made, just save the results
        if (!this.record.recorded || !this.record.recordingAudio) {
            callback({error: "No recording."});
            return;
        }

        var self = this;

        var transloadit = new TransloaditXhr({
            authKey: this.transloaditAuthKey,
            templateId: "7b622b7a661855d67280551cf499aca0",
            successCb: function(results) {
                self.recordingMP3 =
                    results.mp3[0].url.replace(/^http:/, "https:");
                callback();
            },
            errorCb: callback
        });

        this.recordView.getFinalAudioRecording(function(combined) {
            transloadit.uploadFile(combined.wav);
        });
    },

    checkForListenedTime: function() {
        if (!this.record || this.record.recordingAudio || !this.listenStart) {
            return;
        }

        var curTime = (new Date()).getTime();
        var elapsed = curTime - this.listenStart;
        //ScratchpadUI.userScratchpad.addMillisecondsWatched(
        //    elapsed, Record.currentTime(), Record.endTime());
        this.listenStart = null;  // Avoid double-counting.
    },

    // We call this function multiple times, because the
    // endTime value may change as we load the file
    updateDurationDisplay: function() {
        // Do things that are dependent on knowing duration

        // This gets called if we're loading while we're playing,
        // so we need to update with the current time
        this.updateTimeLeft(this.record.currentTime());

        // Set the duration of the progress bar based upon the track duration
        // Slider position is set in seconds
        $(this.dom.PLAYBAR_PROGRESS).slider("option", "max",
            this.record.endTime() / 1000);
    },

    // Update the time left in playback of the track
    updateTimeLeft: function(time) {
        // Update the time indicator with a nicely formatted time
        $(".scratchpad-playbar-timeleft").text(
            "-" + this.formatTime(this.record.endTime() - time));
    },

    // Utility method for formatting time in minutes/seconds
    formatTime: function(time) {
        var seconds = time / 1000,
            min = Math.floor(seconds / 60),
            sec = Math.floor(seconds % 60);

        if (min < 0 || sec < 0) {
            min = 0;
            sec = 0;
        }

        return min + ":" + (sec < 10 ? "0" : "") + sec;
    },

    // Seek the player to a particular time
    seekTo: function(timeMS) {
        // Don't update the slider position when seeking
        // (since this triggers an event on the #progress element)
        if (!this.record.seeking) {
            $(this.dom.PLAYBAR_PROGRESS).slider("option", "value",
                timeMS / 1000);
        }

        // Move the recording and player positions
        if (this.record.seekTo(timeMS) !== false) {
            this.player.setPosition(timeMS);
        }
    },

    listenMessages: function(e) {
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            // Malformed JSON, we don't care about it
        }

        if (!data) {
            return;
        }

        this.trigger("update", data);

        // Hide loading overlay
        if (data.loaded) {
            this.$el.find(this.dom.CANVAS_LOADING).hide();
        }

        // Set the code in the editor
        if (data.code !== undefined) {
            this.editor.text(data.code);
            this.editor.originalCode = data.code;
            this.restartCode();
        }

        // Testing/validation code is being set
        if (data.validate != null) {
            validation = data.validate;
        }

        // Set the line visibility in the editor
        if (data.lines !== undefined) {
            this.editor.toggleGutter(data.lines);
        }

        // Restart the execution
        if (data.restart) {
            this.restartCode();
        }

        // Set the cursor in the editor
        if (data.cursor) {
            this.editor.setCursor(data.cursor);
            this.editor.setErrorHighlight(true);
        }

        // Set the focus back on the editor
        if (data.focus) {
            this.editor.focus();
        }
    },

    // Extract the origin from the embedded frame location
    postFrameOrigin: function() {
        var match = /^.*:\/\/[^\/]*/.exec(
            $("#output-frame").attr("data-src"));

        return match ?
            match[0] :
            window.location.protocol + "//" + window.location.host;
    },

    postFrame: function(data) {
        // Send the data to the frame using postMessage
        $("#output-frame")[0].contentWindow.postMessage(
            JSON.stringify(data), this.postFrameOrigin());
    },

    /*
     * Restart the code in the output frame.
     */
    restartCode: function() {
        this.postFrame({ restart: true });
    },

    /*
     * Execute some code in the output frame.
     */
    runCode: function(code) {
        var options = {
            code: code,
            version: this.config.curVersion(),
            settings: this.settings || {}, // TODO: Figure this out
            execDir: this.execDir,
            externalsDir: this.externalsDir,
            imagesDir: this.imagesDir
        };

        this.trigger("runCode", options);

        this.postFrame(options);
    },

    updateCanvasSize: function(width, height) {
        var canvasWidth = 400;
        var canvasHeight = 400;

        width = width || canvasWidth;
        height = height || canvasHeight;

        var $el = this.$el;
        var dom = this.dom;

        $el.find(dom.OUTPUT_FRAME).width(width);
        $el.find(dom.ALL_OUTPUT).height(height);

        // Set the editor height to be the same as the canvas height
        $el.find(dom.EDITOR).height(height);

        // We need to add 2 to handle the 1px border.
        var borderWidth = this.showButtons ? 2 : 0;

        // Position the canvas on the right-hand-side (floated)
        $el.find(dom.CANVAS_WRAP).width(width + borderWidth);

        var marginWidth = this.showOutput ? width + borderWidth : 0;
        var editorWrap = $el.find(dom.EDITOR_WRAP);
        editorWrap.css(this.rtl ? "margin-left" : "margin-right",
                marginWidth);

        // If the scratchpad page is being embedded then we need to set the
        // dimensions on the page, as well.
        if (this.embedded && !this.showEditor) {
            $("html").width(width + borderWidth).height(height);
        }

        var editor = this.editor.editor;

        // Force the editor to resize.
        editor.resize();

        // Set the font size. Scale the font size down when the size of the
        // editor is too small.
        editor.setFontSize(editorWrap.width() < 400 ? "12px" : "14px");

        this.trigger("canvasSizeUpdated", {
            width: width,
            height: height
        });
    },

    _qualifyURL: function(url){
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    }
});