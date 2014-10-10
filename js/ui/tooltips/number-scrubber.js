// A description of general tooltip flow can be found in tooltip-engine.js
TooltipEngine.classes.numberScrubber = TooltipBase.extend({
    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.render();
        this.bind();
    },

    render: function() {
        var self = this;
        var $scrubberHandle = $("<div class='scrubber-handle'/>")
            .text("◄ ◆ ►")
            .draggable({
                axis: "x",
                start: function() {
                    self.$el.addClass("dragging");
                },
                drag: function() {
                    var thisOffset = $(this).offset();
                    var parentOffset = $(this).parent().offset();
                    var dx = thisOffset.left - parentOffset.left;

                    self.intermediateValue = self.value + Math.round(dx / 2.0) * Math.pow(10, -self.decimals);
                    self.updateText(self.intermediateValue.toFixed(self.decimals));
                },
                stop: function() {
                    self.$el.removeClass("dragging");
                    $(this).css({
                        left: 0,
                        top: 0
                    });

                    self.updateTooltip(self.intermediateValue, self.decimals);
                }
            });

        this.$el = $("<div class='tooltip'><div class='scrubber'></div><div class='arrow'></div></div>")
            .appendTo("body")
            .find(".scrubber")
            .append($scrubberHandle)
            .end()
            .hide();
    },

    bind: function() {
        this.bindToRequestTooltip();
    },

    remove: function() {
        this.$el.remove();
        this.unbindFromRequestTooltip();
    },

    detector: function(event) {
        // Does not match letters followed by numbers "<h1", "var val2", etc.
        // Matches numbers in any other context. The cursor can be anywhere from just ahead 
        // of the (optional) leading negative to just after the last digit.
        if ((/[a-zA-Z]\d+$/.test(event.pre) || (/[a-zA-Z]$/.test(event.pre) && /^\d/.test(event.post))) ||
                !(/\d$/.test(event.pre) || /^-?\d/.test(event.post))) {
            return;
        }
        var reversedPre = event.pre.split("").reverse().join("");
        var numberStart = event.col - /^[\d.]*(-(?!\s*\w))?/.exec(reversedPre)[0].length;
        var number = /^-?[\d.]+/.exec(event.line.slice(numberStart))[0];
        this.aceLocation = {
            start: numberStart,
            length: number.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = event.col;
        this.updateTooltip(parseFloat(number), this.decimalCount(number));
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },

    updateTooltip: function(value, decimals) {
        this.value = value;
        this.decimals = (decimals <= 5) ? decimals : 5;
    },

    // Returns the number of decimal places shown in a string representation of
    // a number.
    decimalCount: function(strNumber) {
        var decIndex = strNumber.indexOf(".");
        return decIndex === -1 ? 0 : strNumber.length - (decIndex + 1);
    }
});

