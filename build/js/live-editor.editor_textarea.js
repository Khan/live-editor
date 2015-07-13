window.TextareaEditor = Backbone.View.extend({
    initialize: function initialize(options) {
        var self = this;

        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.type = options.type;

        this.editor = document.createElement("textarea");
        this.editor.className = "textarea-editor";
        this.$el.append(this.editor);

        $(this.editor).on("input", (function () {
            this.trigger("change");
        }).bind(this));

        // Not needed!
        this.tooltipEngine = {};

        this.config.editor = this;

        this.reset();
    },

    remove: function remove() {},

    reset: function reset(code, focus) {
        code = code || this.defaultCode;

        this.config.runCurVersion(this.type + "_editor", this);

        // Reset the editor
        this.text(code);
        this.setCursor({ start: 0, end: 0 }, focus);
    },

    // Set the cursor position on the editor
    setErrorHighlight: function setErrorHighlight(shouldHighlight) {},

    // Allow for toggling of the editor gutter
    toggleGutter: function toggleGutter(toggle) {},

    getAllFolds: function getAllFolds() {},

    setFolds: function setFolds(folds) {},

    blockPaste: function blockPaste(chastise) {},

    // Focus the editor
    focus: function focus() {
        if (this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    getCursor: function getCursor() {
        return {
            start: this.editor.selectionStart,
            end: this.editor.selectionEnd
        };
    },

    getSelectionIndices: function getSelectionIndices() {
        return this.getCursor();
    },

    // Set the cursor position on the editor
    setCursor: function setCursor(cursorPos, focus) {
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

    setSelection: function setSelection(selection) {
        this.setCursor(selection);
    },

    setReadOnly: function setReadOnly(readOnly) {
        this.editor.readOnly = readOnly;
    },

    text: function text(_text) {
        if (_text != null) {
            this.editor.value = _text;
        } else {
            return this.editor.value;
        }

        return this;
    },

    unfold: function unfold() {},

    insertNewlineIfCursorAtEnd: function insertNewlineIfCursorAtEnd() {},

    undo: function undo() {}
});

LiveEditor.registerEditor("textarea_document", TextareaEditor);