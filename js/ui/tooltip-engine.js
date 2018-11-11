window.TooltipEngine = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.editor = options.editor;
        var record = this.options.record;

        this.tooltips = {};
        var childOptions = _.defaults({
            parent: this
        }, options);

        _.each(options.tooltips, function(name) {
            this.tooltips[name] = new TooltipEngine.classes[name](childOptions);
            this.tooltips[name].on("scrubbingStarted", function() {
                this.trigger("scrubbingStarted", name);
            }.bind(this));
            this.tooltips[name].on("scrubbingEnded", function() {
                this.trigger("scrubbingEnded", name);
            }.bind(this));
        }.bind(this));

        if (record && !record.handlers.hot) {
            record.handlers.hot = function(e) {
                if (this.currentTooltip) {
                    TooltipBase.prototype.updateText.call(this.currentTooltip, e.hot);
                }
            }.bind(this);

            // disable autofill when playback or seeking has started
            ["playStarted", "runSeek"].forEach(function(event) {
                record.on(event, function() {
                    _.values(this.tooltips).forEach(function(tooltip) {
                        tooltip.autofill = false;
                    });
                }.bind(this));
            }, this);

            // enable autofill when playback or seeking has stopped
            ["playPaused", "playStopped", "seekDone"].forEach(function(event) {
                record.on(event, function() {
                    _.values(this.tooltips).forEach(function(tooltip) {
                        tooltip.autofill = true;
                    });
                }.bind(this));
            }, this);
        }

        this.currentTooltip = undefined;
        this.ignore = false;
        this.bind();
    },

    bind: function(){
        if (this.callbacks) {
            return;
        }

        var checkBlur = function(e) {
            var inEditor = $.contains(this.editor.container, e.target);
            var inTooltip = (this.currentTooltip && $.contains(this.currentTooltip.$el[0], e.target));
            var modalOpen = (this.currentTooltip && this.currentTooltip.modal &&
                                this.currentTooltip.modal.$el.is(":visible"));
            if (this.currentTooltip && !(inEditor || inTooltip || modalOpen)) {
                this.currentTooltip.$el.hide();
                this.currentTooltip = undefined;
            }
        }.bind(this);

        this.callbacks = [{
            target: this.editor.selection,
            event: "changeCursor",
            fn: this.doRequestTooltip.bind(this)
        }, {
            target: this.editor.session.getDocument(),
            event: "change",
            fn: function(e) {
                this.doRequestTooltip(e.data);
            }.bind(this)
        }, {
            target: this.editor.session,
            event: "changeScrollTop",
            fn: function() {
                if (this.currentTooltip) {
                    this.currentTooltip.placeOnScreen();
                }
            }.bind(this)
        }, {
            target: $(document),
            event: "mousedown",
            fn: checkBlur
        }, {
            target: $(document),
            event: "contextmenu",
            fn: checkBlur
        }, {
            target: $(this.editor.container),
            event: "mousedown",
            fn: function() {
                this.doRequestTooltip({
                    action: "click"
                });
            }.bind(this)
        }];

        _.each(this.callbacks, function(cb){
            cb.target.on(cb.event, cb.fn);
        });


        this.requestTooltipDefaultCallback = function() {
            if (this.currentTooltip && this.currentTooltip.$el) {
                this.currentTooltip.$el.hide();
                this.currentTooltip = undefined;
            }
        }.bind(this);

        this.editor.on("requestTooltip", this.requestTooltipDefaultCallback);
    },

    remove: function() {
        _.each(this.callbacks, function(cb) {
            cb.target.off(cb.event, cb.fn);
        });
        _.each(this.tooltips, function(tooltip) {
            tooltip.remove();
        });

        this.editor.off("requestTooltip", this.requestTooltipDefaultCallback);
    },

    doRequestTooltip: function(source) {
        if (this.ignore) {
            return;
        }

        this.last = this.last || {};

        var selection = this.editor.selection;
        var pos = selection.getCursor();
        var params = {
            col: pos.column,
            row: pos.row,
            line: this.editor.session.getDocument().getLine(pos.row),
            selections: selection.getAllRanges(),
            source: source
        };
        params.pre = params.line.slice(0, params.col);
        params.post = params.line.slice(params.col);

        var duplicate = (params.col === this.last.col &&
            params.row === this.last.row && params.line === this.last.line);

        if (duplicate && !source) {
            return false;
        }
        if (this.isWithinComment(params.pre)){
            // if selected text is within a comment, hide current tooltip (if any) and return
            if (this.currentTooltip) {
                this.currentTooltip.$el.hide();
                this.currentTooltip = undefined;
            }
            return false;
        }
        this.last = params;

        this.editor._emit("requestTooltip", params);
    },

    // Returns true if we're inside a comment
    // This isn't a perfect check, but it is close enough.
    isWithinComment: function(text) {
        // Comments typically start with a / or a * (for multiline C style)
        return text.length && (text[0] === "/" || text[0] === "*");
    }
});

TooltipEngine.classes = {};

 /*
  * This is the base that we build all of the tooltips on
  *
  * Every Tooltip has the following major parts:
  * - initialize(), just accepts options and then tries to attach
  *   the html for the tooltip by calling render() and bind() as required
  *
  * - render() and bind() to set up the HTML
  *
  * - A detector function. The detector functions are all bound to the
  *   requestTooltip event in their respective bind() method. They receive an event with
  *   information about where the cursor is and whether it got there because of a click,
  *   selection character added, etc. It chooses to either load its tooltip or let the
  *   event keep bubbling
  *   > The detector function also sets aceLocation, which saves what portion of the
  *     text the selector is active for.
  *
  * - updateText replaces whatever text is specified by the aceLocation
  *   with the new text. It is common for tooltips to override this function
  *   so that they can accept a value in a different format, make it into a string
  *   and then pass the formatted value back to the function defined in TooltipBase
  *   to do the actual replace
  *
  * - placeOnScreen which determines where the HTML needs to be moved to in order
  *   for it to show up on by the cursor. This also pulls information from aceLocation
  *
  */

window.TooltipBase = Backbone.View.extend({
    bindToRequestTooltip: function() {
        if (this.parent) {
            this.callback = this.detector.bind(this);
            this.parent.editor.on("requestTooltip", this.callback);
        }
    },

    unbindFromRequestTooltip: function() {
        if (this.parent) {
            this.parent.editor.off("requestTooltip", this.callback);
        }
    },

    placeOnScreen: function() {
        // don't show tool tips when the editor is in readonly mode
        if (this.parent.editor.getReadOnly()) {
            return;
        }
        var parent = this.parent;
        if (parent.currentTooltip && parent.currentTooltip !== this) {
            parent.currentTooltip.$el.hide();
        }
        parent.currentTooltip = this;

        var editor = parent.editor;
        var loc = this.aceLocation;
        var editorBB = editor.renderer.scroller.getBoundingClientRect();
        var editorHeight = editorBB.height;
        if (typeof loc.tooltipCursor !== "number") {
            loc.tooltipCursor = loc.start + loc.length;
        }
        var coords = editor.renderer.textToScreenCoordinates(loc.row, loc.tooltipCursor);
        var relativePos = coords.pageY - editorBB.top;

        this.$el
            .css({
                top: $(window).scrollTop() + coords.pageY,
                left: coords.pageX
            })
            .toggle(!(relativePos < 0 || relativePos >= editorHeight));
    },

    // Third parameter, if true, tells ACE not to remember this update in the undo chain. Useful in
    // number-scrubbing.
    // THIS IS A PROBLEMATIC HACK.
    //  - If the undo chain and the editor's text are left in an inconsistent state, then
    //     future undo's will change the wrong text. I (ChrisJPhoenix) think this just means you need to
    //     put the editor's text back the way it was before letting anything else happen.
    //     This causes problems if the user hits the keyboard in the middle of a number-scrub: undo
    //     won't put things back correctly. Thus, use editor.setReadOnly(true) while using this hack.
    //  - I use the session's $fromUndo variable to tell the editor not to save undo's. This
    //     is undocumented. There's currently (7/25/15) a test for it in tooltips_test.js.
    updateText: function(newText, customSelection, avoidUndo) {
        if (!this.parent || this.parent.options.record.playing) {
            return;
        }
        var parent = this.parent;
        var editor = parent.editor;

        parent.ignore = true;
        newText = newText.toString();
        var Range = ace.require("ace/range").Range;
        var loc = this.aceLocation;
        var range = new Range(loc.row, loc.start, loc.row, loc.start + loc.length);

        // We probably could just set it to false when we're done, but someone else might
        // be trying a similar hack, or... who knows?
        var undoState;
        if (avoidUndo) {
            undoState = editor.session.$fromUndo;
            editor.session.$fromUndo = true;
        }
        editor.session.replace(range, newText);
        if (avoidUndo) {
            editor.session.$fromUndo = undoState;
        }

        range.end.column = range.start.column + newText.length;
        if (customSelection) {
            range.start.column = loc.start + customSelection.offset;
            range.end.column = loc.start + customSelection.offset + customSelection.length;
        }
        editor.selection.setSelectionRange(range);

        parent.ignore = false;
        this.aceLocation.length = newText.length;
    },

    insert: function() {
        if (this.parent.options.record.playing) {
            return;
        }
        this.parent.editor.session.insert.apply(this.parent.editor.session, arguments);
    },

    parens: {
        "(": ")",
        "{": "}",
        "[": "]"
    },

    // Returns true if we're inside an open parenthesis
    isInParenthesis: function(text) {
        var parenStack = [];
        for (var i = 0; i < text.length; i++) {
            if (text[i] in this.parens) {
                parenStack.unshift(text[i]);
            } else if (parenStack && text[i] === this.parens[parenStack[0]]) {
                parenStack.shift();
            }
        }
        return parenStack.length > 0;
    },

    // Returns true if we're after an `=` assignment
    isAfterAssignment: function(text) {
        return /(?:^|[^!=])=\s*$/.test(text);
    },

    // Returns true if we're inside a string
    isWithinString: function(text) {
        var withinString = false;
        var lastQuoteChar;
        for (var i = 0; i < text.length; i++) {
            if (withinString && text[i] === lastQuoteChar) {
                withinString = false;
            } else if (!withinString && text[i] === "'" || text[i] === "\"") {
                lastQuoteChar = text[i];
                withinString = true;
            }
        }
        return withinString;
    }
});
