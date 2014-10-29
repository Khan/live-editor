/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

window.TipBar = Backbone.View.extend({
    initialize: function(options) {
        this.liveEditor = options.liveEditor;
        this.pos = 0;
        this.texts = [];
        this.render();
        this.bind();
    },

    render: function() {
        this.$overlay = $("<div class=\"overlay error-overlay\" style=\"display: none\"></div>").appendTo(this.$el);
        this.$el.append(Handlebars.templates["tipbar"]());
    },

    bind: function() {
        var self = this;

        this.$el.on("click", ".tipbar .tipnav a", function(e) {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.show();
            }

            self.liveEditor.editor.focus();

            return false;
        });

        this.$el.on("click", ".tipbar .text-wrap a", function(e) {
            var error = self.texts[self.pos];

            self.liveEditor.editor.setCursor(error);
            self.liveEditor.editor.setErrorHighlight(true);

            return false;
        });
    },

    show: function() {
        var texts = this.texts;

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
    },

    hide: function() {
        var bar = this.$el.find(".tipbar");
        if (bar.is(':visible')) {
            bar.animate({ top: 400, opacity: 0.1 }, 300, function() {
                $(this).hide();
            });
        }
        clearTimeout(this.errorDelay);
    },

    toggleErrors: function(errors) {
        this.texts = errors;
        var hasErrors = !!errors.length;

        this.$overlay.toggle(hasErrors);

        if (!hasErrors) {
            this.hide();
            return;
        }

        this.errorDelay = setTimeout(this.show.bind(this), 1200);
    }
});