/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

window.TipBar = Backbone.View.extend({
    initialize: function(options) {
        this.output = options.output;
        this.pos = 0;
        this.texts = [];
        this.render();
        this.bind();
    },

    render: function() {
        this.$el.append(Handlebars.templates["tipbar"]());
    },

    bind: function() {
        var self = this;

        this.$el.on("click", ".tipbar .tipnav a", function() {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.show();
            }

            self.output.postParent({ focus: true });

            return false;
        });

        this.$el.on("click", ".tipbar .text-wrap a", function() {
            var error = self.texts[self.pos];

            self.output.postParent({ cursor: error });

            return false;
        });
    },

    show: function(type, texts, callback) {
        if (texts) {
            this.pos = 0;
            this.texts = texts;
        } else {
            texts = this.texts;
        }

        var pos = this.pos;
        var bar = this.$el.find(".tipbar");

        // Inject current text
        bar
            .find(".current-pos").text(texts.length > 1 ? (pos + 1) + "/" + texts.length : "").end()
            .find(".message").html(texts[pos].text || texts[pos] || "").end()
            .find("a.prev").toggleClass("ui-state-disabled", pos === 0).end()
            .find("a.next").toggleClass("ui-state-disabled", pos + 1 === texts.length).end();

        this.$el.find(".show-me").toggle(texts[pos].row !== -1);

        bar.find(".tipnav").toggle(texts.length > 1);

        // Only animate the bar in if it's not visible
        if (!bar.is(":visible")) {
            bar
                .css({ top: 400, opacity: 0.1 })
                .show()
                .animate({
                    top: this.$el.find(".toolbar").is(":visible") ? 33 : 100,
                    opacity: 0.9},
                    300);
        }

        if (callback) {
            callback(texts[pos]);
        }
    },

    hide: function() {
        var bar = this.$el.find(".tipbar");
        if (bar.is(':visible')) {
            bar.animate({ top: 400, opacity: 0.1 }, 300, function() {
                $(this).hide();
            });
        }
    }
});