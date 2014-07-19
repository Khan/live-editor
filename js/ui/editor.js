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

        // Attach the hot number picker to the editor
        if (this.$el.hotNumber) {
            this.$el.hotNumber({
                reload: false,
                editor: this.editor,
                record: this.record,
                imagesDir: options.imagesDir
            });
        }

        // Make the editor vertically resizable
        if (this.$el.resizable) {
            this.$el.resizable({
                // Only allow for vertical resizing
                handles: "s",

                // While the resize is occurring, resize the Ace editor
                resize: function() {
                    self.editor.resize();
                }
            });
        }

        // Kill default selection on the hot number
        this.$el.on("mousedown", ".hotnumber", function(e) {
            e.preventDefault();
        });

        // Stop overriding Cmd/Ctrl-L. It's used to by browser to go to the
        // location bar, but ace wants to use it for go-to-line.
        this.editor.commands.removeCommand("gotoline");

        // Stop highlighting lines on cursor change
        this.editor.selection.addEventListener("changeCursor", function() {
            self.setErrorHighlight(false);
        });

        this.editor.on("change", function() {
            self.trigger("change");
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
    },

    setReadOnly: function(state) {
        this.editor.setReadOnly(state);
    }
});

window.ScratchpadBlocklyEditor = Backbone.View.extend({
    initialize: function(options) {
        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;

        this.config.editor = this;

        var toolbox = "<xml>";

        var generateValues = function(props) {
            var values = "";
            if (props.args) {
                props.args.forEach(function(prop) {
                    if ("fill" in prop) {
                        values += "<value name='" + prop.name + "'>";
                        if (prop.type === "Colour") {
                            values += "<block type='colour_picker'>" +
                                "</block>";
                        } else if (prop.type === "String") {
                            values += "<block type='text'>" +
                                "<field name='TEXT'>" + prop.fill + "</field>" +
                                "</block>";
                        } else if (prop.type === "Number") {
                            values += "<block type='math_number'>" +
                                "<field name='NUM'>" + prop.fill + "</field>" +
                                "</block>";
                        } else if (prop.type === "Variable") {
                            values += "<block type='variables_get'>" +
                                "<field name='VAR'>" + prop.fill + "</field>" +
                                "</block>";
                        }
                        values += "</value>";
                    }
                });
            }
            return values;
        };

        Object.keys(Blockly.p5js).forEach(function(catName) {
            var vars = Blockly.p5js[catName];

            toolbox += "<category name='" + catName + "'>";

            Object.keys(vars).forEach(function(name) {
                toolbox += "<block type='p5js_" + name + "'>";
                toolbox += generateValues(vars[name]);
                toolbox += "</block>";
            });

            var jsVars = Blockly.js[catName];

            if (jsVars) {
                Object.keys(jsVars).forEach(function(name) {
                    toolbox += "<block type='" + name + "'>";
                    toolbox += generateValues(jsVars[name]);
                    toolbox += "</block>";
                });
            }

            toolbox += "</category>";
        });

        Object.keys(Blockly.js).forEach(function(catName) {
            if (catName in Blockly.p5js) {
                return;
            }

            var jsVars = Blockly.js[catName];

            toolbox += "<category name='" + catName + "'>";

            Object.keys(jsVars).forEach(function(name) {
                toolbox += "<block type='" + name + "'>";
                toolbox += generateValues(jsVars[name]);
                toolbox += "</block>";
            });

            toolbox += "</category>";
        });
        toolbox += "</xml>";

        Blockly.inject(this.el, {
            path: options.externalsDir + "blockly/",
            toolbox: toolbox
        });

        Blockly.addChangeListener(function() {
            this.trigger("change");
        }.bind(this));
    },

    setCursor: function() {},
    setSelection: function() {},
    focus: function() {},
    toggleGutter: function() {},
    setErrorHighlight: function() {},
    setReadOnly: function() {},

    setBlocklyFromJS: function(code) {
        var xmlString = Blockly.util.jsToBlocklyXml(code);
        var xmlDom = Blockly.core.Xml.textToDom(xmlString);
        if (xmlDom) {
            Blockly.core.mainWorkspace.clear();
            Blockly.core.Xml.domToWorkspace(Blockly.core.mainWorkspace, xmlDom);
        }
    },

    text: function(code) {
        if (code != null) {
            this.setBlocklyFromJS(code);
        }

        return Blockly.JavaScript.workspaceToCode();
    }
});