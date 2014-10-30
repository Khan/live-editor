(function() {
    var windowVariables = {};
    for (var prop in window) {
        if (window.hasOwnProperty(prop)) {
            windowVariables[prop] = true;
        }
    }

    window.stateScrubber = {
    	windowVariables: windowVariables,
    	firstTimeout: 0,
    	firstInterval: 0,

        clearGlobals: function() {
            for (var prop in window) {
                if (!windowVariables[prop] && window.hasOwnProperty(prop)) {
                    // This should get rid of variables which cannot be deleted
                    window[prop] = undefined;
                    delete window[prop];
                }
            }
        },

        clearTimeoutsAndIntervals: function() {
            var lastTimeout = setTimeout(function(){}, 0);
            var lastInterval = setInterval(function(){}, 0);

            for (var i=this.firstTimeout; i<=lastTimeout; i++) {
                clearTimeout(i);
            }
            for (var i=this.firstInterval; i<=lastInterval; i++) {
                clearInterval(i);
            }

            this.firstTimeout = lastTimeout;
            this.firstInterval = lastInterval;
        },

        clearAll: function() {
        	this.clearGlobals();
        	this.clearTimeoutsAndIntervals();
        }
    };
})();