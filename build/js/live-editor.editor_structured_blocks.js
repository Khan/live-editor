var JSEditor = Backbone.View.extend({
    className: "editor",

    initialize: function(options) {
        var code = options.code;

        if (typeof code === "string") {
            code = JSRules.parseProgram(code);
        }

        this.code = code;

        this.code.on({
            "updated": function() {
                this.trigger("updated");
            }.bind(this)
        });
    },

    toScript: function() {
        return this.code.toScript();
    },

    render: function() {
        this.$el.html(this.code.render().$el);
        return this;
    }
});

var JSToolbox = Backbone.View.extend({
    className: "toolbox",

    initialize: function(options) {
        var toolbox = options.toolbox || [];

        toolbox = toolbox.map(function(item) {
            if (typeof item === "function") {
                item = JSRules.parseStructure(item);
            }

            return JSRules.findRule(item);
        });

        this.toolbox = toolbox;
    },

    render: function() {
        this.$el.html(this.toolbox.map(function(item) {
            var $item = item.render().$el;

            $item.draggable({
                connectToSortable: ".block-statements",
                helper: "clone",
                revert: "invalid",
                toSortable: function(e, ui) {
                    var $elems = ui.helper.siblings();
                    var $placeholder =
                        $elems.filter(".ui-sortable-placeholder");
                    var curPos = $elems.index($placeholder);
                    ui.helper.trigger("sort-added",
                        [item, curPos, ui.helper[0]]);
                }
            });

            return $item;
        }));
        return this;
    }
});

var JSToolboxEditor = Backbone.View.extend({
    initialize: function(options) {
        this.editor = new JSEditor({
            code: options.code
        });

        this.editor.on("updated", function(code) {
            this.trigger("updated", code);
        }.bind(this));

        this.toolbox = new JSToolbox({
            toolbox: options.toolbox
        });

        this.render();
    },

    toScript: function() {
        return this.editor.toScript();
    },

    render: function() {
        this.$el.html([
            this.editor.render().$el,
            this.toolbox.render().$el
        ]);
    }
});

var JSRules = {
    rules: [],

    findRule: function(node) {
        if (typeof node !== "object") {
            return;
        }

        for (var r = 0; r < this.rules.length; r++) {
            var Rule = this.rules[r];
            var match = Structured.matchNode(node, Rule.prototype.structure);

            if (match) {
                return new Rule({
                    node: node,
                    match: match
                });
            }
        }

        throw new Error("No rule found for: " + JSON.stringify(node));
    },

    addRule: function(rule) {
        rule.prototype.tokens = this.tokenize(rule.prototype.structure);

        if (typeof rule.prototype.structure === "function") {
            rule.prototype.structure =
                this.parseStructure(rule.prototype.structure);
        }

        this.rules.push(rule);
        return rule;
    },

    tokenize: function(fn) {
        if (typeof fn === "object") {
            return [];
        }

        if (typeof fn === "function") {
            fn = fn.toString().replace(/function.*?{\s*/, "")
                .replace(/\s*}$/, "");
        }

        return esprima.tokenize(fn);
    },

    parseProgram: function(code) {
        return new JSProgram({
            node: esprima.parse(code)
        });
    },

    parseStructure: function(fn) {
        return esprima.parse("(" + fn + ")").body[0].expression.body.body[0];
    }
};

var JSStatements = Backbone.Collection.extend({
    model: function(attrs) {
        // Ignore objects that are already a JSRule model
        if (attrs instanceof JSRule) {
            return attrs;
        }

        return JSRules.findRule(attrs);
    }
});

var JSRule = Backbone.View.extend({
    baseEvents: {
        "sort-update": "sortUpdate",
        "sort-added": "sortAdded",
        "sort-removed": "sortRemoved",
        "inside": "inside",
        "outside": "outside",
        "drop": "drop"
    },

    events: function() {
        return _.extend({}, this.baseEvents, this.additionalEvents);
    },

    initialize: function(options) {
        this.node = options.node;
        this.match = _.defaults(this.genMatch(options), {
            _: [],
            vars: {}
        });
        this.children = this.getChildModels();
    },

    inside: function() {
        this.$el.removeClass("outside");
    },

    outside: function() {
        this.$el.addClass("outside");
    },

    drop: function() {
        // Ignore the cases where this isn't a new draggable coming in
        if (!this.$el.hasClass("ui-draggable")) {
            return;
        }

        // Remove the draggable related classes/styling
        this.$el.removeClass("ui-draggable ui-draggable-handle")
            .css({width: "", height: ""});

        // Re-render after dropping the element, to avoid any dummy
        // element shenanigans from jQuery UI
        this.render();

        this.$el.parent().sortable("refresh");
    },

    sortUpdate: function(e, index) {
        var collection = this.collection;

        if (this.collection) {
            // Ignore cases where the model isn't in this collection
            if (collection.indexOf(this) < 0) {
                return;
            }

            collection.remove(this);
            collection.add(this, {at: index});
        }

        this.triggerUpdate();
    },

    sortAdded: function(e, model, index, elem) {
        var collection = this.findChildCollection();

        if (collection) {
            var newModel = JSRules.findRule(model.toAST());
            newModel.setElement(elem);
            collection.add(newModel, {at: index});
        }

        this.triggerUpdate();
    },

    sortRemoved: function(e, index) {
        var collection = this.findChildCollection();

        if (collection) {
            var model = collection.at(index);
            collection.remove(model);
        }

        this.triggerUpdate();
    },

    triggerUpdate: function() {
        this.$el.trigger("updated");
    },

    findChildCollection: function() {
        // TODO: Eventually support multiple collections per model
        var children = this.children;

        for (var i = 0, l = children._.length; i < l; i++) {
            if (children._[i] instanceof JSStatements) {
                return children._[i]
            }
        }

        for (var name in children.vars) {
            if (children.vars[name] instanceof JSStatements) {
                return children.vars[name];
            }
        }
    },

    getChildModels: function(state) {
        state = state || this.match;
        var ret = {_: [], vars: {}};

        for (var i = 0; i < state._.length; i++) {
            var match = state._[i];
            ret._[i] = _.isArray(match) ?
                this.modelMatchArray(match) :
                this.modelMatch(match);
        }

        for (var name in state.vars) {
            var match = state.vars[name];
            ret.vars[name] = _.isArray(match) ?
                this.modelMatchArray(match) :
                this.modelMatch(match);
        }

        return ret;
    },

    modelMatch: function(match) {
        return JSRules.findRule(match);
    },

    modelMatchArray: function(matches) {
        return new JSStatements(matches);
    },

    genMatch: function() {
        throw new Error("No genMatch method implemented.");
    },

    toAST: function() {
        throw new Error("No toAST method implemented.");
    },

    toScript: function() {
        return escodegen.generate(this.toAST());
    },

    getAST: function() {
        var state = this.match;
        var ret = {_: [], vars: {}};

        for (var i = 0; i < state._.length; i++) {
            var match = state._[i];
            ret._[i] = _.isArray(match) ?
                this.astComponentArray(match, "_", i) :
                this.astComponent(match, "_", i);
        }

        for (var name in state.vars) {
            var match = state.vars[name];
            ret.vars[name] = _.isArray(match) ?
                this.astComponentArray(match, "vars", name) :
                this.astComponent(match, "vars", name);
        }

        return ret;
    },

    astComponent: function(match, ns, id) {
        return this.children[ns][id].toAST();
    },

    astComponentArray: function(matches, ns, id) {
        return this.children[ns][id].map(function(model) {
            return model.toAST();
        });
    },

    renderStatements: function(collection) {
        var $div = $("<div>").addClass("block block-statements");

        $div.html(collection.map(function(statement) {
            return statement.render().el;
        }));

        var getIndex = function(ui) {
            if (ui.helper) {
                return ui.helper.siblings().index(ui.placeholder);
            } else {
                return ui.item.index();
            }
        };

        var outside = false;
        var stopping = false;

        $div.sortable({
            revert: false,
            change: function(e, ui) {
                ui.item.trigger("sort-update", getIndex(ui));
            },
            receive: function(e, ui) {
                if (outside) {
                    ui.item.triggerHandler("inside");
                }
                outside = false;
            },
            over: function(e, ui) {
                outside = false;
                ui.item.triggerHandler("inside");
                ui.placeholder.removeClass("outside");
            },
            beforeStop: function(e, ui) {
                stopping = true;

                // Remove item when dropped outside the sortable
                if (outside) {
                    ui.item.trigger("sort-removed", getIndex(ui));
                    ui.item.remove();
                }
            },
            stop: function(e, ui) {
                stopping = false;
                ui.item.triggerHandler("drop");
            },
            out: function(e, ui) {
                // An extra 'out' event fires while stopping, we ignore it
                if (stopping) {
                    return;
                }

                outside = true;

                // Remove the model when the external draggable is moved
                // outside of the sortable (sortable already removes the elem)
                if (ui.helper && ui.item.hasClass("ui-draggable-dragging")) {
                    ui.item.trigger("sort-removed", getIndex(ui));
                }

                ui.placeholder.addClass("outside");
                ui.item.triggerHandler("outside");
            }
        });

        return $div[0];
    },

    renderInput: function(statement) {
        // TODO: Handle the input type
        var $div = $("<div>").addClass("block block-input");
        $div.html(statement.render().el);
        return $div[0];
    }
});

var JSASTRule = JSRule.extend({
    className: "block block-statement",

    genMatch: function(options) {
        return options.match;
    },

    toAST: function() {
        return Structured.injectData(this.structure, this.getAST());
    },

    render: function() {
        var children = this.children;
        var tokens = this.tokens;
        var _pos = 0;

        var buildTag = function(type, token) {
            return "<span class='" + type + "'>" + token.value + "</span>";
        };

        tokens = tokens.map(function(token) {
            if (token.type === "Identifier") {
                if (token.value === "_") {
                    return children._[_pos++].render().el;
                } else {
                    return buildTag("entity name function call", token);
                }
            } else if (token.type === "Punctuator") {
                switch(token.value) {
                    case ".":
                        return buildTag("keyword dot", token);
                    case "=":
                    case "+":
                    case "!":
                    case "-":
                    case "|":
                    case "*":
                    case "/":
                        token.value = " " + token.value + " ";
                        return buildTag("keyword operator", token);
                    case ",":
                        return ", ";
                }
            } else if (token.type === "Keyword") {
                token.value += " ";
                return buildTag("keyword", token);

            } else if (token.type === "Boolean") {
                return buildTag("constant language", token);

            } else if (token.type === "Numeric") {
                return buildTag("constant numeric", token);
            }

            return token.value;
        });

        this.$el.html(tokens);

        return this;
    }
});
var JSProgram = JSRules.addRule(JSRule.extend({
    structure: {type: "Program"},

    additionalEvents: {
        "updated": "updated"
    },

    className: "program",

    updated: function() {
        this.trigger("updated", this.getAST());
    },

    genMatch: function() {
        return {
            _: [this.node.body]
        };
    },

    toAST: function() {
        return {
            type: "Program",
            body: this.getAST()._[0]
        };
    },

    render: function() {
        this.$el.html(this.renderStatements(this.children._[0]));
        return this;
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        var _ = _;
    }
}));

JSRules.addRule(JSRule.extend({
    structure: {type: "Identifier"},

    className: "block block-inline block-variable",

    additionalEvents: {
        "input input": "onInput"
    },

    genMatch: function() {
        return {
            vars: {
                name: this.node.name
            }
        };
    },

    toAST: function() {
        return {
            type: "Identifier",
            name: this.match.vars.name
        };
    },

    onInput: function(event) {
        this.match.vars.name = event.target.value;

        this.triggerUpdate();
    },

    render: function() {
        var name = this.match.vars.name.toString();

        this.$el.html($("<input>")
            .attr({
                type: "text",
                value: name,
                size: name.length
            }));
        return this;
    }
}));

JSRules.addRule(JSRule.extend({
    structure: {type: "Literal"},

    className: "block block-inline",

    additionalEvents: {
        "click": "activate",
        "input input": "onInput",
        "blur input": "deactivate",
        "keydown input": "onKeyDown"
    },

    getType: function() {
        return typeof this.node.value;
    },

    genMatch: function() {
        return {
            vars: {
                value: this.node.value
            }
        };
    },

    toAST: function() {
        return {
            type: "Literal",
            value: this.match.vars.value
        };
    },

    onInput: function(event) {
        var val = event.target.value;
        var type = this.getType();

        if (type === "boolean") {
            val = (val === "true");
        } else if (type === "number") {
            val = parseFloat(val);
        }

        this.match.vars.value = val;

        this.triggerUpdate();
    },

    onKeyDown: function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.deactivate();
        }
    },

    deactivate: function() {
        this.active = false;
    },

    activate: function() {
        if (this.editable) {
            this.active = true;
            var input = this.$el.find("input")[0];
            input.focus();
            input.select();
        }
    },

    render: function() {
        var type = this.getType();
        var val = this.match.vars.value.toString();

        this.$el.addClass("block-" + type);
        this.$el.html($("<input>")
            .attr({
                type: "text",
                value: val,
                size: val.length,
                "class": "constant numeric"
            }));
        return this;
    }
}));
// Shapes

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        rect(_, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        line(_, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        bezier(_, _, _, _, _, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        ellipse(_, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        point(_, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        quad(_, _, _, _, _, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        triangle(_, _, _, _, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        arc(_, _, _, _, _, _);
    }
}));

// TODO: Handle additional height/width args
JSRules.addRule(JSASTRule.extend({
    structure: function() {
        image(_, _, _);
    }
}));

// Colors

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        background(_, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        fill(_, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        noFill();
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        stroke(_, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        strokeWeight(_);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        noStroke();
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        color(_, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        blendColor(_, _, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        lerpColor(_, _, _);
    }
}));

// Text

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        text(_, _, _);
    }
}));

// TODO: Handle additional size argument
JSRules.addRule(JSASTRule.extend({
    structure: function() {
        textFont(_, _);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        textSize(_);
    }
}));

// Transforms

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        rotate(_);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        scale(_);
    }
}));

JSRules.addRule(JSASTRule.extend({
    structure: function() {
        translate(_, _);
    }
}));