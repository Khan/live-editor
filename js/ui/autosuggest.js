/* NOTE: This file is not currently used. It contains the logic for
 * for autocompletion. The documentation popup has moved into the tooltip.
 */
/**
 * Helper functionality for the Scratchpad auto suggest feature,
 * parameter information and live documentation.
 */
import ScratchpadAutosuggestData from "./autosuggest-data.js";

const ScratchpadAutosuggest = {
    /**
     * Initializes the autosuggest functionality and adds/modifies the
     * completers to be applicable to KA.
     */
    init: function(editor) {
        this.initialized = true;
        this.editor = editor;
        this.enableLiveCompletion(window.localStorage["autosuggest"] || true);
        var langTools = ace.require("ace/ext/language_tools");

        var customCompleters = [
            ScratchpadAutosuggestData._keywords,
            ScratchpadAutosuggestData._pjsFunctions,
            ScratchpadAutosuggestData._pjsVariables,
            ScratchpadAutosuggestData._pjsCallbacks,
            ScratchpadAutosuggestData._pjsObjectConstructors,
            ScratchpadAutosuggestData._pjsObjects,
        ];

        // Remove the default keywords completer, it includes a ton of
        // things we don't want to expose to the user like window,
        // document, etc...
        // Also remove the textCompleter. We'll use this wraped up in
        // our own completer for local variables.
        for (var i = editor.completers.length - 1; i >= 0; i--) {
            if (editor.completers[i] === langTools.keyWordCompleter) {
                editor.completers.splice(i, 1);
            } else if (editor.completers[i] === langTools.textCompleter) {
                this.internalTextCompleter = editor.completers[i];
                editor.completers.splice(i, 1);
            }
        }

        /*
        // Local completer is currently disabled because it doesn't work
        // perfectly, even with wrapping it.  I think implementing a custom
        // one before enabling would be best.

        // The internal local completer thinks numbers are identifiers
        // and suggests them if they are used, get rid of that by
        // wrapping the internal local completer in our own!
        this.localVariableCompleter = {
            getCompletions: function(editor, session, pos, prefix,
                                     callback) {
                if (prefix && isNaN(prefix[0])) {
                    this.internalTextCompleter.getCompletions(editor,
                        session, pos, prefix, callback);
                    return;
                }

                if (prefix.length === 0) {
                    callback(null, []);
                }
            }.bind(this)
        };
        langTools.addCompleter(this.localVariableCompleter);
        */

        // Completer for keywords and pjs
        this.customCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                if (prefix.length === 0) {
                    callback(null, []);
                    return;
                }

                var completions = [];
                customCompleters.forEach(
                    function(c) {
                        c.whitelist.forEach(
                            function(o) {
                                // Completer entries can be simple strings or objects.
                                // If it's an object it usually has live documentation
                                // info inside of it.  Extract the name here.
                                var f = o;
                                if (_.isObject(o)) {
                                    f = o.name;
                                }

                                // Only return a result if it's a prefix.
                                var funcName = f.split("(")[0];
                                if (funcName.indexOf(prefix) === -1) {
                                    return;
                                }
                                completions.push({
                                    // name can be anything unique
                                    name: f + "-name",
                                    // value is what's used for showing/autocompleting
                                    value: funcName,
                                    // We just rate everything the same for now. There's
                                    // some basic internal matching based on keystrokes.
                                    score: 299,
                                    // The type to display next to the autosuggest
                                    // This is a human readable short descriptive name
                                    // such as: pjs function.
                                    meta: c.type,
                                });
                            }.bind(this),
                        );
                    }.bind(this),
                );
                callback(null, completions);
            },
        };

        langTools.addCompleter(this.customCompleter);
    },
    /**
     * It's sometimes useful to not have live completion. So expose a way to
     * enable and disable it. This is used for example when entering text
     * within a comment. The tooltips code tells us not to do autosuggest.
     * @param enable true to enable autosuggest
     */
    enableLiveCompletion: function(enable) {
        // Ignore enableLiveCompletion calls if we're not initialized
        if (!this.initialized) {
            return;
        }
        this.editor.setOptions({
            // enable live popping up of the autosuggest
            enableLiveAutocompletion: enable,
        });
    },
    /**
     * Returns the list of parameters for the specified function
     * This is used for the parameter info popup within lookupParamsSafeHTML.
     * @param lookup The function to lookup
     */
    lookupParams: function(lookup) {
        // Ignore lookupParams calls if we're not initialized
        if (!this.initialized) {
            return;
        }
        var found = _.find(
            ScratchpadAutosuggestData._pjsFunctions.whitelist,
            function(o) {
                var f = o;
                if (_.isObject(o)) {
                    f = o.name;
                }
                return f.split("(")[0] === lookup;
            },
        );

        // If we don't have a funciton, check the keywords list
        // This feature isn't currently used but you can enable it
        // to give help for things like for loops by providing an
        // example of how it is used.
        if (!found) {
            found = _.find(
                ScratchpadAutosuggestData._keywords.whitelist,
                function(o) {
                    if (_.isObject(o)) {
                        var f = o.name;
                        return f === lookup;
                    }
                    return false;
                },
            );
        }

        if (!found) {
            return;
        }
        return found;
    },
};

export default ScratchpadAutosuggest;
