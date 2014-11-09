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

        // This function returns different values if alt and/or shift are
        // pressed: alt -> -1, shift -> 1, alt + shift -> 0.
        // If there no modifier keys are pressed, the result is based on the
        // number of decimal places.
        function getExponent(evt) {
            var exp = -self.decimals;
            if (evt.shiftKey && evt.altKey) {
                exp = 0;
            } else if (evt.shiftKey) {
                exp = 1;
            } else if (evt.altKey) {
                exp = -1;
            }
            return exp;
        }

        var $leftButton = $("<span role='button'>◄</span>");
        var $rightButton = $("<span role='button' class='flipped-arrow'>◄</span>");
        var $center = $("<span> ◆ </span>");

        $leftButton.click(function (evt) {
            if (!self.dragged) {
                var exp = getExponent(evt);
                self.decimals = Math.max(0, -exp);
                self.intermediateValue = self.value - Math.pow(10, exp);
                self.updateText(self.intermediateValue.toFixed(self.decimals));
                self.updateTooltip(self.intermediateValue, self.decimals);
            }
        });

        $rightButton.click(function (evt) {
            if (!self.dragged) {
                var exp = getExponent(evt);
                self.decimals = Math.max(0, -exp);
                self.intermediateValue = self.value + Math.pow(10, exp);
                self.updateText(self.intermediateValue.toFixed(self.decimals));
                self.updateTooltip(self.intermediateValue, self.decimals);
            }
        });

        var $scrubberHandle = $("<div class='scrubber-handle'/>")
            .append($leftButton).append($center).append($rightButton)
            .draggable({
                axis: "x",
                start: function() {
                    self.$el.addClass("dragging");
                },
                drag: function(evt) {
                    var thisOffset = $(this).offset();
                    var parentOffset = $(this).parent().offset();
                    var dx = thisOffset.left - parentOffset.left;

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0, -exp);
                    self.intermediateValue = self.value + Math.round(dx / 2.0) * Math.pow(10, exp);
                    self.updateText(self.intermediateValue.toFixed(self.decimals));
                    self.dragged = true;
                },
                stop: function(evt) {
                    self.$el.removeClass("dragging");
                    $(this).css({
                        left: 0,
                        top: 0
                    });

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0,-exp);
                    self.updateTooltip(self.intermediateValue, self.decimals);

                    // use a timeout because $leftButton.click and $rightButton.click
                    // are called after stop
                    setTimeout(function () {
                        self.dragged = false;
                    }, 0);
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

