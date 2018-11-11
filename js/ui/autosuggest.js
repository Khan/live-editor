/**
 * Helper functionality for the Scratchpad auto suggest feature,
 * parameter information and live documentation.
 */
window.ScratchpadAutosuggest = {
    /**
     * Returns the list of parameters for the specified function
     * This is used for the parameter info popup within lookupParamsSafeHTML.
     * @param lookup The function to lookup
     */
    lookupParams: function(lookup) {
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
