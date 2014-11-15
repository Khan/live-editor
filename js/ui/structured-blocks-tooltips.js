(function() {
    var ESC = 27;

    window.StructuredBlocksTooltips = Backbone.View.extend({
        events: {
            "click .block-rgb.block-name-r": "showColorPicker"
        },

        initialize: function() {
            this.render();
            this.bind();
        },

        render: function() {
            this.$colorPicker = $("<div class='tooltip picker active'>" +
                "<div class='picker'></div>" +
                "<div class='arrow'></div></div>")
                // Prevent dragging
                .on("mousedown", function() {
                    return false;
                })
                .find(".picker")
                    .ColorPicker({flat: true})
                .end()
                .hide();

            this.colorPicker = this.$colorPicker.find(".colorpicker")
                .data("colorpicker");
        },

        bind: function() {
            $(window).on("mousedown", function(e) {
                if (!$.contains(this.$colorPicker[0], e.target)) {
                    this.hideColorPicker();
                }
            }.bind(this));

            $(window).on("keydown", function(e) {
                if (e.which === ESC) {
                    this.hideColorPicker();
                }
            }.bind(this));
        },

        showColorPicker: function(e) {
            var $target = $(e.currentTarget);
            var $block = $target.closest(".block-statement");
            var pos = $target.position();

            this.colorPicker.onChange = function(hsb, hex, rgb) {
                $block.trigger("updateColor", rgb);
            };

            this.$colorPicker
                .appendTo($block)
                .css({
                    top: pos.top + 5,
                    left: pos.left + $target.width() + 5
                })
                .find(".picker")
                    .ColorPickerSetColor($block.data("color"))
                .end()
                .show();
        },

        hideColorPicker: function() {
            this.colorPicker.onChange = function() {};
            this.$colorPicker.hide();
        }
    });
})();