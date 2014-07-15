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