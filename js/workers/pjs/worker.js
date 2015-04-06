/* global initProcessingStubs */

var init = false;

self.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (!init) {
        init = true;
        var deps = data.deps;

        eval(deps["processing-stubs.js"]);
        eval(deps["program-stubs.js"]);

        self.initProcessingStubs = initProcessingStubs;
        self.initProgramStubs = initProgramStubs;
    }

    var context = data.context,
        code = "with(arguments[0]){\n" +
            data.code +
            "\nif (typeof draw !== 'undefined' && draw){draw();}}",
        runtimeCost = 0,
        drawMethods = ["background", "bezier", "curve", "ellipse", "line",
            "quad", "rect", "triangle", "vertex", "text", "image"],
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
    var stubbedContext = initProcessingStubs();
    stubbedContext = initProgramStubs(stubbedContext);

    // Go through all the properties exposed by the program
    // (previously extracted via JSHint, et. al.)
    var unstubFunctionsInObject = function(object) {
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                // We're unable to pass functions to a web worker so we must
                // pass in a stubbed function placeholder, instead. If possible
                // we try to replace it with the corresponding function in
                // Processing.js. If not then we make a dummy function that we
                // use to track the complexity of the program.
                if (object[prop] === "__STUBBED_FUNCTION__") {
                    object[prop] = prop in stubbedContext ?
                        stubbedContext[prop] :
                        drawCounter(prop);
                } else if (typeof object[prop] === "object") {
                    unstubFunctionsInObject(object[prop]);
                }
            }
        }
    };

    unstubFunctionsInObject(context);

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
