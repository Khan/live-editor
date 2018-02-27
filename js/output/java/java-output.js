window.JavaOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.initPromise = window.javaEngine.init()
            .then(() => this.engineInitialized = true);

        this.config = options.config;
        this.output = options.output;
        this.tester = null;
        this.engineInitialized = false;
        this.render();
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe id='output_iframe'>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {},

    lint: function lint(userCode, skip) {
        // TODO(hannah): Implement!
        var deferred = $.Deferred();
        deferred.resolve({
        	errors: [],
        	warnings: [],
       	});
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
        console.log("[Debug] Compiling Code", codeObj);

        this.initPromise.then(() => {
            window.javaEngine.compile(codeObj)
                .then(transpiled => {
                    console.log("[Debug] Executing code");

                    window.javaEngine.execute(transpiled);
                });
        });
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("java", JavaOutput);
