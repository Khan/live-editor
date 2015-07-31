window.PythonOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;
        // TODO(hannah): Implement a tester.
        this.tester = null;
        this.render();
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe id='output_iframe'>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {},

    infiniteLoopError: {
        text: $._("Your javascript is taking too long to run. " + "Perhaps you have a mistake in your code?"),
        type: "error",
        source: "timeout"
    },

    runtimeError: {
        text: $._("Your javascript encountered a runtime error. " + "Check your console for more information."),
        type: "error",
        source: "timeout"
    },

    lint: function lint(userCode, skip) {
        this.slowparseResults = userCode;
        var deferred = $.Deferred();
        deferred.resolve([]);
        return deferred;
    },

    flattenError: function flattenError(plainError, error, base) {
        return "";
    },

    getLintMessage: function getLintMessage(plainError) {
        return "";
    },

    initTests: function initTests(validate) {
        return;
    },

    test: function test(userCode, tests, errors, callback) {},

    postProcessing: function postProcessing(oldPageTitle) {},

    runCode: function runCode(codeObj, callback) {
        // need to focus on fixing thisSSSSS!!!
        function outf(text) { 
            if (text != '\n') {
                // innerHTML: $('#output_iframe').contents().find('body')[0].innerHTML
                $('#output_iframe').contents().find('body').html(text);
            }
        } 
        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        }

        var prog = this.slowparseResults;
        Sk.pre = "output";
    
        try {
            Sk.configure({output:outf, read:builtinRead}); 
        } catch(err) {}

        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
        var myPromise = Sk.misceval.asyncToPromise(function() {
           return Sk.importMainWithBody("<stdin>", false, prog, true);
        });

        myPromise.then(
            function(mod) {},
            function(err) {
                console.log(err.toString());
            }
        );
        
        callback([]);
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("python", PythonOutput);