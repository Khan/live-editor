/* global initProcessingStubs */

importScripts("processing-stubs.js?cachebust=" + (new Date()).toDateString());

self.onmessage = function(event) {
    var data = event.data,
        context = data.context,
        code = "with(arguments[0]){\n" +
            data.code +
            "\nif (typeof draw !== 'undefined' && draw){draw();}}",
        runtimeCost = 0,
        drawMethods = ["background", "bezier", "curve", "ellipse", "line",
            "quad", "rect", "triangle", "vertex", "text"],
        willDraw = {};

    // Generates a function for counting the rough complexity of a specific
    // function call. (It assumes that Processing function calls that draw
    // to the screen are inherently more complex.)
    var drawCounter = function(name) {
        return function() {
            runtimeCost += willDraw[name] ? 1 : 0.1;
            return 0;
        };
    };

    for (var i = 0; i < drawMethods.length; i++) {
        willDraw[drawMethods[i]] = true;
    }

    // Populates the environment with most of the processing
    // functions that return values
    var processingContext = initProcessingStubs();

    // Go through all the properties exposed by the program
    // (previously extracted via JSHint, et. al.)
    for (var prop in context) {
        if (context.hasOwnProperty(prop)) {
            // We're unable to pass functions to a web worker so we must
            // pass in a stubbed function placeholder, instead. If possible
            // we try to replace it with the corresponding function in
            // Processing.js. If not then we make a dummy function that we
            // use to track the complexity of the program.
            if (context[prop] === "__STUBBED_FUNCTION__") {
                context[prop] = prop in processingContext ?
                    processingContext[prop] :
                    drawCounter(prop);
            }
        }
    }

    // Let the parent know that execution is about to begin
    self.postMessage({ execStarted: true });

    setTimeout(function(){
        // Execute the code and the drawing function, at least once
        // TODO: Run other functions that execute on event (mousePressed, etc.)
        (new Function(code)).call({}, context);

        // Cap the maximum number of function calls
        // Score 1 for the popular function calls that draw to the screen
        // Score 0.1 for every other function calls
        // Max determined rather arbitrarily, higher than this seems too
        // complex for most simple programs
        if (runtimeCost > 16000) {
            // A dummy $._() i18n placeholder to avoid including the i18n.js file
            var $ = {
                _: function(str){
                    return str;
                }
            };

            self.postMessage({
                type: "error",
                message: $._("The program is taking too long to run. " +
                             "Perhaps you could try and make it a bit simpler?")
            });
        } else {
            self.postMessage({ type: "end" });
        }
    }, 1);
};
