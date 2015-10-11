var _ = require("underscore");
var Backbone = require("backbone");

var ScratchpadAutosuggest = require("./autosuggest.js");
var TooltipBase = require("./tooltip-base.js");

var TooltipEngine = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.editor = options.editor;
        this.enabled = true;
        var record = this.options.record;

        this.tooltips = {};
        var childOptions = _.defaults({
            parent: this
        }, options);

        _.each(options.tooltips, function(name) {
            this.tooltips[name] = new TooltipEngine.classes[name](childOptions);
            this.tooltips[name].on("scrubbingStarted", function() {
                this.trigger("scrubbingStarted", name);
            }.bind(this));
            this.tooltips[name].on("scrubbingEnded", function() {
                this.trigger("scrubbingEnded", name);
            }.bind(this));
        }.bind(this));

        if (record && !record.handlers.hot) {
            record.handlers.hot = function(e) {
                if (this.currentTooltip) {
                    TooltipBase.prototype.updateText.call(this.currentTooltip, e.hot);
                }
            }.bind(this);

            // disable autofill when playback or seeking has started
            ["playStarted", "runSeek"].forEach(function(event) {
                record.on(event, function() {
                    _.values(this.tooltips).forEach(function(tooltip) {
                        tooltip.autofill = false;
                    });
                }.bind(this));
            }, this);

            // enable autofill when playback or seeking has stopped
            ["playPaused", "playStopped", "seekDone"].forEach(function(event) {
                record.on(event, function() {
                    _.values(this.tooltips).forEach(function(tooltip) {
                        tooltip.autofill = true;
                    });
                }.bind(this));
            }, this);
        }

        this.currentTooltip = undefined;
        this.ignore = false;
        this.bind();
    },

    bind: function(){
        if (this.callbacks) {
            return;
        }

        var checkBlur = function(e) {
            var inEditor = $.contains(this.editor.container, e.target);
            var inTooltip = (this.currentTooltip && $.contains(this.currentTooltip.$el[0], e.target));
            var modalOpen = (this.currentTooltip && this.currentTooltip.modal &&
                                this.currentTooltip.modal.$el.is(":visible"));
            if (this.currentTooltip && !(inEditor || inTooltip || modalOpen)) {
                this.currentTooltip.$el.hide();
                this.currentTooltip = undefined;
            }
        }.bind(this);

        this.callbacks = [{
            target: this.editor.selection,
            event: "changeCursor",
            fn: this.doRequestTooltip.bind(this)
        }, {
            target: this.editor.session.getDocument(),
            event: "change",
            fn: function(e) {
                if (this.enabled) {
                    this.doRequestTooltip(e.data);
                }
            }.bind(this)
        }, {
            target: this.editor.session,
            event: "changeScrollTop",
            fn: function() {
                if (this.currentTooltip) {
                    this.currentTooltip.placeOnScreen();
                }
            }.bind(this)
        }, {
            target: $(document),
            event: "mousedown",
            fn: checkBlur
        }, {
            target: $(document),
            event: "contextmenu",
            fn: checkBlur
        }, {
            target: $(this.editor.container),
            event: "mousedown",
            fn: function() {
                this.doRequestTooltip({
                    action: "click"
                });
            }.bind(this)
        }];

        _.each(this.callbacks, function(cb){
            cb.target.on(cb.event, cb.fn);
        });


        this.requestTooltipDefaultCallback = function() {  //Fallback to hiding
            ScratchpadAutosuggest.enableLiveCompletion(this.enabled);
            if (this.currentTooltip && this.currentTooltip.$el) {
                this.currentTooltip.$el.hide();
                this.currentTooltip = undefined;
            }
        }.bind(this);

        // Sets the live completion status to whatever value is passed in.
        this.setEnabledStatus = function(status) {
            this.enabled = status;
        }.bind(this);

        this.editor.on("requestTooltip", this.requestTooltipDefaultCallback);
    },

    remove: function() {
        _.each(this.callbacks, function(cb) {
            cb.target.off(cb.event, cb.fn);
        });
        _.each(this.tooltips, function(tooltip) {
            tooltip.remove();
        });

        this.editor.off("requestTooltip", this.requestTooltipDefaultCallback);
    },

    doRequestTooltip: function(source) {
        if (this.ignore) {
            return;
        }

        this.last = this.last || {};

        var selection = this.editor.selection;
        var pos = selection.getCursor();
        var params = {
            col: pos.column,
            row: pos.row,
            line: this.editor.session.getDocument().getLine(pos.row),
            selections: selection.getAllRanges(),
            source: source
        };
        params.pre = params.line.slice(0, params.col);
        params.post = params.line.slice(params.col);

        var duplicate = (params.col === this.last.col &&
            params.row === this.last.row && params.line === this.last.line);

        if (duplicate && !source) {
            return false;
        }
        if (this.isWithinComment(params.pre)){
            return false;
        }
        this.last = params;

        this.editor._emit("requestTooltip", params);
    },

    // Returns true if we're inside a comment
    // This isn't a perfect check, but it is close enough.
    isWithinComment: function(text) {
        // Comments typically start with a / or a * (for multiline C style)
        return text.length && (text[0] === "/" || text[0] === "*");
    }
});

TooltipEngine.classes = {};

// TODO(kevinb) remove after updating tests to deal with modules
window.TooltipEngine = TooltipEngine;

module.exports = TooltipEngine;
