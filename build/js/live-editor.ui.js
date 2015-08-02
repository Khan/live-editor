this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Oh noes!";}

function program3(depth0,data) {
  
  
  return "Show me where";}

  buffer += "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n    <div class=\"tipnav\">\n        <a href=\"\" class=\"prev\"><span class=\"ui-icon ui-icon-circle-triangle-w\"></span></a>\n        <span class=\"current-pos\"></span>\n        <a href=\"\" class=\"next\"><span class=\"ui-icon ui-icon-circle-triangle-e\"></span></a>\n    </div>\n    <div class=\"text-wrap\">\n        <div class=\"oh-no\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a></div>\n    </div>\n</div>";
  return buffer;});;
/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

window.TipBar = Backbone.View.extend({
    initialize: function initialize(options) {
        this.liveEditor = options.liveEditor;
        this.pos = 0;
        this.errors = [];
        this.render();
        this.bind();
    },

    render: function render() {
        this.$overlay = $("<div class=\"overlay error-overlay\" style=\"display: none\"></div>").appendTo(this.$el);
        this.$el.append(Handlebars.templates["tipbar"]());
    },

    bind: function bind() {
        var self = this;

        // Make the error dialog draggable
        if ($.fn.draggable) {
            this.$el.find(".tipbar").draggable({
                containment: "parent",
                handle: ".error-buddy",
                axis: "y"
            });
        }

        this.$el.on("click", ".tipbar .tipnav a", function (e) {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.update();
            }

            self.liveEditor.editor.focus();

            return false;
        });

        this.$el.on("click", ".tipbar .show-me a", function (e) {
            var error = self.errors[self.pos];

            self.liveEditor.editor.setCursor(error);
            self.liveEditor.editor.setErrorHighlight(true);

            return false;
        });
    },

    setErrors: function setErrors(errors) {
        this.errors = errors;
        this.update(false);
    },

    update: function update(show) {
        var errors = this.errors;
        var pos = errors[this.pos] == null ? 0 : this.pos;
        var bar = this.$el.find(".tipbar");

        // Inject current text
        bar.find(".current-pos").text(errors.length > 1 ? pos + 1 + "/" + errors.length : "").end().find(".message").html(errors[pos].text || errors[pos] || "").end().find("a.prev").toggleClass("ui-state-disabled", pos === 0).end().find("a.next").toggleClass("ui-state-disabled", pos + 1 === errors.length).end();

        // it could be undefined, null, or -1
        this.$el.find(".show-me").toggle(errors[pos].row > -1);

        bar.find(".tipnav").toggle(errors.length > 1);
        if (show) {
            bar.show();
        }
    },

    hide: function hide() {
        var bar = this.$el.find(".tipbar");
        bar.hide();
        clearTimeout(this.errorDelay);
    },

    toggleErrors: function toggleErrors(errors, delay) {
        var hasErrors = errors.length > 0;

        this.$overlay.toggle(hasErrors);

        if (!hasErrors) {
            this.hide();
            return;
        }

        this.setErrors(errors);

        clearTimeout(this.errorDelay);
        this.errorDelay = setTimeout((function () {
            this.update(true);
        }).bind(this), delay);
    },

    setErrorPosition: function setErrorPosition(errorPos) {
        this.pos = errorPos;
        this.update(true);
    }
});
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["live-editor"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return " no-output";}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <iframe id=\"output-frame\"\n                    src=\"";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "execFile", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\n                    data-src=\"";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "execFile", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"></iframe>\n            ";
  return buffer;}

function program5(depth0,data) {
  
  
  return "Loading...";}

function program7(depth0,data) {
  
  
  return "Hmm...";}

function program9(depth0,data) {
  
  
  return "Restart";}

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <a href=\"\" class=\"draw-color-button\" id=\"";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n                    <span></span>\n                </a>\n                ";
  return buffer;}

function program13(depth0,data) {
  
  
  return "Record";}

function program15(depth0,data) {
  
  
  return "Loading...";}

function program17(depth0,data) {
  
  
  return "Enable Flash to load audio:";}

function program19(depth0,data) {
  
  
  return "Play";}

function program21(depth0,data) {
  
  
  return "Loading audio...";}

  buffer += "<div class=\"scratchpad-wrap";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  stack2 = helpers.unless;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n    <!-- Canvases (Drawing + Output) -->\n    <div class=\"scratchpad-canvas-wrap\">\n        <div id=\"output\">\n            <!-- Extra data-src attribute to work around\n                 cross-origin access policies. -->\n            ";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  stack2 = helpers['if'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            <canvas class=\"scratchpad-draw-canvas\" style=\"display:none;\"\n                width=\"400\" height=\"400\"></canvas>\n\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-canvas-loading\">\n                <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <div class=\"error-buddy-resting\">\n                <div class=\"error-buddy-happy\" style=\"display:none;\">\n                    <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/ohnoes-happy.png\"/>\n                </div>\n                <div class=\"error-buddy-thinking\" style=\"display:none;\">\n                    <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/ohnoes-hmm.png\"/>\n                    ";
  buffer += "\n                    ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </div>\n            </div>\n            <button id=\"restart-code\"\n                class=\"simple-button pull-right\">\n                <span class=\"icon-refresh\"></span>\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n\n            <!-- Widgets for selecting colors to doodle on the canvas during\n                recordings -->\n            <div id=\"draw-widgets\" style=\"display:none;\">\n                <a href=\"\" id=\"draw-clear-button\" class=\"ui-button\">\n                    <span class=\"ui-icon-cancel\"></span>\n                </a>\n                ";
  foundHelper = helpers.colors;
  stack1 = foundHelper || depth0.colors;
  stack2 = helpers.each;
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n\n            <!-- Record button -->\n            <button id=\"record\" class=\"simple-button pull-left\" style=\"display:none;\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(13, program13, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n        </div>\n    </div>\n\n    <!-- Editor -->\n    <div class=\"scratchpad-editor-wrap overlay-container\">\n        <div class=\"scratchpad-editor-tabs\">\n          <div id=\"scratchpad-code-editor-tab\" class=\"scratchpad-editor-tab\">\n            <div class=\"scratchpad-editor scratchpad-ace-editor\"></div>\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-editor-bigplay-loading\" style=\"display:none;\">\n                <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(15, program15, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n\n            <!-- This cannot be removed, if we want Flash to keep working! -->\n            <div id=\"sm2-container\">\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(17, program17, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <br>\n            </div>\n\n            <button class=\"scratchpad-editor-bigplay-button\" style=\"display:none;\">\n                <span class=\"icon-play\"></span>\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(19, program19, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <!-- Row for playback controls -->\n            <div class=\"scratchpad-playbar\" style=\"display:none;\">\n                <div class=\"scratchpad-playbar-area\" style=\"display:none;\">\n                    <button\n                        class=\"simple-button primary scratchpad-playbar-play\"\n                        type=\"button\">\n                        <span class=\"icon-play\"></span>\n                    </button>\n\n                    <div class=\"scratchpad-playbar-progress\"></div>\n\n                    <span class=\"scratchpad-playbar-timeleft\"></span>\n                </div>\n                <div class=\"loading-msg\">\n                    ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(21, program21, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </div>\n            </div>\n            <div class=\"scratchpad-debugger\"></div>\n        </div>\n\n        <div class=\"scratchpad-toolbar scratchpad-dev-record-row\" style=\"display:none;\"></div>\n    </div>\n</div>";
  return buffer;});;
window.ScratchpadDrawCanvas = Backbone.View.extend({
    initialize: function initialize(options) {
        this.record = options.record;

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

    colors: {
        black: [0, 0, 0],
        red: [255, 0, 0],
        orange: [255, 165, 0],
        green: [0, 128, 0],
        blue: [0, 0, 255],
        lightblue: [173, 216, 230],
        violet: [128, 0, 128]
    },

    remove: function remove() {
        // Clear and reset canvas
        this.clear(true);
        this.endDraw();

        // Remove all bound events from draw canvas
        this.$el.off(".draw-canvas");

        // Remove all bound events from document
        $(document).off(".draw-canvas");
    },

    bindRecordView: function bindRecordView() {
        var self = this;
        var record = this.record;

        this.$el.on({
            "mousedown.draw-canvas": function mousedownDrawCanvas(e) {
                // Left mouse button
                if (record.recording && e.button === 0) {
                    self.startLine(e.offsetX, e.offsetY);
                    e.preventDefault();
                }
            },

            "mousemove.draw-canvas": function mousemoveDrawCanvas(e) {
                if (record.recording) {
                    self.drawLine(e.offsetX, e.offsetY);
                }
            },

            "mouseup.draw-canvas": function mouseupDrawCanvas(e) {
                if (record.recording) {
                    self.endLine();
                }
            },

            "mouseout.draw-canvas": function mouseoutDrawCanvas(e) {
                if (record.recording) {
                    self.endLine();
                }
            }
        });

        record.on("runSeek", function () {
            self.clear(true);
            self.endDraw();
        });

        // Handle record seek caching
        record.seekCachers.canvas = {
            getState: function getState() {
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

            restoreState: function restoreState(cacheData) {
                self.startDraw();

                // Restore Canvas state
                self.x = cacheData.x;
                self.y = cacheData.y;
                self.down = cacheData.down;
                self.setColor(cacheData.color);

                // Restore canvas image
                // Disable shadow (otherwise the image will have a shadow!)
                var oldShadow = self.ctx.shadowColor;
                self.ctx.shadowColor = "rgba(0,0,0,0.0)";
                self.ctx.drawImage(cacheData.canvas, 0, 0);
                self.ctx.shadowColor = oldShadow;
            }
        };

        // Initialize playback commands
        _.each(this.commands, function (name) {
            record.handlers[name] = function () {
                self[name].apply(self, arguments);
            };
        });
    },

    startLine: function startLine(x, y) {
        if (!this.down) {
            this.down = true;
            this.x = x;
            this.y = y;

            this.record.log("startLine", x, y);
        }
    },

    drawLine: function drawLine(x, y) {
        if (this.down && this.x != null && this.y != null) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.closePath();

            this.x = x;
            this.y = y;

            this.record.log("drawLine", x, y);
        }
    },

    endLine: function endLine() {
        if (this.down) {
            this.down = false;
            this.record.log("endLine");
        }
    },

    setColor: function setColor(color) {
        if (color != null) {
            if (!this.isDrawing) {
                this.startDraw(true);
            }

            this.color = color;

            this.ctx.shadowColor = "rgba(" + this.colors[color] + ",0.5)";
            this.ctx.strokeStyle = "rgba(" + this.colors[color] + ",1.0)";

            this.record.log("setColor", color);
        }

        this.trigger("colorSet", color);
    },

    clear: function clear(force) {
        // Clean off the canvas
        this.ctx.clearRect(0, 0, 600, 480);
        this.x = null;
        this.y = null;
        this.down = false;

        if (force !== true) {
            this.record.log("clear");
        }
    },

    startDraw: function startDraw(colorDone) {
        if (this.isDrawing) {
            return;
        }

        this.isDrawing = true;

        if (colorDone !== true) {
            this.setColor("black");
        }

        this.trigger("drawStarted");
    },

    endDraw: function endDraw() {
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

    initialize: function initialize(options) {
        // The saved audio chunks
        this.audioChunks = [];
        // The current chunk we have not yet saved or discarded
        this.currentChunk = null;
    },

    setCurrentChunk: function setCurrentChunk(recording) {
        this.currentChunk = recording;
    },

    currentChunkExists: function currentChunkExists() {
        return !_.isNull(this.currentChunk);
    },

    startNewChunk: function startNewChunk() {
        this.currentChunk = null;
    },

    discardCurrentChunk: function discardCurrentChunk() {
        this.currentChunk = null;
    },

    saveCurrentChunk: function saveCurrentChunk() {
        if (!this.currentChunk) {
            return;
        }
        this.audioChunks.push(this.currentChunk);
        this.currentChunk = null;
    },

    /* Return the array of audio chunks, not yet stitched together. */
    getAllChunks: function getAllChunks() {
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
    initialize: function initialize(options) {
        this.render();
        this.$recordButton = options.recordButton;
        this.$finalSaveButton = options.saveButton;
        this.editor = options.editor;
        this.record = options.record;
        this.config = options.config;
        this.drawCanvas = options.drawCanvas;
        this.workersDir = options.workersDir;
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

    render: function render() {
        this.$el.html(Handlebars.templates["dev-record"]({})).show();
    },

    initializeButtons: function initializeButtons() {
        // Set up the buttons
        this.$newChunkButton = this.$el.find(".scratchpad-dev-new-chunk");
        this.$discardChunkButton = this.$el.find(".scratchpad-dev-discard-chunk");
        this.$saveChunkButton = this.$el.find(".scratchpad-dev-save-chunk");
        this.$refreshEditorButton = this.$el.find(".scratchpad-dev-refresh-editor-state");
        // Disable chunk buttons to start
        this.disableChunkButtons(true, true, true, true, false);
        // Bind event listeners
        this.$newChunkButton.on("click", _.bind(this.newChunk, this));
        this.$discardChunkButton.on("click", _.bind(this.discardChunk, this));
        this.$saveChunkButton.on("click", _.bind(this.saveChunk, this));
        this.$refreshEditorButton.on("click", _.bind(this.refreshEditor, this));
    },

    /* Set up everything and get permission for recording. */
    initializeRecordingAudio: function initializeRecordingAudio() {
        // Start recording the presenter's audio
        this.multirecorder = new MultiRecorder({
            workerPath: this.workersDir + "shared/multirecorder-worker.js"
        });
        this.$recordButton.text("Use the chunks (and give permission)");
        this.setButtonDisableStatus(this.$recordButton, true);
        this.disableChunkButtons(false, true, true, true, true);
    },

    /* Start recording audio after a brief countdown for preparation.
     *   Leads to startRecordingCommands() being called,
     *   so no need to call startRecordingCommands manually.
     */
    startRecordingAudio: function startRecordingAudio() {
        var self = this;

        this.lastSavedCode = this.editor.text();
        this.multirecorder.startRecording(1).progress(_.bind(function (seconds) {
            this.$newChunkButton.text(seconds + "...");
        }, this)).done(_.bind(function () {
            this.disableChunkButtons(false, true, true, true, true);
            self.record.recordingAudio = true;
            this.$newChunkButton.html("Stop recording chunk");
            this.startRecordingCommands();
        }, this));
    },

    /* Stop recording audio. Called from ScratchpadUI as a result of the
     *  call to stopRecordingCommands. */
    stopRecordingAudio: function stopRecordingAudio() {
        this.multirecorder.stopRecording().done(_.bind(function (recording) {
            this.audioChunks.setCurrentChunk(recording);
            this.$lastAudioChunkElem.html(recording.createAudioPlayer());
        }, this));
    },

    /* Display a sound player with all the saved audio chunks. */
    showSavedAudioChunks: function showSavedAudioChunks() {
        this.getFinalAudioRecording(_.bind(function (saved) {
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
    getDurationMsOfSavedAudio: function getDurationMsOfSavedAudio() {
        var durationMs = 0;
        var audioElem = $(this.$savedAudioChunksElem).find("audio");
        if (audioElem && audioElem.length > 0) {
            durationMs = audioElem[0].duration * 1000;
        }
        return durationMs;
    },

    /* Start recording user commands. Should only be called from
     *  startRecordingAudio. */
    startRecordingCommands: function startRecordingCommands() {
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
        this.record.log("select", 0, 0);
        this.editor.setCursor({ row: 0, column: 0 });
    },

    /* Stop recording commands. This will trigger an event sequence that
     *    will lead to stopRecordingAudio being called as well.
     *
     * Currently assumes that when we stop recording commands, we want
     * to upload the recording.
     */
    stopRecordingCommands: function stopRecordingCommands() {
        this.record.stopRecordChunk();
    },

    /* Return the final audio recording, with all the audio chunks stitched
     *  together. */
    getFinalAudioRecording: function getFinalAudioRecording(callback) {
        this.multirecorder.combineRecordings(this.audioChunks.getAllChunks()).done(callback);
    },

    /* Return the final commands recording, with all the command chunks
     *  stitched together. */
    getFinalCommandRecording: function getFinalCommandRecording() {
        return this.record.dumpRecording();
    },

    /* Start recording a new chunk, or stop recording the current chunk
     *  (the button toggles) */
    newChunk: function newChunk() {
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
            this.stopRecordingCommands(); // Leads to stopRecordingAudio
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
    discardChunk: function discardChunk(evt) {
        if (!this.audioChunks.currentChunkExists()) {
            return;
        }
        this.audioChunks.discardCurrentChunk();
        this.record.discardRecordChunk();
        this.$lastAudioChunkElem.empty();
        this.refreshEditor();
    },

    /* Save the chunk we just recorded. */
    saveChunk: function saveChunk(evt) {
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
    refreshEditor: function refreshEditor(evt) {
        this.record.loadRecording(this.record.dumpRecording());
        this.editor.editor.setReadOnly(false);
        this.record.initData = this.record.actualInitData;
        // Add an empty command to force the Record playback to
        // keep playing until the audio track finishes playing
        if (this.record.commands) {
            this.record.commands.push([this.getDurationMsOfSavedAudio(), "seek"]);
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
        setTimeout(_.bind(function () {
            this.disableChunkButtons(false, true, true, false, false);
        }, this), 1000);
    },

    /*
     * Quick way to set the disabled state for lots of recording-related
     *  buttons at once.
     */
    disableChunkButtons: function disableChunkButtons(newBool, discardBool, saveBool, refreshBool, finalBool) {
        this.setButtonDisableStatus(this.$newChunkButton, newBool);
        this.setButtonDisableStatus(this.$discardChunkButton, discardBool);
        this.setButtonDisableStatus(this.$saveChunkButton, saveBool);
        this.setButtonDisableStatus(this.$refreshEditorButton, refreshBool);
        this.setButtonDisableStatus(this.$finalSaveButton, finalBool);
    },

    /* Updated the button to the disabledStatus, if defined. */
    setButtonDisableStatus: function setButtonDisableStatus($button, disabledStatus) {
        if (!_.isUndefined(disabledStatus)) {
            $button.prop("disabled", disabledStatus);
        }
    }

});
window.LiveEditor = Backbone.View.extend({
    dom: {
        DRAW_CANVAS: ".scratchpad-draw-canvas",
        DRAW_COLOR_BUTTONS: "#draw-widgets a.draw-color-button",
        CANVAS_WRAP: ".scratchpad-canvas-wrap",
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
        OUTPUT_DIV: "#output",
        ALL_OUTPUT: "#output, #output-frame",
        RESTART_BUTTON: "#restart-code",
        GUTTER_ERROR: ".ace_error",
        ERROR_BUDDY_HAPPY: ".error-buddy-happy",
        ERROR_BUDDY_THINKING: ".error-buddy-thinking"
    },

    mouseCommands: ["move", "over", "out", "down", "up"],
    colors: ["black", "red", "orange", "green", "blue", "lightblue", "violet"],

    defaultOutputWidth: 400,
    defaultOutputHeight: 400,

    editors: {},

    initialize: function initialize(options) {
        var _this = this;

        this.workersDir = this._qualifyURL(options.workersDir);
        this.externalsDir = this._qualifyURL(options.externalsDir);
        this.imagesDir = this._qualifyURL(options.imagesDir);
        this.soundsDir = options.soundsDir;
        this.execFile = options.execFile ? this._qualifyURL(options.execFile) : "";
        this.jshintFile = this._qualifyURL(options.jshintFile || this.externalsDir + "jshint/jshint.js");
        this.redirectUrl = options.redirectUrl;

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
            // Drawing has started
            drawStarted: (function () {
                // Activate the canvas
                this.$el.find(this.dom.DRAW_CANVAS).show();
            }).bind(this),

            // Drawing has ended
            drawEnded: (function () {
                // Hide the canvas
                this.$el.find(this.dom.DRAW_CANVAS).hide();
            }).bind(this),

            // A color has been chosen
            colorSet: (function (color) {
                // Deactivate all the color buttons
                this.$el.find(this.dom.DRAW_COLOR_BUTTONS).removeClass("ui-state-active");

                // If a new color has actually been chosen
                if (color !== null) {
                    // Select that color and activate the button
                    this.$el.find("#" + color).addClass("ui-state-active");
                }
            }).bind(this)
        });

        // TEMP: Set up a query param for testing the new error experience
        // Looks to see if "new_error_experience=yes" is in the url,
        //  if it is, then we use the new error buddy behaviour.
        this.newErrorExperience = false;
        if (window.location.search.indexOf("new_error_experience=yes") !== -1) {
            this.newErrorExperience = true;
        }

        // Set up the editor
        this.editor = new this.editors[this.editorType]({
            el: this.dom.EDITOR,
            code: this.initialCode,
            autoFocus: options.autoFocus,
            config: this.config,
            record: this.record,
            imagesDir: this.imagesDir,
            soundsDir: this.soundsDir,
            externalsDir: this.externalsDir,
            workersDir: this.workersDir,
            type: this.editorType
        });

        var ast = {
            type: "Program",
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: "fill"
                    },
                    arguments: [{
                        type: "Literal",
                        raw: "255"
                    }, {
                        type: "Literal",
                        raw: "0"
                    }, {
                        type: "Literal",
                        raw: "0"
                    }]
                }
            }, {
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: "rect"
                    },
                    arguments: [{
                        type: "Literal",
                        raw: "100"
                    }, {
                        type: "Literal",
                        raw: "100"
                    }, {
                        type: "Literal",
                        raw: "100"
                    }, {
                        type: "Literal",
                        raw: "100"
                    }]
                }
            }]
        };

        setTimeout(function () {
            ASTEditor.init(_this.editor.editor, ast);
            _this.editor.editor.setOptions({
                fontSize: "20px"
            });
            ASTEditor.watcher.on("run", function (userCode) {
                console.log(userCode);
                _this.markDirty();
            });
        });

        var tooltipEngine = this.config.editor.tooltipEngine;
        if (tooltipEngine.setEnabledStatus) {
            // Looks to see if "autosuggestToggle=yes" is in the url,
            //  if it is, then we disable the live autosuggestions.
            if (window.location.search.indexOf("autosuggestToggle=yes") !== -1) {

                // Overrides whatever is in localStorage.
                // TODO (anyone) remove this when the URL param is removed.
                window.localStorage["autosuggest"] = "true";

                // Allows toggling of the autosuggestions.
                this.editor.editor.commands.addCommand({
                    name: "toggleAutosuggest",
                    bindKey: {
                        win: "Ctrl+Alt+A",
                        mac: "Command+Option+A"
                    },
                    exec: function exec(editor) {
                        var status = window.localStorage["autosuggest"] === "true";

                        tooltipEngine.setEnabledStatus(status !== true);

                        window.localStorage.setItem("autosuggest", String(status !== true));
                    }
                });
            } else {
                // since we load the enabled value from localStorage...
                tooltipEngine.setEnabledStatus("true");
            }
        }

        // linting in the webpage environment generates slowparseResults which
        // is used in the runCode step so skipping linting won't work in that
        // environment without some more work
        if (this.editorType === "ace_pjs") {
            this.noLint = false;
            this.editor.on("scrubbingStarted", (function () {
                this.noLint = true;
            }).bind(this));

            this.editor.on("scrubbingEnded", (function () {
                this.noLint = false;
            }).bind(this));
        }

        this.tipbar = new TipBar({
            el: this.$(this.dom.OUTPUT_DIV),
            liveEditor: this
        });

        // Set up the debugger;
        if (options.useDebugger) {
            this["debugger"] = new ScratchpadDebugger({
                liveEditor: this,
                editor: this.editor.editor
            });
            this["debugger"].on("enabled", function (enabled) {
                if (enabled) {
                    this.$el.find(this.dom.RESTART_BUTTON).attr("disabled", "");
                } else {
                    this.$el.find(this.dom.RESTART_BUTTON).removeAttr("disabled");
                }
            }, this);
        }

        var code = options.code;

        // Load the text into the editor
        if (code !== undefined) {
            this.editor.text(code);
            this.editor.originalCode = code;
        }

        // Focus on the editor
        this.editor.focus();

        //if (options.cursor) {
        //    // Restore the cursor position
        //    this.editor.setCursor(options.cursor);
        //
        //} else {
        //    // Set an initial starting selection point
        //    this.editor.setSelection({
        //        start: {row: 0, column: 0},
        //        end: {row: 0, column: 0}
        //    });
        //}

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

    render: function render() {
        this.$el.html(Handlebars.templates["live-editor"]({
            execFile: this.execFile,
            imagesDir: this.imagesDir,
            colors: this.colors
        }));
    },

    bind: function bind() {
        var self = this;
        var $el = this.$el;
        var dom = this.dom;

        // Make sure that disabled buttons can't still be used
        $el.delegate(".simple-button.disabled, .ui-state-disabled", "click", function (e) {
            e.stopImmediatePropagation();
            return false;
        });

        // Handle the restart button
        $el.delegate(this.dom.RESTART_BUTTON, "click", this.restartCode.bind(this));

        this.handleMessagesBound = this.handleMessages.bind(this);
        $(window).on("message", this.handleMessagesBound);

        $el.find("#output-frame").on("load", (function () {
            this.outputState = "clean";
            this.markDirty();
        }).bind(this));

        // Whenever the user changes code, execute the code
        this.editor.on("change", (function () {
            this.markDirty();
        }).bind(this));

        this.editor.on("userChangedCode", (function () {
            if (!this.record.recording && !this.record.playing) {
                this.trigger("userChangedCode");
            }
        }).bind(this));

        this.on("runDone", this.runDone.bind(this));

        // This function will fire once after each synchrynous block which changes the cursor
        // or the current selection. We use it for tag highlighting in webpages.
        var cursorDirty = function cursorDirty() {
            if (self.outputState !== "clean") {
                // This will fire after markDirty() itself gets a chance to start a new run
                // So it will just keep resetting itself until one run comes back and there are
                // no changes waiting
                self.once("runDone", cursorDirty);
            } else {
                setTimeout(function () {
                    if (self.editor.getSelectionIndices) {}
                    self.editor.once("changeCursor", cursorDirty);
                }, 0);
            }
        };
        this.editor.once("changeCursor", cursorDirty);

        this.config.on("versionSwitched", (function (e, version) {
            // Re-run the code after a version switch
            this.markDirty();

            // Run the JSHint config
            this.config.runVersion(version, "jshint");
        }).bind(this));

        if (this.hasAudio()) {
            $el.find(".overlay").show();
            $el.find(dom.BIG_PLAY_LOADING).show();
            $el.find(dom.PLAYBAR).show();
        }

        // Set up color button handling
        $el.find(dom.DRAW_COLOR_BUTTONS).each(function () {
            $(this).addClass("ui-button").children().css("background", this.id);
        });

        // Set up toolbar buttons
        if (jQuery.fn.buttonize) {
            $el.buttonize();
        }

        // Handle color button clicks during recording
        $el.on("buttonClick", "a.draw-color-button", function () {
            self.drawCanvas.setColor(this.id);
            self.editor.focus();
        });

        // If the user clicks the disable overlay (which is laid over
        // the editor and canvas on playback) then pause playback.
        $el.on("click", ".disable-overlay", function () {
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
            start: function start() {
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
            slide: function slide(e, ui) {
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
            stop: function stop(e, ui) {
                self.record.seeking = false;
                self.updateTimeLeft(ui.value * 1000);

                // If we were playing when we started sliding, resume playing
                if (self.wasPlaying) {
                    // Set the timeout to give time for the events to catch up
                    // to the present -- if we start before the events have
                    // finished, the scratchpad editor code will be in a bad
                    // state. Wait roughly a second for events to settle down.
                    setTimeout(function () {
                        self.record.play();
                    }, 1000);
                }
            }
        });

        var handlePlayClick = function handlePlayClick() {
            if (self.record.playing) {
                self.record.pausePlayback();
            } else {
                self.record.play();
            }
        };

        // Handle the play button
        $el.find(dom.PLAYBAR_PLAY).off("click.play-button").on("click.play-button", handlePlayClick);

        var handlePlayButton = function handlePlayButton() {
            // Show the playback bar and hide the loading message
            $el.find(dom.PLAYBAR_LOADING).hide();
            $el.find(dom.PLAYBAR_AREA).show();

            // Handle the big play button click event
            $el.find(dom.BIG_PLAY_BUTTON).off("click.big-play-button").on("click.big-play-button", function () {
                $el.find(dom.BIG_PLAY_BUTTON).hide();
                handlePlayClick();
            });

            $el.find(dom.PLAYBAR_PLAY).on("click", function () {
                $el.find(dom.BIG_PLAY_BUTTON).hide();
            });

            // Hide upon interaction with the editor
            $el.find(dom.EDITOR).on("click", function () {
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
        $el.on("buttonClick", "#draw-clear-button", function () {
            self.drawCanvas.clear();
            self.drawCanvas.endDraw();
            self.editor.focus();
        });

        // Handle the restart button
        $el.on("click", this.dom.RESTART_BUTTON, function () {
            self.record.log("restart");
        });

        // Handle the gutter errors
        $el.on("click", this.dom.GUTTER_ERROR, function () {
            self.setErrorPosition(parseInt($(this).text(), 10));
        });

        // Handle clicks on the thinking Error Buddy
        $el.on("click", this.dom.ERROR_BUDDY_THINKING, function () {
            self.setErrorPosition(0);
        });

        // Bind the handler to start a new recording
        $el.find("#record").on("click", function () {
            self.recordHandler(function (err) {
                if (err) {
                    // TODO: Change this:
                    console.error(err);
                }
            });
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
    },

    remove: function remove() {
        $(window).off("message", this.handleMessagesBound);
        this.editor.remove();
    },

    canRecord: function canRecord() {
        return this.transloaditAuthKey && this.transloaditTemplate;
    },

    hasAudio: function hasAudio() {
        return !!this.recordingMP3;
    },

    setupAudio: function setupAudio() {
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
            // See sm2-container in play-page.handlebars and flashblock.css
            useFlashBlock: true,
            // Sometimes when Flash is blocked or the browser is slower,
            //  soundManager will fail to initialize at first,
            //  claiming no response from the Flash file.
            // To handle that, we attempt a reboot 3 seconds after each
            //  timeout, clearing the timer if we get an onready during
            //  that time (which happens if user un-blocks flash).
            onready: function onready() {
                window.clearTimeout(rebootTimer);
                self.audioInit();
            },
            ontimeout: function ontimeout(error) {
                // The onready event comes pretty soon after the user
                //  clicks the flashblock, but not instantaneous, so 3
                //  seconds seems a good amount of time to give them the
                //  chance to click it before we remove it. It's possible
                //  they may have to click twice sometimes
                //  (but the second time time will work).
                window.clearTimeout(rebootTimer);
                rebootTimer = window.setTimeout(function () {
                    // Clear flashblocker divs
                    self.$el.find("#sm2-container div").remove();
                    soundManager.reboot();
                }, 3000);
            }
        });
        soundManager.beginDelayedInit();

        this.bindRecordHandlers();
    },

    audioInit: function audioInit() {
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
            id: "sound" + new Date().getTime(),

            url: this.recordingMP3,

            // Load the audio automatically
            autoLoad: true,

            // While the audio is playing update the position on the progress
            // bar and update the time indicator
            whileplaying: (function () {
                self.updateTimeLeft(record.currentTime());

                if (!record.seeking) {
                    // Slider takes values in seconds
                    self.$el.find(self.dom.PLAYBAR_PROGRESS).slider("option", "value", record.currentTime() / 1000);
                }

                record.trigger("playUpdate");
            }).bind(this),

            // Hook audio playback into Record command playback
            // Define callbacks rather than sending the function directly so
            // that the scope in the Record methods is correct.
            onplay: function onplay() {
                record.play();
            },
            onresume: function onresume() {
                record.play();
            },
            onpause: function onpause() {
                record.pausePlayback();
            },
            onload: function onload() {
                record.durationEstimate = record.duration = this.duration;
                record.trigger("loaded");
            },
            whileloading: function whileloading() {
                record.duration = null;
                record.durationEstimate = this.durationEstimate;
                record.trigger("loading");
            },
            // When audio playback is complete, notify everyone listening
            // that playback is officially done
            onfinish: function onfinish() {
                record.stopPlayback();
                record.trigger("playEnded");
            },
            onsuspend: function onsuspend() {
                // Suspend happens when the audio can't be loaded automatically
                // (such is the case on iOS devices). Thus we trigger a
                // readyToPlay event anyway and let the load happen when the
                // user clicks the play button later on.
                self.trigger("readyToPlay");
            }
        });

        // Wait to start playback until we at least have some
        // bytes from the server (otherwise the player breaks)
        var checkStreaming = setInterval(function () {
            // We've loaded enough to start playing
            if (self.audioReadyToPlay()) {
                clearInterval(checkStreaming);
                self.trigger("readyToPlay");
            }
        }, 16);

        this.bindPlayerHandlers();
    },

    audioReadyToPlay: function audioReadyToPlay() {
        // NOTE(pamela): We can't just check bytesLoaded,
        //  because IE reports null for that
        // (it seems to not get the progress event)
        // So we've changed it to also check loaded.
        // If we need to, we can reach inside the HTML5 audio element
        //  and check the ranges of the buffered property
        return this.player && (this.player.bytesLoaded > 0 || this.player.loaded);
    },

    bindPlayerHandlers: function bindPlayerHandlers() {
        var self = this;
        var record = this.record;

        // Bind events to the Record object, to track when playback events occur
        this.record.bind({
            loading: function loading() {
                self.updateDurationDisplay();
            },

            loaded: function loaded() {
                // Add an empty command to force the Record playback to
                // keep playing until the audio track finishes playing
                var commands = record.commands;

                if (commands) {
                    commands.push([Math.max(record.endTime(), commands[commands.length - 1][0]), "seek"]);
                }
                self.updateDurationDisplay();
            },

            // When play has started
            playStarted: function playStarted() {
                // If the audio player is paused, resume playing
                if (self.player.paused) {
                    self.player.resume();

                    // Otherwise we can assume that we need to start playing from the top
                } else if (self.player.playState === 0) {
                    self.player.play();
                }
            },

            // Pause when recording playback pauses
            playPaused: function playPaused() {
                self.player.pause();
            }
        });
    },

    bindRecordHandlers: function bindRecordHandlers() {
        var self = this;
        var record = this.record;

        /*
         * Bind events to Record (for recording and playback)
         * and to ScratchpadCanvas (for recording and playback)
         */

        record.bind({
            // Playback of a recording has begun
            playStarted: function playStarted(e, resume) {
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
                self.$el.find(self.dom.RESTART_BUTTON).addClass("disabled");

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
                self.$el.find(self.dom.PLAYBAR_PLAY).find("span").removeClass("glyphicon-play icon-play").addClass("glyphicon-pause icon-pause");
            },

            playEnded: function playEnded() {
                // Re-init if the recording version is different from
                // the scratchpad's normal version
                self.config.switchVersion(this.initialVersion);
            },

            // Playback of a recording has been paused
            playPaused: function playPaused() {
                // Turn off playback-related styling
                $("html").removeClass("playing");

                // Disable the blocking overlay
                self.$el.find(".disable-overlay").hide();

                // Allow the user to restart the code again
                self.$el.find(self.dom.RESTART_BUTTON).removeClass("disabled");

                // Re-enable the record button after playback
                self.$el.find("#record").removeClass("disabled");

                // Deactivate the play button
                self.$el.find(self.dom.PLAYBAR_PLAY).find("span").addClass("glyphicon-play icon-play").removeClass("glyphicon-pause icon-pause");
            },

            // Recording has begun
            recordStarted: function recordStarted() {
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
            recordEnded: function recordEnded() {
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
                // to its initial state.
                self.drawCanvas.endDraw();
            }
        });

        // ScratchpadCanvas mouse events to track
        // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
        _.each(this.mouseCommands, function (name) {
            // Handle the command during playback
            record.handlers[name] = function (x, y) {
                self.postFrame({
                    mouseAction: {
                        name: name,
                        x: x,
                        y: y
                    }
                });
            };
        });

        // When a restart occurs during playback, restart the output
        record.handlers.restart = function () {
            var $restart = self.$el.find(self.dom.RESTART_BUTTON);

            if (!$restart.hasClass("hilite")) {
                $restart.addClass("hilite green");
                setTimeout(function () {
                    $restart.removeClass("hilite green");
                }, 300);
            }

            self.postFrame({ restart: true });
        };

        // Force the recording to sync to the current time of the audio playback
        record.currentTime = function () {
            return self.player ? self.player.position : 0;
        };

        // Create a function for retreiving the track end time
        // Note that duration will be set to the duration estimate while
        // the track is still loading, and only set to actual duration
        // once its loaded.
        record.endTime = function () {
            return this.duration || this.durationEstimate;
        };
    },

    recordHandler: function recordHandler(callback) {
        // If we're already recording, stop
        if (this.record.recording) {
            // Note: We should never hit this case when recording chunks.
            this.recordView.stopRecordingCommands();
            return;
        }

        var saveCode = this.editor.text();

        // You must have some code in the editor before you start recording
        // otherwise the student will be starting with a blank editor,
        // which is confusing
        if (!saveCode) {
            callback({ error: "empty" });
        } else if (this.config.curVersion() !== this.config.latestVersion()) {
            callback({ error: "outdated" });
        } else if (this.canRecord() && !this.hasAudio()) {
            this.startRecording();
            this.editor.focus();
        } else {
            callback({ error: "exists" });
        }
    },

    startRecording: function startRecording() {
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
    },

    saveRecording: function saveRecording(callback, steps) {
        // If no command or audio recording was made, just save the results
        if (!this.record.recorded || !this.record.recordingAudio) {
            return callback();
        }

        var transloadit = new TransloaditXhr({
            authKey: this.transloaditAuthKey,
            templateId: this.transloaditTemplate,
            steps: steps,
            successCb: (function (results) {
                this.recordingMP3 = results.mp3[0].url.replace(/^http:/, "https:");
                callback(null, this.recordingMP3);
            }).bind(this),
            errorCb: callback
        });

        this.recordView.getFinalAudioRecording(function (combined) {
            transloadit.uploadFile(combined.wav);
        });
    },

    // We call this function multiple times, because the
    // endTime value may change as we load the file
    updateDurationDisplay: function updateDurationDisplay() {
        // Do things that are dependent on knowing duration

        // This gets called if we're loading while we're playing,
        // so we need to update with the current time
        this.updateTimeLeft(this.record.currentTime());

        // Set the duration of the progress bar based upon the track duration
        // Slider position is set in seconds
        this.$el.find(this.dom.PLAYBAR_PROGRESS).slider("option", "max", this.record.endTime() / 1000);
    },

    // Update the time left in playback of the track
    updateTimeLeft: function updateTimeLeft(time) {
        // Update the time indicator with a nicely formatted time
        this.$el.find(".scratchpad-playbar-timeleft").text("-" + this.formatTime(this.record.endTime() - time));
    },

    // Utility method for formatting time in minutes/seconds
    formatTime: function formatTime(time) {
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
    seekTo: function seekTo(timeMS) {
        // Don't update the slider position when seeking
        // (since this triggers an event on the #progress element)
        if (!this.record.seeking) {
            this.$el.find(this.dom.PLAYBAR_PROGRESS).slider("option", "value", timeMS / 1000);
        }

        // Move the recording and player positions
        if (this.record.seekTo(timeMS) !== false) {
            this.player.setPosition(timeMS);
        }
    },

    handleMessages: function handleMessages(e) {
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);
        } catch (err) {}

        if (!data) {
            return;
        }

        if (data.type === "debugger") {
            // these messages are handled by ui/debugger.js:listenMessages
            return;
        }

        this.trigger("update", data);

        // Hide loading overlay if output is loaded
        // We previously just looked at data.loaded,
        // but that didn't work for some users (maybe message too early?)
        // so now we also hide if we see data.results

        if (data.loaded || data.results) {
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

        if (data.results) {
            this.trigger("runDone");
        }

        if (this.editorType.indexOf("ace_") === 0 && data.results && data.results.assertions) {

            // Add gutter warning markers for assertions in the editor.
            // E.g. Add `Program.assertEqual(2, 4);` to the live editor to see
            // an example.
            var annotations = [];
            for (var i = 0; i < data.results.assertions.length; i++) {

                var unitTest = data.results.assertions[i];
                annotations.push({
                    row: unitTest.row,
                    column: unitTest.column,
                    text: unitTest.text,
                    type: "warning"
                });
                this.addUnderlineMarker(unitTest.row);
            }

            // Remove previously added markers
            this.removeMarkers();
            // Add new gutter markers
            this.editor.editor.session.setAnnotations(annotations);
        }

        if (this.newErrorExperience && this.errorState.length === 0) {
            this.setHappyState();
        }

        if (data.results && _.isArray(data.results.errors)) {
            this.handleErrors(data.results.errors);
        }

        // Set the line visibility in the editor
        if (data.lines !== undefined) {
            this.editor.toggleGutter(data.lines);
        }

        // Restart the execution
        if (data.restart) {
            this.restartCode();
        }

        // Log the recorded action
        if (data.log) {
            this.record.log.apply(this.record, data.log);
        }
    },

    addUnderlineMarker: function addUnderlineMarker(row) {
        // Underline the problem line to make it more obvious
        //  if they don't notice the gutter icon
        var AceRange = ace.require("ace/range").Range;
        var line = this.editor.editor.session.getDocument().getLine(row);
        this.editor.editor.session.addMarker(new AceRange(row, 0, row, line.length), "ace_problem_line", "text", false);
    },

    removeMarkers: function removeMarkers() {
        // Remove previously added markers and decorations
        var session = this.editor.editor.session;
        var markers = session.getMarkers();
        _.each(markers, function (marker, markerId) {
            session.removeMarker(markerId);
        });
    },

    removeGutterDecorations: function removeGutterDecorations() {
        // Remove old gutter decorations
        var session = this.editor.editor.session;
        _.each(this.gutterDecorations, function (errorOffset, errorRow) {
            session.removeGutterDecoration(errorRow - 1, "ace_error");
        });
    },

    gutterDecorations: [],
    errorCursorRow: null,
    showError: null,

    handleErrors: function handleErrors(errors) {

        if (!this.newErrorExperience) {
            this.tipbar.toggleErrors(errors, 1500);
            return;
        }

        // New Error Experience:

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

        var currentRow = this.editor.getCursor().row;

        // Reset the timer
        window.clearInterval(this.errorTimeout);

        if (errors.length) {
            // There is an error
            var session = this.editor.editor.session;

            // Remove old gutter markers and decorations
            this.removeMarkers();
            this.removeGutterDecorations();

            // Add gutter decorations
            var gutterDecorations = [];
            _.each(errors, function (error, index) {
                // Create a log of which row corresponds with which error
                // message so that when the user clicks a gutter marker they
                // are shown the relevant error message.
                if (gutterDecorations[error.row + 1] == null) {
                    gutterDecorations[error.row + 1] = index;
                    session.addGutterDecoration(error.row, "ace_error");
                }

                this.addUnderlineMarker(error.row);
            }, this);

            this.gutterDecorations = gutterDecorations;

            // Set the errors
            this.setErrors(errors);

            var onlyErrorsOnThisLine = this.errorCursorRow === null || this.errorCursorRow === currentRow;
            if (this.errorCursorRow === null) {
                this.errorCursorRow = currentRow;
            }

            // If we were already planning to show the error, or if there are
            // errors on more than the current line, or we have errors and the
            // program was just loaded (i.e. this.showError is null) then we
            // should show the error now. Otherwise we'll delay showing the
            // error message to give them time to type.
            this.showError = this.showError || !onlyErrorsOnThisLine || this.showError === null;

            if (this.showError) {
                // We've already timed out or moved to another line, so show
                // the error.
                this.setErrorState();
            } else if (onlyErrorsOnThisLine) {
                // There are new errors caused by typing on this line, so let's
                // give the typer time to finish what they were writing. We'll
                // show the tipbar if a full minute has gone by without typing.
                this.setThinkingState();

                this.errorTimeout = setTimeout((function () {
                    this.setErrorState();
                }).bind(this), 60000);
            }
        } else {
            // If there are no errors, remove the gutter decorations that marked
            // the errors and reset our state.
            this.removeGutterDecorations();
            this.setHappyState();
            this.showError = false;
            this.errorCursorRow = null;
        }
    },

    // This is the current error state of Oh Noes Guy.
    // His state can be one of:
    // - happy (no errors)
    // - thinking (the ambigous state where there may be an error in what the
    //             typer is currently typing)
    // - error (there is an error that we want to display prominently)
    errorState: "",
    setErrors: function setErrors(errors) {
        this.tipbar.setErrors(errors);
    },
    setErrorPosition: function setErrorPosition(errorPos) {
        this.setErrorState();
        this.tipbar.setErrorPosition(this.gutterDecorations[errorPos]);
    },
    setErrorState: function setErrorState() {
        this.errorState = "error";
        this.$el.find(this.dom.ERROR_BUDDY_THINKING).hide();
        this.$el.find(this.dom.ERROR_BUDDY_HAPPY).hide();
        this.tipbar.update(true);
    },
    setThinkingState: function setThinkingState() {
        if (this.errorState !== "thinking") {
            this.errorState = "thinking";
            this.tipbar.hide();
            this.$el.find(this.dom.ERROR_BUDDY_HAPPY).hide();
            this.$el.find(this.dom.ERROR_BUDDY_THINKING).show();
        }
    },
    setHappyState: function setHappyState() {
        if (this.errorState !== "happy") {
            this.errorState = "happy";
            this.tipbar.hide();
            this.$el.find(this.dom.ERROR_BUDDY_THINKING).hide();
            this.$el.find(this.dom.ERROR_BUDDY_HAPPY).show();
        }
    },

    // Extract the origin from the embedded frame location
    postFrameOrigin: function postFrameOrigin() {
        var match = /^.*:\/\/[^\/]*/.exec(this.$el.find("#output-frame").attr("data-src"));

        return match ? match[0] : window.location.protocol + "//" + window.location.host;
    },

    postFrame: function postFrame(data) {
        // Send the data to the frame using postMessage
        this.$el.find("#output-frame")[0].contentWindow.postMessage(JSON.stringify(data), this.postFrameOrigin());
    },

    hasFrame: function hasFrame() {
        return !!this.execFile;
    },

    /*
     * Restart the code in the output frame.
     */
    restartCode: function restartCode() {
        this.postFrame({ restart: true });
    },

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
    runCode: _.throttle(function (code) {
        var options = {
            code: arguments.length === 0 ? this.editor.text() : code,
            cursor: this.editor.getSelectionIndices ? this.editor.getSelectionIndices() : -1,
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
            outputType: this.outputType
        };

        this.trigger("runCode", options);

        this.postFrame(options);
    }, 20),

    markDirty: function markDirty() {
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

        if (!this.newErrorExperience) {
            this.tipbar.hide();
        }

        if (this.outputState === "clean") {
            // We will run at the end of this code block
            // This stops replace from trying to execute code
            // between deleting the old code and adding the new code
            setTimeout(this.runCode.bind(this), 0);
            this.outputState = "running";

            // 500ms is an arbitrary timeout. Hopefully long enough for
            // reasonable programs to execute, but short enough for editor to
            // not freeze.
            this.runTimeout = setTimeout((function () {
                this.trigger("runDone");
            }).bind(this), 500);
        } else {
            this.outputState = "dirty";
        }
    },

    // This will either be called when we receive the results
    // Or it will timeout.
    runDone: function runDone() {
        clearTimeout(this.runTimeout);
        var lastOutputState = this.outputState;
        this.outputState = "clean";
        if (lastOutputState === "dirty") {
            this.markDirty();
        }
    },

    // This stops us from sending any updates until the current run has finished
    // Reset output state to clean as a part of the frame load handler
    outputState: "dirty",

    updateCanvasSize: function updateCanvasSize(width, height) {
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
    },

    getScreenshot: function getScreenshot(callback) {
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
            var text = this.editor.text();
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
        $(window).on("message.getScreenshot", function (e) {
            // Only call if the data is actually an image!
            if (/^data:/.test(e.originalEvent.data)) {
                callback(e.originalEvent.data);
            }
        });

        // Ask the frame for a screenshot
        this.postFrame({ screenshot: true });
    },

    undo: function undo() {
        this.editor.undo();
    },

    _qualifyURL: function _qualifyURL(url) {
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    }
});

LiveEditor.registerEditor = function (name, editor) {
    LiveEditor.prototype.editors[name] = editor;
};

//self.postFrame({
//    setCursor: self.editor.getSelectionIndices()
//});

// Malformed JSON, we don't care about it
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["ASTEditor"] = factory();
	else
		root["ASTEditor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var prog = __webpack_require__(1);
	var watcher = __webpack_require__(2).astWatcher;

	module.exports = {
	    init: function init(editor, ast) {
	        ast = ast || prog;

	        var editing = __webpack_require__(4);
	        var navigation = __webpack_require__(6);

	        editing.init(editor, ast);
	        navigation.init(editor, ast);
	    },
	    watcher: watcher
	};

	// TODO: dragging to create a selection should always select nodes that make sense to replace or delete
	// TODO: delete => replace with Placeholder
	// TODO: figure out undo/redo on the AST
	// TODO: certain nodes can be edited, e.g. Literals, Identifiers... other nodes can not
	// TODO: select the whole node when it can't be edited when placing the cursor somewhere
	// TODO: handle replacing the current selection
	// TODO: undo/redo using either ast-path to identify nodes or use references for children in the AST
	// TODO: create a custom highlight mode in ace that uses the AST to determine colors
	// TODO: have ace scroll to the line it was on before we replaced everything
	// TODO: don't replace everything in the ace editor
	// TODO: disallow return statements inside of for-loop

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	var prog = {
	    type: "Program",
	    body: [{
	        type: "LineComment",
	        content: "Single line comment" // newlines are disallowed
	    }, {
	        type: "BlockComment",
	        content: "Block Comment\nLine 1\nLine 2"
	    }, {
	        type: "BlankStatement"
	    }, {
	        type: "ForOfStatement",
	        left: {
	            type: "VariableDeclaration",
	            declarations: [{
	                type: "VariableDeclarator",
	                id: {
	                    type: "Identifier",
	                    name: "a"
	                },
	                init: null
	            }],
	            kind: "let"
	        },
	        right: {
	            type: "ArrayExpression",
	            elements: [{ type: "Literal", raw: "1.0" }, { type: "Literal", raw: "2.0" }, { type: "Literal", raw: "3.0" }]
	        },
	        body: {
	            type: "BlockStatement",
	            body: [{
	                type: "ExpressionStatement",
	                expression: {
	                    type: "AssignmentExpression",
	                    left: {
	                        type: "Identifier",
	                        name: "a"
	                    },
	                    right: {
	                        type: "BinaryExpression",
	                        operator: "+",
	                        left: {
	                            type: "Identifier",
	                            name: "a"
	                        },
	                        right: {
	                            type: "Literal",
	                            raw: "1"
	                        }
	                    }
	                }
	            }, { type: "BlankStatement" }, {
	                type: "ExpressionStatement",
	                expression: {
	                    type: "CallExpression",
	                    callee: {
	                        type: "Identifier",
	                        name: "ellipse"
	                    },
	                    arguments: [{
	                        type: "BinaryExpression",
	                        operator: "*",
	                        left: {
	                            type: "Identifier",
	                            name: "a"
	                        },
	                        right: {
	                            type: "Literal",
	                            raw: "50"
	                        }
	                    }, {
	                        type: "Literal",
	                        raw: "100"
	                    }, {
	                        type: "Literal",
	                        raw: "100"
	                    }, {
	                        type: "Literal",
	                        raw: "100"
	                    }]
	                }
	            }]
	        }
	    }, { type: "BlankStatement" }, {
	        type: "ClassDeclaration",
	        id: {
	            type: "Identifier",
	            name: "Foo"
	        },
	        body: {
	            type: "ClassBody",
	            body: [{
	                type: "MethodDefinition",
	                key: {
	                    type: "Identifier",
	                    name: "constructor"
	                },
	                value: {
	                    "type": "FunctionExpression",
	                    "id": null,
	                    "params": [],
	                    "defaults": [],
	                    "body": {
	                        "type": "BlockStatement",
	                        "body": [{ type: "BlankStatement" }]
	                    },
	                    "generator": false,
	                    "expression": false
	                },
	                kind: "constructor",
	                computed: false,
	                "static": false
	            }, {
	                type: "MethodDefinition",
	                key: {
	                    type: "Identifier",
	                    name: "bar"
	                },
	                value: {
	                    "type": "FunctionExpression",
	                    "id": null,
	                    "params": [{
	                        type: "Identifier",
	                        name: "x"
	                    }, {
	                        type: "Identifier",
	                        name: "y"
	                    }],
	                    "defaults": [],
	                    "body": {
	                        "type": "BlockStatement",
	                        "body": [{
	                            type: "ReturnStatement",
	                            argument: {
	                                type: "BinaryExpression",
	                                operator: "+",
	                                left: {
	                                    type: "Identifier",
	                                    name: "x"
	                                },
	                                right: {
	                                    type: "Identifier",
	                                    name: "y"
	                                }
	                            }
	                        }]
	                    },
	                    "generator": false,
	                    "expression": false
	                },
	                kind: "method",
	                computed: false,
	                "static": false
	            }]
	        }
	    }]
	};

	module.exports = prog;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var EventEmitter = __webpack_require__(3).EventEmitter;

	var astWatcher = new EventEmitter();

	var indent = "    ";
	var line = undefined,
	    column = undefined,
	    indentLevel = undefined,
	    placeholderCount = undefined;

	function renderAST(node) {
	    line = 1;
	    column = 0;
	    indentLevel = 0;
	    placeholderCount = 0;
	    var result = render(node);

	    if (placeholderCount === 0) {
	        astWatcher.emit("run", result);
	    }

	    return result;
	}

	var renderer = {
	    VariableDeclaration: function VariableDeclaration(node, parent) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        var result = node.kind;
	        result += " ";
	        column += node.kind.length + 1; // node.kind.length + " ".length

	        node.declarations.forEach(function (decl, index) {
	            if (index > 0) {
	                result += ", ";
	                column += 2; // ", ".length
	            }
	            result += render(decl);
	        });

	        node.loc.end = { line: line, column: column };

	        if (parent && parent.type === "ForOfStatement") {
	            return result;
	        } else {
	            return result + ";";
	        }
	    },
	    VariableDeclarator: function VariableDeclarator(node) {
	        if (node.init) {
	            node.loc = {};
	            var result = render(node.id);
	            node.loc.start = node.id.loc.start;
	            result += " = ";
	            column += 3; // " = ".length
	            result += render(node.init);
	            node.loc.end = node.init.loc.end;
	            return result;
	        } else {
	            var result = render(node.id);
	            node.loc = node.id.loc;
	            return result;
	        }
	    },
	    Identifier: function Identifier(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        column += node.name.length;
	        node.loc.end = { line: line, column: column };
	        return node.name;
	    },
	    Placeholder: function Placeholder(node) {
	        placeholderCount++;
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        column += 1; // "?".length
	        node.loc.end = { line: line, column: column };
	        return "?";
	    },
	    BlankStatement: function BlankStatement(node) {
	        node.loc = {
	            start: { line: line, column: column },
	            end: { line: line, column: column }
	        };
	        return "";
	    },
	    ForOfStatement: function ForOfStatement(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = "for (";
	        column += 5; // "for (".length

	        result += render(node.left, node);
	        result += " of ";
	        column += 4; // " of ".length
	        result += render(node.right);
	        result += ") ";

	        result += render(node.body);

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    ArrayExpression: function ArrayExpression(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = "[";
	        column += 1;

	        node.elements.forEach(function (element, index) {
	            if (index > 0) {
	                result += ", ";
	                column += 2; // ", ".length
	            }
	            result += render(element);
	        });

	        result += "]";
	        column += 1;

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    Literal: function Literal(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        if (node.raw) {
	            column += String(node.raw).length;
	        } else {
	            column += String(node.value).length;
	        }
	        node.loc.end = { line: line, column: column };

	        return node.raw ? node.raw : node.value;
	    },
	    BlockStatement: function BlockStatement(node) {
	        var result = "{\n";

	        indentLevel += 1;
	        column += indentLevel * indent.length;
	        line += 1;

	        var children = node.body.map(function (statement) {
	            column = indentLevel * indent.length;
	            var result = indent.repeat(indentLevel) + render(statement);
	            line += 1;
	            return result;
	        });

	        // TODO guarantee that there's always one child
	        var first = node.body[0];
	        var last = node.body[children.length - 1];

	        node.loc = {};
	        node.loc.start = first.loc.start;
	        node.loc.end = last.loc.end;

	        result += children.join("\n") + "\n";

	        indentLevel -= 1;

	        result += indent.repeat(indentLevel) + "}";

	        return result;
	    },
	    ExpressionStatement: function ExpressionStatement(node) {
	        var expr = render(node.expression);

	        node.loc = {
	            start: node.expression.loc.start,
	            end: node.expression.loc.end
	        };

	        return expr + ";";
	    },
	    AssignmentExpression: function AssignmentExpression(node) {
	        var left = render(node.left);
	        column += 3; // " = ".length;
	        var right = render(node.right);

	        node.loc = {
	            start: node.left.loc.start,
	            end: node.right.loc.end
	        };

	        return left + " = " + right;
	    },
	    ReturnStatement: function ReturnStatement(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        column += 7; // "return ".length
	        var arg = render(node.argument);

	        node.loc.end = node.argument.loc.end;

	        return "return " + arg + ";";
	    },
	    Program: function Program(node) {
	        // TODO: unify this with "BlockStatement" which has the same code
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        var result = node.body.map(function (statement) {
	            column = indentLevel * indent.length;
	            var result = indent.repeat(indentLevel) + render(statement);
	            line += 1;
	            return result;
	        }).join("\n") + "\n";
	        node.loc.end = { line: line, column: column };
	        return result;
	    },
	    LineComment: function LineComment(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        var result = "// " + node.content;
	        column += result.length;
	        node.loc.end = { line: line, column: column };
	        return result;
	    },
	    BlockComment: function BlockComment(node) {
	        // TODO: handle indent level
	        node.loc = {};
	        column = indent.length * indentLevel;
	        node.loc.start = { line: line, column: column };
	        var lines = node.content.split("\n");
	        var result = "/*\n" + lines.map(function (line) {
	            return "  " + line + "\n";
	        }).join("") + " */";
	        line += 1 + lines.length; // Program or BlockStatements add another \n
	        column = indent.length * indentLevel;
	        node.loc.end = { line: line, column: column };
	        return result;
	    },
	    BinaryExpression: function BinaryExpression(node) {
	        var left = render(node.left);
	        column += 3; // e.g. " + ".length;
	        var right = render(node.right);

	        node.loc = {
	            start: node.left.loc.start,
	            end: node.right.loc.end
	        };

	        return left + " " + node.operator + " " + right;
	    },
	    Parentheses: function Parentheses(node) {
	        node.loc = {};
	        column += 1; // "(".length
	        var expr = render(node.expression);
	        column += 1; // ")".length
	        var _node$expression$loc = node.expression.loc;
	        var start = _node$expression$loc.start;
	        var end = _node$expression$loc.end;

	        node.loc = {
	            start: {
	                line: start.line,
	                column: start.column - 1
	            },
	            end: {
	                line: end.line,
	                column: end.column + 1
	            }
	        };
	        return "(" + expr + ")";
	    },
	    ClassDeclaration: function ClassDeclaration(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = "class ";
	        column += 6; // "class ".length

	        // not advancing column here is okay because ClassBody (BlockStatement)
	        // resets column when it advances to the first line of the body
	        result += render(node.id) + " " + render(node.body);

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    ClassBody: function ClassBody(node) {
	        return this.BlockStatement(node);
	    },
	    MethodDefinition: function MethodDefinition(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        var result = render(node.key);

	        result += "(";
	        column += 1;
	        node.value.params.forEach(function (element, index) {
	            if (index > 0) {
	                result += ", ";
	                column += 2; // ", ".length
	            }
	            result += render(element);
	        });
	        result += ")";
	        result += " ";

	        result += render(node.value.body);

	        node.loc.end = { line: line, column: column };

	        // kind of a hack b/c there isn't a FunctionExpression rendered in the
	        // the classical sense
	        // TODO figure how to fix this so we can access the identifier separately
	        node.value.loc = {};
	        node.value.loc.start = JSON.parse(JSON.stringify(node.key.loc.end));
	        node.value.loc.start.column += 1;
	        node.value.loc.end = node.loc.end;

	        return result;
	    },
	    CallExpression: function CallExpression(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        var result = render(node.callee);

	        result += "(";
	        column += 1;
	        node.arguments.forEach(function (arg, index) {
	            if (index > 0) {
	                result += ", ";
	                column += 2; // ", ".length
	            }
	            result += render(arg);
	        });
	        result += ")";
	        column += 1;

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    FunctionExpression: function FunctionExpression(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = "function (";
	        column += result.length;
	        node.params.forEach(function (element, index) {
	            if (index > 0) {
	                result += ", ";
	                column += 2; // ", ".length
	            }
	            result += render(element);
	        });
	        result += ")";
	        result += " ";

	        result += render(node.body);

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    MemberExpression: function MemberExpression(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = render(node.object);
	        if (node.computed) {
	            result += "[";
	            column += 1;
	            result += render(node.property);
	            result += "]";
	            column += 1;
	        } else {
	            result += ".";
	            column += 1; // ".".length
	            result += render(node.property);
	        }

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    IfStatement: function IfStatement(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };

	        var result = "if (";
	        column += result.length;

	        result += render(node.test);
	        result += ") ";
	        result += render(node.consequent);

	        if (node.alternate) {
	            result += " else {\n";
	            indentLevel += 1;
	            column += indentLevel * indent.length;
	            line += 1;
	            result += render(node.consequent);

	            indentLevel -= 1;
	            result += indent.repeat(indentLevel) + "}";
	        }

	        node.loc.end = { line: line, column: column };

	        return result;
	    },
	    ThisExpression: function ThisExpression(node) {
	        node.loc = {};
	        node.loc.start = { line: line, column: column };
	        column += 4;
	        node.loc.end = { line: line, column: column };

	        return "this";
	    }
	};

	function render(node, parent) {
	    if (renderer[node.type]) {
	        return renderer[node.type](node, parent);
	    } else {
	        throw node.type + " not supported yet";
	    }
	}

	module.exports = {
	    renderAST: renderAST,
	    astWatcher: astWatcher
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function (n) {
	  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function (type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events) this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler)) return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++) args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++) args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++) listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function (type, listener) {
	  var m;

	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  if (!this._events) this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function (type, listener) {
	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function (type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener)) throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type]) return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener || isFunction(list.listener) && list.listener === listener) {
	    delete this._events[type];
	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0) return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function (type) {
	  var key, listeners;

	  if (!this._events) return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function (type) {
	  var ret;
	  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function (emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type]) ret = 0;else if (isFunction(emitter._events[type])) ret = 1;else ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var session = undefined,
	    selection = undefined,
	    editor = undefined,
	    prog = undefined;

	var renderAST = __webpack_require__(2).renderAST;

	var _require = __webpack_require__(5);

	var findNode = _require.findNode;
	var findPropName = _require.findPropName;
	var findNodePath = _require.findNodePath;

	var clearProps = function clearProps(node) {
	    Object.keys(node).forEach(function (key) {
	        delete node[key];
	    });
	};

	var copyProps = function copyProps(srcNode, dstNode) {
	    Object.keys(srcNode).forEach(function (key) {
	        dstNode[key] = srcNode[key];
	    });
	};

	var hideCursor = function hideCursor() {
	    document.querySelector('.ace_cursor-layer').style.opacity = 0.0;
	};

	var showCursor = function showCursor() {
	    document.querySelector('.ace_cursor-layer').style.opacity = 1.0;
	};

	var update = function update(row, column) {
	    session.setValue(renderAST(prog));
	    selection.setSelectionRange({
	        start: { row: row, column: column },
	        end: { row: row, column: column }
	    });
	};

	document.addEventListener('keypress', function (e) {
	    e.preventDefault();

	    var range = editor.getSelectionRange();
	    var row = range.end.row;
	    var column = range.end.column;
	    var line = row + 1;

	    var _findNode = findNode(prog, line, column);

	    var cursorNode = _findNode.cursorNode;
	    var cursorParentNode = _findNode.cursorParentNode;

	    if (!cursorNode) {
	        return;
	    }

	    var c = String.fromCharCode(e.keyCode);

	    insert(c, cursorNode, cursorParentNode, row, column);
	}, true);

	document.addEventListener('keyup', function (e) {
	    // prevent backspace
	    if (e.keyCode === 8) {
	        e.stopPropagation();
	        e.preventDefault();
	    }
	}, true);

	document.addEventListener('keydown', function (e) {
	    var range = editor.getSelectionRange();
	    var row = range.end.row;
	    var column = range.end.column;
	    var line = row + 1;

	    var path = findNodePath(prog, line, column);

	    // ignore tabs
	    if (e.keyCode === 9) {
	        e.stopPropagation();
	        e.preventDefault();
	    }

	    if (e.keyCode === 8) {
	        e.stopPropagation();
	        e.preventDefault();
	        backspace(path, row, column);
	    }

	    if (e.keyCode === 13) {
	        e.stopPropagation();
	        e.preventDefault();
	        enter(path, row, column);
	    }
	}, true);

	var insert = function insert(c, cursorNode, cursorParentNode, row, column) {
	    var line = row + 1;

	    if (c === ",") {
	        (function () {
	            var path = findNodePath(prog, line, column);
	            var expression = null;
	            var parent = null;
	            // find the largest expression such that the cursor as the end of it
	            for (var i = path.length - 1; i > -1; i--) {
	                var node = path[i];
	                if (node.loc.end.column === column) {
	                    expression = node;
	                    parent = path[i - 1];
	                }
	            }
	            if (expression && parent && parent.type === "ArrayExpression") {
	                var elements = parent.elements;
	                var idx = elements.findIndex(function (element) {
	                    return expression === element;
	                });

	                if (idx !== -1) {
	                    var node = {
	                        type: "Placeholder"
	                    };
	                    elements.splice(idx + 1, 0, node);
	                    column += 3; // ", ?".length

	                    update(row, column);
	                }
	            }
	            if (expression && parent && parent.type === "FunctionExpression") {
	                var params = parent.params;
	                var idx = params.findIndex(function (param) {
	                    return expression === param;
	                });

	                if (idx !== -1) {
	                    var node = {
	                        type: "Placeholder",
	                        accept: "Identifier"
	                    };
	                    params.splice(idx + 1, 0, node);
	                    column += 3; // ", ?".length

	                    update(row, column);
	                }
	            }
	            if (expression && parent && parent.type === "CallExpression") {
	                var args = parent.arguments;
	                var idx = args.findIndex(function (param) {
	                    return expression === param;
	                });

	                if (idx !== -1) {
	                    var node = {
	                        type: "Placeholder"
	                    };
	                    args.splice(idx + 1, 0, node);
	                    column += 3; // ", ?".length

	                    update(row, column);
	                }
	            }
	        })();
	    } else if (c === ")") {
	        if (cursorParentNode.type === "FunctionExpression") {
	            // TODO check that we're inside the param list
	            // TODO create a function that gives the range of the param list
	            var firstLine = cursorParentNode.body.body[0];
	            row = firstLine.loc.start.line - 1;
	            column = firstLine.loc.start.column;
	            update(row, column);
	        } else if (cursorParentNode.type === "MethodDefinition") {
	            var firstLine = cursorParentNode.value.body.body[0];
	            row = firstLine.loc.start.line - 1;
	            column = firstLine.loc.start.column;
	            update(row, column);
	        } else {
	            var nodes = findNode(prog, line, column + 1);
	            if (["Parentheses", "CallExpression"].indexOf(nodes.cursorNode.type) !== -1) {
	                column += 1;
	                update(row, column);
	            }
	        }
	    } else if (c === "]") {
	        if (cursorParentNode.type === "ArrayExpression") {
	            var nodes = findNode(prog, line, column + 1);
	            if (nodes.cursorNode.type === "ArrayExpression") {
	                column += 1;
	                update(row, column);
	            }
	        }
	    } else if (cursorNode.type === "ArrayExpression" && cursorNode.elements.length === 0) {
	        var node = null;
	        if (/[0-9\.]/.test(c)) {
	            node = {
	                type: "Literal"
	            };
	            if (c === ".") {
	                node.raw = "0.";
	                column += 1;
	            } else {
	                node.raw = c;
	            }
	            column += 1;
	        } else if (/[a-zA-Z_$]/.test(c)) {
	            node = {
	                type: "Identifier",
	                name: c
	            };
	            column += 1;
	        } else if (/[\(\)]/.test(c)) {
	            node = {
	                type: "Parentheses",
	                expression: {
	                    type: "Placeholder"
	                }
	            };
	            column += 1;
	        }
	        if (node !== null) {
	            cursorNode.elements = [node];
	            update(row, column);
	        }
	    } else if (cursorNode.type === "Placeholder") {
	        if (/[0-9\.]/.test(c) && (!cursorNode.accept || cursorNode.accept === "Literal")) {
	            cursorNode.type = "Literal";
	            if (c === ".") {
	                cursorNode.raw = "0.";
	                column += 1;
	            } else {
	                cursorNode.raw = c;
	            }
	        } else if (/[a-zA-Z_$]/.test(c) && (!cursorNode.accept || cursorNode.accept === "Identifier")) {
	            cursorNode.type = "Identifier";
	            cursorNode.name = c;
	        } else if (c === "(") {
	            cursorNode.type = "Parentheses";
	            cursorNode.expression = {
	                type: "Placeholder"
	            };
	            column += 1;
	        } else if (c === "[" && (!cursorNode.accept || cursorNode.accept === "ArrayExpression")) {
	            clearProps(cursorNode);
	            cursorNode.type = "ArrayExpression";
	            cursorNode.elements = [];
	        } else if (/[\+\-\*\/<>]/.test(c) && (!cursorNode.accept || cursorNode.accept === "BinaryExpression")) {
	            if (cursorParentNode.type === "VariableDeclarator") {
	                if (findPropName(cursorParentNode, cursorNode) === "id") {
	                    return;
	                }
	            }
	            if (cursorParentNode.type === "FunctionExpression") {
	                if (cursorParentNode.params.findIndex(function (param) {
	                    return param === cursorNode;
	                }) !== -1) {
	                    return;
	                }
	            }
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	        }
	        update(row, column);
	    } else if (cursorNode.type === "Literal") {
	        if (/[0-9\.]/.test(c)) {
	            var str = cursorNode.raw;
	            if (c === "." && str.indexOf(".") !== -1) {
	                return; // can't have more than one decimal
	            }
	            var relIdx = column - cursorNode.loc.start.column;
	            str = str.substring(0, relIdx) + c + str.substring(relIdx);
	            cursorNode.raw = str;
	            column += 1;

	            update(row, column);
	        } else if (/[\+\-\*\/<>]/.test(c)) {
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            clearProps(cursorNode);
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	            update(row, column);
	        }
	    } else if (cursorNode.type === "Identifier") {
	        if (/[a-zA-Z_$0-9]/.test(c)) {
	            var str = cursorNode.name;
	            var relIdx = column - cursorNode.loc.start.column;
	            str = str.substring(0, relIdx) + c + str.substring(relIdx);
	            cursorNode.name = str;
	            column += 1;

	            update(row, column);
	        } else if (c === "=") {
	            if (cursorParentNode.type === "ExpressionStatement") {
	                cursorParentNode.expression = {
	                    type: "AssignmentExpression",
	                    left: cursorNode,
	                    right: {
	                        type: "Placeholder"
	                    }
	                };
	                column += 3;
	            } else if (cursorParentNode.type === "VariableDeclarator") {
	                cursorParentNode.init = { type: "Placeholder" };
	                column += 3;
	            } else if (cursorParentNode.type === "MemberExpression") {
	                var path = findNodePath(prog, line, column);
	                var node = null;
	                // find the largest expression with the cursor at the end
	                for (var i = path.length - 1; i > -1; i--) {
	                    node = path[i];
	                    if (node.type === "ExpressionStatement") {
	                        break;
	                    }
	                }
	                var expr = node.expression;
	                node.expression = {
	                    type: "AssignmentExpression",
	                    left: expr,
	                    right: { type: "Placeholder" }
	                };
	                column += 3;
	            }
	            update(row, column);
	        } else if (/[\+\-\*\/<>]/.test(c)) {
	            if (cursorParentNode.type === "VariableDeclarator") {
	                if (findPropName(cursorParentNode, cursorNode) === "id") {
	                    return;
	                }
	            }
	            if (cursorParentNode.type === "FunctionExpression") {
	                if (cursorParentNode.params.findIndex(function (param) {
	                    return param === cursorNode;
	                }) !== -1) {
	                    return;
	                }
	            }
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	            update(row, column);
	        } else if (c === " ") {
	            // TODO create a function called "promoteIdentifier"
	            if (cursorParentNode.type === "ExpressionStatement") {
	                var node = null;

	                if (cursorNode.name === "let") {
	                    node = {
	                        type: "VariableDeclaration",
	                        declarations: [{
	                            type: "VariableDeclarator",
	                            id: {
	                                type: "Placeholder",
	                                accept: "Identifier"
	                            },
	                            init: null
	                        }],
	                        kind: "let"
	                    };
	                    column += 1;
	                } else if (cursorNode.name === "for") {
	                    node = {
	                        type: "ForOfStatement",
	                        left: { type: "Placeholder" },
	                        right: { type: "Placeholder" },
	                        body: {
	                            type: "BlockStatement",
	                            body: [{
	                                type: "BlankStatement"
	                            }]
	                        }
	                    };
	                    column += 2;
	                } else if (cursorNode.name === "if") {
	                    node = {
	                        type: "IfStatement",
	                        test: { type: "Placeholder" },
	                        consequent: {
	                            type: "BlockStatement",
	                            body: [{ type: "BlankStatement" }]
	                        },
	                        alternate: null
	                    };
	                    column += 2;
	                } else if (cursorNode.name === "return") {
	                    // TODO check if we're inside a function
	                    node = {
	                        type: "ReturnStatement",
	                        argument: { type: "Placeholder" }
	                    };
	                    column += 1;
	                } else if (cursorNode.name === "class") {
	                    node = {
	                        type: "ClassDeclaration",
	                        id: {
	                            type: "Placeholder",
	                            accept: "Identifier"
	                        },
	                        body: {
	                            type: "ClassBody",
	                            body: [{ type: 'BlankStatement' }]
	                        }
	                    };
	                    column += 1;
	                }

	                if (node !== null) {
	                    clearProps(cursorParentNode);
	                    copyProps(node, cursorParentNode);
	                    update(row, column);
	                }
	            } else if (cursorParentNode.type === "ForOfStatement") {
	                var node = null;

	                if (cursorNode.name === "let") {
	                    node = {
	                        type: "VariableDeclaration",
	                        declarations: [{
	                            type: "VariableDeclarator",
	                            id: {
	                                type: "Placeholder",
	                                accept: "Identifier"
	                            },
	                            init: null
	                        }],
	                        kind: "let"
	                    };
	                    column += 1;
	                }
	                if (node !== null) {
	                    clearProps(cursorNode);
	                    copyProps(node, cursorNode);
	                    update(row, column);
	                }
	            }
	        } else if (c === "(") {
	            if (cursorNode.name === "function") {
	                clearProps(cursorNode);
	                var node = {
	                    "type": "FunctionExpression",
	                    "id": null,
	                    "params": [],
	                    "defaults": [],
	                    "body": {
	                        "type": "BlockStatement",
	                        "body": [{ type: "BlankStatement" }]
	                    },
	                    "generator": false,
	                    "expression": false
	                };
	                copyProps(node, cursorNode);
	                column += 2;
	            } else if (cursorParentNode.type === "MethodDefinition") {
	                column += 1;
	            } else {
	                var callee = JSON.parse(JSON.stringify(cursorNode));
	                clearProps(cursorNode);
	                cursorNode.type = "CallExpression";
	                cursorNode.callee = callee;
	                cursorNode.arguments = [];
	                column += 1;
	            }
	            update(row, column);
	        } else if (c === ".") {
	            var obj = JSON.parse(JSON.stringify(cursorNode));
	            clearProps(cursorNode);
	            cursorNode.type = "MemberExpression";
	            cursorNode.object = obj;
	            cursorNode.property = {
	                type: "Placeholder",
	                accept: "Identifier"
	            };
	            cursorNode.computed = false;
	            column += 1;
	            update(row, column);
	        } else if (c === "[") {
	            var obj = JSON.parse(JSON.stringify(cursorNode));
	            clearProps(cursorNode);
	            cursorNode.type = "MemberExpression";
	            cursorNode.object = obj;
	            cursorNode.property = {
	                type: "Placeholder"
	            };
	            cursorNode.computed = true;
	            column += 1;
	            update(row, column);
	        }
	    } else if (cursorNode.type === "LineComment") {
	        var str = cursorNode.content;
	        var relIdx = column - cursorNode.loc.start.column - 3; // compensate for "// " prefix
	        str = str.substring(0, relIdx) + c + str.substring(relIdx);
	        cursorNode.content = str;
	        column += 1;

	        update(row, column);
	    } else if (cursorNode.type === "BlankStatement") {
	        if (/[a-zA-Z]/.test(c)) {
	            if (cursorParentNode.type === "ClassBody") {
	                cursorNode.type = "MethodDefinition";
	                cursorNode.key = {
	                    type: "Identifier",
	                    name: c
	                };
	                cursorNode.value = {
	                    "type": "FunctionExpression",
	                    "id": null,
	                    "params": [],
	                    "defaults": [],
	                    "body": {
	                        "type": "BlockStatement",
	                        "body": [{ type: "BlankStatement" }]
	                    },
	                    "generator": false,
	                    "expression": false
	                };
	                column += 1;
	            } else {
	                cursorNode.type = "ExpressionStatement";
	                cursorNode.expression = {
	                    type: "Identifier",
	                    name: c
	                };
	                column += 1;
	            }
	            update(row, column);
	        }
	    } else if (cursorNode.type === "CallExpression") {
	        var node = {};
	        if (/[0-9\.]/.test(c)) {
	            node.type = "Literal";
	            if (c === ".") {
	                node.raw = "0.";
	                column += 1;
	            } else {
	                node.raw = c;
	            }
	            column += 1;
	            // TODO verify that the cursor is in the param list
	            // TODO create an actual node for param/arg lists
	            cursorNode.arguments = [node];
	            update(row, column);
	        } else if (/[a-zA-Z\_\$]/.test(c)) {
	            node.type = "Identifier";
	            node.name = c;
	            column += 1;
	            // TODO verify that the cursor is in the param list
	            // TODO create an actual node for param/arg lists
	            cursorNode.arguments = [node];
	            update(row, column);
	        } else if (/[\+\-\*\/<>]/.test(c)) {
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	            update(row, column);
	        }
	    } else if (cursorNode.type === "Parentheses") {
	        if (/[\+\-\*\/<>]/.test(c)) {
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	            update(row, column);
	        }
	    } else if (cursorNode.type === "FunctionExpression") {
	        var node = {};
	        if (/[a-zA-Z\_\$]/.test(c)) {
	            node.type = "Identifier";
	            node.name = c;
	            column += 1;
	            // TODO verify that the cursor is in the param list
	            // TODO create an actual node for param/arg lists
	            cursorNode.params = [node];
	        }
	        update(row, column);
	    } else if (cursorNode.type === "MemberExpression") {
	        if (/[\+\-\*\/<>]/.test(c)) {
	            var left = JSON.parse(JSON.stringify(cursorNode));
	            clearProps(cursorNode);
	            cursorNode.type = "BinaryExpression";
	            cursorNode.left = left;
	            cursorNode.right = { type: "Placeholder" };
	            cursorNode.operator = c;
	            column += 3;
	            update(row, column);
	        }
	    } else if (cursorNode.type === "IfStatement") {
	        // TODO: check if the cursor's at the end of the IfStatement
	        if (c === " ") {
	            if (cursorNode.alternate === null) {
	                cursorNode.alternate = {
	                    type: "BlockStatement",
	                    body: [{ type: "BlankStatement" }]
	                };
	                update(row, column);
	            }
	        }
	    }
	};

	var backspace = function backspace(path, row, column) {
	    var _findNode2 = findNode(prog, row + 1, column);

	    var cursorStatementParentNode = _findNode2.cursorStatementParentNode;

	    var node1 = path[path.length - 1];
	    var node2 = path[path.length - 2];
	    var node3 = path[path.length - 3];
	    var node4 = path[path.length - 4];

	    if (!node1) {
	        return;
	    }

	    var relIdx = column - node1.loc.start.column;

	    if (node1.type === "Placeholder") {
	        if (node2.type === "ArrayExpression") {
	            var elements = node2.elements;
	            var idx = elements.findIndex(function (element) {
	                return node1 === element;
	            });

	            if (idx === -1) return;

	            elements.splice(idx, 1);
	            if (elements.length > 0) {
	                column -= 3; // ", ?".length
	            } else {
	                    column -= 1; // "?".length
	                }
	            update(row, column);
	        } else if (node2.type === "FunctionExpression") {
	            var params = node2.params;
	            var idx = params.findIndex(function (param) {
	                return node1 === param;
	            });

	            if (idx === -1) return;

	            params.splice(idx, 1);
	            if (params.length > 0) {
	                column -= 3; // ", ?".length
	            } else {
	                    column -= 1; // "?".length
	                }
	            update(row, column);
	        } else if (node2.type === "CallExpression") {
	            var args = node2.arguments;
	            var idx = args.findIndex(function (arg) {
	                return node1 === arg;
	            });
	            if (idx === -1) return;

	            args.splice(idx, 1);
	            if (args.length > 0) {
	                column -= 3;
	            } else {
	                column -= 1;
	            }
	            update(row, column);
	        } else if (node2.type === "ExpressionStatement") {
	            clearProps(node2);
	            node2.type = "BlankStatement";
	            update(row, column);
	        } else if (node2.type === "BinaryExpression") {
	            var left = node2.left;
	            clearProps(node2);
	            node2.type = left.type;
	            copyProps(left, node2);
	            column -= 4;
	            update(row, column);
	        } else if (node2.type === "AssignmentExpression") {
	            var left = node2.left;
	            clearProps(node2);
	            node2.type = left.type;
	            copyProps(left, node2);
	            column -= 4;
	            update(row, column);
	        } else if (node2.type === "Parentheses") {
	            clearProps(node2);
	            node2.type = "Placeholder";
	            column -= 1;
	            update(row, column);
	        } else if (node2.type === "MethodDefinition") {
	            clearProps(node2);
	            node2.type = "BlankStatement";
	            column -= 1; // "?".length
	            update(row, column);
	        } else if (node2.type === "ReturnStatement") {
	            clearProps(node2);
	            node2.type = "BlankStatement";
	            column -= 8; // "return ?".length
	            update(row, column);
	        } else if (node2.type === "VariableDeclarator") {
	            var propName = findPropName(node2, node1);
	            if (propName === "id") {
	                if (node3.declarations.length > 1) {
	                    // TODO handle multiple decls
	                } else {
	                        column -= node3.kind.length + 2;
	                        clearProps(node3);
	                        if (node4.type === "ForOfStatement") {
	                            node3.type = "Placeholder";
	                        } else {
	                            node3.type = "BlankStatement";
	                        }
	                        update(row, column);
	                    }
	            }
	        } else if (node2.type === "MemberExpression") {
	            // TODO: check both sides of the dot and maintain the one that isn't a placeholder
	            var obj = node2.object;
	            clearProps(node2);
	            copyProps(obj, node2);
	            column -= 2;
	            update(row, column);
	        }
	    } else if (node1.type === "ArrayExpression" && node1.elements.length === 0) {
	        clearProps(node1);
	        node1.type = "Placeholder";
	        update(row, column);
	    } else if (node1.type === "Literal") {
	        var str = node1.raw;
	        if (str.length === 1) {
	            delete node1.value;
	            node1.type = "Placeholder";
	        } else {
	            str = str.substring(0, relIdx - 1) + str.substring(relIdx);
	            node1.raw = str;
	            node1.value = parseFloat(str);
	            column -= 1;
	        }
	        update(row, column);
	    } else if (node1.type === "Identifier") {
	        var str = String(node1.name);
	        if (str.length === 1) {
	            delete node1.name;
	            node1.type = "Placeholder";
	            if (node2.type === "VariableDeclarator") {
	                if (findPropName(node2, node1) === "id") {
	                    node1.accept = "Identifier";
	                }
	            }
	            if (node2.type === "FunctionExpression") {
	                if (node2.params.findIndex(function (param) {
	                    return param === node1;
	                }) !== -1) {
	                    node1.accept = "Identifier";
	                }
	            }
	        } else {
	            str = str.substring(0, relIdx - 1) + str.substring(relIdx);
	            node1.name = str;
	            column -= 1;
	        }
	        update(row, column);
	    } else if (node1.type === "LineComment") {
	        // TODO: figure out how to delete LineCommments
	        relIdx -= 3; // compensate for "// " prefix
	        var str = String(node1.content);
	        if (str.length > 0) {
	            str = str.substring(0, relIdx - 1) + str.substring(relIdx);
	            node1.content = str;
	            column -= 1;
	        }
	        update(row, column);
	    } else if (node1.type === "BlankStatement") {
	        var elements = node2.body;
	        var idx = elements.findIndex(function (element) {
	            return node1 === element;
	        });

	        if (idx !== -1) {
	            elements.splice(idx, 1);

	            row -= 1;
	            column = cursorStatementParentNode.loc.start.column;

	            update(row, column);
	        }
	    }
	};

	var enter = function enter(path, row, column) {
	    var _findNode3 = findNode(prog, row + 1, column);

	    var cursorNode = _findNode3.cursorNode;
	    var cursorParentNode = _findNode3.cursorParentNode;
	    var cursorStatementNode = _findNode3.cursorStatementNode;
	    var cursorStatementParentNode = _findNode3.cursorStatementParentNode;

	    if (cursorNode.type === "BlankStatement") {
	        var elements = cursorParentNode.body;
	        var idx = elements.findIndex(function (element) {
	            return cursorNode === element;
	        });

	        elements.splice(idx + 1, 0, { type: "BlankStatement" });
	        row += 1;
	        column = cursorParentNode.loc.start.column;
	        update(row, column);
	    } else if (cursorNode.type === "Program") {
	        var body = cursorNode.body;
	        body.push({ type: "BlankStatement" });
	        row += 1;
	        update(row, column);
	    } else if (cursorParentNode.type === "MethodDefinition") {
	        var classBody = path[path.length - 3];
	        var body = classBody.body;
	        // we use the cursorParentNode here because that's the MethodDefinition
	        // we're in, not the FunctionExpression which is the cursorNode
	        var idx = body.findIndex(function (node) {
	            return node === cursorParentNode;
	        });
	        if (idx !== -1) {
	            body.splice(idx + 1, 0, { type: "BlankStatement" });
	            row += 1;
	            column = cursorParentNode.loc.start.column;
	            update(row, column);
	        }
	    } else {
	        var elements = cursorStatementParentNode.body;
	        var idx = elements.findIndex(function (element) {
	            return cursorStatementNode === element;
	        });

	        if (column === cursorStatementNode.loc.start.column) {
	            elements.splice(idx, 0, { type: "BlankStatement" });
	        } else if (column === cursorStatementNode.loc.end.column) {
	            elements.splice(idx + 1, 0, { type: "BlankStatement" });
	        }

	        row += 1;
	        column = cursorStatementParentNode.loc.start.column;
	        update(row, column);
	    }
	};

	module.exports = {
	    init: function init(aceEditor, ast) {
	        editor = aceEditor;
	        session = aceEditor.getSession();
	        prog = ast;

	        session.setValue(renderAST(prog));
	        selection = editor.getSession().getSelection();
	    }
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	var findPropName = function findPropName(parent, node) {
	    if (["BinaryExpression", "AssignmentExpression"].indexOf(parent.type) !== -1) {
	        if (parent.right === node) {
	            return "right";
	        }
	        if (parent.left === node) {
	            return "left";
	        }
	    } else if (parent.type === "VariableDeclarator") {
	        if (parent.id === node) {
	            return "id";
	        }
	        if (parent.init === node) {
	            return "init";
	        }
	    } else if (parent.type === "MemberExpression") {
	        if (parent.object === node) {
	            return "object";
	        }
	        if (parent.property === node) {
	            return "property";
	        }
	    } else if (["ExpressionStatement", "Parentheses"].indexOf(parent.type) !== -1) {
	        return "expression";
	    }
	};

	var cursorNode = null;
	var cursorParentNode = null;
	var cursorStatementNode = null;
	var cursorStatementParentNode = null;

	function _findNode(node, parent, line, column) {
	    if (node.loc) {
	        var _node$loc = node.loc;
	        var start = _node$loc.start;
	        var end = _node$loc.end;

	        var cursorAfterStart = line > start.line || line === start.line && column >= start.column;
	        var cursorBeforeEnd = line < end.line || line === end.line && column <= end.column;
	        if (cursorAfterStart && cursorBeforeEnd) {
	            cursorNode = node;
	            cursorParentNode = parent;
	            if (/Statement|Declaration/.test(node.type)) {
	                cursorStatementNode = node;
	                cursorStatementParentNode = parent;
	            }
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = Object.keys(node)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var key = _step.value;

	                    if (key === "type") {
	                        continue;
	                    }
	                    if (key === "loc") {
	                        continue;
	                    }
	                    if (!node.hasOwnProperty(key)) {
	                        continue;
	                    }
	                    var value = node[key];
	                    if (value === null) {
	                        continue;
	                    }
	                    if (Array.isArray(value)) {
	                        var _iteratorNormalCompletion2 = true;
	                        var _didIteratorError2 = false;
	                        var _iteratorError2 = undefined;

	                        try {
	                            for (var _iterator2 = value[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                                var child = _step2.value;

	                                _findNode(child, node, line, column);
	                            }
	                        } catch (err) {
	                            _didIteratorError2 = true;
	                            _iteratorError2 = err;
	                        } finally {
	                            try {
	                                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	                                    _iterator2["return"]();
	                                }
	                            } finally {
	                                if (_didIteratorError2) {
	                                    throw _iteratorError2;
	                                }
	                            }
	                        }
	                    }
	                    _findNode(value, node, line, column);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator["return"]) {
	                        _iterator["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }
	        }
	    }
	}

	function findNode(root, line, column) {
	    cursorNode = null;
	    cursorParentNode = null;

	    _findNode(root, null, line, column);

	    return { cursorNode: cursorNode, cursorParentNode: cursorParentNode, cursorStatementNode: cursorStatementNode, cursorStatementParentNode: cursorStatementParentNode };
	}

	var path = null;

	function _findNodePath(node, line, column) {
	    if (node.loc) {
	        var _node$loc2 = node.loc;
	        var start = _node$loc2.start;
	        var end = _node$loc2.end;

	        var cursorAfterStart = line > start.line || line === start.line && column >= start.column;
	        var cursorBeforeEnd = line < end.line || line === end.line && column <= end.column;
	        if (cursorAfterStart && cursorBeforeEnd) {
	            path.push(node);
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	                for (var _iterator3 = Object.keys(node)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var key = _step3.value;

	                    if (key === "type") {
	                        continue;
	                    }
	                    if (key === "loc") {
	                        continue;
	                    }
	                    if (!node.hasOwnProperty(key)) {
	                        continue;
	                    }
	                    var value = node[key];
	                    if (value === null) {
	                        continue;
	                    }
	                    if (Array.isArray(value)) {
	                        var _iteratorNormalCompletion4 = true;
	                        var _didIteratorError4 = false;
	                        var _iteratorError4 = undefined;

	                        try {
	                            for (var _iterator4 = value[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                                var child = _step4.value;

	                                _findNodePath(child, line, column);
	                            }
	                        } catch (err) {
	                            _didIteratorError4 = true;
	                            _iteratorError4 = err;
	                        } finally {
	                            try {
	                                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
	                                    _iterator4["return"]();
	                                }
	                            } finally {
	                                if (_didIteratorError4) {
	                                    throw _iteratorError4;
	                                }
	                            }
	                        }
	                    }
	                    _findNodePath(value, line, column);
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	                        _iterator3["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }
	        }
	    }
	}

	function findNodePath(root, line, column) {
	    path = [];

	    _findNodePath(root, line, column);

	    return path;
	}

	module.exports = {
	    findNode: findNode, findPropName: findPropName, findNodePath: findNodePath
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var session = undefined,
	    selection = undefined,
	    editor = undefined,
	    prog = undefined;

	var renderAST = __webpack_require__(2).renderAST;

	var _require = __webpack_require__(5);

	var findNode = _require.findNode;
	var findPropName = _require.findPropName;
	var findNodePath = _require.findNodePath;

	var clearProps = function clearProps(node) {
	    Object.keys(node).forEach(function (key) {
	        delete node[key];
	    });
	};

	var copyProps = function copyProps(srcNode, dstNode) {
	    Object.keys(srcNode).forEach(function (key) {
	        dstNode[key] = srcNode[key];
	    });
	};

	var hideCursor = function hideCursor() {
	    document.querySelector('.ace_cursor-layer').style.opacity = 0.0;
	};

	var showCursor = function showCursor() {
	    document.querySelector('.ace_cursor-layer').style.opacity = 1.0;
	};

	var update = function update(row, column) {
	    session.setValue(renderAST(prog));
	    selection.setSelectionRange({
	        start: { row: row, column: column },
	        end: { row: row, column: column }
	    });
	};

	var setCursor = function setCursor(row, column, isPlaceholder) {
	    if (isPlaceholder) {
	        selection.setSelectionRange({
	            start: { row: row, column: column },
	            end: { row: row, column: column + 1 }
	        });
	    } else {
	        selection.setSelectionRange({
	            start: { row: row, column: column },
	            end: { row: row, column: column }
	        });
	    }
	};

	document.addEventListener('keydown', function (e) {
	    var range = editor.getSelectionRange();
	    var row = range.end.row;
	    var column = range.end.column;
	    var line = row + 1;

	    var path = findNodePath(prog, line, column);

	    // ignore tabs
	    if (e.keyCode === 9) {
	        e.stopPropagation();
	        e.preventDefault();
	    }

	    if (e.keyCode === 37) {
	        e.preventDefault();
	        e.stopPropagation();
	        left(path, row, column);
	    }

	    if (e.keyCode === 39) {
	        e.preventDefault();
	        e.stopPropagation();
	        right(path, row, column);
	    }
	}, true);

	var left = function left(path, row, column) {
	    var _findNode = findNode(prog, row + 1, column);

	    var cursorNode = _findNode.cursorNode;
	    var cursorParentNode = _findNode.cursorParentNode;

	    if (["Literal", "Identifier", "Parentheses"].indexOf(cursorNode.type) !== -1) {
	        if (cursorNode.loc.start.column <= column - 1) {
	            column -= 1;
	            setCursor(row, column);
	            return;
	        }
	    }

	    // enter from the right
	    if (cursorNode.type === "CallExpression") {
	        if (cursorNode.loc.end.column === column) {
	            column -= 1;
	            setCursor(row, column);
	            return;
	        }
	    }

	    for (var i = path.length - 1; i > 0; i--) {
	        var node = path[i];
	        var _parent = path[i - 1];

	        var propName = findPropName(_parent, node);

	        if (propName === "right") {
	            var loc = _parent.left.loc;
	            row = loc.end.line - 1;
	            column = loc.end.column + 1;
	            setCursor(row, column, true);
	            hideCursor();
	            break;
	        } else if (propName === "init") {
	            // TODO: check the type, if it's a placeholder then we need to select it
	            var loc = _parent.id.loc;
	            row = loc.end.line - 1;
	            column = loc.end.column;
	            setCursor(row, column);
	            break;
	        } else if (propName === "property") {
	            var loc = _parent.object.loc;
	            row = loc.end.line - 1;
	            column = loc.end.column;
	            setCursor(row, column);
	            break;
	        }
	    }

	    if (["BinaryExpression", "AssignmentExpression"].indexOf(cursorNode.type) !== -1) {
	        column = cursorNode.left.loc.end.column;
	        setCursor(row, column);
	        return;
	    }

	    if (cursorParentNode.type === "ArrayExpression") {
	        var elements = cursorParentNode.elements;
	        var idx = elements.findIndex(function (element) {
	            return cursorNode === element;
	        });

	        if (idx > 0) {
	            cursorNode = cursorParentNode.elements[idx - 1];
	            column = cursorNode.loc.end.column; // assume same row
	            setCursor(row, column);
	        }
	        return;
	    }

	    if (cursorParentNode.type === "FunctionExpression") {
	        var params = cursorParentNode.params;
	        var idx = params.findIndex(function (param) {
	            return cursorNode === param;
	        });

	        if (idx > 0) {
	            cursorNode = cursorParentNode.params[idx - 1];
	            column = cursorNode.loc.end.column; // assume same row
	            setCursor(row, column);
	        }
	    }

	    if (cursorParentNode.type === "CallExpression") {
	        var args = cursorParentNode.arguments;
	        var idx = args.findIndex(function (arg) {
	            return cursorNode === arg;
	        });

	        if (idx > 0) {
	            cursorNode = cursorParentNode.arguments[idx - 1];
	            column = cursorNode.loc.end.column; // assume same row
	            setCursor(row, column);
	        }
	    }

	    var nodes = findNode(prog, row + 1, column - 1);
	    // we use cursorParentNode here because the identifier for the CallExpression
	    // is smushed right up against the '(' so it's impossible to find it unless
	    // we changed the the findNode method
	    // TODO investigate adding an option to findNode to change whether the ranges are inclusive or not
	    if (["CallExpression"].indexOf(nodes.cursorParentNode.type) !== -1) {
	        column -= 1;
	        setCursor(row, column);
	        return;
	    }
	};

	var right = function right(path, row, column) {
	    var _findNode2 = findNode(prog, row + 1, column);

	    var cursorNode = _findNode2.cursorNode;
	    var cursorParentNode = _findNode2.cursorParentNode;

	    if (["Literal", "Identifier", "Parentheses"].indexOf(cursorNode.type) !== -1) {
	        if (column + 1 <= cursorNode.loc.end.column) {
	            column += 1;
	            setCursor(row, column);
	            return;
	        }
	    }

	    for (var i = path.length - 1; i > 0; i--) {
	        var node = path[i];
	        var _parent2 = path[i - 1];

	        var propName = findPropName(_parent2, node);

	        if (propName === "left") {
	            var loc = _parent2.left.loc;
	            row = loc.end.line - 1;
	            column = loc.end.column + 1;
	            setCursor(row, column, true);
	            hideCursor();
	            break;
	        } else if (propName === "id" && cursorParentNode.type === "VariableDeclarator") {
	            column += 3;
	            setCursor(row, column);
	            //hideCursor();
	            // TODO: check the type, e.g. PlaceHolder

	            break;
	        } else if (propName === "object") {
	            var loc = _parent2.property.loc;
	            row = loc.end.line - 1;
	            column = loc.start.column;
	            setCursor(row, column);
	            break;
	        }
	    }

	    if (["BinaryExpression", "AssignmentExpression"].indexOf(cursorNode.type) !== -1) {
	        column = cursorNode.right.loc.start.column;
	        setCursor(row, column);
	        return;
	    }

	    if (cursorParentNode.type === "ArrayExpression") {
	        var elements = cursorParentNode.elements;
	        var idx = elements.findIndex(function (element) {
	            return cursorNode === element;
	        });

	        if (idx < elements.length - 1) {
	            cursorNode = cursorParentNode.elements[idx + 1];
	            column = cursorNode.loc.start.column; // assume same row
	            setCursor(row, column);
	        }
	        return;
	    }

	    if (cursorParentNode.type === "FunctionExpression") {
	        var params = cursorParentNode.params;
	        var idx = params.findIndex(function (param) {
	            return cursorNode === param;
	        });

	        if (idx < params.length - 1) {
	            cursorNode = cursorParentNode.params[idx + 1];
	            column = cursorNode.loc.start.column; // assume same row
	            setCursor(row, column);
	        }
	    }

	    if (cursorParentNode.type === "CallExpression") {
	        var args = cursorParentNode.arguments;
	        var idx = args.findIndex(function (arg) {
	            return cursorNode === arg;
	        });

	        if (idx < args.length - 1) {
	            cursorNode = cursorParentNode.arguments[idx + 1];
	            column = cursorNode.loc.start.column; // assume same row
	            setCursor(row, column);
	        }
	    }

	    var nodes = findNode(prog, row + 1, column + 1);
	    if (["Parentheses", "CallExpression"].indexOf(nodes.cursorNode.type) !== -1) {
	        column += 1;
	        setCursor(row, column);
	        return;
	    }
	};

	module.exports = {
	    init: function init(aceEditor, ast) {
	        editor = aceEditor;
	        prog = ast;

	        selection = editor.getSession().getSelection();
	        session = editor.getSession();

	        selection.on("changeCursor", function (e) {
	            setTimeout(function () {
	                var range = editor.getSelectionRange();
	                var line = range.start.row + 1;
	                var column = range.start.column;

	                var _findNode3 = findNode(prog, line, column);

	                var cursorNode = _findNode3.cursorNode;

	                console.log(cursorNode);
	                if (cursorNode.type === "Placeholder") {
	                    var loc = cursorNode.loc;
	                    var row = loc.start.line - 1;
	                    selection.setSelectionRange({
	                        start: { row: row, column: loc.start.column },
	                        end: { row: row, column: loc.end.column }
	                    });
	                    hideCursor();
	                } else if (["AssignmentExpression", "BinaryExpression"].indexOf(cursorNode.type) !== -1) {
	                    var loc = cursorNode.left.loc;
	                    var row = loc.end.line - 1;
	                    var _column = loc.end.column + 1;
	                    selection.setSelectionRange({
	                        start: {
	                            row: row,
	                            column: _column
	                        },
	                        end: {
	                            row: row,
	                            column: _column + 1
	                        }
	                    });
	                    hideCursor();
	                } else {
	                    showCursor();
	                }
	            }, 0);
	        });
	    }
	};

/***/ }
/******/ ])
});
;