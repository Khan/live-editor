var fs = require("fs");

var Mapper = function(oldData) {
    this.log = [];

    oldData.forEach(function(e) {
        for (var prop in e) {
            if (prop in this) {
                this[prop].call(this, e);
                break;
            }
        }
    }.bind(this));
};

Mapper.prototype = {
    startLine: function(e) {
        this.log.push([e.time, "startLine", e.startLine[0], e.startLine[1]]);
    },

    drawLine: function(e) {
        this.log.push([e.time, "drawLine", e.drawLine[0], e.drawLine[1]]);
    },

    endLine: function(e) {
        this.log.push([e.time, "endLine"]);
    },

    setColor: function(e) {
        this.log.push([e.time, "setColor", e.setColor[0]]);
    },

    clear: function(e) {
        this.log.push([e.time, "clear"]);
    },

    move: function(e) {
        this.log.push([e.time, "move", e.move.x, e.move.y]);
    },

    over: function(e) {
        this.log.push([e.time, "over", e.over.x, e.over.y]);
    },

    out: function(e) {
        this.log.push([e.time, "out", e.out.x, e.out.y]);
    },

    down: function(e) {
        this.log.push([e.time, "down", e.down.x, e.down.y]);
    },

    up: function(e) {
        this.log.push([e.time, "up", e.up.x, e.up.y]);
    },

    insertText: function(e) {
        this.log.push([
            e.time,
            "insertText",
            e.insertText.start.row,
            e.insertText.start.column,
            e.insertText.end.row,
            e.insertText.end.column,
            e.text
        ]);
    },

    insertLines: function(e) {
        this.log.push([
            e.time,
            "insertLines",
            e.insertLines.start.row,
            e.insertLines.start.column,
            e.insertLines.end.row,
            e.insertLines.end.column,
            e.lines
        ]);
    },

    removeText: function(e) {
        this.log.push([
            e.time,
            "removeText",
            e.removeText.start.row,
            e.removeText.start.column,
            e.removeText.end.row,
            e.removeText.end.column
        ]);
    },

    removeLines: function(e) {
        this.log.push([
            e.time,
            "removeLines",
            e.removeLines.start.row,
            e.removeLines.start.column,
            e.removeLines.end.row,
            e.removeLines.end.column
        ]);
    },

    start: function(e) {
        var startRow = e.start.row;
        var startCol = e.start.column;
        var endRow = e.end ? e.end.row : e.start.row;
        var endCol = e.end ? e.end.column : e.start.column;

        var last = this.log[this.log.length - 1];

        if (last && last[1] === "select") {
            var lastEndRow = last[4] === undefined ? last[2] : last[4];
            var lastEndCol = last[5] === undefined ? last[3] : last[5];

            // Duplicate entry, just drop it
            if (last[2] === startRow && last[3] === startCol &&
                    lastEndRow === endRow && lastEndCol === endCol) {
                return;
            }
        }

        if (startRow !== endRow || startCol !== endCol) {
            this.log.push([
                e.time,
                "select",
                e.start.row,
                e.start.column,
                e.end.row,
                e.end.column
            ]);
        } else {
            this.log.push([
                e.time,
                "select",
                e.start.row,
                e.start.column
            ]);
        }
    },

    restart: function(e) {
        this.log.push([e.time, "restart"]);
    }
};

console.log("Reading in data...");
var input = require("./old-recording-data.json");
var output = {};

console.log("Mapping old data format to new format...");
for (var id in input) {
    if (input.hasOwnProperty(id)) {
        var mapped = new Mapper(input[id].commands);
        output[id] = input[id];
        output[id].commands = mapped.log;   
    }
}

console.log("Writing out data...");
fs.writeFileSync("./recording-data.json", JSON.stringify(output));