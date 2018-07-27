/* eslint-disable no-var */
/* TODO: Fix the lint errors */
const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");

const ScratchpadAutosuggest = require("../../ui/autosuggest.js");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");
const TooltipUtils = require("./tooltip-utils.js");

// A description of general tooltip flow can be found in tooltip-engine.js
const AutoSuggest = TooltipBase.extend({
    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.render();
        this.bind();
        this.mouse = false;

        document.addEventListener("mousedown", () => {
            this.mouse = true;
        });
        document.addEventListener("mouseup", () => {
            this.mouse = false;
        });
    },

    detector: function(event) {
        // TODO: update this to support auto-suggest tooltip for inner functions passed as params
        // this currently only allows displaying of the tooltip for the outside function, except in cases
        // where the inner function uses one of the other tooltips (e.g. image-picker)
        if (!/(\b[^\d\W][\w]*)\s*(\({1}\s*\){1})*\s*([^\]]*)$/.test(event.pre)
            || (this.parent.options.record && this.parent.options.record.playing)) {
            return;
        }
        if (!TooltipUtils.isInParenthesis(RegExp.$3)) {
            return;
        }
        if (event.source && event.source.type === "changeCursor" && this.mouse) {
            // ignore changeCursor events when the mouse button is down
            return;
        }
        var functionCall = RegExp.$1;
        var paramsToCursor = RegExp.$3;
        var lookupParams = ScratchpadAutosuggest.lookupParamsSafeHTML(functionCall, paramsToCursor);
        if (lookupParams) {
            this.aceLocation = {
                start: event.col,
                length: 0,
                row: event.row
            };

            this.updateTooltip(lookupParams);
            this.placeOnScreen();
            event.stopPropagation();
            ScratchpadAutosuggest.enableLiveCompletion(false);
        }
    },

    render: function() {
        this.$el = $("<div class='tooltip autosuggest hide-while-playing'><div class='hotsuggest'></div><div class='arrow'></div></div>")
            .appendTo("body").hide();
    },

    bind: function() {
        this.$el.on("mousedown", function() {
            this.$el.hide();
            this.options.editor.focus();
        }.bind(this));

        this.checkForEscape = function(e) {
            if (e.which === 27 && this.$el) {
                this.$el.hide();
            }
        }.bind(this);

        $(document).on("keyup", this.checkForEscape);
        this.bindToRequestTooltip();
    },

    remove: function() {
        this.$el.remove();
        $(document).off("keyup", this.checkForEscape);
        this.unbindFromRequestTooltip();
    },

    updateTooltip: function(content) {
        this.$el.find(".hotsuggest").empty().append(content);
    }
});

TooltipEngine.registerTooltip("autoSuggest", AutoSuggest);

module.exports = AutoSuggest;