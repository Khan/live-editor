(function($) {
	$.fn.loadNow = function() {
		$.each(this, function(i, t) {
			$(t).attr("src", $(t).attr("data-lazy-src"));
			$(t).removeAttr("data-lazy-src");
		})
		return this;
	}

	$.fn.backgroundLoad = function(threads) {
		if (!threads) {
			threads = 1;
		}
		if (!this.length) {
			return this;
		}
		var target = this.splice(Math.min(0, this.length-threads),threads);

		$(target)
			.load(function(){ 
				this.backgroundLoad();
			}.bind(this))
			.error(function(){ 
				this.backgroundLoad();
			}.bind(this));
		$(target).loadNow();
		return this;
	}
})(jQuery);