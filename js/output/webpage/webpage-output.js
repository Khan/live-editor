window.HTMLOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;

        this.render();

        // Load HTML config options
        this.config.runCurVersion("webpage", this);

        return this;
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
    },

    messageHandlers: {
        // Take a screenshot of the output
        screenshot: function(data) {
            // Convert the page to a screenshot and return
            // it to the parent frame.
        }
    },

    lint: function(userCode, callback) {
        // Lint the user's code, returning any errors in the
        // callback.
        callback([]);
    },

    initTests: function(validate) {
        // Initialize any test data
        // validate holds a string with the test data in it
    },

    test: function(userCode, tests, errors, callback) {
        // Run tests given the user's code, tests, and errors
        callback(errors, {});
    },

    runCode: function(userCode, callback) {
        var doc = this.$frame[0].contentWindow.document;
        doc.open();
        doc.write(userCode);
        doc.close();

        callback([], userCode);
    },

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("webpage", HTMLOutput);