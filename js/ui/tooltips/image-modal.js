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
        if (url !== this.currentUrl) {
            this.currentUrl = url;
            var allowedHosts = /(\.|^)?(khanacademy\.org|kastatic\.org|localhost:\d+)$/i;
            var match = /\/\/([^\/]*)(?:\/|\?|#|$)/.exec(url);
            var host = match ? match[1] : "";
            if(!host || allowedHosts.test(host)) {
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
        this.$el = $("<div class='tooltip imagemodalpreview'>" +
        	'<div class="content"><img src="/images/throbber.gif" class="imthrobber" /><div class="imshell"><img class="imimg" /><div class="imerror"></div></div>' +
        	'<button class="kui-button kui-button-submit kui-button-primary" style="padding: 5px; width: 100%; margin: 0 auto;" >Pick Image</button>'+
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
            self.$modal.find(".imcontent").scrollspy("refresh");
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

        this.$modal.on('hidden.bs.modal', function() {
            var $active = self.$modal.find(".image.active");
            if ($active.length !== 1) {
                return;
            }
            var path = self.options.imagesDir+$active.attr("data-path")+".png";
            self.updateText(path);
            self.updateTooltip(path);
        });

        self.$modal.find('.nav-tabs a').click(function (e) {
          e.preventDefault();
          $(this).tab('show');
          self.$modal.find(".imcontent").scrollspy("refresh");
        });
    },

    slugify: function(text) {
        return text.toLowerCase().match(/[a-z0-9_]+/g).join("-");
    },

    handlebarsPatchedEach: function(arr,options) {
        return _.map(arr, function(item,index) {
            item.$index = index;
            item.$first = index === 0;
            item.$last  = index === arr.length-1;
            return options.fn(item);
        }).join('');
    }
});
