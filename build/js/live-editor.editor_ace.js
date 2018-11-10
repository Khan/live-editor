window.AceEditor = Backbone.View.extend({
    dom: {
        TEXT_INPUT: "textarea",
        CONTENT: "div.ace_content"
    },

    tooltips: {
        // The earlier in the list a tooltip appears
        // the higher priority it gets.
        ace_pjs: ["imagePicker", "soundModal", "colorPicker", "numberScrubberClick", "autoSuggest", "numberScrubber"],
        ace_webpage: ["imageModal", "colorPicker", "numberScrubber"],
        ace_sql: ["numberScrubber"]
    },

    initialize: function initialize(options) {
        var self = this;

        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;
        this.type = options.type;
        this.workersDir = options.workersDir;
        this.editor = ace.edit(this.el);
        this.textarea = this.$(this.dom.TEXT_INPUT);
        this.content = this.$(this.dom.CONTENT);
        this.offset = this.content.offset();

        // Bind the recording logic first. Should always happen before
        // other events (such as the tooltip engine)
        if (this.record) {
            this.bindRecord();
        }

        // Attach the picker tooltips to the editor
        this.tooltipEngine = new TooltipEngine({
            tooltips: this.tooltips[this.type],
            type: this.type,
            imagesDir: options.imagesDir,
            soundsDir: options.soundsDir,
            editor: this.editor,
            record: this.record
        });

        this.tooltipEngine.on("scrubbingStarted", (function (name) {
            this.trigger("scrubbingStarted", name);
        }).bind(this));

        this.tooltipEngine.on("scrubbingEnded", (function (name) {
            this.trigger("scrubbingEnded", name);
        }).bind(this));

        // TODO(bbondy): Support multiple content types for autosuggest.
        if (this.tooltips[this.type].indexOf("autoSuggest") !== -1) {
            ScratchpadAutosuggest.init(this.editor);
        }

        // Override ACE gutter tooltip positioning due to bugginess
        ace.require("ace/tooltip").Tooltip.prototype.setPosition = function (x, y) {
            // Calculate x & y, relative to editor & scrolled window
            var editorOffset = $(this.$parentNode).offset();
            var xOffset = editorOffset.left - $(window).scrollLeft();
            var yOffset = editorOffset.top - $(window).scrollTop();
            x -= xOffset;
            y -= yOffset;
            this.getElement().style.left = x + "px";
            this.getElement().style.top = y + "px";
        };

        // Make the editor vertically resizable
        if (this.$el.resizable) {
            this.$el.resizable({
                // Only allow for vertical resizing
                handles: "s",

                // While the resize is occurring, resize the Ace editor
                resize: function resize() {
                    self.editor.resize();
                }
            });
        }

        var $sensorFrame = $("<iframe>").css({
            width: "100%",
            height: 0,
            position: "absolute",
            visibility: "hidden"
        }).appendTo(this.el);

        $($sensorFrame[0].contentWindow.window).on("resize", (function () {
            // Force the editor to resize.
            this.editor.resize();

            // Set the font size. Scale the font size down when the
            // size of the editor is too small.
            this.editor.setFontSize(this.$el.width() < 400 ? "12px" : "14px");
        }).bind(this));

        // Kill default selection on the hot number
        this.$el.on("mousedown", ".tooltip", function (e) {
            e.preventDefault();
        });

        // Stop overriding Cmd/Ctrl-L. It's used to by browser to go to the
        // location bar, but ace wants to use it for go-to-line.
        this.editor.commands.removeCommand("gotoline");

        // On Windows, the "fold all" hotkey conflicts with close curly brace
        // "}" on EU keyboards. Unbind this in case we're on an EU keyboard.
        this.editor.commands.bindKey("Alt-0", null);

        // Stop highlighting lines on cursor change
        this.editor.selection.addEventListener("changeCursor", function () {
            self.setErrorHighlight(false);
        });

        this.editor.on("change", (function () {
            self.trigger("change");
            if (this.editor.curOp && this.editor.curOp.command.name) {
                self.trigger("userChangedCode");
            }
        }).bind(this));

        this.editor.on("click", function () {
            self.trigger("click");
        });

        this.editor.selection.on("changeCursor", function () {
            self.trigger("changeCursor");
        });
        this.editor.selection.on("changeSelection", function () {
            self.trigger("changeCursor");
        });

        this.config.on("versionSwitched", function (version) {
            self.config.runVersion(version, self.type + "_editor", self);
        });

        this.config.editor = this;

        this.reset();
    },

    remove: function remove() {
        this.tooltipEngine.remove();
    },

    bindRecord: function bindRecord() {
        var self = this;
        var editor = this.editor;
        var record = this.record;
        var doc = editor.session.doc;

        // Track text change events
        doc.on("change", function (e) {
            var start = e.data.range.start;
            var end = e.data.range.end;

            if (e.data.action.indexOf("insert") === 0) {
                var insert = e.data.lines || e.data.text;
                self.record.log(e.data.action, start.row, start.column, end.row, end.column, insert);
            } else {
                self.record.log(e.data.action, start.row, start.column, end.row, end.column);
            }
        }, true);

        editor.selection.addEventListener("changeCursor", function () {
            if (editor.selection.isEmpty()) {
                self.handleSelect();
            }
        }, true);

        editor.selection.addEventListener("changeSelection", this.handleSelect.bind(this), true);

        // Add in record playback handlers
        var docOperations = ["insertText", "insertLines", "removeText", "removeLines"];

        _.each(docOperations, function (op) {
            record.handlers[op] = function (startRow, startCol, endRow, endCol, data) {
                var delta = {
                    action: op,
                    range: {
                        start: {
                            row: startRow,
                            column: startCol
                        },
                        end: {
                            row: endRow,
                            column: endCol
                        }
                    }
                };

                if (op === "insertText") {
                    delta.text = data;
                } else if (op === "insertLines") {
                    delta.lines = data;
                }

                doc.applyDeltas([delta]);
            };
        });

        $.extend(record.handlers, {
            select: function select(startRow, startCol, endRow, endCol) {
                if (endRow == null) {
                    endRow = startRow;
                }

                if (endCol == null) {
                    endCol = startCol;
                }

                editor.selection.setSelectionRange({
                    start: {
                        row: startRow,
                        column: startCol
                    },
                    end: {
                        row: endRow,
                        column: endCol
                    }
                });
            }
        });

        // Handle record seek caching
        record.seekCachers.editor = {
            getState: function getState() {
                return {
                    // Save current editor text
                    text: self.text(),

                    // Save current editor cursor position
                    cursor: self.getCursor()
                };
            },

            restoreState: function restoreState(cacheData) {
                // Restore editor text
                self.text(cacheData.text);

                // Restore cursor position
                self.setCursor(cacheData.cursor);
            }
        };

        record.on("runSeek", function () {
            self.reset(record.initData.code);
        });
    },

    handleSelect: function handleSelect() {
        if (!this.record.recording) {
            return;
        }

        var curRange = this.editor.selection.getRange();

        var start = curRange.start;
        var end = curRange.end;

        this.record.log("select", start.row, start.column, end.row, end.column);
    },

    reset: function reset(code, focus) {
        code = code || this.defaultCode;

        this.config.runCurVersion(this.type + "_editor", this);

        // Reset the editor
        this.text(code);
        this.setCursor({ row: 0, column: 0 }, focus);
    },

    // Set the cursor position on the editor
    setErrorHighlight: function setErrorHighlight(shouldHighlight) {
        this.editor.setHighlightActiveLine(shouldHighlight);
    },

    // Allow for toggling of the editor gutter
    toggleGutter: function toggleGutter(toggle) {
        this.editor.renderer.setShowGutter(toggle);
    },

    getAllFolds: function getAllFolds() {
        var session = this.editor.session;
        return _.map(session.getAllFolds(), function (fold) {
            return [fold.start.row, fold.end.row];
        });
    },

    setFolds: function setFolds(folds) {
        _.each(folds, (function (fold) {
            this.editor.session.foldAll(fold[0], fold[1], 0);
        }).bind(this));
    },

    blockPaste: function blockPaste(chastise) {
        // Used throughout the function
        var aceEditor = this.editor;

        // First, we remember the original functions, but only once,
        // in case this function gets run again
        if (!aceEditor.originalCut) {
            aceEditor.originalCut = aceEditor.onCut;
            aceEditor.originalCopy = aceEditor.onCopy;
            aceEditor.originalPaste = aceEditor.onPaste;
        }

        aceEditor.onCut = function (clipboardText) {
            aceEditor.lastCopied = this.getSelectedText();
            aceEditor.originalCut.apply(aceEditor);
        };
        aceEditor.onCopy = function (clipboardText) {
            aceEditor.lastCopied = this.getSelectedText();
            aceEditor.originalCopy.apply(aceEditor);
        };
        aceEditor.onPaste = function (clipboardText) {
            // Allow them to paste either if it matches what they cut/copied,
            // or if its a small # of characters, most likely symbols
            // that dont exist on their keyboard, or if its a URL
            var isUrl = function isUrl(str) {
                return str.match(/\s*https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)\s*/);
            };
            if (clipboardText === aceEditor.lastCopied || clipboardText.length < 3 || isUrl(clipboardText)) {
                aceEditor.originalPaste.apply(aceEditor, [clipboardText]);
                return;
            } else {
                chastise();
            }
        };

        // Block dragging
        var isLocal = false;
        aceEditor.container.addEventListener("dragstart", function () {
            isLocal = true;
        });
        aceEditor.container.addEventListener("dragend", function () {
            isLocal = false;
        });
        aceEditor.container.addEventListener("drop", function (e) {
            if (!isLocal) {
                chastise();
                e.stopPropagation();
            }
        }, true);
    },

    /*
     * Utility plugins for working with the editor
     */

    // Focus the editor
    focus: function focus() {
        if (this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    getCursor: function getCursor() {
        return this.editor.getCursorPosition();
    },

    getSelectionIndices: function getSelectionIndices() {
        var rng = this.editor.getSelectionRange();
        var doc = this.editor.getSession().getDocument();

        return {
            start: doc.positionToIndex(rng.start),
            end: doc.positionToIndex(rng.end)
        };
    },

    // Set the cursor position on the editor
    setCursor: function setCursor(cursorPos, focus) {
        this.editor.moveCursorToPosition(cursorPos);
        this.editor.clearSelection();

        if (focus !== false && this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    setSelection: function setSelection(selection) {
        this.editor.selection.setSelectionRange(selection);
    },

    setReadOnly: function setReadOnly(readOnly) {
        this.editor.setReadOnly(readOnly);
    },

    text: function text(_text) {
        if (_text != null) {
            this.editor.getSession().setValue(_text);
        } else {
            return this.editor.getSession().getValue().replace(/\r\n/g, "\n");
        }

        return this;
    },

    unfold: function unfold() {
        return this.editor.getSession().unfold();
    },

    insertNewlineIfCursorAtEnd: function insertNewlineIfCursorAtEnd() {
        var maxRow = this.editor.getSession().getLength() - 1;
        var line = this.editor.getSession().getLine(maxRow);
        var maxColumn = line.length;
        var cursor = this.editor.getCursorPosition();
        if (cursor.row === maxRow && cursor.column === maxColumn) {
            var oldText = this.text();
            if (oldText.length && oldText[oldText.length - 1] !== "\n") {
                this.text(this.text() + "\n");
                this.setCursor({ row: maxRow + 1, column: 0 });
            }
        }
    },

    undo: function undo() {
        this.editor.undo();
    }
});

LiveEditor.registerEditor("ace_pjs", AceEditor);
LiveEditor.registerEditor("ace_webpage", AceEditor);
LiveEditor.registerEditor("ace_sql", AceEditor);
