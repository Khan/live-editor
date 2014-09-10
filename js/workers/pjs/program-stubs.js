// PhantomJS seems to fail at passing the Program object
// inside the context- it turns the functions into null values instead.
// That may also be the behavior of older browsers.
// This fixes that by defining them in this stub instead.
function initProgramStubs(context) {
    /*
     * Processing functions that return values should have implementations
     * here.
     */

    context = context || {};

    context.Program = {
        settings: function() {return {};},
        runTests: function() {},
        runTest: function() {},
        restart: function() {},
        assertEqual: function() {}
    };

    return context;
}