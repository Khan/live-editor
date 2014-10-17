(function() {
    var Modal = Backbone.View.extend({
        initialize: function(options) {
            this.options = options;
            this.parent = options.parent;
            this.render();
            this.bind();
            TooltipUtils.setupScrollSpy(
                this.$(".imagemodal-content"),
                function(content) { // This function finds the associated pills for a scrollable div.
                    return $(content).closest(".tab-pane").find(".nav-pills");
                }
            );
        },

        // There are more bindings below in events these are here because 
        // scroll events cannot be delegated
        bind: function() {
            // Handle the heading shadow which appears on scroll
            this.$(".imagemodal-content").scroll(
                _.throttle(function(e) {
                    var $target = $(e.currentTarget);
                    if ($target.scrollTop() > 0) {
                        $target.addClass("top-shadow");
                    } else {
                        $target.removeClass("top-shadow");
                    }
                }, 100)
            );

            // Lazy load on scroll
            this.$(".imagemodal-content").scroll(
                _.throttle(function(e) {
                    TooltipUtils.lazyLoadImgs(e.currentTarget);
                }, 200)
            );
        },

        events: {
            // Highlight image when it is clicked
            "click .imagemodal-content .image":
                function(e) {
                    this.$(".image.active").removeClass("active");
                    $(e.currentTarget).addClass("active");
                },

            "click .nav-tabs a":
                function(e) {
                    $(e.currentTarget).tab("show");
                    // We need to call LazyLoad any time we are changing the visible content div.
                    TooltipUtils.lazyLoadImgs(e.currentTarget);
                    e.preventDefault();
                },

            "shown.bs.modal":
                function(e) {
                    $("body").css("overflow", "hidden");
                    this.$(".image.active").removeClass("active");
                    TooltipUtils.lazyLoadImgs(this.$(".tab-pane.active .imagemodal-content"));
                },
            
            "hidden.bs.modal":
                function(e) {
                    $("body").css("overflow", "auto");
                },

            // Update the url in ACE if someone clicks ok
            "click .imagemodal-submit":
                function(e) {
                    var $active = this.$(".image.active");
                    if ($active.length !== 1) {
                        return;
                    }
                    var path = this.options.imagesDir + $active.attr("data-path") + ".png";
                    this.parent.updateText(path);
                    this.parent.updateTooltip(path);
                }
        },

        render: function() {
            Handlebars.registerHelper("slugify", this.slugify);
            Handlebars.registerHelper("patchedEach", this.handlebarsPatchedEach);
            this.$el = $(Handlebars.templates.imagemodal({
                imagesDir: this.options.imagesDir,
                classes: ExtendedOutputImages
            }))
            this.$el.appendTo("body").hide();
        },

        slugify: function(text) {
            return text.toLowerCase().match(/[a-z0-9_]+/g).join("-");
        },

        // This patches our super old version of Handlebars to
        // give us access to the iteration index inside an each loop.
        // This is exactly how it works in Handlebars 1.3+
        // except that they use @<value> instead of $<value>
        // when we upgrade Handlebars we can get rid of this.
        handlebarsPatchedEach: function(arr, options) {
            return _.map(arr, function(item, index) {
                item.$index = index;
                item.$first = index === 0;
                item.$last = index === arr.length - 1;
                return options.fn(item);
            }).join("");
        }
    });


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
                    if (url !== this.$(".thumb").attr("src")) {
                        this.$(".thumb").attr("src", url);
                        this.$(".thumb-throbber").show();
                    }
                    if (this.$(".thumb-error").hasClass("domainError")) {
                        this.$(".thumb-error").removeClass("domainError").hide();
                        this.$(".thumb").show();
                    }
                } else {
                    this.$(".thumb").hide();
                    this.$(".thumb-error")
                        .text($._("Sorry! That server is not permitted."))
                        .addClass("domainError").show();
                    this.$(".thumb-throbber").hide();
                }
            }
        },

        render: function() {
            var self = this;
            this.$el = $(Handlebars.templates.imagemodalpreview())
                            .appendTo("body").hide();

            this.$(".thumb")
                .on("load", function() {
                    $(this).closest(".thumb-shell").find(".thumb-error").hide();
                    $(this).show();
                    self.$(".thumb-throbber").hide();
                })
                .on("error", function() {
                    if (self.currentUrl !== $(this).attr("src")) {
                        return;
                    }
                    $(this).closest(".thumb-shell").find(".thumb-error")
                        .text($._("That is not a valid image URL.")).show();
                    $(this).hide();
                    self.$(".thumb-throbber").hide();
                });

            this.$("button").on("click", function() {
                self.modal.$el.modal();
            });

            this.modal = new Modal(_.defaults({
                parent: this
            }, this.options));
        }
    });
})();
