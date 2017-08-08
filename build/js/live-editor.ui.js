this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "&times;";}

function program3(depth0,data) {
  
  
  return "Oh noes!";}

function program5(depth0,data) {
  
  
  return "Show me where";}

function program7(depth0,data) {
  
  
  return "Previous error";}

function program9(depth0,data) {
  
  
  return "Next error";}

  buffer += "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n    \n    <div class=\"text-wrap\">\n        <button class=\"close\" type=\"button\" aria-label=\"Close\">";
  foundHelper = helpers.i18nDoNotTranslate;
  stack1 = foundHelper || depth0.i18nDoNotTranslate;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n        <div class=\"oh-no\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a></div>\n        <div class=\"tipnav\">\n            <a href=\"javascript:void(0);\" class=\"prev\" title=\"";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-w\"></span>\n            </a>\n            <span class=\"current-pos\"></span>\n            <a href=\"javascript:void(0);\" class=\"next\" title=\"";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-e\"></span>\n            </a>\n        </div>\n    </div>\n</div>";
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
        this.$bar = this.$el.find(".tipbar");
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
            e.preventDefault();

            var error = self.errors[self.pos];
            self.liveEditor.editor.setCursor(error);
            self.liveEditor.editor.setErrorHighlight(true);

            return false;
        });

        this.$el.on("click", ".tipbar .close", function (e) {
            self.liveEditor.setThinkingState();
        });
    },

    setErrors: function setErrors(errors) {
        this.errors = errors;
        this.update(false);
    },

    update: function update(show) {
        if (!this.errors.length) return;

        var errors = this.errors;
        var pos = errors[this.pos] == null ? 0 : this.pos;

        // Inject current text
        this.$bar.find(".current-pos").text(errors.length > 1 ? pos + 1 + "/" + errors.length : "").end().find(".message").html(errors[pos].text || errors[pos] || "").end().find("a.prev").toggleClass("ui-state-disabled", pos === 0).end().find("a.next").toggleClass("ui-state-disabled", pos + 1 === errors.length).end();

        // it could be undefined, null, or -1
        this.$el.find(".show-me").toggle(errors[pos].row > -1);

        this.$bar.find(".tipnav").toggle(errors.length > 1);
        if (show) {
            this.$overlay.show();
            this.$bar.show();
        }
    },

    hide: function hide() {
        this.$bar.hide();
        this.$overlay.hide();
        clearTimeout(this.errorDelay);
    },

    toggleErrors: function toggleErrors(errors, delay) {
        var hasErrors = errors.length > 0;
        if (!hasErrors) {
            this.hide();
            return;
        }

        this.$overlay.show();
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
  buffer += escapeExpression(stack1) + "/spinner-large.gif\">\n                <span class=\"hide-text\">";
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
  buffer += escapeExpression(stack1) + "/creatures/OhNoes-Happy.png\"/>\n                </div>\n                <a class=\"error-buddy-thinking\" style=\"display:none;\" href=\"javascript:void()\">\n                    <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/creatures/OhNoes-Hmm.png\"/>\n                    ";
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
  buffer += "\n                </a>\n            </div>\n            <button id=\"restart-code\"\n                class=\"simple-button pull-right\">\n                <span class=\"icon-refresh\"></span>\n                ";
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
  buffer += escapeExpression(stack1) + "/spinner-large.gif\">\n                <span class=\"hide-text\">";
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
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.iframeOverlay=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Creates an overlay on top of an iframe that intercepts and retriggers mouse
 * events.  The purpose of this is two-fold:
 * - provide better user experience when a drag operation leaves iframe's bounds
 * - allow events to be filtered to toggle interactivity without having to modify
 *   the code runing inside the iframe
 */

var Poster = require("poster");
var EventSim = require("eventsim");
var LinkedList = require("basic-ds").LinkedList;

function createOverlay(iframe) {
    var wrapper = document.createElement("span");
    wrapper.setAttribute("style", "position:relative;padding:0;margin:0;display:inline-block;");
    wrapper.setAttribute("class", "wrapper");

    var overlay = document.createElement("span");
    overlay.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("tabindex", "0"); // allwos the span to have focus

    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);

    var down = false;
    var paused = false;
    var queue = new LinkedList();

    var poster = new Poster(iframe.contentWindow);

    function postMouseEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            var bounds = wrapper.getBoundingClientRect();
            poster.post("mouse", {
                type: e.type,
                x: e.pageX - bounds.left,
                y: e.pageY - bounds.top,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    function postKeyboardEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            poster.post("keyboard", {
                type: e.type,
                keyCode: e.keyCode,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    overlay.addEventListener("click", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("dblclick", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseover", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseout", function (e) {
        return postMouseEvent(e);
    });

    overlay.addEventListener("mousedown", function (e) {
        down = true;
        postMouseEvent(e);
    });

    overlay.addEventListener("mousemove", function (e) {
        if (!down) {
            postMouseEvent(e);
        }
    });

    window.addEventListener("mousemove", function (e) {
        if (down) {
            e.preventDefault();
            postMouseEvent(e);
        }
    });

    window.addEventListener("mouseup", function (e) {
        if (down) {
            down = false;
            postMouseEvent(e);
        }
    });

    overlay.addEventListener("keydown", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keypress", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keyup", function (e) {
        return postKeyboardEvent(e);
    });

    var keyEventRegex = /key(up|down|press)/;
    var mouseEventRegex = /click|dblclick|mouse(up|down|move|over|out)/;

    return {
        pause: function pause() {
            paused = true;
        },
        resume: function resume() {
            if (!paused) {
                // guard against multiple calls to resume()
                return;
            }
            paused = false;

            function pop() {
                if (paused) {
                    return; // if something has paused use since we posted the last event return
                }

                var e = queue.pop_back();
                if (!e) {
                    return;
                }

                if (e instanceof MouseEvent) {
                    postMouseEvent(e);
                } else if (e instanceof KeyboardEvent) {
                    postKeyboardEvent(e);
                } else if (mouseEventRegex.test(e.type)) {
                    postMouseEvent(e);
                } else if (keyEventRegex.test(e.type)) {
                    postKeyboardEvent(e);
                }

                if (queue.last && queue.last.value) {
                    var next = queue.last.value; // TODO: change last to lastNode
                    var delay = next.timestamp - e.timestamp; // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
                    setTimeout(pop, delay);
                }
            }
            pop();
        }
    };
}

function createRelay(element) {
    var poster = new Poster(window.parent);

    poster.listen("mouse", function (e) {
        EventSim.simulate(element, e.type, {
            clientX: e.x,
            clientY: e.y,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });

    poster.listen("keyboard", function (e) {
        EventSim.simulate(element, e.type, {
            keyCode: e.keyCode,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });
}

exports.createOverlay = createOverlay;
exports.createRelay = createRelay;
},{"basic-ds":5,"eventsim":7,"poster":8}],2:[function(require,module,exports){
var ListNode = require("./ListNode");
var LinkedList = (function () {
    function LinkedList() {
        this.first = null;
        this.last = null;
    }
    LinkedList.prototype.push_back = function (value) {
        var node = new ListNode(value);
        if (this.first === null && this.last === null) {
            this.first = node;
            this.last = node;
        }
        else {
            node.prev = this.last;
            this.last.next = node;
            this.last = node;
        }
    };
    LinkedList.prototype.push_front = function (value) {
        var node = new ListNode(value);
        if (this.first === null && this.last === null) {
            this.first = node;
            this.last = node;
        }
        else {
            node.next = this.first;
            this.first.prev = node;
            this.first = node;
        }
    };
    LinkedList.prototype.pop_back = function () {
        if (this.last) {
            var value = this.last.value;
            if (this.last.prev) {
                var last = this.last;
                this.last = last.prev;
                this.last.next = null;
                last.destroy();
            }
            else {
                this.last = null;
                this.first = null;
            }
            return value;
        }
        else {
            return null;
        }
    };
    LinkedList.prototype.pop_front = function () {
        if (this.first) {
            var value = this.first.value;
            if (this.first.next) {
                var first = this.first;
                this.first = first.next;
                this.first.prev = null;
                first.destroy();
            }
            else {
                this.first = null;
                this.last = null;
            }
            return value;
        }
        else {
            return null;
        }
    };
    LinkedList.prototype.clear = function () {
        this.first = this.last = null;
    };
    LinkedList.prototype.insertBeforeNode = function (refNode, value) {
        if (refNode === this.first) {
            this.push_front(value);
        }
        else {
            var node = new ListNode(value);
            node.prev = refNode.prev;
            node.next = refNode;
            refNode.prev.next = node;
            refNode.prev = node;
        }
    };
    LinkedList.prototype.forEachNode = function (callback, _this) {
        var node = this.first;
        var index = 0;
        while (node !== null) {
            callback.call(_this, node, index);
            node = node.next;
            index++;
        }
    };
    LinkedList.prototype.forEach = function (callback, _this) {
        this.forEachNode(function (node, index) { return callback.call(_this, node.value, index); }, _this);
    };
    LinkedList.prototype.nodeAtIndex = function (index) {
        var i = 0;
        var node = this.first;
        while (node !== null) {
            if (index === i) {
                return node;
            }
            i++;
            node = node.next;
        }
        return null;
    };
    LinkedList.prototype.valueAtIndex = function (index) {
        var node = this.nodeAtIndex(index);
        return node ? node.value : undefined;
    };
    LinkedList.prototype.toArray = function () {
        var array = [];
        var node = this.first;
        while (node !== null) {
            array.push(node.value);
            node = node.next;
        }
        return array;
    };
    LinkedList.fromArray = function (array) {
        var list = new LinkedList();
        array.forEach(function (value) {
            list.push_back(value);
        });
        return list;
    };
    return LinkedList;
})();
module.exports = LinkedList;

},{"./ListNode":3}],3:[function(require,module,exports){
var ListNode = (function () {
    function ListNode(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    ListNode.prototype.destroy = function () {
        this.value = null;
        this.prev = null;
        this.next = null;
    };
    return ListNode;
})();
module.exports = ListNode;

},{}],4:[function(require,module,exports){
var Stack = (function () {
    function Stack() {
        this.items = [];
        this.poppedLastItem = function (item) {
        };
    }
    Stack.prototype.push = function (item) {
        this.items.push(item);
    };
    Stack.prototype.pop = function () {
        var item = this.items.pop();
        if (this.isEmpty) {
            this.poppedLastItem(item);
        }
        return item;
    };
    Stack.prototype.peek = function () {
        return this.items[this.items.length - 1];
    };
    Stack.prototype.toArray = function () {
        return this.items.map(function (item) { return item; });
    };
    Object.defineProperty(Stack.prototype, "size", {
        get: function () {
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "isEmpty", {
        get: function () {
            return this.items.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    return Stack;
})();
module.exports = Stack;

},{}],5:[function(require,module,exports){
exports.LinkedList = require("./LinkedList");
exports.Stack = require("./Stack");

},{"./LinkedList":2,"./Stack":4}],6:[function(require,module,exports){
var initKeyboardEvent_variant = (function (event) {
    try {
        event.initKeyboardEvent("keyup", false, false, window, "+", 3, true, false, true, false, false);
        if ((event["keyIdentifier"] || event["key"]) == "+" && (event["keyLocation"] || event["location"]) == 3) {
            return event.ctrlKey ? (event.altKey ? 1 : 3) : (event.shiftKey ? 2 : 4);
        }
        return 9;
    }
    catch (e) {
        return 0;
    }
})(document.createEvent("KeyboardEvent"));
var keyboardEventProperties = {
    "char": "",
    "key": "",
    "location": 0,
    "ctrlKey": false,
    "shiftKey": false,
    "altKey": false,
    "metaKey": false,
    "repeat": false,
    "locale": "",
    "detail": 0,
    "bubbles": false,
    "cancelable": false,
    "keyCode": 0,
    "charCode": 0,
    "which": 0
};
function createModifersList(dict) {
    var modifiers = ["Ctrl", "Shift", "Alt", "Meta", "AltGraph"];
    return modifiers.filter(function (mod) {
        return dict.hasOwnProperty([mod.toLowerCase() + "Key"]);
    }).join(" ");
}
function createKeyboardEvent(type, dict) {
    var event;
    if (initKeyboardEvent_variant) {
        event = document.createEvent("KeyboardEvent");
    }
    else {
        event = document.createEvent("Event");
    }
    var propName, localDict = {};
    for (propName in keyboardEventProperties) {
        if (keyboardEventProperties.hasOwnProperty(propName)) {
            if (dict && dict.hasOwnProperty(propName)) {
                localDict[propName] = dict[propName];
            }
            else {
                localDict[propName] = keyboardEventProperties[propName];
            }
        }
    }
    var ctrlKey = localDict["ctrlKey"];
    var shiftKey = localDict["shiftKey"];
    var altKey = localDict["altKey"];
    var metaKey = localDict["metaKey"];
    var altGraphKey = localDict["altGraphKey"];
    var key = localDict["key"] + "";
    var char = localDict["char"] + "";
    var location = localDict["location"];
    var keyCode = localDict["keyCode"] || (localDict["keyCode"] = key && key.charCodeAt(0) || 0);
    var charCode = localDict["charCode"] || (localDict["charCode"] = char && char.charCodeAt(0) || 0);
    var bubbles = localDict["bubbles"];
    var cancelable = localDict["cancelable"];
    var repeat = localDict["repeat"];
    var local = localDict["locale"];
    var view = window;
    localDict["which"] || (localDict["which"] = localDict["keyCode"]);
    if ("initKeyEvent" in event) {
        event.initKeyEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
    }
    else if (initKeyboardEvent_variant && "initKeyboardEvent" in event) {
        switch (initKeyboardEvent_variant) {
            case 1:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, shiftKey, altKey, metaKey, altGraphKey);
                break;
            case 2:
                event.initKeyboardEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
                break;
            case 3:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, altKey, shiftKey, metaKey, altGraphKey);
                break;
            case 4:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, createModifersList(localDict), repeat, local);
                break;
            default:
                event.initKeyboardEvent(type, bubbles, cancelable, view, char, key, location, createModifersList(localDict), repeat, local);
        }
    }
    else {
        event.initEvent(type, bubbles, cancelable);
    }
    for (propName in keyboardEventProperties) {
        if (keyboardEventProperties.hasOwnProperty(propName)) {
            if (event[propName] != localDict[propName]) {
                try {
                    delete event[propName];
                    Object.defineProperty(event, propName, { writable: true, value: localDict[propName] });
                }
                catch (e) {
                }
            }
        }
    }
    return event;
}
module.exports = createKeyboardEvent;

},{}],7:[function(require,module,exports){
var createKeyboardEvent = require("./createKeyboardEvent");
var EventSim;
(function (EventSim) {
    var mouseRegex = /click|dblclick|(mouse(down|move|up|over|out|enter|leave))/;
    var pointerRegex = /pointer(down|move|up|over|out|enter|leave)/;
    var keyboardRegex = /key(up|down|press)/;
    function simulate(target, name, options) {
        var event;
        if (mouseRegex.test(name)) {
            event = new MouseEvent(name, options);
        }
        else if (keyboardRegex.test(name)) {
            event = createKeyboardEvent(name, options);
        }
        else if (pointerRegex.test(name)) {
            event = new PointerEvent(name, options);
        }
        target.dispatchEvent(event);
    }
    EventSim.simulate = simulate;
})(EventSim || (EventSim = {}));
module.exports = EventSim;

},{"./createKeyboardEvent":6}],8:[function(require,module,exports){
var posters = [];
if (self.document) {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            if (poster.target === e.source) {
                var listeners = poster.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            }
        });
    });
}
else {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            var listeners = poster.channels[channel];
            if (listeners) {
                listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
            }
        });
    });
}
var Poster = (function () {
    function Poster(target, origin) {
        var _this = this;
        if (origin === void 0) { origin = "*"; }
        if (self.window && target instanceof HTMLIFrameElement) {
            target = target.contentWindow;
        }
        this.origin = origin;
        this.target = target;
        this.channels = {};
        if (self.window && target instanceof Worker) {
            target.addEventListener("message", function (e) {
                var channel = e.data.channel;
                var listeners = _this.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            });
        }
        posters.push(this);
    }
    Poster.prototype.post = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var message = {
            channel: channel,
            args: args
        };
        if (self.document && !(this.target instanceof Worker)) {
            this.target.postMessage(message, this.origin);
        }
        else {
            this.target.postMessage(message);
        }
    };
    Poster.prototype.emit = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.unshift(channel);
        this.post.apply(this, args);
    };
    Poster.prototype.listen = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners === undefined) {
            listeners = this.channels[channel] = [];
        }
        listeners.push(callback);
        return this;
    };
    Poster.prototype.addListener = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.on = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.removeListener = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners) {
            var index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    };
    Poster.prototype.removeAllListeners = function (channel) {
        this.channels[channel] = [];
    };
    Poster.prototype.listeners = function (channel) {
        var listeners = this.channels[channel];
        return listeners || [];
    };
    return Poster;
})();
module.exports = Poster;

},{}]},{},[1])(1)
});

/* Provides debugging support for live-editor */

window.ScratchpadDebugger = Backbone.View.extend({

    el: ".scratchpad-debugger",

    initialize: function initialize(options) {
        this.editor = options.editor;
        this.liveEditor = options.liveEditor;

        this.render();
        this.bind();
    },

    render: function render() {
        this.$el.html(Handlebars.templates["debugger"]({
            execFile: this.execFile,
            imagesDir: this.imagesDir,
            colors: this.colors
        }));
    },

    postFrame: function postFrame(data) {
        this.liveEditor.postFrame(data);
    },

    bind: function bind() {
        // create the overlay first before binding any event handlers because
        // createOverlay moves the iframe's position in the DOM tree which
        // unbinds existing event handlers
        var iframe = $("iframe").get(0);
        this.overlay = iframeOverlay.createOverlay(iframe);

        var $el = this.$el;
        var $container = $(this.editor.container);
        var self = this;

        $(window).on("message", this.listenMessages.bind(this));

        $el.on("change", ".debug-mode", function () {
            self.debuggerLevel = $el.find(".debugger-level-select option:selected").val();

            if (this.checked) {
                self.trigger("enabled", true);
                self.editor.setReadOnly(true);
                $container.addClass("debugging");
                $el.find(".ace_cursor").hide();

                $el.find(".debugger-level").show();
                if (self.debuggerLevel === "beginner") {
                    $el.find(".debugger-simple").show();
                } else if (self.debuggerLevel === "advanced") {
                    $el.find(".debugger-complex").show();
                }
            } else {
                self.trigger("enabled", false);
                self.editor.setReadOnly(false);
                $container.removeClass("debugging");
                $el.find(".ace_cursor").show();

                $el.find(".debugger-level").hide();
                $el.find(".debugger-simple").hide();
                $el.find(".debugger-complex").hide();
            }

            self.postFrame({
                type: "debugger",
                action: "debug",
                state: this.checked ? "on" : "off"
            });
        });

        var scroller = self.liveEditor.$el.find(".ace_scroller").get(0);
        // needs to be on the capture phase to prevent existing event handlers
        // from firing
        scroller.addEventListener("mousedown", function (e) {
            if (self.get("enabled")) {
                e.stopImmediatePropagation();
            }
        }, true);

        $el.on("change", ".debugger-level-select", function () {
            self.debuggerLevel = $(this).find("option:selected").val();

            if (self.debuggerLevel === "beginner") {
                $el.find(".debugger-complex").hide();
                $el.find(".debugger-simple").show();
            } else if (self.debuggerLevel === "advanced") {
                $el.find(".debugger-simple").hide();
                $el.find(".debugger-complex").show();
            }
        });

        $el.on("click", ".debug-begin", function () {
            self.postFrame({
                type: "debugger",
                action: "start",
                paused: true,
                breakpoints: self.getBreakpoints()
            });

            self.enableButtons();
        });

        $el.on("click", ".debug-end", function () {
            self.postFrame({
                type: "debugger",
                action: "resume",
                ignoreBreakpoints: true
            });
        });

        $el.on("click", ".debug-restart", function () {
            self.postFrame({
                type: "debugger",
                action: "start",
                breakpoints: self.getBreakpoints()
            });
        });

        $el.on("click", ".debug-continue", function () {
            self.postFrame({
                type: "debugger",
                action: "resume"
            });
        });

        $el.on("click", ".step-over", function () {
            self.postFrame({
                type: "debugger",
                action: "stepOver"
            });
        });

        $el.on("click", ".step-in", function () {
            self.postFrame({
                type: "debugger",
                action: "stepIn"
            });
        });

        $el.on("click", ".step-out", function () {
            self.postFrame({
                type: "debugger",
                action: "stepOut"
            });
        });

        // set/clear breakpoints by clicking in the gutter
        this.editor.on("guttermousedown", function (e) {
            var target = e.domEvent.target;
            if (target.className.indexOf("ace_gutter-cell") === -1) {
                return;
            }

            // only set a breakpoint when clicking on the left side of the target
            if (e.clientX > 25 + target.getBoundingClientRect().left) {
                return;
            }

            var row = e.getDocumentPosition().row;

            if (e.editor.session.getBreakpoints()[row]) {
                e.editor.session.clearBreakpoint(row);

                self.postFrame({
                    type: "debugger",
                    action: "clearBreakpoint",
                    line: row + 1
                });
            } else {
                e.editor.session.setBreakpoint(row);

                self.postFrame({
                    type: "debugger",
                    action: "setBreakpoint",
                    line: row + 1
                });
            }

            e.stop();
        });

        // Based on:
        // https://github.com/ajaxorg/cloud9/blob/master/plugins-client/ext.debugger/breakpoints.js#L170
        var session = this.editor.session;
        session.on("change", function (e) {
            if (!session.$breakpoints.length) {
                return;
            }

            var delta = e.data;
            var range = delta.range;
            if (range.end.row === range.start.row) {
                return;
            }

            var len, firstRow;
            len = range.end.row - range.start.row;

            if (delta.action === "insertText" || delta.action === "insertLines") {
                if (delta.action === "insertText") {
                    firstRow = range.start.column ? range.start.row + 1 : range.start.row;
                }

                var args = new Array(len);
                args.unshift(firstRow, 0);
                Array.prototype.splice.apply(session.$breakpoints, args);
            } else if (delta.action === "removeText" || delta.action === "removeLines") {
                firstRow = range.start.row;

                if (range.start.column === 0 && range.end.column === 0) {
                    session.$breakpoints.splice(firstRow, len);
                } else {
                    session.$breakpoints.splice(firstRow + 1, len);
                }
            }
        });
    },

    getBreakpoints: function getBreakpoints() {
        var breakpoints = {};
        this.editor.session.getBreakpoints().forEach(function (value, index) {
            breakpoints[index + 1] = true;
        });
        console.log(breakpoints);
        return breakpoints;
    },

    listenMessages: function listenMessages(e) {
        // DANGER!  The data coming in from the iframe could be anything,
        // because with some cleverness the author of the program can send an
        // arbitrary message up to us.  We need to be careful to sanitize it
        // before doing anything with it, to avoid XSS attacks.  For more
        // information, see the comment in handleMessages in live-editor.js.
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);
        } catch (err) {}

        if (!data) {
            return;
        }

        if (data.type !== "debugger") {
            return;
        }

        var editor = this.editor;

        if (data.action === "halted") {
            this.disableButtons();
            editor.setHighlightActiveLine(false);
        } else if (data.action === "step") {
            // Coerce to number just in case
            if (+data.line > 0) {
                this.enableButtons();
                editor.gotoLine(+data.line);
                editor.setHighlightActiveLine(true);
                this.overlay.pause();
            } else {
                // TODO: don't post messages when there's no line number
                editor.setHighlightActiveLine(false);
                this.overlay.resume();
            }
        } else if (data.action === "done") {
            editor.setHighlightActiveLine(false);
            this.disableButtons();
            this.overlay.resume();
        }
    },

    enableButtons: function enableButtons() {
        this.$el.find(".step-over").removeAttr("disabled");
        this.$el.find(".step-in").removeAttr("disabled");
        this.$el.find(".step-out").removeAttr("disabled");
        this.$el.find(".debug-end").removeAttr("disabled");
        this.$el.find(".debug-continue").removeAttr("disabled");
    },

    disableButtons: function disableButtons() {
        this.$el.find(".step-over").attr("disabled", "");
        this.$el.find(".step-in").attr("disabled", "");
        this.$el.find(".step-out").attr("disabled", "");
        this.$el.find(".debug-end").attr("disabled", "");
        this.$el.find(".debug-continue").attr("disabled", "");
    }
});

// Malformed JSON, we don't care about it
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["debugger"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Debug Mode";}

function program3(depth0,data) {
  
  
  return "Level";}

function program5(depth0,data) {
  
  
  return "Beginner";}

function program7(depth0,data) {
  
  
  return "Advanced";}

function program9(depth0,data) {
  
  
  return "Begin";}

function program11(depth0,data) {
  
  
  return "Step";}

function program13(depth0,data) {
  
  
  return "End";}

function program15(depth0,data) {
  
  
  return "Restart";}

function program17(depth0,data) {
  
  
  return "Step Over";}

function program19(depth0,data) {
  
  
  return "Step In";}

function program21(depth0,data) {
  
  
  return "Step Out";}

function program23(depth0,data) {
  
  
  return "Continue";}

  buffer += "<div class=\"scratchpad-debugger\">\n    ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <input type=\"checkbox\" class=\"debug-mode\">\n    <span class=\"debugger-level\" style=\"display:none;margin-left:20px;\">\n        ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <select class=\"debugger-level-select\">\n            <option value=\"beginner\" selected>\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </option>\n            <option value=\"advanced\">\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </option>\n        </select>\n    </span>\n\n    <div class=\"debugger-simple\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-begin\" style=\"margin-right:20px;\">\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-end\" disabled style=\"margin-left:20px;\">\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(13, program13, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n    </div>\n    <div class=\"debugger-complex\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-restart\" style=\"margin-right:10px;\">\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(15, program15, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <!-- start/restart -->\n        <button class=\"step-over\" disabled>\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(17, program17, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(19, program19, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-out\" disabled>\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(21, program21, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-continue\" disabled style=\"margin-left:10px;\">\n            ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(23, program23, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </button>\n    </div>\n</div>\n";
  return buffer;});;
// TODO(kevinb) remove after challenges have been converted to use i18n._
$._ = i18n._;

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
        this.newErrorExperience = options.newErrorExperience;
        if (window.location.search.indexOf("new_error_experience=yes") !== -1) {
            this.newErrorExperience = true;
        }

        if (options.enableLoopProtect != null) {
            this.enableLoopProtect = options.enableLoopProtect;
        } else {
            this.enableLoopProtect = true;
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

        if (options.cursor) {
            // Restore the cursor position
            this.editor.setCursor(options.cursor);
        } else {
            // Set an initial starting selection point
            this.editor.setSelection({
                start: { row: 0, column: 0 },
                end: { row: 0, column: 0 }
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

    render: function render() {
        this.$el.html(Handlebars.templates["live-editor"]({
            execFile: this.execFile,
            imagesDir: this.imagesDir,
            colors: this.colors
        }));
    },

    bind: function bind() {
        var _this = this;

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

        $el.find("#output-frame").on("load", function () {
            _this.outputState = "clean";
            _this.markDirty();
        });

        // Whenever the user changes code, execute the code
        this.editor.on("change", function () {
            _this.markDirty();
        });

        this.editor.on("userChangedCode", function () {
            if (!_this.record.recording && !_this.record.playing) {
                _this.trigger("userChangedCode");
            }
        });

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
            setTimeout(function () {
                self.maybeShowErrors();
            }, 0);
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
            var lineNum = parseInt($(this).text(), 10);
            self.setErrorPosition(this.gutterDecorations[lineNum]);
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
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);
        } catch (err) {}

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
            // TODO(benkraft): This is technically not unsafe, in that
            // this.editor.text() does not render its argument as HTML, but it
            // does mean that a user can write a program which modifies its own
            // code (perhaps on another user's computer).  Not directly a
            // security risk, but it would be nice if it weren't possible.
            this.editor.text(data.code);
            this.editor.originalCode = data.code;
            this.restartCode();
        }

        // Testing/validation code is being set
        if (data.validate !== undefined && data.validate !== null) {
            this.validation = data.validate;
        }

        if (data.results) {
            this.trigger("runDone");
        }

        if (this.editorType.indexOf("ace_") === 0 && data.results) {
            // Remove previously added markers
            this.removeMarkers();
            if (data.results.assertions || data.results.warnings) {
                // Add gutter warning markers in the editor.
                // E.g. Add `Program.assertEqual(2, 4);` to the live editor to see
                // an example.
                var annotations = [];
                for (var i = 0; i < data.results.assertions.length; i++) {
                    var assertion = data.results.assertions[i];
                    annotations.push({
                        // Coerce to the expected type
                        row: +assertion.row,
                        column: +assertion.column,
                        // This is escaped by the gutter annotation display
                        // code, so we don't need to escape it here.
                        text: assertion.text.toString(),
                        type: "warning"
                    });
                    this.addUnderlineMarker(+assertion.row);
                }

                for (var i = 0; i < data.results.warnings.length; i++) {
                    var warning = data.results.warnings[i];
                    annotations.push({
                        // Coerce to the expected type
                        row: +warning.row,
                        column: +warning.column,
                        // This is escaped by the gutter annotation display
                        // code, so we don't need to escape it here.
                        text: warning.text.toString(),
                        type: "warning"
                    });
                    this.addUnderlineMarker(+warning.row);
                }

                // Add new gutter markers
                this.editor.editor.session.setAnnotations(annotations);
            } else {
                this.editor.editor.session.setAnnotations([]);
            }
        }

        if (this.newErrorExperience && this.errorState.length === 0) {
            this.setHappyState();
        }

        if (data.results && _.isArray(data.results.errors)) {
            this.handleErrors(this.cleanErrors(data.results.errors));
        }

        // Set the line visibility in the editor
        if (data.lines !== undefined) {
            // Coerce to the expected type
            this.editor.toggleGutter(data.lines.map(function (x) {
                return +x;
            }));
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

        // Reset the timer
        window.clearTimeout(this.errorTimeout);

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
                if (gutterDecorations[error.row + 1] === null) {
                    gutterDecorations[error.row + 1] = index;
                    session.addGutterDecoration(error.row, "ace_error");
                }

                this.addUnderlineMarker(error.row);
            }, this);

            this.gutterDecorations = gutterDecorations;

            // Set the errors
            this.setErrors(errors);

            this.maybeShowErrors();
        } else {
            // If there are no errors, remove the gutter decorations that marked
            // the errors and reset our state.
            this.removeGutterDecorations();
            this.setErrors([]);
            this.setHappyState();
            this.showError = false;
            this.errorCursorRow = null;
        }
    },

    maybeShowErrors: function maybeShowErrors() {

        if (!this.hasErrors() || !this.editor || !this.editor.getCursor()) {
            return;
        }

        var currentRow = this.editor.getCursor().row;
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
            // show the tipbar if 1 minute has gone by without typing.
            this.setThinkingState();
            // Make doubly sure that we clear the timeout
            window.clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout((function () {
                if (this.hasErrors()) {
                    this.setErrorState();
                }
            }).bind(this), 60000);
        }
    },

    // This is the current error state of Oh Noes Guy.
    // His state can be one of:
    // - happy (no errors)
    // - thinking (the ambigous state where there may be an error in what the
    //             typer is currently typing)
    // - error (there is an error that we want to display prominently)
    errorState: "",
    hasErrors: function hasErrors() {
        return this.tipbar.errors.length;
    },
    setErrors: function setErrors(errors) {
        this.tipbar.setErrors(errors);
    },
    setErrorPosition: function setErrorPosition(errorPos) {
        this.setErrorState();
        this.tipbar.setErrorPosition(errorPos);
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
            this.$el.find(this.dom.ERROR_BUDDY_THINKING).show().animate({ left: -2 }, { duration: 300, easing: "linear" }).animate({ left: 2 }, { duration: 300, easing: "linear" }).animate({ left: 0 }, { duration: 300, easing: "linear" });
        }
    },
    setHappyState: function setHappyState() {
        this.errorState = "happy";
        this.tipbar.hide();
        this.$el.find(this.dom.ERROR_BUDDY_THINKING).hide();
        this.$el.find(this.dom.ERROR_BUDDY_HAPPY).show();
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
            outputType: this.outputType,
            enableLoopProtect: this.enableLoopProtect
        };

        this.trigger("runCode", options);

        this.postFrame(options);
    }, 20),

    markDirty: function markDirty() {
        var _this2 = this;

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
            this.runTimeout = setTimeout(function () {
                _this2.trigger("runDone");
            }, 500);
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

            // Remove all HTML markup and un-escape entities
            text = text.replace(/<[^>]+>/g, "");
            text = text.replace(/&nbsp;|&#160;/g, " ");
            text = text.replace(/&lt;|&#60;/g, "<");
            text = text.replace(/&gt;|&#62;/g, ">");
            text = text.replace(/&amp;|&#38;/g, "&");
            text = text.replace(/&quot;|&#34;/g, "\"");
            text = text.replace(/&apos;|&#39;/g, "'");

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
    },

    cleanErrors: function cleanErrors(errors) {
        var loopProtectMessages = {
            "WhileStatement": i18n._("<code>while</code> loop"),
            "DoWhileStatement": i18n._("<code>do-while</code> loop"),
            "ForStatement": i18n._("<code>for</code> loop"),
            "FunctionDeclaration": i18n._("<code>function</code>"),
            "FunctionExpression": i18n._("<code>function</code>")
        };

        errors = errors.map((function (error) {
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
                error.html = i18n._("A %(type)s is taking too long to run. " + "Perhaps you have a mistake in your code?", {
                    type: loopProtectMessages[loopNodeType]
                });
            }

            var newError = {};

            // error.html was cleared above, so if it exists it's because we
            // reset it, and it's safe.
            if (typeof error === "string") {
                newError.text = this.clean(this.prettify(error));
            } else if (error.html) {
                newError.text = this.prettify(error.html);
            } else {
                newError.text = this.prettify(this.clean(error.text || error.message || ""));
            }

            // Coerce anything from the user to the expected types before
            // copying over
            if (error.lint !== undefined) {
                newError.lint = {};

                // TODO(benkraft): Coerce this in a less ad-hoc way, or at
                // least only pass through the things we'll actually use.
                // Also, get a stronger guarantee that none of these
                // strings ever get used unescaped.
                var numberProps = ["character", "line"];
                var stringProps = ["code", "evidence", "id", "raw", "reason", "scope", "type"];
                var objectProps = ["openTag"];

                numberProps.forEach(function (prop) {
                    if (error.lint[prop] != undefined) {
                        newError.lint[prop] = +error.lint[prop];
                    }
                });

                stringProps.forEach(function (prop) {
                    if (error.lint[prop] != undefined) {
                        newError.lint[prop] = error.lint[prop].toString();
                    }
                });

                objectProps.forEach(function (prop) {
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
        }).bind(this));

        errors = errors.sort(function (a, b) {
            var diff = a.row - b.row;
            return diff === 0 ? (a.priority || 99) - (b.priority || 99) : diff;
        });

        return errors;
    },

    // This adds html tags around quoted lines so they can be formatted
    prettify: function prettify(str) {
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
    },

    clean: function clean(str) {
        return String(str).replace(/</g, "&lt;");
    }
});

LiveEditor.registerEditor = function (name, editor) {
    LiveEditor.prototype.editors[name] = editor;
};

// Malformed JSON, we don't care about it
