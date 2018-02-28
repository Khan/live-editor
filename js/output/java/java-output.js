window.JavaOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.initPromise = window.javaEngine.init()
            .then(() => {
                this.engineInitialized = true;
                window.javaExecutor.init();
                this.output.postParent({readyToRun: true});
                this.output.postParent({loaded: true});
            });

        this.config = options.config;
        this.output = options.output;
        this.tester = null;
        this.engineInitialized = false;
        this.render();

        return this;
    },

    render: function render() {
        if (!this.$canvas) {
            this.$el.empty();
            this.$canvas = $("<canvas>").attr("id", "output-canvas").appendTo(this.el).show();
            window.processing = new Processing(this.$canvas[0]);
            window.processing.size(400, 400);
        }

        this.clearCanvas();
    },

    clearCanvas: function clearCanvas() {
        window.processing.background(255, 255, 255);
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
        this.clearCanvas();
        this.output.postParent({
            readyToRun: false,
            clearErrors: true
        });
        console.log("[Debug] Compiling Code");

        this.initPromise.then(() => {
            window.javaEngine.compile(codeObj)
                .then(transpiled => {
                    console.log("[Debug] Executing code");

                    window.javaEngine.execute(transpiled);
                    this.output.postParent({ readyToRun: true });
                    this.output.postParent({
                        results: {}
                    });
                })
                .catch((error) => {
                    console.log(`[Debug] ${error.message}`);
                    this.output.postParent({ readyToRun: true });
                    this.output.postParent({
                        results: {
                            assertions: [],
                            errors: error.errors,
                            warnings: error.warnings
                        }
                    });
                });
        });
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("java", JavaOutput);
