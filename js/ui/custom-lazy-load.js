(function($) {
	$.fn.loadNow = function() {
		$.each(this, function(i, t) {
			$(t).attr("src", $(t).attr("data-lazy-src"));
			$(t).removeAttr("data-lazy-src");
		})
		return this;
	}

	$.fn.customLazyLoad = function(tolerance) {
		var tolerance = tolerance || 250;
		$(this).each(function(i, t) {
			var top = $(t).scrollTop();
			var bottom = top + $(t).height();
			top -= tolerance;
			bottom += tolerance;
			$(t).find("img[data-lazy-src]").each(function(j, img) {
				var height = $(img).position().top;
				if (height < top) {
					return true; // continue;
				} else if (height < bottom) {
					$(img).loadNow();
				} else {
					return false; // break;
				}
			})
		})
	}
})(jQuery);