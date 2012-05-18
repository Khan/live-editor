var stubFunctions = function(context) {
	var functionStubbed = {};
	for ( var prop in context ) {
		if (!context.hasOwnProperty(prop)) {
			continue;
		}
		
		// Stub out functions
		if (context[prop] === '__STUBBED_FUNCTION__') {
			functionStubbed[prop] = function() {};
		} else {
			functionStubbed[prop] = context[prop];
		}
	}
	return functionStubbed;
};

self.onmessage = function(event) {
	var data = event.data;
	var code = data.code;
	var globalContext = stubFunctions(data.globalContext);
	var contexts = data.contexts.map(stubFunctions);

	/*
	self.postMessage({
		type: 'start'
	});
	self.postMessage({
		type: 'log',
		message: data.contexts
	});
	*/
	(new Function( code )).apply( globalContext, contexts );
	contexts[0].draw && contexts[0].draw();
	self.postMessage({
		type: 'end'
	});
};
