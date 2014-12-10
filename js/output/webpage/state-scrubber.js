/**
 * StateScrubber
 * Resets global javascript state.
 */
window.StateScrubber = function(target){
    this.target = target;
    this.firstTimeout = target.setTimeout(function(){}, 0);

    // We will record all the variables that we see on window on startup
    // these will be the only keys we leave intact when we reset window
    this.globalVariables = {};
    for (var prop in target) {
        if (target.hasOwnProperty(prop)) {
            this.globalVariables[prop] = true;
        }
    }

    // Since variables initially on window will not be reset, try to freeze them to
    // avoid state leaking between extecutions.
    for (var prop in this.globalVariables) {
        try {
            var propDescriptor =
                Object.getOwnPropertyDescriptor(target, prop);
            if (!propDescriptor || propDescriptor.configurable) {
                Object.defineProperty(target, prop, {
                    value: target[prop],
                    writable: false,
                    configurable: false
                });
            }
        } catch(e) {
            // Couldn't access property for permissions reasons,
            // like window.frame
            // Only happens on prod where it's cross-origin
        }
    }
    // Completely lock down window's prototype chain
    Object.freeze(Object.getPrototypeOf(target));
};

window.StateScrubber.prototype = {
    clearGlobals: function() {
        for (var prop in this.target) {
            if (!this.globalVariables[prop] && this.target.hasOwnProperty(prop)) {
                // This should get rid of variables which cannot be deleted
                // http://perfectionkills.com/understanding-delete/
                this.target[prop] = undefined;
                delete this.target[prop];
            }
        }
    },

    clearTimeoutsAndIntervals: function() {
    	// Intervals are acutally also timeouts under the hood, so clearing all the 
    	// timeouts since last time is sufficient.
    	// (If you're interested intervals are timeouts with the repeat flag set to true:
    	// www.w3.org/TR/html5/webappapis.html#timers)
        var lastTimeout = this.target.setTimeout(function(){}, 0);

        for (var i=this.firstTimeout; i<lastTimeout; i++) {
            this.target.clearTimeout(i);
        }

        this.firstTimeout = lastTimeout;
    },

    clearAll: function() {
    	this.clearGlobals();
    	this.clearTimeoutsAndIntervals();
    }
};