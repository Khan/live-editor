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

    updateTooltip: function(url) {
        if (url !== this.currentUrl) {
            this.currentUrl = url;
            var allowedHosts = /(\.|^)?(khanacademy\.org|kastatic\.org|localhost:\d+)$/i;
            var match = /\/\/([^\/]*)(?:\/|\?|#|$)/.exec(url);
            var host = match ? match[1] : "";
            if (!host || allowedHosts.test(host)) {
                if (url !== this.$el.find(".imimg").attr("src")) {
                    this.$el.find(".imimg").attr("src", url);
                    this.$el.find(".imthrobber").show();
                }
                if (this.$el.find(".imerror").hasClass("domainError")) {
                    this.$el.find(".imerror").removeClass("domainError").hide();
                    this.$el.find(".imimg").show();
                }
            } else {
                this.$el.find(".imimg").hide();
                this.$el.find(".imerror").text($._("Sorry! That server is not permitted.")).addClass("domainError").show();
                this.$el.find(".imthrobber").hide();
            }
        }
    },

    render: function() {
        var self = this;
        this.$el = $('<div class="tooltip imagemodalpreview">' +
            '<div class="content"><img src="/images/throbber.gif" class="imthrobber" /><div class="imshell"><img class="imimg" /><div class="imerror"></div></div>' +
            '<button class="kui-button kui-button-submit kui-button-primary" style="padding: 5px; width: 100%; margin: 0 auto;" >Pick Image</button>' +
            '</div><div class="arrow"></div></div>')
            .appendTo("body").hide();

        this.$el.find(".imimg")
            .on("load", function() {
                $(this).closest(".imshell").find(".imerror").hide();
                $(this).show();
                self.$el.find(".imthrobber").hide();
            })
            .on("error", function() {
                if (self.currentUrl !== $(this).attr("src")) {
                    return;
                }
                $(this).closest(".imshell").find(".imerror").text($._("That is not a valid image URL.")).show();
                $(this).hide();
                self.$el.find(".imthrobber").hide();
            });

        this.$el.find("button").on("click", function() {
            self.$modal.find(".image.active").removeClass("active");
            self.$modal.modal();
        });

        Handlebars.registerHelper("slugify", this.slugify);
        Handlebars.registerHelper("patchedEach", this.handlebarsPatchedEach);

        this.$modal = $(Handlebars.templates.imagemodal({
            imagesDir: self.options.imagesDir,
            classes: ExtendedOutputImages
        }));

        this.$modal.find(".imcontent").on("scroll", function() {
            if ($(this).scrollTop() > 0) {
                $(this).addClass("top-shadow");
            } else {
                $(this).removeClass("top-shadow");
            }
        });

        this.$modal.on("click", ".imcontent .image", function() {
            self.$modal.find(".image.active").removeClass("active");
            $(this).addClass("active");
        });

        this.$modal.on("shown.bs.modal", function() {
            $("body").css("overflow", "hidden");
        });
        this.$modal.on("hidden.bs.modal", function() {
            $("body").css("overflow", "auto");
        });

        this.$modal.find("#im-submit").on("click", function() {
            var $active = self.$modal.find(".image.active");
            if ($active.length !== 1) {
                return;
            }
            var path = self.options.imagesDir + $active.attr("data-path") + ".png";
            self.updateText(path);
            self.updateTooltip(path);
        })

        this.$modal.find(".nav-tabs a").click(function(e) {
            e.preventDefault();
            $(this).tab("show");
        });

        this.$modal.find(".nav-pills").each(function(i, list) {
            var links = $(list).find("a[href]");
            var targets = _.map(links, function(link) {
                return [$(link).attr("href"), $(link)];
            });

            var target_heights = [];
            var $content = $(list).closest(".tab-pane").find(".imcontent");
            var scrollspy = function(e) {
                if (!target_heights.length) {
                    _.each(targets, function(t) {
                        var $heading = $content.find(t[0]);
                        if ($heading.length) {
                            target_heights.push([$heading.position().top, t[1]]);
                        }
                    });
                    target_heights.sort(function(a, b) {
                        return a[0] - b[0]
                    })
                }
                var height = $content.scrollTop();
                var active = false;
                for (var index in target_heights) {
                    var t = target_heights[index];
                    if (t[0] < height + 150) {
                        active = target_heights[index][1];
                    } else {
                        break;
                    }
                }
                $(list).find(".active").removeClass("active");
                $(active).closest("li").addClass("active");
            };

            $content.scroll(scrollspy);
            links.on("click", function(e) {
                var t = $($(this).attr("href"));
                if (t.length) {
                    $content.scrollTop(t.position().top);
                }
                e.stopPropagation();
                e.preventDefault();
            });
        });

        $(document).ready(function() {
            this.$modal.find("img[data-lazy-src]").backgroundLoad(3);
        }.bind(this))
    },

    slugify: function(text) {
        return text.toLowerCase().match(/[a-z0-9_]+/g).join("-");
    },

    handlebarsPatchedEach: function(arr, options) {
        return _.map(arr, function(item, index) {
            item.$index = index;
            item.$first = index === 0;
            item.$last = index === arr.length - 1;
            return options.fn(item);
        }).join("");
    }
});