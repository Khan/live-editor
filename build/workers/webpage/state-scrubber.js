/**
 * StateScrubber
 * Resets global javascript state.
 *  
 * This file is built as a worker file so that it can be accessed as-is by webapp
 * (i.e. no packaging) and then included inline to guarantee that it is the first 
 * script to run.
 */

 (function() {
 	// We will record all the variables that we see on window on startup
 	// these will be the only keys we leave intact when we reset window
    var windowVariables = {};
    for (var prop in window) {
        if (window.hasOwnProperty(prop)) {
            windowVariables[prop] = true;
        }
    }

    // Since window variables will not be reset, try to freeze them to
    // avoid state leaking between extecutions.
    for (var prop in windowVariables) {
        try {
            var propDescriptor =
                Object.getOwnPropertyDescriptor(window, prop);
            if (!propDescriptor || propDescriptor.configurable) {
                Object.defineProperty(window, prop, {
                    value: window[prop],
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
    Object.freeze(Object.getPrototypeOf(window));

    window.StateScrubber = {
    	windowVariables: windowVariables,
    	firstTimeout: 0,

        clearGlobals: function() {
            for (var prop in window) {
                if (!windowVariables[prop] && window.hasOwnProperty(prop)) {
                    // This should get rid of variables which cannot be deleted
                    // http://perfectionkills.com/understanding-delete/
                    window[prop] = undefined;
                    delete window[prop];
                }
            }
        },

        clearTimeoutsAndIntervals: function() {
	    	// Intervals are acutally also timeouts under the hood, so clearing all the 
	    	//  timeouts since last time is sufficient.
	    	// (If you're interested intervals are timeouts with the repeat flag set to true:
	    	// www.w3.org/TR/html5/webappapis.html#timers)
            var lastTimeout = setTimeout(function(){}, 0);

            for (var i=this.firstTimeout; i<=lastTimeout; i++) {
                clearTimeout(i);
            }

            this.firstTimeout = lastTimeout;
        },

        clearAll: function() {
        	this.clearGlobals();
        	this.clearTimeoutsAndIntervals();
        }
    };
})();