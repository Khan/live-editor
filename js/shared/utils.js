(function() {
	window.batch_function = function(target) {
		var state = "clean";
		var lastArgs = [window, []];
		var run = function() {
			if (state === "clean") {
				state = "running";
				target.apply(this, arguments);
			}
			else {
				state = "dirty";
				lastArgs = [this, arguments];
			}
		};
		run.force = function() {
			target.apply(this, arguments);
			state = "running";
		};
		run.done = function() {
			var lastState = state;
			state = "clean";
			if (lastState === "dirty") {
				run.apply(lastArgs[0], lastArgs[1]);
			}
		};
		run.state = function() {
			return state;
		};
		return run;
	};
})();