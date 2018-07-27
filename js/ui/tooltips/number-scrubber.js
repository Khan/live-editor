/* global ace */
/* eslint-disable no-var */
/* TODO: Fix the lint errors */
const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");

const ScratchpadAutosuggest = require("../../ui/autosuggest.js");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

// A description of general tooltip flow can be found in tooltip-engine.js
const NumberScrubber = TooltipBase.extend({
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

        var baseSvg =
            "<svg width='12px' height='12px' viewBox='-25, -25, 150, 150'>";

        var leftArrow = clickOnly ? "-" : baseSvg +
            "<polygon points='0,50 100,0 100, 100' fill='white'/></svg>";
        var rightArrow = clickOnly ? "+" : baseSvg +
            "<polygon points='0,50 100,0 100, 100' fill='white'/></svg>";
        var center = clickOnly ? "" : baseSvg +
            "<polygon points='50,0 100,50 50,100 0,50' fill='white'/></svg>";

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

        var textAtAceLocation = function() {
            var Range = ace.require("ace/range").Range;
            var loc = self.aceLocation;
            var range = new Range(loc.row, loc.start, loc.row, loc.start + loc.length);
            return self.parent.editor.getSession().getTextRange(range);
        };

        if (!clickOnly) {
            $scrubberHandle.draggable({
                axis: "x",
                appendTo: "body",
                helper: function() {
                    return $(this).clone().css($(this).offset());
                },
                start: function(e, ui) {
                    self.$el.addClass("dragging");
                    $(this).css("visibility", "hidden");
                    self.props.onScrubbingStarted();
                    // The text-to-be-tweaked needs to be the same length at the start and end
                    // of the anti-undo changes.
                    // I could probably just remember the length, but I like putting back the
                    // original string. (It might even matter for i18n.)
                    self.originalString = textAtAceLocation();
                    self.wasReadOnly = self.parent.editor.getReadOnly();
                    self.parent.editor.setReadOnly(true);
                },
                drag: function(evt, ui) {
                    var thisOffset = ui.helper.offset();
                    var parentOffset = $(this).parent().offset();
                    var dx = thisOffset.left - parentOffset.left;

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0, -exp);
                    self.intermediateValue = self.value + Math.round(dx / 2.0) * Math.pow(10, exp);
                    // Third parameter true means: Don't let this be remembered in the undo chain.
                    self.updateText(self.intermediateValue.toFixed(self.decimals), undefined, true);
                    self.dragged = true;
                },
                stop: function(evt, ui) {
                    self.$el.removeClass("dragging");
                    $(this).css("visibility", "visible");

                    var exp = getExponent(evt);
                    self.decimals = Math.max(0,-exp);
                    // put back the original string from before we started the un-undo manipulations
                    self.updateText(self.originalString, undefined, true);
                    // ...And this makes one undo-able replacement placing the drag's final value.
                    self.updateText(self.intermediateValue.toFixed(self.decimals));
                    self.updateTooltip(self.intermediateValue, self.decimals);
                    self.props.onScrubbingEnded();

                    // use a timeout because $leftButton.click and $rightButton.click
                    // are called after stop
                    setTimeout(function () {
                        self.dragged = false;
                        self.parent.editor.setReadOnly(self.wasReadOnly);
                    }, 0);
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

TooltipEngine.registerTooltip("numberScrubber", NumberScrubber);

module.exports = NumberScrubber;