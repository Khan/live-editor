window.ScratchpadEditor = Backbone.View.extend({
    initialize: function(options) {
        var self = this;

        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;
        this.editor = ace.edit(this.el);
        this.textarea = this.$(this.dom.TEXT_INPUT);
        this.content = this.$(this.dom.CONTENT);
        this.offset = this.content.offset();

        // Stop overriding Cmd/Ctrl-L. It's used to by browser to go to the
        // location bar, but ace wants to use it for go-to-line.
        this.editor.commands.removeCommand("gotoline");

        // Stop highlighting lines on cursor change
        this.editor.selection.addEventListener("changeCursor", function() {
            self.setErrorHighlight(false);
        });

        // TODO: Bind directly to object once it's a backbone model
        $(this.config).on("versionSwitched", function(version) {
            self.config.runVersion(version, "editor", self.editor);
        });

        this.config.editor = this;

        this.reset();

        if (this.record) {
            this.bindRecord();
        }
    },

    dom: {
        ACTIVE_LINE: ".ace_active_line",
        TEXT_INPUT: "textarea",
        CONTENT: "div.ace_content"
    },

    autoCompleteBehavior: {
        autoBrace: false,
        braceIndent: true,
        equalsInsert: true
    },

    bindAutoComplete: function(editor, autoCompleteBehavior) {
        var self = this;
        autoCompleteBehavior = autoCompleteBehavior ||
            this.autoCompleteBehavior;

        // When a { is typed, an endline, indentation, and another endline
        // are inserted. The cursor is set after the indentation.
        // Additionally make it so that if "var draw =" is typed then
        // the associated "function() { ... }; are inserted as well.
        var behavior = editor.getSession().getMode().$behaviour;

        // Reset auto-complete for parentheses and quotes
        // (matches earlier Ace behavior)
        behavior.add("parens", "insertion", function() {});
        behavior.add("parens", "deletion", function() {});
        behavior.add("brackets", "insertion", function() {});
        behavior.add("brackets", "deletion", function() {});
        behavior.add("string_dquotes", "insertion", function() {});
        behavior.add("string_dquotes", "deletion", function() {});

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("braces", "insertion", function(state, action,
                editor, session, text) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);

            if (text === "{") {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);

                // Old auto-completion logic
                if (autoCompleteBehavior.autoBrace) {
                    if (selected !== "") {
                        return {
                            text: "{" + selected + "}",
                            selection: false
                        };
                    } else {
                        return {
                            text: "{}",
                            selection: [1, 1]
                        };
                    }

                } else if (autoCompleteBehavior.braceIndent) {
                    // This is the one section of the code that's been
                    // modified, everything else was left as-is.
                    // Endlines and indentation were added to brace
                    // autocompletion.

                    // Insert a semicolon after the brace if there's
                    // an assignment occurring on the same line
                    // (e.g. if you're doing var draw = function(){...})
                    var maybeSemicolon = /=\s*function/.test(line) ? ";" : "";

                    var indent = this.getNextLineIndent(state,
                        line.substring(0, line.length - 1),
                        session.getTabString());
                    var nextIndent = this.$getIndent(
                        session.doc.getLine(cursor.row));

                    // The case of if (EXPR) { doesn't indent properly
                    // as the if (EXPR) line doesn't trigger an additional
                    // indentation level, so we force it to work.
                    if (indent === nextIndent) {
                        indent += session.getTabString();
                    }

                    return {
                        text: "{\n" + indent + selected + "\n" +
                            nextIndent + "}" + maybeSemicolon,
                        // Format:
                        // [ rowStartSelection, colStartSelection,
                        //   rowEndSelection, colEndSelection ]
                        selection: [1, indent.length, 1, indent.length]
                    };
                }

            } else if (text === "}") {
                var rightChar = line.substring(cursor.column,
                    cursor.column + 1);
                if (rightChar === "}") {
                    var matching = session.$findOpeningBracket("}",
                        {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null) {
                        return {
                            text: "",
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text === "\n") {
                var rightChar = line.substring(cursor.column,
                    cursor.column + 1);
                if (rightChar === "}") {
                    var openBracePos = session.findMatchingBracket(
                        {row: cursor.row, column: cursor.column + 1});
                    if (!openBracePos) {
                        return null;
                    }

                    var indent = this.getNextLineIndent(state,
                        line.substring(0, line.length - 1),
                        session.getTabString());
                    var nextIndent = this.$getIndent(
                        session.doc.getLine(openBracePos.row));

                    return {
                        text: "\n" + indent + "\n" + nextIndent,
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            }
        });

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("equals", "insertion", function(state, action,
                editor, session, text) {

            if (!autoCompleteBehavior.equalsInsert) {
                return;
            }

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);

            if (text === "=" && /\bdraw\s*$/.test(line)) {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);

                var indent = this.getNextLineIndent(state,
                    line.substring(0, line.length - 1),
                    session.getTabString());
                var nextIndent = this.$getIndent(
                    session.doc.getLine(cursor.row));

                // The case of if (EXPR) { doesn't indent properly
                // as the if (EXPR) line doesn't trigger an additional
                // indentation level, so we force it to work.
                if (indent === nextIndent) {
                    indent += session.getTabString();
                }

                return {
                    text: "= function() {\n" + indent + selected + "\n" +
                        nextIndent + "};",
                    selection: [1, indent.length, 1, indent.length]
                };
            }
        });
    },

    bindRecord: function() {
        var self = this;
        var editor = this.editor;
        var record = this.record;

        editor.setKeyboardHandler({
            handleKeyboard: function($data, hashId, keyString, keyCode, e) {
                if (!record.playing) {
                    self.trigger("userChangedCode");
                }

                // Dont trigger on special keys (ctrl, shift, etc)
                if (hashId === -1) {
                    self.trigger("keyInput");
                }

                if (!record.recording) {
                    return;
                }

                var isCommand = editor.commands.findKeyCommand(
                        hashId, keyString),
                    isEmpty = jQuery.isEmptyObject(e);

                if (isCommand && !isEmpty) {
                    record.log({ cmd: isCommand.name });
                    self.blockSelection();

                    // Prevent commands from having any logged side effects
                    var oldExec = isCommand.exec;

                    isCommand.exec = function() {
                        record.recording = false;
                        var ret = oldExec.apply(this, arguments);
                        record.recording = true;
                        return ret;
                    };

                    return isCommand;

                } else if (!isCommand && isEmpty) {
                    record.log({ key: keyString });
                    self.blockSelection();
                }
            }
        });

        editor.addEventListener("copy", function() {
            record.log({ copy: 1 });
        });

        editor.addEventListener("paste", function(text) {
            self.trigger("userChangedCode");
            if (record.recording) {
                record.log({ paste: text });
            }
        });

        editor.addEventListener("cut", function() {
            self.trigger("userChangedCode");
            record.log({ cut: 1 });
            self.blockSelection();
        });

        editor.renderer.scrollBar.addEventListener("scroll", function(e) {
            record.log({ top: e.data });
        });

        editor.selection.addEventListener("changeCursor", function() {
            if (editor.selection.isEmpty()) {
                self.handleSelect();
            }
        });

        editor.selection.addEventListener("changeSelection",
            this.handleSelect.bind(this));

        // Add in record playback handlers.
        $.extend(record.handlers, {
            cut: function() {
                editor.onCut();
            },

            copy: function() {
                editor.getCopyText();
            },

            paste: function(e) {
                editor.onPaste(e.paste);
            },

            cmd: function(e) {
                editor.commands.exec(e.cmd, self.editor);
            },

            key: function(e) {
                editor.onTextInput(e.key, false);
            },

            top: function(e) {
                editor.renderer.scrollBar.setScrollTop(e.top);
            },

            start: function(e) {
                if (!e.end) {
                    e.end = e.start;
                }

                editor.selection.setSelectionRange(e);
            },

            focus: function() {
                self.textarea[0].focus();
            }
        });

        // Handle record seek caching
        record.seekCachers.editor = {
            getState: function() {
                return {
                    // Save current editor text
                    text: self.text(),

                    // Save current editor cursor position
                    cursor: self.getCursor()
                };
            },

            restoreState: function(cacheData) {
                // Restore editor text
                self.text(cacheData.text);

                // Restore cursor position
                self.setCursor(cacheData.cursor);
            }
        };

        record.on({
            runSeek: function() {
                self.reset(record.initData.code);
            }
        });
    },

    // Managing user selection
    doSelect: true,
    curRange: null,

    blockSelection: function() {
        var self = this;

        this.doSelect = false;

        setTimeout(function() {
            self.doSelect = true;
        }, 13);
    },

    handleSelect: function() {
        if (!this.doSelect || !this.record.recording) {
            return;
        }

        var self = this;

        if (this.curRange) {
            return;
        }

        setTimeout(function() {
            var curRange = self.curRange;

            var diff = {
                start: {
                    row: curRange.start.row,
                    column: curRange.start.column
                }
            };

            if (curRange.end.row !== curRange.start.row ||
                 curRange.end.column !== curRange.start.column) {

                diff.end = {
                    row: curRange.end.row,
                    column: curRange.end.column
                };
            }

            var lastSelection = self.record.commands[
                self.record.commands.length - 1];

            // Note: Not sure how I feel about using JSON.stringify for
            // deep comparisons but boy is it convenient.
            if (lastSelection) {
                lastSelection = JSON.stringify({
                    start: lastSelection.start,
                    end: lastSelection.end
                });
            }

            if (!lastSelection ||
                lastSelection !== JSON.stringify(diff)) {
                self.record.log(diff);
            }

            self.curRange = null;
        }, 13);

        this.curRange = this.editor.selection.getRange();
    },

    reset: function(code, focus) {
        code = code || this.defaultCode;

        this.config.runCurVersion("editor", this.editor);

        // Reset the editor
        this.text(code);
        this.setCursor({row: 0, column: 0}, focus);
    },

    // Set the cursor position on the editor
    setErrorHighlight: function(shouldHighlight) {
        var self = this;

        this.editor.setHighlightActiveLine(shouldHighlight);

        // Delay adding a flash until the active line is shown
        setTimeout(function() {
            // Add the hilite flash
            var line = self.$(self.dom.ACTIVE_LINE).addClass("hilite");

            // And quickly remove it again (to give a nice flash animation)
            setTimeout(function() {
                line.removeClass("hilite");
            }, 100);
        }, 1);
    },

    // Allow for toggling of the editor gutter
    toggleGutter: function(toggle) {
        this.editor.renderer.setShowGutter(toggle);
    },

    /*
     * Utility plugins for working with the editor
     */

    // Focus the editor
    focus: function() {
        if (this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    getCursor: function() {
        return this.editor.getCursorPosition();
    },

    // Set the cursor position on the editor
    setCursor: function(cursorPos, focus) {
        this.editor.moveCursorToPosition(cursorPos);
        this.editor.clearSelection();

        if (focus !== false && this.autoFocus !== false) {
            this.editor.focus();
        }
    },

    setSelection: function(selection) {
        this.editor.selection.setSelectionRange(selection);
    },

    setReadOnly: function(readOnly) {
        this.editor.setReadOnly(readOnly);
    },

    text: function(text) {
        if (text != null) {
            this.editor.getSession().setValue(text);
        } else {
            return this.editor.getSession().getValue().replace(/\r/g, "\n");
        }

        return this;
    },

    unfold: function() {
        return this.editor.getSession().unfold();
    },

    insertNewlineIfCursorAtEnd: function() {
        var maxRow = this.editor.getSession().getLength() - 1;
        var line = this.editor.getSession().getLine(maxRow);
        var maxColumn = line.length;
        var cursor = this.editor.getCursorPosition();
        if (cursor.row === maxRow && cursor.column === maxColumn) {
            var oldText = this.text();
            if (oldText.length && oldText[oldText.length - 1] !== "\n") {
                this.text(this.text() + "\n");
                this.setCursor({row: maxRow + 1, column: 0});
            }
        }
    }
});
