/* eslint-disable no-console */
/* TODO: Fix the lint errors */
/* To fix, remove an entry above, npm run lint, and fix errors. */

const Backbone = require("backbone");
Backbone.$ = require("jquery");

const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

const NumberScrubberClick = TooltipBase.extend({
    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.bindToRequestTooltip();
    },

    remove: function() {
        this.unbindFromRequestTooltip();
    },

    detector: function(event) {
        if (event.source && event.source.action === "click") {
            if (this.parent.tooltips.numberScrubber) {
                this.parent.tooltips.numberScrubber.detector(event);
            } else {
                console.warn("FAIL: You loaded the numberScrubberClick tooltip, without the numberScrubber tooltip.");
            }
        }
    },
});

TooltipEngine.registerTooltip("numberScrubberClick", NumberScrubberClick);