Blockly.p5js = {
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
    },
    fill: {
        url: "https://www.khanacademy.org/cs/fillr-g-b/839774957",
        title: "Fill Color",
        args: [
            { name: "color", type: "Colour", fill: "color(255,0,0)" }
        ]
    },
    text: {
        url: "https://www.khanacademy.org/cs/texttext-x-y/937624625",
        title: "Draw Text",
        args: [
            { name: "text", type: "String", fill: "", blank: "" },
            { name: "x", type: "Number", fill: 50, blank: 0 },
            { name: "y", type: "Number", fill: 50, blank: 0 }
        ]
    },
};

Object.keys(Blockly.p5js).forEach(function(name) {
    var props = Blockly.p5js[name];

    Blockly.Blocks["p5js_" + name] = {
        init: function() {
            this.setHelpUrl(props.url);
            this.setColour(160);
            this.appendDummyInput()
                .appendField(props.title);
            props.args.forEach(function(prop) {
                this.appendValueInput(prop.name)
                    .setCheck(prop.type)
                    .appendField(prop.name);
            }.bind(this));
            this.setInputsInline(props.args.length <= 4);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
        }
    };

    Blockly.JavaScript["p5js_" + name] = function(block) {
        var values = props.args.map(function(prop) {
            var val = Blockly.JavaScript.valueToCode(block, prop.name,
                Blockly.JavaScript.ORDER_NONE);

            if (val != null && val !== "") {
                return val;
            }

            val = ("blank" in prop ? prop.blank : prop.fill);

            if (typeof val === "string") {
                return '"' + val + '"';
            } else {
                return val;
            }
        });

        return name + "(" + values.join(",") + ");\n";
    };
});

var hexToColor = function(hex) {
    var nums = [hex.slice(1,3), hex.slice(3,5), hex.slice(5,7)];
    nums = nums.map(function(num) {
        return parseInt(num, 16);
    }).join(",");
    return "color(" + nums + ")";
};

Blockly.JavaScript.colour_picker = function(block) {
    return [hexToColor(block.getFieldValue("COLOUR")),
        Blockly.JavaScript.ORDER_ATOMIC];
};