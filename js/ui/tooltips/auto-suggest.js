// A description of general tooltip flow can be found in tooltip-engine.js
TooltipEngine.classes.autoSuggest = TooltipBase.extend({
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
        if (!/(\b[^\d\W][\w]*)\s*\(\s*([^\)]*)$/.test(event.pre) || this.parent.options.record.playing) {
            return;
        }
        if (event.source && event.source.type === "changeCursor" && this.mouse) {
            // ignore changeCursor events when the mouse button is down
            return;
        }
        var functionCall = RegExp.$1;
        var paramsToCursor = RegExp.$2;
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