TooltipEngine.classes.numberScrubberClick = TooltipBase.extend({
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