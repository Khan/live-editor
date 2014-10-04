TooltipEngine.classes.imageModal = TooltipBase.extend({
	initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.render();
        this.bindToRequestTooltip();
    },

    detector: function(event) {
        if (!/<img\s+[^>]*?\s*src=["']([^"']*)$/.test(event.pre)) {
            return;
        }
        var urlStart = event.col - RegExp.$1.length;
        var url = event.line.slice(urlStart).match(/^[^"']*/)[0];
        this.aceLocation = {
            start: urlStart,
            length: url.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + 1;

        this.updateTooltip(url);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },

    updateTooltip: function(url){

        this.$el.find("img").attr("src", url).show();
    },

    render: function() {
        this.$el = $("<div class='tooltip imagemodalpreview'>" +
        	'<div class="content"><div class="imshell"><img src="" /></div>' +
        	'<button class="kui-button kui-button-submit kui-button-primary" style="padding: 5px 20px; margin: 0 auto;" >Pick Image</button></div>' +
                "<div class='arrow'></div></div>")
            .appendTo("body").hide();
    }
});
