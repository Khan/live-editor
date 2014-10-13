(function($) {
	var scrollspy = function(shell) {
		var $shell = $(shell);
		return function() {
			var pointers = $shell.data("scrollspy.pointers"); // [[height, node], ... ]
			if (pointers == undefined) {
				$shell.data("scrollspy.pointers", "working");
				setTimeout(function() {
					$shell.customScrollSpy("refresh")
				}, 0);
				return;
			} else if (pointers == "working") {
				return;
			}

			var scroll = $shell.scrollTop();
			var active;
			$.each(pointers, function(i, pointer) {
				if (pointer[0] < scroll + 150) {
					active = pointer[1];
				} else {
					return false;
				}
			});

			$($(shell).data("scrollspy.nav_ul")).find(".active").removeClass("active");
			$(active).closest("li").addClass("active");
		}
	};

	$.fn.customScrollSpy = function(arg) {
		var shells = this;
		$.each(shells, function(i, shell) {
			if (typeof arg === "function") {
				var nav_ul = arg(shell);
				$(shell).data("scrollspy.nav_ul", nav_ul);
				$(shell).on("scroll", _.throttle(scrollspy(shell), 60)) // Uses a closure to capture the shell
				$(nav_ul).find("li a").on("click", function(e) {
					var top = $(shell).find($(this).attr("href")).position().top;
					$(shell).scrollTop(top);
					e.preventDefault();
				})
			} else if (arg == "refresh") {
				var nav_ul = $(shell).data("scrollspy.nav_ul");
				if (!nav_ul) {
					console.warn("tried to refresh scrollspy without first initializing it");
					return;
				}
				var navs = nav_ul.find("li a");
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
					return a[0] - b[0]
				})
				$(shell).data("scrollspy.pointers", pointers);
			}
		})
	};
})(jQuery);