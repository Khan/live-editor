window.HTMLOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;

        this.render();
        this.bind();

        // Load HTML config options
        this.config.runCurVersion("html", this);

        return this;
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
    },

    bind: function() {

    },

    messageHandlers: {
        // Take a screenshot of the output
        screenshot: function(data) {
            // ...
        }
    },

    lint: function(userCode, callback) {
        callback([]);
    },

    initTests: function(validate) {
        
    },

    test: function(userCode, tests, errors, callback) {
        callback(errors, {});
    },

    runCode: function(userCode, callback) {
        var doc = this.$frame[0].contentWindow.document;
        doc.open("text/html", "replace");
        doc.write(userCode);
        doc.close();

        callback([], userCode);
    },

    clear: function() {

    },

    kill: function() {

    }
});

LiveEditorOutput.registerOutput("html", HTMLOutput);