/* eslint-disable max-lines, no-var, no-useless-escape, eqeqeq, prefer-spread,
   prefer-const, no-extra-bind, no-undef, one-var
*/
/* TODO: Fix the lint errors */
const _ = require("lodash");

import classNames from 'classnames';
import React, {Component} from "react";
import ReactDOM from "react-dom";
import {StyleSheet, css} from "aphrodite/no-important";

const i18n = require("i18n");
const EditorSide = require("./ui/editor-side.jsx");
const ErrorBuddy = require("./ui/tipbar.jsx");
const ErrorBuddyMini = require("./ui/errorbuddy-mini.jsx");
const OutputSide = require("./ui/output-side.jsx");
const RestartButton = require("./ui/restart-button.jsx");
const ScratchpadDebugger = require("./ui/debugger.js");
const ScratchpadConfig = require("./shared/config.js");
const ScratchpadDrawCanvas = require("./ui/canvas.js");
const ScratchpadRecordModel = require("./shared/record.js");
const ScratchpadRecordView = require("./ui/record.js");
const Structured = require("../external/structuredjs/structured.js");

import "../css/ui/flashblock.css";
import { throws } from "assert";

// TODO(kevinb) remove after challenges have been converted to use i18n._
$._ = i18n._;

// This adds html tags around quoted lines so they can be formatted
const prettify = function(str) {
    str = str.split("\"");
    var htmlString = "";
    for (var i = 0; i < str.length; i++) {
        if (str[i].length === 0) {
            continue;
        }

        if (i % 2 === 0) {
            //regular text
            htmlString += "<span class=\"text\">" + str[i] + "</span>";
        } else {
            // text in quotes
            htmlString += "<span class=\"quote\">" + str[i] + "</span>";
        }
    }
    return htmlString;
};

const clean = function(str) {
    return String(str).replace(/</g, "&lt;");
};

const qualifyURL = function(url) {
    var a = document.createElement("a");
    a.href = url;
    return a.href;
};

const editors = {};

class LiveEditor extends Component {
    props: {
        hideEditor: boolean,
        version: string,
        execFile: string
    };

    errorCursorRow: null
    showError: null

    dom: {
        DRAW_CANVAS: ".scratchpad-draw-canvas",
        DRAW_COLOR_BUTTONS: "#draw-widgets a.draw-color-button",
        CANVAS_WRAP: ".scratchpad-canvas-wrap",
        EDITOR: ".scratchpad-editor",
        BIG_PLAY_LOADING: ".scratchpad-editor-bigplay-loading",
        BIG_PLAY_BUTTON: ".scratchpad-editor-bigplay-button",
        PLAYBAR: ".scratchpad-playbar",
        PLAYBAR_AREA: ".scratchpad-playbar-area",
        PLAYBAR_OPTIONS: ".scratchpad-playbar-options",
        PLAYBAR_LOADING: ".scratchpad-playbar .loading-msg",
        PLAYBAR_PROGRESS: ".scratchpad-playbar-progress",
        PLAYBAR_PLAY: ".scratchpad-playbar-play",
        PLAYBAR_TIMELEFT: ".scratchpad-playbar-timeleft",
        PLAYBAR_UI: ".scratchpad-playbar-play, .scratchpad-playbar-progress",
        OUTPUT_FRAME: "#output-frame",
        OUTPUT_DIV: "#output",
        ALL_OUTPUT: "#output, #output-frame",
        GUTTER_ERROR: ".ace_error"
    }

    mouseCommands: ["move", "over", "out", "down", "up"]
    colors: ["black", "red", "orange", "green", "blue", "lightblue", "violet"]

    defaultOutputWidth: 400
    defaultOutputHeight: 400

    constructor(props) {
        super(props);
        this.state = {
            // This is the current error state of Oh Noes Guy.
            // His state can be one of:
            // - happy (no errors)
            // - thinking (the ambigous state where there may be an error in what the
            //             typer is currently typing)
            // - error (there is an error that we want to display prominently)
            errorState: "happy",
            errors: [],
            // Start off by showing any errors in popup error buddy
            showErrorPopup: true,
            // This is set to true once we have our first result back from
            //  the output window
            outputLoaded: false,
            // Enables the restart button
            enableRestart: true,
            // Shows the restart button at all
            showRestart: false,
            // Animates the restart dynamically (talkthrough-triggered)
            animateRestartNow: false
        };

        // This stops us from sending any updates until the current run has finished
        // Reset output state to clean as a part of the frame load handler
        this.outputState = "dirty";

        // Process all the URLs
        this.workersDir = qualifyURL(props.workersDir);
        this.externalsDir = qualifyURL(props.externalsDir);
        this.imagesDir = qualifyURL(props.imagesDir);
        this.soundsDir = props.soundsDir;
        this.execFile = props.execFile ? qualifyURL(props.execFile) : "";
        this.jshintFile = qualifyURL(props.jshintFile ||
            this.externalsDir + "jshint/jshint.js");
        this.redirectUrl = props.redirectUrl;

        this.outputType = props.outputType || "";
        this.editorType = props.editorType || Object.keys(editors)[0];
        this.editorHeight = props.editorHeight;
        this.initialCode = props.code;
        this.initialVersion = props.version;
        this.settings = props.settings;
        this.validation = props.validation;

        this.recordingCommands = props.recordingCommands;
        this.recordingMP3 = props.recordingMP3;
        this.recordingInit = props.recordingInit || {
            code: this.initialCode,
            version: this.initialVersion
        };

        this.transloaditTemplate = props.transloaditTemplate;
        this.transloaditAuthKey = props.transloaditAuthKey;

        this.noLint = false;

        this.render();

        this.config = new ScratchpadConfig({
            version: this.props.version
        });

        // We no longer load in record, since that functionality isn't
        // currently needed nor supported
        if (this.canRecord()) {
            this.record = new ScratchpadRecordModel();
        }

        if (props.enableLoopProtect != null) {
            this.enableLoopProtect = props.enableLoopProtect;
        } else {
            this.enableLoopProtect = true;
        }

        this.aceWrapperRef = React.createRef();
        this.iframeRef = React.createRef();

        this.handleRecordClick = this.handleRecordClick.bind(this);
        this.handleMessages = this.handleMessages.bind(this);
        this.handleMiniClick = this.handleMiniClick.bind(this);
        this.handleRestartClick = this.handleRestartClick.bind(this);
        this.handleChangeDebounced =  _.debounce(this.handleChange, 300)
        //TODO: this.bind();
        //TODO:this.setupAudio();
    }

    componentDidMount() {
        // Change the width and height of the output frame if it's been
        // changed by the user, via the query string, or in the settings
        //TODO:this.updateCanvasSize(this.props.width, this.props.height);

        window.addEventListener("message", this.handleMessages);

        // This function will fire once after each synchronous block which
        // changes the cursor or the current selection.
        // We use it for tag highlighting in webpages.
        const cursorDirty = () => {
            if (this.outputState !== "clean" ) {
                // This will fire after markDirty() itself gets a chance to start a new run
                // So it will just keep resetting itself until one run comes back and there are
                // no changes waiting
                self.once("runDone", cursorDirty);
            } else {
                setTimeout(function() {
                    if (self.editor.getSelectionIndices) {
                        self.postFrame({
                            setCursor: self.editor.getSelectionIndices()
                        });
                    }
                    self.editor.once("changeCursor", cursorDirty);
                }, 0);
            }
            // This makes sure that we pop up the error
            // if the user changed the cursor to a new line
            setTimeout(function() {
                self.maybeShowErrors();
            }, 0);
        };
        //this.aceWrapperRef.once("changeCursor", cursorDirty);

        this.config.on("versionSwitched", (e, version) => {
            // Re-run the code after a version switch
            this.markDirty();

            // Run the JSHint config
            this.config.runVersion(version, "jshint");
        });
    }

    /**
     * Returns a boolean determining if the user's code has some non-deterministic
     * code running (and thus should have the restart button shown).
     */
    shouldShowRestart() {
        const currentCode = this.aceWrapperRef.current.text();

        if (this.props.outputType === "webpage") {
            if (currentCode.match(/<script>/) || currentCode.match(/animation:/)) {
                return true;
            }
        } else if (this.props.outputType === "pjs") {
            var checks = [
                "function(){var draw = function(){};}",
                "function(){draw = function(){};}",
                "function(){var mousePressed = function(){};}",
                "function(){var mouseReleased = function(){};}",
                "function(){var mouseMoved = function(){};}",
                "function(){var mouseClicked = function(){};}",
                "function(){var keyPressed = function(){};}",
                "function(){mousePressed = function(){};}",
                "function(){mouseReleased = function(){};}",
                "function(){mouseMoved = function(){};}",
                "function(){mouseClicked = function(){};}",
                "function(){keyPressed = function(){};}",
                "function(){random();}",
                "function(){var _ = new Random();}",
                "function(){var _ = random();}",
            ];

            try {
                // Don't worry, StructuredJS caches the parsing of the code and
                // the structure tests!
                for (var i = 0; i < checks.length; i++) {
                    if (Structured.match(currentCode, checks[i])) {
                        return true;
                    }
                }
                return false;
            } catch (e) {
                // Don't have to do anything on syntax error, just ignore it
                // and leave the restart button in its current state.
            }
        }

        return false;
    };

    renderErrorBuddy () {
        const props = {
            errors: this.state.errors,
            errorNum: this.state.errorNum,
            isHidden: !this.state.showErrorPopup,
            onErrorShowRequested: (error) => {
                this.aceWrapperRef.current.setCursor(error);
                this.aceWrapperRef.current.setErrorHighlight(true);
            },
            onDismissed: (error) => {
                this.setState({
                    errorState: "thinking",
                    showErrorPopup: false
                });
            }
        }
        return <ErrorBuddy {...props}/>
    }

    renderOutputSide() {
        const props = {
            execFile: this.execFile,
            iframeRef: this.iframeRef,
            sandboxProps: this.props.sandboxProps,
            imagesDir: this.imagesDir,
            colors: this.colors,
            canRecord: this.canRecord(),
            isResizable: this.isResizable(),
            hideEditor: this.props.hideEditor,
            outputLoaded: this.state.outputLoaded,
            errorBuddy: this.renderErrorBuddy(),
            onOutputFrameLoaded: () => {
                this.outputState = "clean";
                this.markDirty();
            }
        }
        return <OutputSide {...props} />;
    }

    renderAceEditorWrapper() {
        const props = {
            ref: this.aceWrapperRef,
            code: this.props.code,
            autoFocus: this.props.autoFocus,
            cursor: this.props.cursor,
            config: this.config,
            record: this.props.record,
            imagesDir: this.props.imagesDir,
            soundsDir: this.props.soundsDir,
            externalsDir: this.props.externalsDir,
            workersDir: this.props.workersDir,
            type: this.editorType,
            onChanged: () => {
                // Whenever the user changes code, execute the code
                this.markDirty();
                this.handleChangeDebounced();
            },
            onUserChanged: (code) => {
                if (!this.record ||
                    (!this.record.recording && !this.record.playing)) {
                    this.props.onUserChanged && this.props.onUserChanged(code);
                }
            },
            onChangedCursor: () => {
                // TODO: this.markDirty();
            },
            onClicked: () => {

            }
        };

        // linting in the webpage environment generates slowparseResults which
        // is used in the runCode step so skipping linting won't work in that
        // environment without some more work
        if (this.editorType === "ace_pjs") {
            props.onScrubbingStarted = () => {
                this.noLint = true;
            };
            props.onScrubbingEnded = () => {
                this.noLint = false;
            };
        }

        return React.createElement(editors[this.editorType], props);
    }

    renderEditorSide () {
        const extraProps = {
            aceEditorWrapper: this.renderAceEditorWrapper(),
            onEditorCreated: (aceWrapperRef) => {
                this.aceWrapperRef = aceWrapperRef;
            },
            onDisableClicked: () => {
                // If the user clicks the disable overlay (which is laid over
                // the editor and canvas on playback) then pause playback.
                this.record.pausePlayback();
            },
            leftComponents: [
                <ErrorBuddyMini
                    key="errorBuddyMini"
                    imagesDir={this.imagesDir}
                    errorState={this.state.errorState}
                    isHidden={this.state.showErrorPopup}
                    onClick={this.handleMiniClick}
                />
            ],
            rightComponents: [
                <RestartButton
                    key="restartButton"
                    labelText={this.props.restartLabel}
                    isDisabled={!this.state.enableRestart}
                    isHidden={!this.state.showRestart}
                    onClick={this.handleRestartClick}
                    animateNow={this.animateRestartNow}
                />
            ]
        }
        const props = Object.assign({}, this.props, extraProps)
        return <EditorSide {...props}/>;
    }

    initResizing () {
        if (this.isResizable()) {
            var minCanvas = 400;
            var minEditor = 410;

            var $handle = $(this.dom.DRAG_HANDLE);
            var $outputFrame = $(this.dom.OUTPUT_FRAME);
            var $scratchpadWrap = $(this.dom.SCRATCHPAD_WRAP);

            $handle.on("mousedown", function(e) {
                var initialPX = e.pageX;
                var initialWidth = $outputFrame.width();
                var drag = _.throttle(function(e) {
                    var delta = e.pageX - initialPX;
                    // Because I care <3
                    if ($scratchpadWrap.css("direction") === "rtl") {
                        delta = -delta;
                    }
                    var width = initialWidth - delta;
                    var totalWidth = $scratchpadWrap.width();
                    if (width < minCanvas) {
                        width = minCanvas;
                    } else if (totalWidth - width < minEditor) {
                        width = totalWidth - minEditor;
                    }
                    ScratchpadUI.liveEditor.updateCanvasSize(width);
                    return false;
                }, 30);

                $handle.addClass("dragging");

                // Stop the iframe from stealing events during drag
                $outputFrame.css("pointer-events", "none");

                $(document).on("mousemove", drag);
                $(document).one("mouseup", function() {
                    $(document).off("mousemove", drag);
                    $handle.removeClass("dragging");

                    $outputFrame.css("pointer-events", "auto");
                });
            });

            $handle.show();
        }
    }

    renderDragHandle() {
        if (!this.isResizable()) {
            return null;
        }

        return (
            <div
                className={classNames(
                    "scratchpad-drag-handle",
                    css(
                        styles.dragHandle,
                        this.props.hideEditor && styles.editorHidden,
                    ),
                )}
            />
        );
    }

    renderRecordButton() {
        if (!this.canRecord()) {
            return null;
        }
        return <button id="record" onClick={this.handleRecordClick}>
            {i18n._("Record a talkthrough")}
            </button>;
    }

    renderPlaybackBar() {
        return null;
    }

    render() {
        return (
            <div
                className={classNames(
                    "scratchpad-wrap",
                    this.props.execFile ? "" : "no-output",
                    css(
                        styles.wrap,
                        this.props.hideEditor &&
                            isResizable &&
                            styles.wrapNoEditorResizable,
                    ),
                )}
            >
            <div
                className={css(
                    styles.wrapOuter,
                    !this.props.hideEditor &&
                        styles.wrapBorder,
                )}
            >
                <div className={css(styles.wrapInner)}>
                    {this.renderEditorSide()}
                    {this.renderDragHandle()}
                    {this.renderOutputSide()}
                </div>
                {this.renderPlaybackBar()}
                {this.renderRecordButton()}
            </div>
        </div>
        );
    }

    bind () {


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

        // Handle the gutter errors
        $el.on("click", this.dom.GUTTER_ERROR, () => {
            var lineNum = parseInt($(this).text(), 10);
            this.setErrorState(this.gutterDecorations[lineNum]);
        });

        // Load the recording playback commands as well, if applicable
        if (this.recordingCommands) {
            // Check the filename to see if a multiplier is specified,
            // of the form audio_x1.3.mp3, which means it's 1.3x as slow
            var url = this.recordingMP3;
            var matches = /_x(1.\d+).mp3/.exec(url);
            var multiplier = parseFloat(matches && matches[1]) || 1;
            this.record.loadRecording({
                init: this.recordingInit,
                commands: this.recordingCommands,
                multiplier: multiplier
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleMessages);
    }

    canRecord () {
        return this.transloaditAuthKey && this.transloaditTemplate;
    }

    isResizable() {
        return this.editorType === "ace_pjs" || this.editorType === "ace_webpage";
    }

    hasAudio() {
        return !!this.recordingMP3;
    }

    setupAudio () {
        if (!this.hasAudio()) {
            return;
        }

        var self = this;
        var rebootTimer;

        soundManager.setup({
            url: this.externalsDir + "SoundManager2/swf/",
            debugMode: false,
            // Un-comment this to test Flash on FF:
            // debugFlash: true, preferFlash: true, useHTML5Audio: false,
            // See sm2-container in editor-wrapper.jsx and flashblock.css
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
                    self.$el.find("#sm2-container div").remove();
                    soundManager.reboot();
                }, 3000);
            }
        });
        soundManager.beginDelayedInit();

        this.bindRecordHandlers();
    }

    audioInit () {
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
                    self.$el.find(self.dom.PLAYBAR_PROGRESS)
                        .slider("option", "value", record.currentTime() / 1000);
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
                record.stopPlayback();
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
            if (self.audioReadyToPlay()) {
                clearInterval(checkStreaming);
                self.trigger("readyToPlay");
            }
        }, 16);

        this.bindPlayerHandlers();
    }

    audioReadyToPlay () {
        // NOTE(pamela): We can't just check bytesLoaded,
        //  because IE reports null for that
        // (it seems to not get the progress event)
        // So we've changed it to also check loaded.
        // If we need to, we can reach inside the HTML5 audio element
        //  and check the ranges of the buffered property
        return this.player &&
            (this.player.bytesLoaded > 0 || this.player.loaded);
    }

    bindPlayerHandlers() {
        var self = this;
        var record = this.record;

        // Bind events to the Record object, to track when playback events occur
        this.record.bind({
            loading: function() {
                self.updateDurationDisplay();
            },

            loaded: function() {
                // Add an empty command to force the Record playback to
                // keep playing until the audio track finishes playing
                var commands = record.commands;

                if (commands) {
                    commands.push([
                        Math.max(record.endTime(),
                            commands[commands.length - 1][0]), "seek"]);
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

    bindRecordHandlers () {
        var self = this;
        var record = this.record;

        /*
         * Bind events to Record (for recording and playback)
         * and to ScratchpadCanvas (for recording and playback)
         */

        record.bind({
            // Playback of a recording has begun
            playStarted: (e, resume) => {
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
                    self.$el.find("#record").addClass("disabled");
                }

                // During playback disable the restart button
                this.setState({enableRestart: false});

                if (!record.recording) {
                    // Turn on playback-related styling
                    $("html").addClass("playing");

                    // Show an invisible overlay that blocks interactions with
                    // the editor and canvas areas (preventing the user from
                    // being able to disturb playback)
                    self.$el.find(".disable-overlay").show();
                }

                self.editor.unfold();

                // Activate the play button
                self.$el.find(self.dom.PLAYBAR_PLAY)
                    .find("span")
                    .removeClass("glyphicon-play icon-play")
                    .addClass("glyphicon-pause icon-pause");
            },

            playEnded: function() {
                // Re-init if the recording version is different from
                // the scratchpad's normal version
                self.config.switchVersion(this.initialVersion);
            },

            // Playback of a recording has been paused
            playPaused: function() {
                // Turn off playback-related styling
                $("html").removeClass("playing");

                // Disable the blocking overlay
                self.$el.find(".disable-overlay").hide();

                // Allow the user to restart the code again
                this.setState({enableRestart: true});

                // Re-enable the record button after playback
                self.$el.find("#record").removeClass("disabled");

                // Deactivate the play button
                self.$el.find(self.dom.PLAYBAR_PLAY)
                    .find("span")
                    .addClass("glyphicon-play icon-play")
                    .removeClass("glyphicon-pause icon-pause");
            },

            // Recording has begun
            recordStarted: function() {
                // Let the output know that recording has begun
                self.postFrame({ recording: true });

                self.$el.find("#draw-widgets").removeClass("hidden").show();

                // Hides the invisible overlay that blocks interactions with the
                // editor and canvas areas (preventing the user from being able
                // to disturb the recording)
                self.$el.find(".disable-overlay").hide();

                // Allow the editor to be changed
                self.editor.setReadOnly(false);

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
                self.$el.find("#save-button, #fork-button")
                    .addClass("disabled");

                // Activate the recording button
                self.$el.find("#record").addClass("toggled");
            },

            // Recording has ended
            recordEnded: function() {
                // Let the output know that recording has ended
                self.postFrame({ recording: false });

                if (record.recordingAudio) {
                    self.recordView.stopRecordingAudio();
                }

                // Re-enable the save button
                self.$el.find("#save-button, #fork-button")
                    .removeClass("disabled");

                // Enable playbar UI
                self.$el.find(self.dom.PLAYBAR_UI)
                    .removeClass("ui-state-disabled");

                // Return the recording button to normal
                self.$el.find("#record").removeClass("toggled disabled");

                // Stop any sort of user playback
                record.stopPlayback();

                // Show an invisible overlay that blocks interactions with the
                // editor and canvas areas (preventing the user from being able
                // to disturb the recording)
                self.$el.find(".disable-overlay").show();

                // Turn on playback-related styling (hides hot numbers, for
                // example)
                $("html").addClass("playing");

                // Prevent the editor from being changed
                self.editor.setReadOnly(true);

                self.$el.find("#draw-widgets").addClass("hidden").hide();

                // Because we are recording in chunks, do not reset the canvas
                // to its initial state.
                self.drawCanvas.endDraw();
            }
        });

        // ScratchpadCanvas mouse events to track
        // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
        this.mouseCommands.forEach((name) => {
            // Handle the command during playback
            record.handlers[name] = function(x, y) {
                this.postFrame({
                    mouseAction: {
                        name: name,
                        x: x,
                        y: y
                    }
                });
            };
        });

        // When a restart occurs during playback, restart the output
        record.handlers.restart = () => {
            this.setState({animateRestartNow: true});
            self.postFrame({restart: true});
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
    }

    // This is debounced in the constructor,
    // so we use this for things we can wait a bit on
    handleChange() {
        this.setState({showRestart: this.shouldShowRestart()});
    }

    handleMiniClick() {
        this.setErrorState(0);
    }

    handleRestartClick() {
        this.restartCode();
        this.record && this.record.log("restart");
    }

    handleRecordClick (callback) {
        // If we're already recording, stop
        if (this.record.recording) {
            // Note: We should never hit this case when recording chunks.
            this.recordView.stopRecordingCommands();
            return;
        }

        var saveCode = this.aceWrapperRef.text();

        // You must have some code in the editor before you start recording
        // otherwise the student will be starting with a blank editor,
        // which is confusing
        if (!saveCode) {
            callback({error: "empty"});

        } else if (this.config.curVersion() !== this.config.latestVersion()) {
            callback({error: "outdated"});

        } else if (this.canRecord() && !this.hasAudio()) {
            this.startRecording();
            this.aceWrapperRef.focus();

        } else {
            callback({error: "exists"});
        }
    }

    startRecording () {
        this.bindRecordHandlers();

        if (!this.recordView) {
            var $el = this.$el;

            // NOTE(jeresig): Unfortunately we need to do this to make sure
            // that we load the web worker from the same domain as the rest
            // of the site (instead of the domain that the "exec" page is on).
            // This is dumb and a KA-specific bit of functionality that we
            // should change, somehow.
            var workersDir = this.workersDir.replace(/^https?:\/\/[^\/]*/, "");

            this.recordView = new ScratchpadRecordView({
                el: $el.find(".scratchpad-dev-record-row"),
                recordButton: $el.find("#record"),
                saveButton: $el.find("#save-button"),
                record: this.record,
                editor: this.editor,
                config: this.config,
                workersDir: workersDir,
                drawCanvas: this.drawCanvas,
                transloaditTemplate: this.transloaditTemplate,
                transloaditAuthKey: this.transloaditAuthKey
            });
        }

        this.recordView.initializeRecordingAudio();
    }

    saveRecording (callback, steps) {
        // If no command or audio recording was made, just save the results
        if (!this.record.recorded || !this.record.recordingAudio) {
            return callback();
        }

        var transloadit = new TransloaditXhr({
            authKey: this.transloaditAuthKey,
            templateId: this.transloaditTemplate,
            steps: steps,
            successCb: function(results) {
                this.recordingMP3 =
                    results.mp3[0].url.replace(/^http:/, "https:");
                callback(null, this.recordingMP3);
            }.bind(this),
            errorCb: callback
        });

        this.recordView.getFinalAudioRecording(function(combined) {
            transloadit.uploadFile(combined.wav);
        });
    }

    // We call this function multiple times, because the
    // endTime value may change as we load the file
    updateDurationDisplay () {
        // Do things that are dependent on knowing duration

        // This gets called if we're loading while we're playing,
        // so we need to update with the current time
        this.updateTimeLeft(this.record.currentTime());

        // Set the duration of the progress bar based upon the track duration
        // Slider position is set in seconds
        this.$el.find(this.dom.PLAYBAR_PROGRESS).slider("option", "max",
            this.record.endTime() / 1000);
    }

    // Update the time left in playback of the track
    updateTimeLeft (time) {
        // Update the time indicator with a nicely formatted time
        this.$el.find(".scratchpad-playbar-timeleft").text(
            "-" + this.formatTime(this.record.endTime() - time));
    }

    // Utility method for formatting time in minutes/seconds
    formatTime (time) {
        var seconds = time / 1000,
            min = Math.floor(seconds / 60),
            sec = Math.floor(seconds % 60);

        if (min < 0 || sec < 0) {
            min = 0;
            sec = 0;
        }

        return min + ":" + (sec < 10 ? "0" : "") + sec;
    }

    // Seek the player to a particular time
    seekTo(timeMS) {
        // Don't update the slider position when seeking
        // (since this triggers an event on the #progress element)
        if (!this.record.seeking) {
            this.$el.find(this.dom.PLAYBAR_PROGRESS)
                .slider("option", "value", timeMS / 1000);
        }

        // Move the recording and player positions
        if (this.record.seekTo(timeMS) !== false) {
            this.player.setPosition(timeMS);
        }
    }

    handleMessages (event) {
        // DANGER!  The data coming in from the iframe could be anything,
        // because with some cleverness the author of the program can send an
        // arbitrary message up to us.  We need to be careful to sanitize it
        // before doing anything with it, to avoid XSS attacks.  For some
        // examples, see https://hackerone.com/reports/103989 or
        // https://app.asana.com/0/44063710579000/71736430394249.
        // TODO(benkraft): Right now that sanitization is spread over a number
        // of different places; some things get sanitized here, while others
        // get passed around and sanitized elsewhere.  Put all the sanitization
        // in one place so it's easier to reason about its correctness, since
        // any gap leaves us open to XSS attacks.
        // TODO(benkraft): Write some tests that send arbitrary messages up
        // from the iframe, and assert that they don't end up displaying
        // arbitrary HTML to the user outside the iframe.
        let data;

        try {
            data = JSON.parse(event.data);
        } catch (err) {
            // Malformed JSON, we don't care about it
        }

        if (!data) {
            return;
        }

        if (typeof data !== "object") {
            return;
        }

        if (data.type === "debugger") {
            // these messages are handled by ui/debugger.js:listenMessages
            return;
        }

        // TODO: Change on("update") in webapp
        this.props.onOutputUpdated && this.props.onOutputUpdated(data);

        // Hide loading overlay if output is loaded
        // We previously just looked at data.loaded,
        // but that didn't work for some users (maybe message too early?)
        // so now we also hide if we see data.results

        if (data.loaded || data.results) {
            this.setState({outputLoaded: true});
        }

        // Set the code in the editor
        if (data.code !== undefined) {
            // TODO(benkraft): This is technically not unsafe, in that
            // this.aceWrapperRef.text() does not render its argument as HTML, but it
            // does mean that a user can write a program which modifies its own
            // code (perhaps on another user's computer).  Not directly a
            // security risk, but it would be nice if it weren't possible.
            this.aceWrapperRef.current.text(data.code);
            this.restartCode();
        }

        // Testing/validation code is being set
        if (data.validate !== undefined && data.validate !== null) {
            this.validation = data.validate;
        }

        if (data.results) {
            this.runDone();
        }

        if (this.editorType.indexOf("ace_") === 0 && data.results) {
            // Remove previously added markers
            this.aceWrapperRef.current.removeMarkers();
            if (data.results.assertions || data.results.warnings) {
                // Add gutter warning markers in the editor. For examples:
                //  Write `Program.assertEqual(2, 4);` in ProcessingJS editor
                //  Write "backgrund: grey" in  webpage editor
                const annotations =
                    data.results.assertions.concat(data.results.warnings)
                    .map((lineMsg) =>{
                        return {
                            // Coerce to the expected type
                            row: +lineMsg.row,
                            column: +lineMsg.column,
                            // This is escaped by the gutter annotation display
                            // code, so we don't need to escape it here.
                            text: lineMsg.text.toString(),
                            type: "warning"
                        }
                    });
                this.aceWrapperRef.current.showGutterWarnings(annotations);
            } else {
                this.aceWrapperRef.current.showGutterWarnings([]);
            }
        }

        if (data.results && Array.isArray(data.results.errors)) {
            this.handleErrors(this.cleanErrors(data.results.errors));
        }

        // Set the line visibility in the editor
        if (data.lines !== undefined) {
            // Coerce to the expected type
            this.aceWrapperRef.current.toggleGutter(data.lines.map(x => +x));
        }

        // Restart the execution
        if (data.restart) {
            this.restartCode();
        }

        // Log the recorded action
        if (data.log) {
            // TODO(benkraft): I think passing unsanitized data to any of our
            // record handlers is currently safe, but it would be nice to not
            // depend on that always being true.  Do something to sanitize
            // this, or at least make it more clear that the data coming in may
            // be unsanitized.
            this.record.log.apply(this.record, data.log);
        }
    }

    handleErrors (errors) {
        // Our new, less-aggressive way of handling errors:
        // We want to check if the errors we see are caused by the line the
        // user is currently on, and that they have just typed them, and if so
        // give the user some time to finish what they were typing.

        // When you start with no errors, the errorCursorRow is null.
        // When you make an error, the errorCursorRow is set to the current row.
        // When we register another error, we check if the errorCursorRow is the
        // same as the current row:
        //  -if it is, we set a timer for one minute of no typing before showing
        //   you the error so you have a chance to finish what you're doing.
        //  -if it is not, we show the error right away.

        // Reset the timer
        window.clearTimeout(this.errorTimeout);

        // Remove old gutter markers and decorations
        this.aceWrapperRef.current.removeGutterErrors();

        if (errors.length) {
            // Show errors in gutter
            this.gutterDecorations = {};
            errors.map((error, index) => {
                // Create a log of which row corresponds with which error
                // message so that when the user clicks a gutter marker they
                // are shown the relevant error message.
                if (this.gutterDecorations[error.row + 1] === null) {
                    this.gutterDecorations[error.row + 1] = index;
                }
            });
            this.aceWrapperRef.current.showGutterErrors(errors);
            // Set the errors
            this.setState({errors});
            this.maybeShowErrors();

        } else {
            // If there are no errors, remove the gutter decorations that marked
            // the errors and reset our state.
            this.setState({errors: []});
            this.setHappyState();
            this.showError = false;
            this.errorCursorRow = null;
        }
    }

    maybeShowErrors () {

        if (!this.state.errors.length || !this.editor || !this.aceWrapperRef.current.getCursor()) {
            return;
        }

        var currentRow = this.aceWrapperRef.current.getCursor().row;
        var onlyErrorsOnThisLine = this.errorCursorRow === null ||
                                   this.errorCursorRow === currentRow;
        if (this.errorCursorRow === null) {
            this.errorCursorRow = currentRow;
        }

        // If we were already planning to show the error, or if there are
        // errors on more than the current line, or we have errors and the
        // program was just loaded (i.e. this.showError is null) then we
        // should show the error now. Otherwise we'll delay showing the
        // error message to give them time to type.
        this.showError = this.showError ||
                         !onlyErrorsOnThisLine ||
                         this.showError === null;

        if (this.showError) {
            // We've already timed out or moved to another line, so show
            // the error.
            this.setErrorState();
        } else if (onlyErrorsOnThisLine) {
            // There are new errors caused by typing on this line, so let's
            // give the typer time to finish what they were writing. We'll
            // show the tipbar if 1 minute has gone by without typing.
            this.setThinkingState();
            // Make doubly sure that we clear the timeout
            window.clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout(() => {
                if (this.state.errors.length) {
                    this.setErrorState();
                }
            }, 60000);
        }
    }

    setErrorState (errorNum) {
        this.setState({
            errorState: "error",
            errorNum: errorNum || 0,
            showErrorPopup: true
        });
    }

    setThinkingState() {
        this.setState({
            errorState: "thinking",
            showErrorPopup: false
        });
    }

    setHappyState() {
        this.setState({
            errorState: "happy",
            showErrorPopup: false
        });
    }

    // Extract the origin from the embedded frame location
    postFrameOrigin() {
        var match = /^.*:\/\/[^\/]*/.exec(
            this.iframeRef.current.getAttribute("data-src"));

        return match ?
            match[0] :
            window.location.protocol + "//" + window.location.host;
    }

    postFrame(data) {
        // Send the data to the frame using postMessage
        this.iframeRef.current.contentWindow.postMessage(
            JSON.stringify(data), this.postFrameOrigin());
    }

    hasFrame () {
        return !!(this.execFile);
    }

    /*
     * Restart the code in the output frame.
     */
    restartCode () {
        this.postFrame({ restart: true });
    }

    /*
     * Execute some code in the output frame.
     *
     * A note about the throttling:
     * This limits updates to 50FPS. No point in updating faster than that.
     *
     * DO NOT CALL THIS DIRECTLY
     * Instead call markDirty because it will handle
     * throttling requests properly.
     */
    runCode(code) {
        return _.throttle((code) => {
            var options = {
                code: arguments.length === 0 ? this.aceWrapperRef.current.text() : code,
                cursor: this.aceWrapperRef.current.getSelectionIndices ? this.aceWrapperRef.current.getSelectionIndices() : -1,
                validate: this.validation || "",
                noLint: this.noLint,
                version: this.config.curVersion(),
                settings: this.settings || {},
                workersDir: this.workersDir,
                externalsDir: this.externalsDir,
                imagesDir: this.imagesDir,
                soundsDir: this.soundsDir,
                redirectUrl: this.redirectUrl,
                jshintFile: this.jshintFile,
                outputType: this.outputType,
                enableLoopProtect: this.enableLoopProtect
            };
            // TODO: Check webapp for "runCode" listeners
            this.props.onCodeRun && this.props.onCodeRun(options);

            this.postFrame(options);
        }, 20)(code)
    }

    markDirty () {
        // makeDirty is called when you type something in the editor. When this
        // happens, we want to run the code, but also want to throttle how often
        // we re-run so we can wait for the results of running it to come back.
        // We keep track of the state using clean/running/dirty markers.

        // The state of the output starts out "clean": the editor and the output
        // are in sync.
        // When you type, markDirty gets called, which will mark the state as
        // "running" and starts of runCode in the background. Since runCode is
        // async, if you type again while it's running then the output state
        // will get set to "dirty".
        // When runCode finishes it will call runDone, which will either set the
        // state back to clean (if it was running before), or will run again if
        // the state was dirty.
        // If runCode takes more than 500ms then runDone will be called and we
        // set the state back to "clean".
        if (this.outputState === "clean") {
            console.log("In markDirty, running code")
            // We will run at the end of this code block
            // This stops replace from trying to execute code
            // between deleting the old code and adding the new code
            setTimeout(this.runCode.bind(this), 0);
            this.outputState = "running";

            // 500ms is an arbitrary timeout. Hopefully long enough for
            // reasonable programs to execute, but short enough for editor to
            // not freeze.
            this.runTimeout = setTimeout(() => {
                this.runDone();
            }, 500);
        } else {
            this.outputState = "dirty";
        }
    }

    // This will either be called when we receive the results
    // Or it will timeout.
    runDone () {
        clearTimeout(this.runTimeout);
        var lastOutputState = this.outputState;
        this.outputState = "clean";
        if (lastOutputState === "dirty") {
            this.markDirty();
        }
    }

    updateCanvasSize(width, height) {
        width = width || this.defaultOutputWidth;
        height = height || this.defaultOutputHeight;

        this.$el.find(this.dom.CANVAS_WRAP).width(width);
        this.$el.find(this.dom.ALL_OUTPUT).height(height);

        // Set the editor height to be the same as the canvas height
        this.$el.find(this.dom.EDITOR).height(this.editorHeight || height);

        this.trigger("canvasSizeUpdated", {
            width: width,
            height: height
        });
    }

    getScreenshot (callback) {
        // If we don't have an output frame then we need to render our
        // own screenshot (so we just use the text in the editor)
        if (!this.hasFrame()) {
            var canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            var ctx = canvas.getContext("2d");

            // Default sizing, we also use a 5px margin
            var lineHeight = 24;
            var maxWidth = 190;

            // We go through all of this so that the text will wrap nicely
            var text = this.aceWrapperRef.current.text();

            // Remove all HTML markup and un-escape entities
            text = text.replace(/<[^>]+>/g, "");
            text = text.replace(/&nbsp;|&#160;/g, " ");
            text = text.replace(/&lt;|&#60;/g, "<");
            text = text.replace(/&gt;|&#62;/g, ">");
            text = text.replace(/&amp;|&#38;/g, "&");
            text = text.replace(/&quot;|&#34;/g, "\"");
            text = text.replace(/&apos;|&#39;/g, "\'");

            var words = text.split(/\s+/);
            var lines = 0;
            var currentLine = words[0];

            ctx.font = lineHeight + "px serif";

            for (var i = 1; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + " " + word).width;
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines += 1;
                    ctx.fillText(currentLine, 5, (lineHeight + 5) * lines);
                    currentLine = word;
                }
            }
            lines += 1;
            ctx.fillText(currentLine, 5, (lineHeight + 5) * lines + 5);

            // Render it to an image and we're done!
            callback(canvas.toDataURL("image/png"));
            return;
        }

        // Unbind any handlers this function may have set for previous
        // screenshots
        $(window).off("message.getScreenshot");

        // We're only expecting one screenshot back
        $(window).on("message.getScreenshot", function(e) {
            // Only call if the data is actually an image!
            if (/^data:/.test(e.originalEvent.data)) {
                callback(e.originalEvent.data);
            }
        });

        // Ask the frame for a screenshot
        this.postFrame({ screenshot: true });
    }

    undo() {
        this.aceWrapperRef.current.undo();
    }

    cleanErrors(errors) {
        var loopProtectMessages = {
            "WhileStatement": i18n._("<code>while</code> loop"),
            "DoWhileStatement": i18n._("<code>do-while</code> loop"),
            "ForStatement": i18n._("<code>for</code> loop"),
            "FunctionDeclaration": i18n._("<code>function</code>"),
            "FunctionExpression": i18n._("<code>function</code>"),
        };

        errors = errors.map(function(error) {
            // These errors come from the user, so we can't trust them.  They
            // get decoded from JSON, so they will just be plain objects, not
            // arbitrary classes, but they're still potentially full of HTML
            // that we need to escape.  So any HTML we want to put in needs to
            // get put in here, rather than somewhere inside the iframe.
            delete error.html;
            // TODO(benkraft): This is a kind of ugly place to put this
            // processing.  Refactor so that we don't have to do something
            // quite so ad-hoc here, while still keeping any user input
            // appropriately sanitized.
            var loopNodeType = error.infiniteLoopNodeType;
            if (loopNodeType) {
                error.html = i18n._(
                    "A %(type)s is taking too long to run. " +
                    "Perhaps you have a mistake in your code?", {
                        type: loopProtectMessages[loopNodeType]
                });
            }

            const newError = {};

            // error.html was cleared above, so if it exists it's because we
            // reset it, and it's safe.
            if (typeof error === "string") {
                newError.text = clean(prettify(error));
            } else if (error.html) {
                newError.text = prettify(error.html);
            } else {
                newError.text = prettify(clean(
                    error.text || error.message || ""));
            }

            // Coerce anything from the user to the expected types before
            // copying over
            if (error.lint !== undefined) {
                newError.lint = {};

                // TODO(benkraft): Coerce this in a less ad-hoc way, or at
                // least only pass through the things we'll actually use.
                // Also, get a stronger guarantee that none of these
                // strings ever get used unescaped.
                const numberProps = ["character", "line"];
                const stringProps = [
                    "code", "evidence", "id", "raw", "reason", "scope", "type"
                ];
                const objectProps = ["openTag"];

                numberProps.forEach(prop => {
                    if (error.lint[prop] != undefined) {
                        newError.lint[prop] = +error.lint[prop];
                    }
                });

                stringProps.forEach(prop => {
                    if (error.lint[prop] != undefined) {
                        newError.lint[prop] = error.lint[prop].toString();
                    }
                });

                objectProps.forEach(prop => {
                    if (error.lint[prop] != undefined) {
                        newError.lint[prop] = error.lint[prop];
                    }
                });
            }

            if (error.row != undefined) {
                newError.row = +error.row;
            }

            if (error.column != undefined) {
                newError.column = +error.column;
            }

            if (error.type != undefined) {
                newError.type = error.type.toString();
            }

            if (error.source != undefined) {
                newError.source = error.source.toString();
            }

            if (error.priority != undefined) {
                newError.priority = +error.priority;
            }

            return newError;
        }.bind(this));

        errors = errors.sort(function(a, b) {
            var diff = a.row - b.row;
            return diff === 0 ? (a.priority || 99) - (b.priority || 99) : diff;
        });

        return errors;
    }
}

LiveEditor.registerEditor = function(name, editor) {
    editors[name] = editor;
};


const defaultDim = 400;
const defaultBorder = `2px solid #D6D8DA`;
const defaultBorderRadius = 5;

const styles = StyleSheet.create({
    dragHandle: {
        background: "#D6D8DA",
        cursor: "ew-resize",
        display: "table-cell",
        flexShrink: 0,
        width: 2,
    },
    editorWrap: {
        borderRight: defaultBorder,
        display: "flex",
        flexDirection: "column",
        marginRight: "auto",
        minHeight: defaultDim,
        flexGrow: 1,
        flexShrink: 1,
    },
    editorHidden: {
        display: "none",
    },
    editorContainer: {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        position: "relative",
    },
    // This is ambiguously named -- refers to the contents of a tab, *NOT*
    // the tab button or buttons at the top of the challenge content editor.
    editorTab: {
        position: "absolute",
        padding: 0,
        height: "100%",
        width: "100%",
    },
    editorTabDocument: {
        position: "static",
    },
    noBorder: {
        border: "none",
    },
    inputFrame: {
        height: "100%",
        position: "relative",
    },
    playbar: {
        borderTop: defaultBorder,
        display: "flex",
        padding: 5,
    },
    playbackBar: {
        flex: "1 0 0",
    },
    toolbarWrap: {
        borderTop: defaultBorder,
        padding: 5,
    },
    wrap: {
        // These two make .wrapInner hide border-radius overflow *shrug*
        position: "relative",
        zIndex: 0,
        flexGrow: 1,
        display: "flex",
        flexDirection: "row",
        minWidth: defaultDim,
    },
    wrapNoEditorResizable: {
        minWidth: "100%",
    },
    wrapOuter: {
        flexGrow: 1,
    },
    wrapBorder: {
        borderRadius: defaultBorderRadius,
        border: defaultBorder,
        overflow: "auto",
        // Also required to make the border-radius overflow work
        transform: "scale(1)",
    },
    wrapInner: {
        display: "flex",
    },
});

module.exports = LiveEditor;