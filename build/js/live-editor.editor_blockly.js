window.BlocklyEditor = Backbone.View.extend({
    initialize: function(options) {
        this.defaultCode = options.code;
        this.autoFocus = options.autoFocus;
        this.config = options.config;
        this.record = options.record;

        this.config.editor = this;

        var toolbox = "<xml>";

        var generateValues = function(props) {
            var values = "";
            if (props.args) {
                props.args.forEach(function(prop) {
                    if ("fill" in prop) {
                        values += "<value name='" + prop.name + "'>";
                        if (prop.type === "Colour") {
                            values += "<block type='colour_picker'>" +
                                "</block>";
                        } else if (prop.type === "Image") {
                            values += "<block type='image_picker'>" +
                                "</block>";
                        } else if (prop.type === "String") {
                            values += "<block type='text'>" +
                                "<field name='TEXT'>" + prop.fill + "</field>" +
                                "</block>";
                        } else if (prop.type === "Number") {
                            values += "<block type='math_number'>" +
                                "<field name='NUM'>" + prop.fill + "</field>" +
                                "</block>";
                        } else if (prop.type === "Variable") {
                            values += "<block type='variables_get'>" +
                                "<field name='VAR'>" + prop.fill + "</field>" +
                                "</block>";
                        }
                        values += "</value>";
                    }
                });
            }
            return values;
        };

        Object.keys(Blockly.p5js).forEach(function(catName) {
            toolbox += "<category name='" + catName + "'>";

            var jsVars = Blockly.js[catName];
            if (jsVars) {
                Object.keys(jsVars).forEach(function(name) {
                    toolbox += "<block type='" + name + "'>";
                    toolbox += generateValues(jsVars[name]);
                    toolbox += "</block>";
                });
            }

            var vars = Blockly.p5js[catName];
            Object.keys(vars).forEach(function(name) {
                toolbox += "<block type='p5js_" + name + "'>";
                toolbox += generateValues(vars[name]);
                toolbox += "</block>";
            });

            toolbox += "</category>";
        });

        Object.keys(Blockly.js).forEach(function(catName) {
            if (catName in Blockly.p5js) {
                return;
            }

            var jsVars = Blockly.js[catName];

            toolbox += "<category name='" + catName + "'>";

            Object.keys(jsVars).forEach(function(name) {
                toolbox += "<block type='" + name + "'>";
                toolbox += generateValues(jsVars[name]);
                toolbox += "</block>";
            });

            toolbox += "</category>";
        });

        // Append dynamically generated "Functions" tab
        toolbox += "<category name='Functions' custom='PROCEDURE'></category>";

        toolbox += "</xml>";

        Blockly.inject(this.el, {
            path: options.externalsDir + "blockly/",
            toolbox: toolbox
        });

        Blockly.addChangeListener(function() {
            this.trigger("change");
        }.bind(this));

        // Attach the hot number picker to the editor
        this.tooltipEngine = new TooltipEngine({
            blockly: Blockly,
            type: 'blockly',
            imagesDir: options.imagesDir
        });

        // Kill default selection on the hot number
        this.$el.on("mousedown", ".tooltip", function(e) {
            e.preventDefault();
        });
    },

    getCursor: function() {},
    setCursor: function() {},
    setSelection: function() {},
    focus: function() {},
    toggleGutter: function() {},
    setErrorHighlight: function() {},
    setReadOnly: function() {},
    undo: function() {},
    insertNewlineIfCursorAtEnd: function() {},

    setBlocklyFromJS: function(code) {
        var xmlString = Blockly.util.jsToBlocklyXml(code);
        var xmlDom = Blockly.core.Xml.textToDom(xmlString);
        if (xmlDom) {
            Blockly.core.mainWorkspace.clear();
            Blockly.core.Xml.domToWorkspace(Blockly.core.mainWorkspace, xmlDom);
        }
    },

    text: function(code) {
        if (code != null) {
            this.setBlocklyFromJS(code);
        }

        return Blockly.JavaScript.workspaceToCode();
    }
});

LiveEditor.registerEditor("blockly_p5js", BlocklyEditor);