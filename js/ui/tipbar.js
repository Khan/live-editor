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
        this.errors = [];
        this.render();
        this.bind();
    },

    render: function() {
        this.$overlay = $("<div class=\"overlay error-overlay\" style=\"display: none\"></div>").appendTo(this.$el);
        this.$el.append(Handlebars.templates["tipbar"]({
            ohNoesMsg: i18n._("Oh noes!"),
            showMeMsg: i18n._("Show me where"),
            explainMoreMsg: i18n._("Explain more"),
            prevMsg: i18n._("Previous error"),
            nextMsg: i18n._("Next error"),
        }));
        this.$bar = this.$el.find(".tipbar");
    },

    bind: function() {
        var self = this;

        // Make the error dialog draggable
        if ($.fn.draggable) {
            this.$el.find(".tipbar").draggable({
                containment: "parent",
                handle: ".error-buddy",
                axis: "y"
            });
        }

        this.$el.on("click", ".tipbar .tipnav a", function(e) {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.update();
            }

            self.liveEditor.editor.focus();

            return false;
        });

        this.$el.on("click", ".tipbar .show-me a", function(e) {
            e.preventDefault();

            var error = self.errors[self.pos];
            self.liveEditor.editor.setCursor(error);
            self.liveEditor.editor.setErrorHighlight(true);

            return false;
        });

        this.$el.on("click", ".tipbar .explain-more a", function(e) {
            e.preventDefault();

            var error = Object.assign({}, self.errors[self.pos]);
            error.text = error.originalText;
            delete error.originalText;
            self.liveEditor.trigger("explain-more", error);
            self.liveEditor.editor.setCursor(error);
            self.liveEditor.editor.setErrorHighlight(true);

            return false;
        });

        this.$el.on("click", ".tipbar .close", function(e) {
            self.liveEditor.setThinkingState();
        });

    },

    setErrors: function(errors) {
        this.errors = errors;
        this.update(false);
    },

    update: function(show) {
        if (!this.errors.length) return;

        var errors = this.errors;
        var pos = errors[this.pos] == null ? 0 : this.pos;

        // Inject current text
        this.$bar
            .find(".current-pos").text(errors.length > 1 ? (pos + 1) + "/" + errors.length : "").end()
            .find(".message").html(errors[pos].text || errors[pos] || "").end()
            .find("a.prev").toggleClass("ui-state-disabled", pos === 0).end()
            .find("a.next").toggleClass("ui-state-disabled", pos + 1 === errors.length).end();

        // it could be undefined, null, or -1
        this.$el.find(".show-me").toggle(errors[pos].row > -1);
        this.$el.find(".explain-more").toggle(errors[pos].row > -1);

        this.$bar.find(".tipnav").toggle(errors.length > 1);
        if (show) {
            this.$overlay.show();
            this.$bar.show();
        }
    },

    hide: function() {
        this.$bar.hide();
        this.$overlay.hide();
        clearTimeout(this.errorDelay);
    },

    toggleErrors: function(errors, delay) {
        console.log("toggleErrors", errors)
        var hasErrors = errors.length > 0;
        if (!hasErrors) {
            this.hide();
            return;
        }

        this.$overlay.show();
        this.setErrors(errors);

        clearTimeout(this.errorDelay);
        this.errorDelay = setTimeout(function() {
            this.update(true);
        }.bind(this), delay);
    },

    setErrorPosition: function(errorPos) {
        this.pos = errorPos;
        this.update(true);
    }
});
