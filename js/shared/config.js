// Maintain all of the configuration options and settings for the site.
// Have them be versioned and attached to the ScratchpadRevision so that
// later config changes don't break old code.
/* jshint unused:false */
var ScratchpadConfig = Backbone.Model.extend({
    version: null,

    initialize: function(options) {
        this.version = options.version;
        this.useDebugger = options.useDebugger;

        if (this.version != null) {
            this.version = this.latestVersion();
        }
    },

    // Run the configuration functions for a particular namespace
    // of functionality. Can optionally take any number of
    // additional arguments.
    runCurVersion: function(type) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.curVersion());
        return this.runVersion.apply(this, args);
    },

    // Run the configuration functions for a particular namespace
    // of functionality, for a particular config version. Can optionally
    // take any number of additional arguments.
    runVersion: function(version, type) {
        var args = Array.prototype.slice.call(arguments, 2);

        for (var i = 0; i <= version; i++) {
            var configFn = this.versions[i][type];

            if (configFn) {
                configFn.apply(this, args);
            }
        }
    },

    switchVersion: function(version) {
        // Make sure we're switching to a new version
        if (version !== this.curVersion()) {
            // Set the new version
            this.version = version;

            // Run the inits for all bound handlers
            this.trigger("versionSwitched", version);
        }
    },

    // Get the current config version
    curVersion: function() {
        if (this.version != null) {
            return this.version;
        }

        return this.latestVersion();
    },

    // Get the latest config version
    latestVersion: function() {
        return this.versions.length - 1;
    },

    autoCompleteBehavior: {
        autoBrace: false,
        braceIndent: true,
        equalsInsert: true
    },

    bindAutoComplete: function(editor, autoCompleteBehavior) {
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

    // The configuration options
    // All configuration options are namespaced and versioned
    versions: [
        {
            name: "Initial Configuration",

            // Ace pjs editor configuration
            ace_pjs_editor: function(editor) {
                var aceEditor = editor.editor;
                
                aceEditor.session.setOption("useWorker", false);

                // Don't highlight the active line
                aceEditor.setHighlightActiveLine(false);

                // Stop bracket highlighting
                aceEditor.$highlightBrackets = function() {};

                // Make sure no horizontal scrollbars are shown
                aceEditor.renderer.setHScrollBarAlwaysVisible(false);

                var session = aceEditor.getSession();

                // Use word wrap
                session.setUseWrapMode(true);

                // Use soft tabs
                session.setUseSoftTabs(true);

                // Stop automatic JSHINT warnings
                session.setUseWorker(false);

                // Set the font size
                aceEditor.setFontSize("14px");

                // Disable highlighting the selected word
                aceEditor.setHighlightSelectedWord(false);

                // Show line numbers and enable code collapsing
                aceEditor.renderer.setShowGutter(true);

                // Don't show print margin
                aceEditor.renderer.setShowPrintMargin(false);

                // Use JavaScript Mode
                session.setMode("ace/mode/javascript");

                // Set the editor theme
                aceEditor.setTheme("ace/theme/textmate");

                // Attach the auto-complete for the editor
                // (must be re-done every time the mode is set)
                this.bindAutoComplete(editor.editor, {
                    autoBrace: false,
                    braceIndent: false,
                    equalsInsert: true
                });
            },

            // Ace HTML editor configuration
            ace_webpage_editor: function(editor) {
                var aceEditor = editor.editor;

                aceEditor.session.setOption("useWorker", false);

                // Don't highlight the active line
                aceEditor.setHighlightActiveLine(false);

                // Make sure no horizontal scrollbars are shown
                aceEditor.renderer.setHScrollBarAlwaysVisible(false);

                var session = aceEditor.getSession();

                // Use word wrap
                session.setUseWrapMode(true);

                // Use soft tabs
                session.setUseSoftTabs(true);

                // Set the font size
                aceEditor.setFontSize("14px");

                // Disable highlighting the selected word
                aceEditor.setHighlightSelectedWord(false);

                // Show line numbers and enable code collapsing
                aceEditor.renderer.setShowGutter(true);

                // Don't show print margin
                aceEditor.renderer.setShowPrintMargin(false);

                // Use HTML Mode
                session.setMode("ace/mode/html");

                // modify auto-complete to be less agressive.
                // Do not autoclose tags if there is other text after the cursor on the line.
                var behaviours = session.getMode().$behaviour.getBehaviours();
                var autoclosingFN = behaviours.autoclosing.insertion;
                behaviours.autoclosing.insertion = function(state, action, editor, session, text) {
                    var pos = editor.getCursorPosition();
                    var line = session.getLine(pos.row);
                    if (line.slice(pos.column).trim() === "") {
                        return autoclosingFN.apply(this, arguments);
                    }
                };

                // Set the editor theme
                aceEditor.setTheme("ace/theme/textmate");
            },

            // Ace SQL editor configuration
            ace_sql_editor: function(editor) {
                var aceEditor = editor.editor;

                // Don't highlight the active line
                aceEditor.setHighlightActiveLine(false);

                // Make sure no horizontal scrollbars are shown
                aceEditor.renderer.setHScrollBarAlwaysVisible(false);

                var session = aceEditor.getSession();

                // Use word wrap
                session.setUseWrapMode(true);

                // Use soft tabs
                session.setUseSoftTabs(true);

                // Set the font size
                aceEditor.setFontSize("14px");

                // Disable highlighting the selected word
                aceEditor.setHighlightSelectedWord(false);

                // Show line numbers and enable code collapsing
                aceEditor.renderer.setShowGutter(true);

                // Don't show print margin
                aceEditor.renderer.setShowPrintMargin(false);

                // Use SQL Mode
                session.setMode("ace/mode/sql");

                // Set the editor theme
                aceEditor.setTheme("ace/theme/textmate");
            },

            // JSHint configuration
            // See: http://www.jshint.com/options/
            jshint: function(output) {
                output.JSHint = {
                    // Prohibit explicitly undefined variables
                    undef: true,

                    // No empty code blocks
                    noempty: true,

                    // Prohibits the use of ++ and --
                    plusplus: true,

                    // Prohibits the use of arguments.callee and caller
                    noarg: true,

                    // Prohibit the use of variables before they were defined
                    latedef: true,

                    // Requires the use of === instead of ==
                    eqeqeq: true,

                    // Requires you to specify curly braces on loops
                    // and conditionals
                    curly: true,

                    // Allow variable shadowing. Declaring a var multiple times
                    // is allowed.
                    shadow: true,

                    // Allow mixing spaces and tabs. We can add a prettify one day
                    // if we want to fix things up.
                    smarttabs: true
                };
            },

            // Processing.js configuration
            processing: function(canvas) {
                canvas.size(400, 400);
                canvas.frameRate(30);
                canvas.angleMode = "radians";
            }
        },

        {
            name: "Switch to Degress from Radians",

            processing: function(canvas) {
                canvas.angleMode = "degrees";
            }
        },

        {
            name: "Brace Autocompletion Changes",

            ace_pjs_editor: function(editor) {
                // We no longer version editor changes,
                // since we made talkie recording more robust.
                // We still version jshint changes however,
                // so we keep this one around as a null change.
            }
        },

        {
            name: "Disable Un-needed JSHint Rules",

            jshint: function(output) {
                // Re-allow empty braces
                delete output.JSHint.noempty;

                // Re-allow ++ and --
                delete output.JSHint.plusplus;
            }
        },

        {
            name: "version 4 placeholder"
            
            // At one time live-editor.shared.js had a (version 4) entry that a
            // duplicate "Brace Autocompletion Changes" before it was disabled.
            // This duplicate was probably introduced by a merge. Unfortunately,
            // many of the revisions in the datastore are version 4.  This 
            // placeholder version ensures that those revisions continue to work
            // without throwing exceptions.
        }
        
        // NOTE: update version test in output_test.js
    ]
});
