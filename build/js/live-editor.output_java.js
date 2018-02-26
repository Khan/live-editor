window.JavaOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;
        this.tester = null;
        this.render();
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe id='output_iframe'>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {},

    lint: function lint(userCode, skip) {},

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
        // TODO(hannah): Implement!
        callback([]);
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("java", JavaOutput);

// TODO(hannah): Implement!
