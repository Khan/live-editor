/* eslint-disable no-var, no-undef, no-extra-bind, no-redeclare, one-var */
/* TODO: Fix the lint errors */
/**
 * Helper functionality for the Scratchpad auto suggest feature,
 * parameter information and live documentation.
 */
window.ScratchpadAutosuggest = {
    /**
     * Initializes the autosuggest functionality and adds/modifies the
     * completers to be applicable to KA.
     */
    init: function(editor) {
        this.initialized = true;
        this.editor = editor;
        this.enableLiveCompletion(window.localStorage["autosuggest"] || true);
        var langTools = ace.require("ace/ext/language_tools");

        var customCompleters = [ScratchpadAutosuggestData._keywords,
            ScratchpadAutosuggestData._pjsFunctions,
            ScratchpadAutosuggestData._pjsVariables,
            ScratchpadAutosuggestData._pjsCallbacks,
            ScratchpadAutosuggestData._pjsObjectConstructors,
            ScratchpadAutosuggestData._pjsObjects];

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
                customCompleters.forEach(function(c) {
                    c.whitelist.forEach(function(o) {
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
                    }.bind(this));
                }.bind(this));
                callback(null, completions);
            }
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
          enableLiveAutocompletion: enable
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
        var found =_.find(ScratchpadAutosuggestData
                        ._pjsFunctions.whitelist,function(o) {
            var f = o;
            if (_.isObject(o)) {
                f = o.name;
            }
            return f.split("(")[0] === lookup;
        });

        // If we don't have a funciton, check the keywords list
        // This feature isn't currently used but you can enable it
        // to give help for things like for loops by providing an
        // example of how it is used.
        if (!found) {
            found = _.find(ScratchpadAutosuggestData
                        ._keywords.whitelist, function(o) {
                if (_.isObject(o)) {
                    var f = o.name;
                    return f === lookup;
                }
                return false;
            });
        }

        if (!found) {
            return;
        }
        return found;
    },
    /**
     * Returns the list of parameters for the specified function in a safe
     * to present to user HTML formatted way.
     * @param f The function to lookup.
     * @param paramsToCursor The params specified so far. Used so the current
     *                       param can be marked up.
     */
    lookupParamsSafeHTML: function(f, paramsToCursor) {
        // Split up all the parameters the user specified sof far.
        var paramPositionLookup = paramsToCursor.split(",").length - 1;
        var found = this.lookupParams(f);
        if (!found) {
            return;
        }

        var f = found;
        var description, params, isFunction = true, exampleURL;
        var autosuggestDescription = $("<div class='autosuggest-info'/>")
                .hide();

        // Autosuggest functions can be objects or simple strings.
        // When it's an object it has the extra live documentation info.
        // Either can be used, so handle both cases here.
        if (_.isObject(found)) {
            f = found.name;
            description = found.description;
            exampleURL = found.exampleURL;
            params = found.params;
            if (!_.isUndefined(found.isFunction)) {
                isFunction = found.isFunction;
            }
        }

        // Small helper that's used at various places below.
        // It obtains the parameter indexed at i or an empty string if none.
        var getParamInfo = function(i) {
            if (!params || i >= params.length) {
                return "";
            }
            return params[i];
        };

        // Setup the function name and if there's an example URL for how to
        // use this function, link it up.
        var fnParts = f.split("(");
        var fnName = $("<span class='autosuggest-function'/>")
            .text(fnParts[0]);
        var descriptionElements = $();
        if (description) {
            descriptionElements = descriptionElements .add(
                fnName.data("param-info",
                    description).data("exampleURL", exampleURL));
        }

        // Get plain text params, if there aren't any bail out here.
        var plainParams = fnParts.length > 1 ?
            fnParts[1].substring(0, fnParts[1].length - 1) : "";
        if (_.isUndefined(plainParams)) {
            return;
        }

        var lookupParams = plainParams.split(",");
        var returnParams = $("<span/>");
        var extraError;

        // Add a warning if too many params were specified
        if (paramPositionLookup >= lookupParams.length &&
                fnName !== "debug") {
            paramPositionLookup = lookupParams.length - 1;
            extraError = $("  <span class='autosuggest-error'/>")
                            .text(" Too many arguments passed!");
        }

        // Add in the first params before the *current* one
        for (var i = 0; i < paramPositionLookup; i++) {
            if (returnParams.children().length) {
                returnParams.append($("<span/>").text(", "));
            }
            returnParams.append($("<span class='autosuggest-param-info'/>")
                        .text(lookupParams[i])
                        .data("param-info", getParamInfo(i)));
        }
        if (returnParams.children().length) {
            returnParams.append($("<span>").text(", "));
        }

        // Add in the *current* param
        returnParams
            .append($("<span class='current-param autosuggest-param-info'/>")
            .text(lookupParams[paramPositionLookup])
            .data("param-info", getParamInfo(i)));

        // Add in the params after the *current* param
        for (var i = paramPositionLookup + 1; i < lookupParams.length; i++) {
            if (returnParams.children().length) {
                returnParams.append($("<span/>").text(", "));
            }
            returnParams.append($("<span class='autosuggest-param-info'/>")
                        .text(lookupParams[i])
                        .data("param-info", getParamInfo(i)));
        }

        // For each param, add some data with parameter info
        returnParams.find(".autosuggest-param-info").each(function() {
            if ($(this).data("param-info")) {
                descriptionElements = descriptionElements.add($(this));
            }
        });

        // If they hover over the name of functions or params,
        // then show the description!
        descriptionElements.mouseenter(function(e) {
            var data = $(e.target).addClass("autosuggest-highlight")
                                  .data("param-info");
            autosuggestDescription.text("  " + data).show();
            $(".arrow").hide();
        }).mouseleave(function(e) {
            $(e.target).removeClass("autosuggest-highlight");
            autosuggestDescription.hide();
            $(".arrow").show();
        }).mousedown(function(e) {
            // If clicking on the function name, show the url in a new tab
            var exampleURL = $(e.target).addClass("autosuggest-highlight")
                                        .data("exampleURL");
            if (exampleURL) {
                window.open(exampleURL, "_blank");
            }
        });

        // Return the HTML desription popup
        return $("<span/>").append(fnName)
                           .append(isFunction ? $("<span/>").text("(") : null)
                           .append(returnParams)
                           .append(isFunction ? $("<span/>").text(")") : null)
                           .append(extraError)
                           .append(autosuggestDescription);
    }
};
