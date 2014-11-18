window.TooltipUtils = {
    /**
     * This is a KA specific implementation of lazy loading:
     * It is targetted specifically at the modal in the imageModal tooltip
     * (although it is generally applicable to some degree)
     * It loads images as they are scrolled into view.
     * It makes the following assumptions
     * - All lazy-loading images have a "data-lazy-src" with the src
     *     we wish to load on-demand
     * - The div being scrolled is the offset parent of all the images
     *     (http://api.jquery.com/position/)
     * - If image A comes before image B in the source,
     *     then A is at least as high as B on the page.
     *
     */
    lazyLoadImgs: function(container, tolerance) {
        tolerance = tolerance || 250;
        var self = this;
        $(container).each(function(i, elem) {
            var top = $(elem).scrollTop();
            var bottom = top + $(elem).height();
            top -= tolerance;
            bottom += tolerance;
            $(elem).find("img[data-lazy-src]").each(function(j, img) {
                var height = $(img).position().top;
                if (height < top) {
                    return true; // continue;
                } else if (height < bottom) {
                    self.loadNow(img);
                } else {
                    return false; // break;
                }
            });
        });
    },

    loadNow: function(img) {
        $.each($(img), function(i, elem) {
            $(elem).attr("src", $(elem).attr("data-lazy-src"));
            $(elem).removeAttr("data-lazy-src");
        });
    },

    /**
     * This is a KA specific implementation of scrollspy
     * The second argument can be one of two things:
     * - A function to determine the nav element.
     * - The word "refresh" to recalculate heading positions
     */
    setupScrollSpy: function(scrollables, arg) {
        $.each($(scrollables), function(i, shell) {
            if (arg === "refresh") {
                var navUl = $(shell).data("scrollspy.navUl");
                if (!navUl) {
                    console.warn("tried to refresh scrollspy without first initializing it");
                    return;
                }
                var navs = navUl.find("li a");
                var pointers = [];
                $.each(navs, function(i, nav) {
                    var selector = $(nav).attr("href");
                    var $heading = $(shell).find(selector).first();
                    if ($heading.length) {
                        var y = $heading.position().top;
                        pointers.push([y, nav]);
                    }
                });
                pointers.sort(function(a, b) {
                    return a[0] - b[0];
                });
                $(shell).data("scrollspy.pointers", pointers);
            } else {
                var navUl = arg(shell);
                $(shell).data("scrollspy.navUl", navUl);
                $(shell).on("scroll", _.throttle(this.doScrollSpy, 60));
                $(navUl).find("li a").on("click", function(e) {
                    var top = $(shell).find($(this).attr("href")).position().top;
                    $(shell).scrollTop(top);
                    e.preventDefault();
                });
            }
        }.bind(this));
    },

    doScrollSpy: function() {
        var $this = $(this);
        var pointers = $this.data("scrollspy.pointers"); // [[height, node], ... ]
        if (pointers === undefined) {
            $this.data("scrollspy.pointers", "working");
            setTimeout(function() {
                TooltipUtils.setupScrollSpy($this, "refresh");
            }, 0);
            return;
        } else if (pointers === "working") {
            return;
        }

        var scroll = $this.scrollTop();
        var active;
        $.each(pointers, function(i, pointer) {
            if (pointer[0] < scroll + 150) {
                active = pointer[1];
            } else {
                return false;
            }
        });

        $this.data("scrollspy.navUl").find(".active").removeClass("active");
        $(active).closest("li").addClass("active");
    }
};