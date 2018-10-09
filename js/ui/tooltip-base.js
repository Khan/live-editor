import $ from "jquery";
import Backbone from "backbone";
Backbone.$ = $;

import "../../css/ui/tooltips.css";

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

const TooltipBase = Backbone.View.extend({
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

export default TooltipBase;