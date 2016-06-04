// A description of general tooltip flow can be found in tooltip-engine.js
TooltipEngine.classes.colorPicker = TooltipBase.extend({
    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;

        var funcs = (this.parent.options.type === "ace_webpage") ? "rgb|rgba" : "background|fill|stroke|color";
        this.regex = RegExp("(\\b(?:"+funcs+")\\s*\\()[^\\)]*$");
        this.autofill = true;

        this.render();
        this.bind();
    },

    render: function() {
        this.$el = $("<div class='tooltip picker'><div class='picker'>" +
                "</div><div class='arrow'></div></div>")
            .appendTo("body")
            .find(".picker").ColorPicker({
                flat: true,
                onChange: function(hsb, hex, rgb, undoMode) {
                    this.updateText(rgb, undoMode);
                }.bind(this)
            }).end()
            .hide();
    },

    bind: function() {
        var over = false;
        var down = false;
        var self = this;

        this.$el
            .on("mouseenter", function() {
                over = true;
            })
            .on("mouseleave", function() {
                over = false;
                if (!down) {
                    self.placeOnScreen();
                }
                self.options.editor.focus();
            })
            .on("mousedown", function() {
                var $picker = $(this);
                $picker.addClass("active");
                down = true;
                self.trigger("scrubbingStarted");

                $(document).one("mouseup", function() {
                    $picker.removeClass("active");
                    down = false;
                    if (!over) {
                        self.placeOnScreen();
                    }
                    self.trigger("scrubbingEnded");
                });
            });
        this.bindToRequestTooltip();
    },

    remove: function() {
        this.$el.remove();
        this.unbindFromRequestTooltip();
    },

    detector: function(event) {
        if (!this.regex.test(event.pre)) {
            return;
        }
        var functionStart = event.col - RegExp.lastMatch.length;
        var paramsStart = functionStart + RegExp.$1.length;

        var pieces = /^(.*?)(\);?|$)/.exec(event.line.slice(paramsStart));
        var body = pieces[1];
        this.closing = pieces[2];
        var paramsEnd = paramsStart + body.length;
        var functionEnd = paramsStart + pieces[0].length;

        var allColors = _.map(body.split(','), parseFloat);
        if (allColors.length === 4 && !isNaN(allColors[3])) {
            body = body.slice(0, body.lastIndexOf(','));
            paramsEnd = paramsStart + body.length;
            this.closing = event.line.slice(paramsEnd, functionEnd);
        }

        var colors = _.map(body.split(','), function(c) {
            c = parseFloat(c);
            return (isNaN(c) ? 0 : c);
        });
        var rgb = {
            r: Math.min(colors[0] || 0, 255),
            g: Math.min(colors[1] || 0, 255),
            b: Math.min(colors[2] || 0, 255)
        };

        this.aceLocation = {
            start: paramsStart,
            length: paramsEnd - paramsStart,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;

        var name = event.line.substring(functionStart, paramsStart - 1);
        var addSemicolon =
            this.isAfterAssignment(event.pre.slice(0, functionStart));
        if (['fill', 'stroke', 'background'].includes(name)) {
            addSemicolon = true;
        }

        if (event.source && event.source.action === "insertText" &&
            event.source.text.length === 1 && this.parent.options.type === "ace_pjs" && this.autofill) {
            // Auto-close
            if (body.length === 0 && this.closing.length === 0) {
                this.closing = ")" + (addSemicolon ? ";" : "");
                this.insert({
                    row: event.row,
                    column: functionEnd
                }, this.closing);
            }

            // Auto-fill
            if (body.trim().length === 0) {
                var rgb = {
                    r: 255,
                    g: 0,
                    b: 0
                };
                this.updateText(rgb);
            }
        }

        this.updateTooltip(rgb);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },

    updateTooltip: function(rgb) {
        this.$el.find(".picker").ColorPickerSetColor(rgb);
    },

    updateText: function(rgb, undoMode) {
        var avoidUndo = false;
        if (undoMode === 'startScrub') {
            // TODO: Next 4 lines of code needs refactoring with textAtAceLocation() in number-scrubber.js.
            // TODO: Sort out this, self, ace, to make it callable from both places, and put it in tooltip-engine.js.
            var Range = ace.require("ace/range").Range;
            var loc = this.aceLocation;
            var range = new Range(loc.row, loc.start, loc.row, loc.start + loc.length);
            this.originalText = this.parent.editor.getSession().getTextRange(range);
            this.wasReadOnly = this.parent.editor.getReadOnly();
            this.parent.editor.setReadOnly(true);
            avoidUndo = true;
        } else if (undoMode === 'midScrub') {
            avoidUndo = true;
        } else if (undoMode === 'stopScrub') {
            TooltipBase.prototype.updateText.call(this, this.originalText, undefined, true);
            this.parent.editor.setReadOnly(this.wasReadOnly);
        }
        TooltipBase.prototype.updateText.call(this, rgb.r + ", " + rgb.g + ", " + rgb.b, undefined, avoidUndo);
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;
    }
});
