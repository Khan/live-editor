window.StructuredBlocksEditor = Backbone.View.extend({
    initialize: function(options) {
        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;

        this.config.editor = this;

        var toolbox = [
            function() {
                fill(255, 0, 0);
            },
            function() {
                rect(10, 10, 50, 50);
            },
            function() {
                ellipse(20, 20, 100, 100);
            }
        ];

        this.editor = new JSToolboxEditor({
            el: this.el,
            toolbox: toolbox,
            code: this.defaultCode || ""
        });

        this.editor.on("updated", function() {
            this.trigger("change");
        }.bind(this));

        /*
        // Attach the hot number picker to the editor
        this.tooltipEngine = new TooltipEngine({
            type: "structured-blocks",
            imagesDir: options.imagesDir
        });

        // Kill default selection on the hot number
        this.$el.on("mousedown", ".tooltip", function(e) {
            e.preventDefault();
        });
        */
    },

    setOptions: function() {},
    getCursor: function() {},
    setCursor: function() {},
    setSelection: function() {},
    focus: function() {},
    toggleGutter: function() {},
    setErrorHighlight: function() {},
    setReadOnly: function() {},
    undo: function() {},
    insertNewlineIfCursorAtEnd: function() {},

    text: function(code) {
        if (code != null) {
            this.editor.setCode(code);
        }

        return this.editor.toScript();
    }
});

LiveEditor.registerEditor("structured-blocks_p5js", StructuredBlocksEditor);