window.StructuredBlocksEditor = Backbone.View.extend({
    initialize: function(options) {
        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;
        this.imagesDir = options.imagesDir;

        this.config.editor = this;

        var toolbox = {
            "Shapes": [
                function() {
                    rect(10, 10, 50, 50);
                },
                function() {
                    ellipse(120, 120, 100, 100);
                },
                function() {
                    line(10, 10, 50, 50);
                },
                function() {
                    triangle(20, 20, 100, 100, 250, 50);
                },
                function() {
                    arc(150, 150, 100, 100, 0, 360);
                }
            ],
            "Colors": [
                function() {
                    fill(255, 0, 0);
                },
                function() {
                    background(255, 0, 0);
                },
                function() {
                    stroke(0, 0, 0);
                },
                function() {
                    strokeWeight(3);
                },
                function() {
                    noStroke();
                },
                function() {
                    noFill();
                }
            ],
            "Extra": [
                {type: "Line", value: ""}
            ]
        };

        this.editor = new JSToolboxEditor({
            el: this.el,
            toolbox: toolbox,
            code: this.defaultCode || "",
            imagesDir: this.imagesDir
        });

        this.editor.on("updated", function() {
            this.trigger("change");
        }.bind(this));

        this.tooltipEngine = new StructuredBlocksTooltips({
            el: this.el
        });
    },

    getAllFolds: function() {
        return [];
    },

    setFolds: function() {},
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

LiveEditor.registerEditor("structured-blocks_pjs", StructuredBlocksEditor);