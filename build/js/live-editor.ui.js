this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["live-editor"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Loading...";
  }

function program3(depth0,data) {
  
  
  return "Restart";
  }

function program5(depth0,data) {
  
  var buffer = "";
  buffer += "\n                <a href=\"\" class=\"draw-color-button\" id=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\">\n                    <span></span>\n                </a>\n                ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "Record";
  }

function program9(depth0,data) {
  
  
  return "Enable Flash to load audio:";
  }

function program11(depth0,data) {
  
  
  return "Play";
  }

function program13(depth0,data) {
  
  
  return "Loading audio...";
  }

  buffer += "<div class=\"scratchpad-wrap\">\n    <!-- Canvases (Drawing + Output) -->\n    <div class=\"scratchpad-canvas-wrap\">\n        <div id=\"output\">\n            <!-- Extra data-src attribute to work around\n                 cross-origin access policies. -->\n            <iframe id=\"output-frame\"\n                src=\"";
  if (helper = helpers.execFile) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.execFile); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n                data-src=\"";
  if (helper = helpers.execFile) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.execFile); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></iframe>\n            <canvas class=\"scratchpad-draw-canvas\" style=\"display:none;\"\n                width=\"400\" height=\"400\"></canvas>\n\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-canvas-loading\">\n                <img src=\"";
  if (helper = helpers.imagesDir) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.imagesDir); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <button id=\"restart-code\"\n                class=\"simple-button pull-right\">\n                <span class=\"glyphicon glyphicon-refresh icon-refresh\"></span>\n                ";
  options={hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n\n            <!-- Widgets for selecting colors to doodle on the canvas during\n                recordings -->\n            <div id=\"draw-widgets\" style=\"display:none;\">\n                <a href=\"\" id=\"draw-clear-button\" class=\"ui-button\">\n                    <span class=\"ui-icon-cancel\"></span>\n                </a>\n                ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.colors), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n\n            <!-- Record button -->\n            <button id=\"record\" class=\"simple-button pull-left\" style=\"display:none;\">";
  options={hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n        </div>\n    </div>\n\n    <!-- Editor -->\n    <div class=\"scratchpad-editor-wrap overlay-container\">\n        <div class=\"scratchpad-editor-tabs\">\n          <div id=\"scratchpad-code-editor-tab\" class=\"scratchpad-editor-tab\">\n            <div class=\"scratchpad-editor scratchpad-ace-editor\"></div>\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-editor-bigplay-loading\" style=\"display:none;\">\n                <img src=\"";
  if (helper = helpers.imagesDir) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.imagesDir); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n\n            <!-- This cannot be removed, if we want Flash to keep working! -->\n            <div id=\"sm2-container\">\n                ";
  options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <br>\n            </div>\n\n            <button class=\"scratchpad-editor-bigplay-button\" style=\"display:none;\">\n                <span class=\"glyphicon glyphicon-play icon-play\"></span>\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <!-- Row for playback controls -->\n            <div class=\"scratchpad-playbar\" style=\"display:none;\">\n                <div class=\"scratchpad-playbar-area\" style=\"display:none;\">\n                    <button\n                        class=\"simple-button primary scratchpad-playbar-play\"\n                        type=\"button\">\n                        <span class=\"glyphicon glyphicon-play icon-play\"></span>\n                    </button>\n\n                    <div class=\"scratchpad-playbar-progress\"></div>\n\n                    <span class=\"scratchpad-playbar-timeleft\"></span>\n                </div>\n                <div class=\"loading-msg\">\n                    ";
  options={hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </div>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar scratchpad-dev-record-row\" style=\"display:none;\"></div>\n    </div>\n</div>";
  return buffer;
  });;
window.ScratchpadDrawCanvas = Backbone.View.extend({
    initialize: function(options) {
        this.record = options.record;

        this.undoStack = [];
        this.isDrawing = false;

        this.ctx = this.el.getContext("2d");
        this.ctx.shadowBlur = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 1;

        this.clear(true);

        if (this.record) {
            this.bindRecordView();
        }
    },

    commands: ["startLine", "drawLine", "endLine", "setColor", "clear"],
    mouseCommands: ["move", "over", "out", "down", "up"],

    colors: {
        black: [0, 0, 0],
        red: [255, 0, 0],
        orange: [255, 165, 0],
        green: [0, 128, 0],
        blue: [0, 0, 255],
        lightblue: [173, 216, 230],
        violet: [128, 0, 128]
    },

    remove: function() {
        // Clear and reset canvas
        this.clear(true);
        this.endDraw();

        // Remove all bound events from draw canvas
        this.$el.off(".draw-canvas");

        // Remove all bound events from document
        $(document).off(".draw-canvas");
    },

    bindRecordView: function() {
        var self = this;
        var record = this.record;

        this.$el.on({
            "mousedown.draw-canvas": function(e) {
                // Left mouse button
                if (record.recording && e.button === 0) {
                    self.startLine(e.offsetX, e.offsetY);
                    e.preventDefault();
                }
            },

            "mousemove.draw-canvas": function(e) {
                if (record.recording) {
                    self.drawLine(e.offsetX, e.offsetY);
                }
            },

            "mouseup.draw-canvas": function(e) {
                if (record.recording) {
                    self.endLine();
                }
            },

            "mouseout.draw-canvas": function(e) {
                if (record.recording) {
                    self.endLine();
                }
            }
        });

        record.on({
            runSeek: function() {
                self.clear(true);
                self.endDraw();
            }
        });

        // Handle record seek caching
        record.seekCachers.canvas = {
            getState: function() {
                if (!self.isDrawing) {
                    return;
                }

                // Copy the canvas contents
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = tmpCanvas.height = self.el.width;
                tmpCanvas.getContext("2d").drawImage(self.el, 0, 0);

                // Store Canvas state
                return {
                    x: self.x,
                    y: self.y,
                    down: self.down,
                    color: self.color,
                    canvas: tmpCanvas
                };
            },

            restoreState: function(cacheData) {
                self.startDraw();

                // Restore Canvas state
                self.x = cacheData.x;
                self.y = cacheData.y;
                self.down = cacheData.down;
                self.setColor(cacheData.color);

                // Restore canvas image
                self.ctx.drawImage(cacheData.canvas, 0, 0);
            }
        };

        // Initialize playback commands
        _.each(this.commands, function(name) {
            record.handlers[name] = function(e) {
                self[name].apply(self, e[name] || []);
            };
        });

        // ScratchpadCanvas mouse events to track
        // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
        _.each(this.mouseCommands, function(name) {
            // Handle the command during playback
            record.handlers[name] = function(e) {
                // TODO: Get rid of ScratchpadUI in favor or something other
                // meta-object that manages scratchpad state.
                self.trigger("mouseEvent", {name: name, action: e});
            };
        });

        $(document).on("keydown.draw-canvas", function(e) {
            // Stop if we aren't running
            if (!record.playing || !self.isDrawing) {
                return;
            }

            // Backspace key
            if (e.which === 8) {
                e.preventDefault();
                self.undo();
            }
        });
    },

    // TODO: Just use the Record log as an undo stack
    undo: function() {
        this.record.log({ canvas: "undo" });

        // TODO: Eventually allow for a "redo" stack
        var cmd = this.undoStack.pop();

        if (cmd && cmd.name === "endLine") {
            while (cmd.name !== "startLine") {
                cmd = this.undoStack.pop();
            }
        }

        this.redraw();
    },

    redraw: function() {
        var stack = this.undoStack.slice(0);

        this.clear(true);

        this.undoStack.length = 0;
        this.undoRunning = true;

        for (var i = 0, l = stack.length; i < l; i++) {
            this[stack[i].name].apply(this, stack[i].args);
        }

        this.undoRunning = false;
    },

    startLine: function(x, y) {
        if (!this.down) {
            this.down = true;
            this.x = x;
            this.y = y;

            this.log("startLine", [x, y]);
        }
    },

    drawLine: function(x, y) {
        if (this.down && this.x != null && this.y != null) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.closePath();

            this.x = x;
            this.y = y;

            this.log("drawLine", [x, y]);
        }
    },

    endLine: function() {
        if (this.down) {
            this.down = false;
            this.log("endLine");
        }
    },

    log: function(name, args) {
        args = args || [];

        if (!this.undoRunning) {
            var obj = {};
            obj[name] = args;
            this.record.log(obj);
        }

        this.undoStack.push({ name: name, args: args });
    },

    setColor: function(color) {
        if (color != null) {
            if (!this.isDrawing) {
                this.startDraw(true);
            }

            this.color = color;

            this.ctx.shadowColor = "rgba(" + this.colors[color] + ",0.5)";
            this.ctx.strokeStyle = "rgba(" + this.colors[color] + ",1.0)";

            this.log("setColor", [color]);
        }

        this.trigger("colorSet", color);
    },

    clear: function(force) {
        // Clean off the canvas
        this.ctx.clearRect(0, 0, 600, 480);
        this.x = null;
        this.y = null;
        this.down = false;

        if (force !== true) {
            this.log("clear");
        }
    },

    startDraw: function(colorDone) {
        if (this.isDrawing) {
            return;
        }

        this.isDrawing = true;
        this.undoStack.length = 0;

        if (colorDone !== true) {
            this.setColor("black");
        }

        this.trigger("drawStarted");
    },

    endDraw: function() {
        if (!this.isDrawing) {
            return;
        }

        this.isDrawing = false;
        this.setColor(null);
        this.trigger("drawEnded");
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
    initialize: function(options) {
        this.render();
        this.$recordButton = options.recordButton;
        this.$finalSaveButton = options.saveButton;
        this.editor = options.editor;
        this.record = options.record;
        this.config = options.config;
        this.externalsDir = options.externalsDir;
        this.transloaditTemplate = options.transloaditTemplate;
        this.transloaditAuthKey = options.transloaditAuthKey;
        this.audioChunks = new ScratchpadAudioChunks();
        this.recordInProgress = false;
        this.commandChunks = [];
        this.startingCode = "";
        this.lastSavedCode = this.editor.text();
        this.$lastAudioChunkElem = this.$el.find(".last-audio-chunk");
        // Note: $savedAudioChunksElem HAS to be displayed in order for us to
        //  get the duration. Hack -- look at other ways to get the duration.
        this.$savedAudioChunksElem = this.$el.find(".saved-audio-chunks");
        this.initializeButtons();
    },

    render: function() {
        this.$el.html(Handlebars.templates["dev-record"]({})).show();
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
            {workerPath: this.externalsDir +
                "multirecorderjs/multirecorder-worker.js"});
        this.$recordButton.text("Use the chunks (and give permission)");
        this.setButtonDisableStatus(this.$recordButton, true);
        this.disableChunkButtons(false, true, true, true, true);
    },

    /* Start recording audio after a brief countdown for preparation.
     *   Leads to startRecordingCommands() being called,
     *   so no need to call startRecordingCommands manually.
     */
    startRecordingAudio: function() {
        var self = this;

        this.lastSavedCode = this.editor.text();
        this.multirecorder.startRecording(1)
            .progress(_.bind(function(seconds) {
                this.$newChunkButton.text(seconds + "...");
            }, this))
            .done(_.bind(function() {
                this.disableChunkButtons(false, true, true, true, true);
                self.record.recordingAudio = true;
                this.$newChunkButton.html("Stop recording chunk");
                this.startRecordingCommands();
            }, this));
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
        if (this.record.hasNoChunks()) {
            // Save the initial code state
            //this.scratchpad.get("revision")
            //    .set("code", this.editor.text());
            this.startingCode = this.editor.text();
            var newVersion = this.config.curVersion();
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
        this.record.log({start: {column: 0, row: 0}});
        this.editor.setCursor({row: 0, column: 0});
    },

    /* Stop recording commands. This will trigger an event sequence that
     *    will lead to stopRecordingAudio being called as well.
     *
     * Currently assumes that when we stop recording commands, we want
     * to upload the recording.
     */
    stopRecordingCommands: function() {
        this.record.stopRecordChunk();
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
        return this.record.dumpRecording();
    },

    /* Start recording a new chunk, or stop recording the current chunk
     *  (the button toggles) */
    newChunk: function() {
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
        this.record.discardRecordChunk();
        this.$lastAudioChunkElem.empty();
        this.refreshEditor();
    },

    /* Save the chunk we just recorded. */
    saveChunk: function(evt) {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.saveCurrentChunk();
        this.record.saveRecordChunk();
        this.lastSavedCode = this.editor.text();
        this.disableChunkButtons(false, true, true, false, false);
        this.showSavedAudioChunks();
        this.$lastAudioChunkElem.empty();
    },

    /* Play back all the saved chunks to get back to the last
     *  saved state. */
    refreshEditor: function(evt) {
        this.record.loadRecording(this.record.dumpRecording());
        this.editor.editor.setReadOnly(false);
        this.record.initData = this.record.actualInitData;
        // Add an empty command to force the Record playback to
        // keep playing until the audio track finishes playing
        if (this.record.commands) {
            this.record.commands.push({
                time: this.getDurationMsOfSavedAudio()
            });
        }
        // Start the play head at 0
        this.record.time = 0;

        // Reset the editor
        this.editor.text(this.startingCode);
        // Clear and hide the drawing area
        this.drawCanvas.clear(true);
        this.drawCanvas.endDraw();
        this.record.runSeek(this.getDurationMsOfSavedAudio());

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
        PLAYBAR_UI: ".scratchpad-playbar-play, .scratchpad-playbar-progress",
        OUTPUT_FRAME: "#output-frame",
        ALL_OUTPUT: "#output, #output-frame"
    },

    defaultOutputWidth: 400,
    defaultOutputHeight: 400,

    editors: {},

    initialize: function(options) {
        this.workersDir = this._qualifyURL(options.workersDir);
        this.externalsDir = this._qualifyURL(options.externalsDir);
        this.imagesDir = this._qualifyURL(options.imagesDir);
        this.execFile = this._qualifyURL(options.execFile);
        this.jshintFile = this._qualifyURL(options.jshintFile ||
            this.externalsDir + "jshint/jshint.js");

        this.outputType = options.outputType || "";
        this.editorType = options.editorType || _.keys(this.editors)[0];
        this.editorHeight = options.editorHeight;
        this.initialCode = options.code;
        this.initialVersion = options.version;
        this.settings = options.settings;
        this.validation = options.validation;

        this.recordingCommands = options.recordingCommands;
        this.recordingMP3 = options.recordingMP3;
        this.recordingInit = options.recordingInit || {
            code: this.initialCode,
            version: this.initialVersion
        };

        this.transloaditTemplate = options.transloaditTemplate;
        this.transloaditAuthKey = options.transloaditAuthKey;

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
            mouseEvent: function(data) {
                this.postFrame(data);
            }.bind(this),

            // Drawing has started
            drawStarted: function() {
                // Activate the canvas
                this.$el.find(this.dom.DRAW_CANVAS).show();
            }.bind(this),

            // Drawing has ended
            drawEnded: function() {
                // Hide the canvas
                this.$el.find(this.dom.DRAW_CANVAS).hide();
            }.bind(this),

            // A color has been chosen
            colorSet: function(color) {
                // Deactivate all the color buttons
                this.$el.find(this.dom.DRAW_COLOR_BUTTONS)
                    .removeClass("ui-state-active");

                // If a new color has actually been chosen
                if (color !== null) {
                    // Select that color and activate the button
                    this.$el.find("#" + color).addClass("ui-state-active");
                }
            }.bind(this)
        });

        // Set up the editor
        this.editor = new this.editors[this.editorType]({
            el: this.dom.EDITOR,
            autoFocus: options.autoFocus,
            config: this.config,
            record: this.record,
            imagesDir: this.imagesDir,
            externalsDir: this.externalsDir,
            workersDir: this.workersDir,
            type: this.editorType
        });

        var code = options.code;

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
            this.editor.setSelection({
                start: {row: 0, column: 0},
                end: {row: 0, column: 0}
            });
        }

        // Hide the overlay
        this.$el.find("#page-overlay").hide();

        // Change the width and height of the output frame if it's been
        // changed by the user, via the query string, or in the settings
        this.updateCanvasSize(options.width, options.height);

        if (this.canRecord()) {
            this.$el.find("#record").show();
        }

        this.bind();
        this.setupAudio();
    },

    render: function() {
        this.$el.html(Handlebars.templates["live-editor"]({
            execFile: this.execFile,
            imagesDir: this.imagesDir,
            colors: ["black", "red", "orange", "green", "blue", "lightblue",
                "violet"]
        }));
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
        $el.find("#output-frame").on("load", function() {
            toExec = true;
            // TODO(leif): properly handle case where the user's code doesn't
            // initially compile. There is currently a race condition in which
            // the output frame is not ready for execution
        });

        // Whenever the user changes code, execute the code
        this.editor.on("change", function() {
            toExec = true;
        });

        // Attempt to run the code every 100ms or so
        this.runCodeInterval = setInterval(function() {
            if (toExec !== null) {
                this.runCode(toExec === true ?
                    this.editor.text() :
                    toExec);

                toExec = null;
            }
        }.bind(this), 100);

        this.config.on("versionSwitched", function(e, version) {
            // Re-run the code after a version switch
            toExec = true;

            // Run the JSHint config
            this.config.runVersion(version, "jshint");
        }.bind(this));

        if (this.hasAudio()) {
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
            self.recordHandler(function(err) {
                if (err) {
                    // TODO: Change this:
                    console.error(err);
                }
            });
        });

        // Load the recording playback commands as well, if applicable
        if (this.recordingCommands) {
            this.record.loadRecording({
                init: this.recordingInit,
                commands: this.recordingCommands
            });
        }
    },

    remove: function() {
        clearInterval(this.runCodeInterval);
        this.$el.remove();
    },

    canRecord: function() {
        return this.transloaditAuthKey && this.transloaditTemplate;
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
                    self.$el.find("#sm2-container div").remove();
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
                    self.$el.find("#record").addClass("disabled");
                }

                // During playback disable the restart button
                self.$el.find("#restart-code").addClass("disabled");

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
                self.$el.find("#restart-code").removeClass("disabled");

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
                self.$el.find("#save-button, #fork-button").addClass("disabled");

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
                self.$el.find("#save-button, #fork-button").removeClass("disabled");

                // Enable playbar UI
                self.$el.find(self.dom.PLAYBAR_UI).removeClass("ui-state-disabled");

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
                // to its initial state, but do redraw.
                self.drawCanvas.endDraw();
                self.drawCanvas.redraw();
            }
        });

        // When a restart occurs during playback, restart the output
        record.handlers.restart = function() {
            var $restart = self.$el.find("#restart-code");

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

        } else if (this.canRecord() && !this.hasAudio()) {
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
                saveButton: $el.find("#save-button"),
                record: this.record,
                editor: this.editor,
                config: this.config,
                externalsDir: this.externalsDir,
                drawCanvas: this.drawCanvas,
                transloaditTemplate: this.transloaditTemplate,
                transloaditAuthKey: this.transloaditAuthKey
            });
        }

        this.recordView.initializeRecordingAudio();
    },

    saveRecording: function(callback) {
        // If no command or audio recording was made, just save the results
        if (!this.record.recorded || !this.record.recordingAudio) {
            return callback();
        }

        var transloadit = new TransloaditXhr({
            authKey: this.transloaditAuthKey,
            templateId: this.transloaditTemplate,
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
        this.$el.find(this.dom.PLAYBAR_PROGRESS).slider("option", "max",
            this.record.endTime() / 1000);
    },

    // Update the time left in playback of the track
    updateTimeLeft: function(time) {
        // Update the time indicator with a nicely formatted time
        this.$el.find(".scratchpad-playbar-timeleft").text(
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
            this.$el.find(this.dom.PLAYBAR_PROGRESS)
                .slider("option", "value", timeMS / 1000);
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
            this.validation = data.validate;
        }
        
        if (data.results && data.results.assertions) { 
           var annotations = [];
           for (var i = 0; i < data.results.assertions.length; i++) { 
             var unitTest = data.results.assertions[i];
             annotations.push({
                  row: unitTest.row, 
                  column: unitTest.column, 
                  text: unitTest.text,
                  type: "warning" 
                });
           }
           this.editor.editor.session.setAnnotations(annotations); 
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
            this.$el.find("#output-frame").attr("data-src"));

        return match ?
            match[0] :
            window.location.protocol + "//" + window.location.host;
    },

    postFrame: function(data) {
        // Send the data to the frame using postMessage
        this.$el.find("#output-frame")[0].contentWindow.postMessage(
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
            code: arguments.length === 0 ? this.editor.text() : code,
            validate: this.validation || "",
            version: this.config.curVersion(),
            settings: this.settings || {},
            workersDir: this.workersDir,
            externalsDir: this.externalsDir,
            imagesDir: this.imagesDir,
            jshintFile: this.jshintFile,
            outputType: this.outputType
        };

        this.trigger("runCode", options);

        this.postFrame(options);
    },

    getScreenshot: function(callback) {
        // Unbind any handlers this function may have set for previous
        // screenshots
        $(window).unbind("message.getScreenshot");

        // We're only expecting one screenshot back
        $(window).bind("message.getScreenshot", function(e) {
            // Only call if the data is actually an image!
            if (/^data:/.test(e.originalEvent.data)) {
                callback(e.originalEvent.data);
            }
        });

        // Ask the frame for a screenshot
        this.postFrame({ screenshot: true });
    },

    updateCanvasSize: function(width, height) {
        width = width || this.defaultOutputWidth;
        height = height || this.defaultOutputHeight;

        this.$el.find(this.dom.OUTPUT_FRAME).width(width);
        this.$el.find(this.dom.ALL_OUTPUT).height(height);

        // Set the editor height to be the same as the canvas height
        this.$el.find(this.dom.EDITOR).height(this.editorHeight || height);

        this.trigger("canvasSizeUpdated", {
            width: width,
            height: height
        });
    },

    getScreenshot: function(callback) {
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
    },

    undo: function() {
        this.editor.undo();
    },

    _qualifyURL: function(url){
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    }
});

LiveEditor.registerEditor = function(name, editor) {
    LiveEditor.prototype.editors[name] = editor;
};