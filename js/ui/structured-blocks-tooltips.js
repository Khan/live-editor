(function() {
    var ESC = 27;

    var setRGB = function(block, rgb) {
        var $block = $(block);

        $block.find(".block-name-r")
            .css("background-color", "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")");
        $block.find(".block-name-r input").val(rgb.r).trigger("input");
        $block.find(".block-name-g input").val(rgb.g).trigger("input");
        $block.find(".block-name-b input").val(rgb.b).trigger("input");
    };


    window.StructuredBlocksTooltips = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.bind();
        },

        render: function() {
            this.$colorPicker = $("<div class='tooltip picker active'><div class='picker'>" +
                    "</div><div class='arrow'></div></div>")
                .find(".picker").ColorPicker({
                    flat: true
                })
                .end()
                .on("mousedown", function() { return false; }) //Prevent dragging 
                .hide();

            this.recolorBlocks();
            setTimeout(this.recolorBlocks.bind(this));
        },

        events: {
            "click .block-rgb.block-name-r": function(e) {
                var $block = $(e.currentTarget).closest(".block-statement");
                var pos = $block.position();

                this.$colorPicker.find(".colorpicker").data("colorpicker").onChange = function(hsb, hex, rgb) {
                    var $block = $(e.currentTarget).closest(".block-statement");
                    setRGB($block, rgb);
                }.bind(this);

                this.$colorPicker
                    .appendTo($(e.currentTarget).closest(".ui-sortable"))
                    .css({
                        top: pos.top + 9,
                        left: pos.left + 100
                    });

                this.$colorPicker.find(".picker").ColorPickerSetColor({
                    r: $block.find(".block-name-r input").val(),
                    g: $block.find(".block-name-g input").val(),
                    b: $block.find(".block-name-b input").val(),
                });

                this.$colorPicker.show();

                var hideColorPicker = function(e) {
                    if (e.type === "click" && $.contains(this.$colorPicker[0], e.target)) {
                        return;
                    } else if (e.type === "keydown" && e.which !== ESC) {
                        return;
                    }

                    this.$colorPicker.hide();
                    $(window).off("mousedown", hideColorPicker);
                    $(window).off("keydown", hideColorPicker);
                }.bind(this);

                $(window).on("mousedown", hideColorPicker);
                $(window).on("keydown", hideColorPicker);
            }
        },

        recolorBlocks: function() {
            var $colorBlocks = this.$(".block-editor .block-rgb.block-name-r");
            $colorBlocks.each(function(i, elem) {
                var $block = $(elem).closest(".block-statement");
                var rgb = {
                    r: $block.find(".block-name-r input").val(),
                    g: $block.find(".block-name-g input").val(),
                    b: $block.find(".block-name-b input").val(),
                };
                setRGB($block, rgb);
            });
        }
    });
})();