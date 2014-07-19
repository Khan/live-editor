/*
 Missing but want to add:
 -----------------------------

 Drawing:
  image()


 Probably don't add, or add but hide:
 -----------------------------

 Color:
  blendColor()
  lerpColor()

 Environment:
  frameRate()
  print()
  debug()

 Mouse:
  mouseButton - not as relevant on mobile..
  mouseOver()
  mouseOut()

 Keyboard - we will have this but hidden,
   and then add a triggersKeyboard: true
   to each of the keyboard-related things,
   so that if we see them when parsing the code,
   we know to pop up the virtual keyboard.

 Math:
  constrain
  PVector

Still to triage:
------------------------------
 Keyboard on
*/

Blockly.p5js = {
    Drawing: {
        image: {
            url: "https://www.khanacademy.org/cs/pointx-y/827809834",
            title: "Display image",
            args: [
                { name: "color", type: "Colour", fill: "color(255,0,0)" }
            ]
        },
        getImage: {
            url: "https://www.khanacademy.org/cs/pointx-y/827809834",
            title: "Get image",
            args: [
                { name: "path", type: "String", fill: "", blank: "" }
            ]
        },
        point: {
            url: "https://www.khanacademy.org/cs/pointx-y/827809834",
            title: "Draw Point",
            args: [
                { name: "x", type: "Number", fill: 50, blank: 0 },
                { name: "y", type: "Number", fill: 50, blank: 0 }
            ]
        },
        line: {
            url: "https://www.khanacademy.org/cs/linex1-y1-x2-y2/827916099",
            title: "Draw Line",
            args: [
                { name: "x1", type: "Number", fill: 0 },
                { name: "y1", type: "Number", fill: 0 },
                { name: "x2", type: "Number", fill: 100, blank: 0 },
                { name: "y2", type: "Number", fill: 100, blank: 0 }
            ]
        },
        triangle: {
            url: "https://www.khanacademy.org/cs/trianglex1-y1-x2-y2-x3-y3/839546599",
            title: "Draw Triangle",
            args: [
                { name: "x1", type: "Number", fill: 0 },
                { name: "y1", type: "Number", fill: 0 },
                { name: "x2", type: "Number", fill: 100, blank: 0 },
                { name: "y2", type: "Number", fill: 100, blank: 0 },
                { name: "x3", type: "Number", fill: 0, blank: 0 },
                { name: "y3", type: "Number", fill: 100, blank: 0 }
            ]
        },
        rect: {
            url: "https://www.khanacademy.org/cs/rectx-y-w-h/839496660",
            title: "Draw Rectangle",
            args: [
                { name: "x", type: "Number", fill: 0 },
                { name: "y", type: "Number", fill: 0 },
                { name: "width", type: "Number", fill: 100, blank: 0 },
                { name: "height", type: "Number", fill: 100, blank: 0 }
            ]
        },
        quad: {
            url: "https://www.khanacademy.org/cs/quadx1-y1-x2-y2-x3-y3-x4-y4/1907244018",
            title: "Draw Quadrilateral",
            args: [
                { name: "x1", type: "Number", fill: 50, blank: 0 },
                { name: "y1", type: "Number", fill: 25, blank: 0 },
                { name: "x2", type: "Number", fill: 180, blank: 0 },
                { name: "y2", type: "Number", fill: 120, blank: 0 },
                { name: "x3", type: "Number", fill: 100, blank: 0 },
                { name: "y3", type: "Number", fill: 180, blank: 0 },
                { name: "x4", type: "Number", fill: 30, blank: 0 },
                { name: "y5", type: "Number", fill: 120, blank: 0 }
            ]
        },
        ellipse: {
            url: "https://www.khanacademy.org/cs/ellipsex-y-w-h/839435680",
            title: "Draw Ellipse",
            args: [
                { name: "x", type: "Number", fill: 50, blank: 0 },
                { name: "y", type: "Number", fill: 50, blank: 0 },
                { name: "width", type: "Number", fill: 100, blank: 0 },
                { name: "height", type: "Number", fill: 100, blank: 0 }
            ]
        },
        arc: {
            url: "https://www.khanacademy.org/cs/arcx-y-w-h-start-stop/1903619297",
            title: "Draw Arc",
            args: [
                { name: "x", type: "Number", fill: 50, blank: 0 },
                { name: "y", type: "Number", fill: 50, blank: 0 },
                { name: "width", type: "Number", fill: 100, blank: 0 },
                { name: "height", type: "Number", fill: 100, blank: 0 },
                { name: "start", type: "Number", fill: 1, blank: 0 },
                { name: "stop", type: "Number", fill: 270, blank: 0 }
            ]
        },
        bezier: {
            url: "https://www.khanacademy.org/cs/bezierx1-y1-cx1-cy1-cx2-cy2-x2-y2/956920482",
            title: "Draw Bezier Curve",
            args: [
                { name: "x1", type: "Number", fill: 100, blank: 0 },
                { name: "y1", type: "Number", fill: 100, blank: 0 },
                { name: "cx1", type: "Number", fill: 200, blank: 0 },
                { name: "cy1", type: "Number", fill: 200, blank: 0 },
                { name: "cx2", type: "Number", fill: 300, blank: 0 },
                { name: "cy2", type: "Number", fill: 100, blank: 0 },
                { name: "x2", type: "Number", fill: 100, blank: 0 },
                { name: "y2", type: "Number", fill: 100, blank: 0 }
            ]
        }
    },
    Colors: {
        background: {
            url: "https://www.khanacademy.org/cs/backgroundr-g-b/839653892",
            title: "Set background color",
            args: [
                { name: "color", type: "Colour", fill: "color(255,0,0)" }
            ]
        },
        fill: {
            url: "https://www.khanacademy.org/cs/fillr-g-b/839774957",
            title: "Set fill color",
            args: [
                { name: "color", type: "Colour", fill: "color(255,0,0)" }
            ]
        },
        noFill: {
            url: "https://www.khanacademy.org/cs/nofill/877946290",
            title: "Turn off fill",
            args: []
        },
        stroke: {
            url: "https://www.khanacademy.org/cs/stroker-g-b/839545910",
            title: "Set outline color",
            args: [
                { name: "color", type: "Colour", fill: "color(255,0,0)" }
            ]
        },
        strokeWeight: {
            url: "https://www.khanacademy.org/cs/strokeweightthickness/877859744",
            title: "Set outline thickness",
            args: [
                { name: "weight", type: "Number", fill: 10 }
            ]
        },
        noStroke: {
            url: "https://www.khanacademy.org/cs/nostroke/839859412",
            title: "Turn off outlines",
            args: []
        },
        color: {
            url: "https://www.khanacademy.org/cs/colorr-g-b/957020020",
            title: "Store a color",
            ret: "Colour",
            args: [
                { name: "color", type: "Colour", fill: "color(255,0,0)" }
            ]
        },
    },
    Text: {
        text: {
            url: "https://www.khanacademy.org/cs/texttext-x-y/937624625",
            title: "Display text",
            args: [
                { name: "text", type: "String", fill: "", blank: "" },
                { name: "x", type: "Number", fill: 50, blank: 0 },
                { name: "y", type: "Number", fill: 50, blank: 0 }
            ]
        },
        textSize: {
            url: "https://www.khanacademy.org/cs/textsizesize/937728198",
            title: "Set text size",
            args: [
                { name: "size", type: "Number", fill: 12, blank: 0 }
            ]
        },
        textFont: {
            url: "https://www.khanacademy.org/cs/textfontfont-size/940030209",
            title: "Set font",
            args: [
                {
                  name: "font", type: "List", fill: "", blank: "",
                  options: [["casual",  'createFont("sans-serif")'],
                            ["proper",  'createFont("serif")'],
                            ["cursive", 'createFont("cursive")'],
                            ["fantasy", 'createFont("fantasy")'],
                            ["code",    'createFont("monospace")']]
                }
            ]
        },
    },
    Transforms: {
        rotate: {
            url: "https://www.khanacademy.org/cs/rotateangle/6386091934351360",
            title: "Rotate next shapes by",
            args: [
                { name: "angle", type: "Number", fill: 30, blank: 0 }
            ]
        },
        scale: {
            url: "https://www.khanacademy.org/cs/scalex-y/6712922034143232",
            title: "Scale next shapes by",
            args: [
                { name: "amount", type: "Number", fill: 2, blank: 0 }
            ]
        },
        translate: {
            url: "https://www.khanacademy.org/cs/translatex-y/6505693083336704",
            title: "Translate next shapes by",
            args: [
                { name: "x", type: "Number", fill: 10, blank: 0 },
                { name: "t", type: "Number", fill: 10, blank: 0 }
            ]
        }
    },
    Environment: {
        width: {
            url: "https://www.khanacademy.org/cs/width/5933816543707136",
            title: "Program width",
            type: "Number"
        },
        height: {
            url: "https://www.khanacademy.org/cs/height/4544657253990400",
            title: "Program height",
            type: "Number"
        },
        draw: {
            url: "",
            title: "Animate",
            type: "Event"
        },
        millis: {
            url: "https://www.khanacademy.org/cs/millis/5970545493409792",
            title: "Milliseconds elapsed",
            ret: "Number",
            args: []
        },
        println: {
            url: "https://www.khanacademy.org/cs/printlndata/6120466259378176",
            title: "Print to console",
            args: [
                { name: "data", fill: 0, blank: 0 }
            ]
        }
    },
    Mouse: {
        mouseX: {
            url: "https://www.khanacademy.org/cs/mousex-mousey/5538427537719296",
            title: "mouse X",
            type: "Number"
        },
        mouseY: {
            url: "https://www.khanacademy.org/cs/mousex-mousey/5538427537719296",
            title: "mouse Y",
            type: "Number"
        },
        pmouseX: {
            url: "https://www.khanacademy.org/cs/pmousex-pmousey/5082026180870144",
            title: "old mouse X",
            type: "Number"
        },
        pmouseY: {
            url: "https://www.khanacademy.org/cs/pmousex-pmousey/5082026180870144",
            title: "old mouse Y",
            type: "Number"
        },
        mouseIsPressed: {
            url: "https://www.khanacademy.org/cs/mouseispressed/939933053",
            title: "the mouse is pressed",
            type: "Boolean"
        },
        mouseClicked: {
            url: "https://www.khanacademy.org/cs/var-mouseclicked-function/1897113673",
            title: "When mouse is clicked",
            type: "Event"
        },
        mousePressed: {
            url: "https://www.khanacademy.org/cs/var-mousepressed-function/1907626123",
            title: "When mouse is pressed",
            type: "Event"
        },
        mouseReleased: {
            url: "https://www.khanacademy.org/cs/var-mousereleased-function/1907670118",
            title: "When mouse is released",
            type: "Event"
        },
        mouseMoved: {
            url: "https://www.khanacademy.org/cs/var-mousemoved-function/5689134450475008",
            title: "When mouse is moved",
            type: "Event"
        },
        mouseDragged: {
            url: "https://www.khanacademy.org/cs/var-mousedragged-function/6273229589053440",
            title: "When mouse is dragged",
            type: "Event"
        }
    },
    Math: {
        random: {
            url: "https://www.khanacademy.org/cs/randomlow-high/827911487",
            title: "Generate random number",
            args: [
                { name: "low", type: "Number", fill: 0, blank: 0 },
                { name: "high", type: "Number", fill: 5, blank: 0 }
            ],
            ret: "Number"
        },
        dist: {
            url: "https://www.khanacademy.org/cs/distx1-y1-x2-y2/1917352082",
            title: "Calculate distance between",
            args: [
                { name: "x1", type: "Number", fill: 0, blank: 0 },
                { name: "y1", type: "Number", fill: 0, blank: 0 },
                { name: "x2", type: "Number", fill: 5, blank: 0 },
                { name: "y3", type: "Number", fill: 5, blank: 0 }
            ],
            ret: "Number"
        },
        min: {
            url: "https://www.khanacademy.org/cs/minnum1-num2/4693347713155072",
            title: "Calculate minimum of",
            args: [
                { name: "num1", type: "Number", fill: 0, blank: 0 },
                { name: "num2", type: "Number", fill: 2, blank: 0 }
            ],
            ret: "Number"
        },
        max: {
            url: "https://www.khanacademy.org/cs/maxnum1-num2/4755409722146816",
            title: "Calculate maximum of",
            args: [
                { name: "num1", type: "Number", fill: 0, blank: 0 },
                { name: "num2", type: "Number", fill: 2, blank: 0 }
            ],
            ret: "Number"
        },
        abs: {
            url: "https://www.khanacademy.org/cs/absnum/877930637",
            title: "Calculate absolute value of",
            args: [
                { name: "num", type: "Number", fill: -1, blank: 0 }
            ],
            ret: "Number"
        },
        log: {
            url: "https://www.khanacademy.org/cs/lognum/877921884",
            title: "Calculate logarithm of",
            args: [
                { name: "num", type: "Number", fill: 8, blank: 0 }
            ],
            ret: "Number"
        },
        pow: {
            url: "https://www.khanacademy.org/cs/pownum-exponent/877858853",
            title: "Raise number to power",
            args: [
                { name: "num", type: "Number", fill: 2, blank: 0 },
                { name: "exponent", type: "Number", fill: 3, blank: 0 }
            ],
            ret: "Number"
        },
        sq: {
            url: "https://www.khanacademy.org/cs/sqnum/6588187426160640",
            title: "Square a number",
            args: [
                { name: "num", type: "Number", fill: 2, blank: 0 }
            ],
            ret: "Number"
        },
        sqrt: {
            url: "https://www.khanacademy.org/cs/sqrtnum/6473360267542528",
            title: "Take square root of",
            args: [
                { name: "num", type: "Number", fill: 4, blank: 0 }
            ],
            ret: "Number"
        },
        round: {
            url: "https://www.khanacademy.org/cs/roundnum/5907281296228352",
            title: "Round number",
            args: [
                { name: "num", type: "Number", fill: 2.5, blank: 0 }
            ],
            ret: "Number"
        },
        ceil: {
            url: "https://www.khanacademy.org/cs/ceil/5491781646942208",
            title: "Take ceiling of",
            args: [
                { name: "num", type: "Number", fill: 2.4, blank: 0 }
            ],
            ret: "Number"
        },
        floor: {
            url: "https://www.khanacademy.org/cs/floornum/5703004061696000",
            title: "Take floor of",
            args: [
                { name: "num", type: "Number", fill: 2.6, blank: 0 }
            ],
            ret: "Number"
        },
        cos: {
            url: "https://www.khanacademy.org/cs/cosdeg/948226821",
            title: "Take cosine of angle",
            args: [
                { name: "num", type: "Number", fill: 90, blank: 0 }
            ],
            ret: "Number"
        },
        sin: {
            url: "https://www.khanacademy.org/cs/sindeg/948255306",
            title: "Take sine of angle",
            args: [
                { name: "num", type: "Number", fill: 90, blank: 0 }
            ],
            ret: "Number"
        },
        tan: {
            url: "https://www.khanacademy.org/cs/tandeg/948018680",
            title: "Take tangent of angle",
            args: [
                { name: "num", type: "Number", fill: 90, blank: 0 }
            ],
            ret: "Number"
        }
    },
    "Date/Time": {
        day: {
            url: "https://www.khanacademy.org/cs/day/4526347808407552",
            title: "Current day",
            ret: "Number",
            args: []
        },
        month: {
            url: "https://www.khanacademy.org/cs/month/5388987023753216",
            title: "Current month",
            ret: "Number",
            args: []
        },
        year: {
            url: "https://www.khanacademy.org/cs/year/6216887939629056",
            title: "Current year",
            ret: "Number",
            args: []
        },
        hour: {
            url: "https://www.khanacademy.org/cs/hour/5806957302644736",
            title: "Current hour",
            ret: "Number",
            args: []
        },
        minute: {
            url: "https://www.khanacademy.org/cs/minute/6638408210317312",
            title: "Current minute",
            ret: "Number",
            args: []
        },
        second: {
            url: "https://www.khanacademy.org/cs/second/5743886110556160",
            title: "Current second",
            ret: "Number",
            args: []
        }
    }
};

Blockly.js = {
    Text: {
        text: {},
        text_join: {}
    },
    Math: {
        math_number: {},
        math_arithmetic: {},
        math_constant: {},
        math_number_property: {},
        math_change: {
            args: [
             { name: "DELTA", type: "Number", fill: 1, blank: 0 }
            ]
        }
    },
    Variables: {
        variables_get: {
        },
        variables_set: {
        }
    },
    Functions: {
        procedures_defnoreturn: {},
        procedures_defreturn: {},
        procedures_ifreturn: {},
        procedures_callnoreturn: {},
        procedures_callreturn: {}
    },
    Logic: {
        controls_if: {},
        logic_compare: {},
        logic_operation: {},
        logic_negate: {},
        logic_boolean: {},
        logic_ternary: {}
    },
    Loops: {
        controls_repeat_ext: {
            args: [
             { name: "TIMES", type: "Number", fill: 10, blank: 0 }
            ]
        },
        controls_whileUntil: {},
        controls_for: {
            args: [
             { name: "FROM", type: "Number", fill: 1, blank: 0 },
             { name: "TO", type: "Number", fill: 10, blank: 0 },
             { name: "BY", type: "Number", fill: 1, blank: 1 }
            ]
        },
        controls_forEach: {},
        controls_flow_statements: {}
    },
    Lists: {
        lists_create_empty: {},
        lists_create_with: {},
        lists_length: {},
        lists_isEmpty: {},
        lists_indexOf: {
            args: [
             { name: "VALUE", type: "Variable", fill: "list"}
            ]
        },
        lists_getIndex: {
            args: [
             { name: "VALUE", type: "Variable", fill: "list"}
            ]
        },
        lists_setIndex: {
            args: [
             { name: "LIST", type: "Variable", fill: "list"}
            ]
        },
        lists_getSublist: {
            args: [
             { name: "LIST", type: "Variable", fill: "list"}
            ]
        }
    }
};

var typeColors = {
    Number: 230,
    String: 160,
    Colour: 20,
    Event: 40,
    Boolean: 210
};

Object.keys(Blockly.p5js).forEach(function(catName) {
    var vars = Blockly.p5js[catName];

    Object.keys(vars).forEach(function(name) {
        var props = vars[name];

        Blockly.Blocks["p5js_" + name] = {
            init: function() {
                this.setHelpUrl(props.url);
                this.appendDummyInput()
                    .appendField(props.title);
                if (props.type === "Image") {
                    this.appendStatementInput("Display image");
                    var image = new Blockly.FieldImage(
                        'http://www.gstatic.com/codesite/ph/images/star_on.gif', 50, 50, '*');
                    this.appendDummyInput("image")
                        .appendField(image);
                } else if (props.type === "Event") {
                    this.setColour(typeColors[props.type]);
                    this.appendStatementInput("DO")
                    .appendField($._("Run"));
                } else if (props.type) {
                    this.setColour(typeColors[props.type]);
                    this.setOutput(true, props.type);
                } else {
                    props.args.forEach(function(prop) {
                        // check if type is a list
                        if (prop.type === "List") {
                            var dropdown = new Blockly.FieldDropdown(
                                prop.options);
                            this.appendDummyInput(prop.name)
                                    .appendField(dropdown, 'PROPERTY');
                        } else {
                            var input = this.appendValueInput(prop.name);
                            if (prop.type !== "String") {
                                input.setCheck(prop.type);
                            }
                            if (props.args.length > 1) {
                                input.appendField(prop.name);
                            }
                        }
                    }.bind(this));

                    this.setInputsInline(props.args.length <= 4);

                    if (props.ret) {
                        this.setColour(typeColors[props.ret]);
                        this.setOutput(true, props.ret);
                    } else {
                        this.setColour(200);
                        this.setPreviousStatement(true);
                        this.setNextStatement(true);
                    }
                }
            }
        };

        Blockly.JavaScript["p5js_" + name] = function(block) {
            if (props.type === "Event") {
                var branch = Blockly.JavaScript.statementToCode(block, "DO");
                branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
                return "var " + name + " = function() {\n" + branch + "};\n";
            } else if (props.type) {
                return [name, Blockly.JavaScript.ORDER_ATOMIC];
            }

            var values = props.args.map(function(prop) {
                if (prop.type === "List") {
                    return block.getFieldValue('PROPERTY');
                }

                var val = Blockly.JavaScript.valueToCode(block, prop.name,
                    Blockly.JavaScript.ORDER_NONE);

                if (val !== null && val !== "") {
                    return val;
                }

                val = ("blank" in prop ? prop.blank : prop.fill);

                if (typeof val === "string") {
                    return '"' + val + '"';
                } else {
                    return val;
                }
            });

            if (props.ret) {
                return [name + "(" + values.join(",") + ")",
                    Blockly.JavaScript.ORDER_ATOMIC];
            } else {
                return name + "(" + values.join(",") + ");\n";
            }
        };
    });
});

var hexToColor = function(hex) {
    var nums = [hex.slice(1,3), hex.slice(3,5), hex.slice(5,7)];
    return nums.map(function(num) {
        return parseInt(num, 16);
    }).join(",");
};

var convertArgsToHex = function(args) {
    var rgb = args;

    if (args.length === 3) {
        rgb = [args[0].value, args[1].value, args[2].value];
    } else if (args.length === 1) {
        // TODO: Handle color(...)
        var val = args[0].value;
        rgb = [val, val, val];
    }

    return "#" + rgb.map(function(arg) {
        var result = arg.toString(16);
        return (result.length === 1 ? "0" : "") + result;
    }).join("");
};

Blockly.JavaScript.colour_picker = function(block) {
    return [hexToColor(block.getFieldValue("COLOUR")),
        Blockly.JavaScript.ORDER_ATOMIC];
};

var findDefByName = function(fnName) {
    for (var catName in Blockly.p5js) {
        var vars = Blockly.p5js[catName];
        if (fnName in vars) {
            return vars[fnName];
        }
    }
};

// Handle p5js methods
Blockly.util.registerBlockSignature(
    {
        type: "CallExpression",
        arguments: patternMatch.var("arguments"),
        callee: {
            type: "Identifier",
            name: patternMatch.var("callee_name"),
        },
    },
    function(node, matchedProps) {
        var props = findDefByName(matchedProps.callee_name);

        if (!props || !props.args) {
            return;
        }

        var callBlock = "";
        callBlock += "<block type='p5js_" + matchedProps.callee_name + "'>";

        if (props.args[0] && props.args[0].type ==="Colour") {
            callBlock += "<value name='" + props.args[0].name + "'>" +
                "<block type='colour_picker'><field name='COLOUR'>" +
                convertArgsToHex(matchedProps.arguments) + "</field>" +
                "</block></value>";
        } else {
            matchedProps.arguments.forEach(function(arg, i) {
                callBlock += "<value name='" + props.args[i].name + "'>" +
                    Blockly.util.convertAstNodeToBlocks(arg) + "</value>";
            });
        }

        callBlock += "</block>";
        return callBlock;
    }
);

// Handle p5js global variables
Blockly.util.registerBlockSignature(
    {
        type: "Identifier",
        name: patternMatch.var("name")
    },
    function(node, matchedProps) {
        var props = findDefByName(matchedProps.name);

        if (!props || props.args || props.type === "Event") {
            return "<block type='variables_get'>" +
                "<field name='VAR'>" + matchedProps.name + "</field>" +
                "</block>";
        }

        return "<block type='p5js_" + matchedProps.name + "'></block>";
    }
);

// Handle p5js events and regular variable declarations
Blockly.util.registerBlockSignature(
    {
        type: "VariableDeclaration",
        declarations: patternMatch.var("declarations")
    },
    function(node, matchedProps) {
        var output;

        matchedProps.declarations.reverse().forEach(function(dec) {
            var props = findDefByName(dec.id.name);
            if (props && props.type === "Event" && dec.init && dec.init.body) {
                var decBlock = "<block type='p5js_" + dec.id.name + "'></block>";
                // Append initialization to DO if present
                if (dec.init) {
                    var decInit = Blockly.util.convertAstNodeToBlocks(dec.init.body);
                    decBlock = Blockly.util.appendTagDeep(decBlock, decInit, "value", "DO");
                }
            } else {
                var decBlock = "<block type='variables_set'>";
                decBlock += "<field name='VAR'>" + dec.id.name + "</field>";
                decBlock += "</block>";
                // Append initialization to VALUE if present
                if (dec.init) {
                    var decInit = Blockly.util.convertAstNodeToBlocks(dec.init);
                    decBlock = Blockly.util.appendTagDeep(decBlock, decInit, "value", "VALUE");
                }
            }

            output = output ?
                Blockly.util.appendInNewTag(decBlock, output, "next") : decBlock;
        });

        return output;
    }
);

// Handle for statements
Blockly.util.registerBlockSignature(
    {
        type: "ForStatement",
        body: patternMatch.var("body"),
        init: patternMatch.var("init"),
        test: patternMatch.var("test"),
        update: patternMatch.var("update")
    },
    function(node, matchedProps) {
        var by = matchedProps.update.operator === "++" ? 1 :
            matchedProps.update.operator === "--" ? -1 :
            matchedProps.update.operator === "+=" ? matchedProps.update.right :
            matchedProps.update.operator === "-=" ? {
                type: "UnaryExpression",
                prefix: true,
                operator: "-",
                argument: matchedProps.update.right
            } : 1;

        if (matchedProps.init.declarations) {
            var name = matchedProps.init.declarations[0].id.name;
            var from = matchedProps.init.declarations[0];
        } else {
            var name = matchedProps.init.left.name;
            var from = matchedProps.init.right;
        }

        var output = "<block type='controls_for'>" +
            "<field name='VAR'>" + name + "</field>" +
            (typeof by === "number" ?
            "<value name='BY'><block type='math_number'>" +
                "<field name='NUM'>" + by + "</field>" +
            "</block></value>" : "") +
            "</block>";

        var fromBlock = Blockly.util.convertAstNodeToBlocks(from);
        output = Blockly.util.appendTagDeep(output, fromBlock, 'value', 'FROM');
        var toBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.test.right);
        output = Blockly.util.appendTagDeep(output, toBlock, 'value', 'TO');

        if (typeof by !== "number") {
            var byBlock = Blockly.util.convertAstNodeToBlocks(by);
            output = Blockly.util.appendTagDeep(output, byBlock, 'value', 'BY');
        }

        return output;
    }
);

// Handle ++ and --
Blockly.util.registerBlockSignature(
    {
        type: "UpdateExpression",
        operator: patternMatch.var("operator"),
        argument: patternMatch.var("argument")
    },
    function(node, matchedProps) {
        var output;
        /*
        var type = matchedProps.operator === "++" ? "ADD": "MINUS";

        // TODO: Handle cases like foo.bar++

        var output = "<block type='math_arithmetic'>" +
            "<field name='OP'>" + type + "</field>" +
            "<value name='B'><block type='math_number'>" +
                "<field name='NUM'>1</field>" +
            "</block></value>" +
            "</block>";

        var leftBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.argument);
        output = Blockly.util.appendTagDeep(output, leftBlock, 'value', 'A');

        output = "<block type='variables_set'>" +
            "<field name='VAR'>" + matchedProps.argument.name + "</field>" +
            "<value name='VALUE'>" +
            output +
            "</value></block>";

        console.log(output)
        */

        if (matchedProps.argument.type === "Identifier") {
            var amount = (matchedProps.operator === "++" ? 1 : -1);
            output = "<block type='math_change'>" +
                "<field name='VAR'>" + matchedProps.argument.name + "</field>" +
                "<value name='DELTA'><block type='math_number'>" +
                    "<field name='NUM'>" + amount + "</field>" +
                "</block></value>" +
            "</block>";
        }

        return output;
    }
);

Blockly.JavaScript['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'DELTA',
      Blockly.JavaScript.ORDER_ADDITION) || '0';
  var varName = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + argument0 + ';\n';
};

// Handle += and -=
Blockly.util.registerBlockSignature(
    {
        type: "AssignmentExpression",
        operator: patternMatch.var("operator"),
        left: patternMatch.var("left"),
        right: patternMatch.var("right")
    },
    function(node, matchedProps) {
        var output;

        if (matchedProps.left.type !== "Identifier" ||
            (matchedProps.operator !== "+=" &&
            matchedProps.operator !== "-=")) {
            return;
        }

        if (matchedProps.right.type === "Literal") {
            var amount = (matchedProps.operator === "+=" ? 1 : -1) *
                matchedProps.right.value;
            output = "<block type='math_change'>" +
                "<field name='VAR'>" + matchedProps.left.name + "</field>" +
                "<value name='DELTA'><block type='math_number'>" +
                    "<field name='NUM'>" + amount + "</field>" +
                "</block></value>" +
            "</block>";
        } else {
            // TODO: Add more types
            var type = matchedProps.operator === "+=" ? "ADD": "MINUS";

            var output = "<block type='math_arithmetic'>" +
                "<field name='OP'>" + type + "</field>" +
                "</block>";

            var leftBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.left);
            var rightBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.right);
            output = Blockly.util.appendTagDeep(output, leftBlock, 'value', 'A');
            output = Blockly.util.appendTagDeep(output, rightBlock, 'value', 'B');

            output = "<block type='variables_set'>" +
                "<field name='VAR'>" + matchedProps.left.name + "</field>" +
                "<value name='VALUE'>" +
                output +
                "</value></block>";
        }

        return output;
    }
);

// Override so that === and !== are used
Blockly.JavaScript['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '===',
    'NEQ': '!==',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '===' || operator == '!==') ?
      Blockly.JavaScript.ORDER_EQUALITY : Blockly.JavaScript.ORDER_RELATIONAL;
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};