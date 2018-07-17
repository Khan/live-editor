/* eslint-disable no-var */
/* TODO: Fix the lint errors */
const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");

const LiveEditor = require("../../live-editor.js");

const TextareaEditor = Backbone.View.extend({
    initialize: function(options) {
        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.type = options.type;

        this.editor = document.createElement("textarea");
        this.editor.className = "textarea-editor";
        this.$el.append(this.editor);

        $(this.editor).on("input", function() {
            this.trigger("change");
        }.bind(this));

        // Not needed!
        this.tooltipEngine = {};

        this.config.editor = this;

        this.reset();
    },

    remove: function() {},

    reset: function(code, focus) {
        code = code || this.defaultCode;

        this.config.runCurVersion(this.type + "_editor", this);

        // Reset the editor
        this.text(code);
        this.setCursor({start: 0, end: 0}, focus);
    },

    // Set the cursor position on the editor
    setErrorHighlight: function(shouldHighlight) {},

    // Allow for toggling of the editor gutter
    toggleGutter: function(toggle) {},

    getAllFolds: function() {},

    setFolds: function(folds) {},

    blockPaste: function(chastise) {},

    // Focus the editor
    focus: function() {
        if (this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    getCursor: function() {
        return {
            start: this.editor.selectionStart,
            end: this.editor.selectionEnd
        };
    },

    getSelectionIndices: function() {
        return this.getCursor();
    },

    // Set the cursor position on the editor
    setCursor: function(cursorPos, focus) {
        if (this.editor.setSelectionRange) {
            this.editor.focus();
            this.editor.setSelectionRange(cursorPos.start, cursorPos.end);

        } else if (this.editor.createTextRange) {
            var range = this.editor.createTextRange();
            range.collapse(true);
            range.moveEnd("character", cursorPos.end);
            range.moveStart("character", cursorPos.start);
            range.select();
        }

        if (focus !== false && this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    setSelection: function(selection) {
        this.setCursor(selection);
    },

    setReadOnly: function(readOnly) {
        this.editor.readOnly = readOnly;
    },

    text: function(text) {
        if (text != null) {
            this.editor.value = text;
        } else {
            return this.editor.value;
        }

        return this;
    },

    unfold: function() {},

    insertNewlineIfCursorAtEnd: function() {},

    undo: function() {}
});

LiveEditor.registerEditor("textarea_document", TextareaEditor);

module.exports = TextareaEditor;