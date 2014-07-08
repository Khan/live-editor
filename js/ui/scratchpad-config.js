// Maintain all of the configuration options and settings for the site.
// Have them be versioned and attached to the ScratchpadRevision so that
// later config changes don't break old code.
var ScratchpadConfig = Backbone.Model.extend({
    version: null,

    initialize: function(options) {
        this.version = options.version;

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
                configFn.apply(window, args);
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
        if (this.version !== null) {
            return this.version;
        }

        return this.latestVersion();
    },

    // Get the latest config version
    latestVersion: function() {
        return this.versions.length - 1;
    },

    // The configuration options
    // All configuration options are namespaced and versioned
    versions: [
        {
            name: "Initial Configuration",

            // Ace editor configuration
            editor: function(editor) {
                // Don't highlight the active line
                editor.setHighlightActiveLine(false);

                // Stop bracket highlighting
                editor.$highlightBrackets = function() {};

                // Make sure no horizontal scrollbars are shown
                editor.renderer.setHScrollBarAlwaysVisible(false);

                var session = editor.getSession();

                // Use word wrap
                session.setUseWrapMode(true);

                // Use soft tabs
                session.setUseSoftTabs(true);

                // Stop automatic JSHINT warnings
                session.setUseWorker(false);

                // Set the font size
                editor.setFontSize("14px");

                // Disable highlighting the selected word
                editor.setHighlightSelectedWord(false);

                // Show line numbers and enable code collapsing
                editor.renderer.setShowGutter(true);

                // Don't show print margin
                editor.renderer.setShowPrintMargin(false);

                // Use JavaScript Mode
                session.setMode("ace/mode/javascript");

                // Set the editor theme
                editor.setTheme("ace/theme/textmate");

                // Attach the auto-complete for the editor
                // (must be re-done every time the mode is set)
                ScratchpadConfig.editor.bindAutoComplete(editor, {
                    autoBrace: true
                });
            },

            // JSHint configuration
            // See: http://www.jshint.com/options/
            jshint: function() {
                // NOTE(joel) - Output is not in scope here
                if (typeof Output === "undefined") {
                    return;
                }

                Output.JSHint = {
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
                    shadow: true
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

            editor: function(editor) {
                // Set the brace autocomplete behavior
                ScratchpadConfig.editor.bindAutoComplete(editor, {
                    autoBrace: false,
                    braceIndent: true,
                    equalsInsert: true
                });
            }
        },

        {
            name: "Disable Un-needed JSHint Rules",

            jshint: function() {
                // NOTE(joel) - Output is not in scope here
                if (typeof Output === "undefined") {
                    return;
                }

                // Re-allow empty braces
                delete Output.JSHint.noempty;

                // Re-allow ++ and --
                delete Output.JSHint.plusplus;
            }
        }
    ]
});