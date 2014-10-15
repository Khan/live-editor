(function($) {
	// This function loads an image set up for lazy loading,
	// by setting its src to its data-lazy-src
	$.fn.loadNow = function() {
		$.each(this, function(i, elem) {
			$(elem).attr("src", $(elem).attr("data-lazy-src"));
			$(elem).removeAttr("data-lazy-src");
		})
		return this;
	}

   /* 
    * This is a KA specific implementation of lazy loading:
	* It is targetted specifically at the modal in the imageModal tooltip
	* (although it is generally applicable to some degree)
	* It loads images as they are scrolled into view.
	* It makes the following assumptions
	* - All lazy-loading images have a "data-lazy-src" attribute with the src we wish to load on-demand
	* - The div being scrolled is the offset parent of all of the images (http://api.jquery.com/position/)
	* - If image A comes before image B in the source, then A is at least as high as B on the page.
	*
	*/

	$.fn.customLazyLoad = function(tolerance) {
		tolerance = tolerance || 250;
		$(this).each(function(i, elem) {
			var top = $(elem).scrollTop();
			var bottom = top + $(elem).height();
			top -= tolerance;
			bottom += tolerance;
			$(elem).find("img[data-lazy-src]").each(function(j, img) {
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