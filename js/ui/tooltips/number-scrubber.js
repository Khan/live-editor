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
        var clickOnly = self.options.clickOnly;

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

        var leftArrow = clickOnly ? "-" : "◄";
        var rightArrow = clickOnly ? "+" : "◄";
        var center = clickOnly ? "" : " ◆ ";

        var $leftButton = $("<span role='button'>" + leftArrow + "</span>");
        var $rightButton = $("<span role='button' class='flipped-arrow'>" + rightArrow + "</span>");
        var $center = $("<span>" + center + "</span>");

        var updateNumber = function(num, evt) {
            var exp = evt ? getExponent(evt) : -self.decimals;
            self.decimals = Math.max(0, -exp);
            self.intermediateValue = self.value + (num * Math.pow(10, exp));
            self.updateText(self.intermediateValue.toFixed(self.decimals));
            self.updateTooltip(self.intermediateValue, self.decimals);
        };

        $leftButton.on("click touchend", function(evt) {
            if (self.noClick) {
                self.noClick = false;
                return;
            }

            if (!self.dragged) {
                updateNumber(-1, evt);
            }
        });

        $rightButton.on("click touchend", function(evt) {
            if (self.noClick) {
                self.noClick = false;
                return;
            }

            if (!self.dragged) {
                updateNumber(1, evt);
            }
        });

        var $scrubberHandle = $("<div class='scrubber-handle'/>")
            .append($leftButton).append($center).append($rightButton);

        if (!clickOnly) {
            $scrubberHandle.draggable({
                axis: "x",
                appendTo: "body",
                helper: function() {
                    return $(this).clone().css($(this).offset());
                },
                start: function(e, ui) {
                    self.parent.editor.scrubberActive = true;
                    self.$el.addClass("dragging");
                    $(this).css("visibility", "hidden");
                },
                drag: function(evt, ui) {
                    var thisOffset = ui.helper.offset();
                    var parentOffset = $(this).parent().offset();
                    var dx = thisOffset.left - parentOffset.left;

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0, -exp);
                    self.intermediateValue = self.value + Math.round(dx / 2.0) * Math.pow(10, exp);
                    self.updateText(self.intermediateValue.toFixed(self.decimals));
                    self.dragged = true;
                },
                stop: function(evt, ui) {
                    self.$el.removeClass("dragging");
                    $(this).css("visibility", "visible");

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0,-exp);
                    self.updateTooltip(self.intermediateValue, self.decimals);

                    // use a timeout because $leftButton.click and $rightButton.click
                    // are called after stop
                    setTimeout(function () {
                        self.dragged = false;
                    }, 0);
                    self.parent.editor.scrubberActive = false;
                }
            });
        } else {
            var clickInterval;

            var numberUpdater = function(evt, rate) {
                var updateRate = 300;
                var start = (new Date).getTime();

                if (self.setCurValue) {
                    self.setCurValue();
                }

                var update = function() {
                    self.noClick = false;

                    clickInterval = setTimeout(function() {
                        self.noClick = true;
                        updateNumber(rate, evt);

                        var curTime = (new Date).getTime() - start;

                        if (curTime >= 5000) {
                            rate = (rate < 1 ? -1 : 1) * 3;
                        } else if (curTime > 2000) {
                            rate = (rate < 1 ? -1 : 1) * 2;
                        }

                        updateRate = 16;

                        update();
                    }, updateRate);
                };

                update();
            };

            $leftButton.on("touchstart mousedown", function(evt) {
                numberUpdater(evt, -1);
                $(this).addClass("active");
                evt.preventDefault();
            });

            $leftButton.on("touchend touchleave mouseup mouseleave", function() {
                $(this).removeClass("active");
                clearInterval(clickInterval);
            });

            $rightButton.on("touchstart mousedown", function(evt) {
                numberUpdater(evt, 1);
                $(this).addClass("active");
                evt.preventDefault();
            });

            $rightButton.on("touchend touchleave mouseup mouseleave", function() {
                $(this).removeClass("active");
                clearInterval(clickInterval);
            });
        }

        this.$el = $("<div class='tooltip'><div class='scrubber'></div><div class='arrow'></div></div>")
            .appendTo("body")
            .find(".scrubber")
            .append($scrubberHandle)
            .end()
            .hide();

        if (clickOnly) {
            this.$el.addClass("click-only");
        }
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

