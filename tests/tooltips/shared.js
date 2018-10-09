import _ from "underscore";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import ScratchpadConfig from "../../js/shared/config.js";
import ScratchpadRecord from "../../js/shared/record.js";
import TooltipEngine from "../../js/ui/tooltip-engine.js";

var mockObject = function(sandbox, obj, mocks) {
    _.each(mocks, function(method) {
        obj[method] = sandbox.spy();
    });
    return obj;
};

export function uniqueEditor() {
    var elem = document.createElement('div');
    document.body.appendChild(elem);
    var ace = new AceEditor({ //Initializes TooltipEngine internally
        el: elem,
        autoFocus: true,
        config: new ScratchpadConfig({
            version: 3
        }),
        imagesDir: "../../build/images/",
        externalsDir: "",
        workersDir: "",
        record: new ScratchpadRecord(),
        type: "ace_pjs"
    });
    //ScratchpadAutosuggest.init(ace.editor);
    ace.editor.focus();
    ace.setSelection({
        start: {
            row: 0,
            column: 0
        },
        end: {
            row: 0,
            column: 0
        }
    });
    return ace;
};

window.ACE = uniqueEditor();
window.editor = ACE.editor;
window.TTE = ACE.tooltipEngine;

for (var TooltipName in TooltipEngine.prototype.classes) {
    var Tooltip = TooltipEngine.classes[TooltipName];
    Tooltip.prototype = Tooltip.oldPrototype;
}

var TTEoptions = {
    parent: TTE,
    editor: editor,
    imagesDir: "",
    record: {
        handlers: {}
    }
};

export function getMockedTooltip(sandbox, Tooltip, whiteList, blackList) {
    if (whiteList) {
        blackList = [];
        for (let method in Tooltip.prototype) {
            if (!_.contains(whiteList, method) && method !== "constructor") {
                blackList.push(method);
            }
        }
    }
    var oldPrototype = Tooltip.prototype;
    Tooltip.prototype = mockObject(sandbox, _.clone(Tooltip.prototype), blackList);
    Tooltip.prototype.render = function () {
        this.modal = {
            show: sandbox.spy(),
            selectImg: sandbox.spy()
        };
    };
    var tooltip = new Tooltip(TTEoptions);
    Tooltip.prototype = oldPrototype;
    return tooltip;
};

export function getTooltip(Tooltip) {
    var tooltip = new Tooltip(TTEoptions);
    return tooltip;
}

export function getTooltipRequestEvent(line, pre) {
    expect(line.slice(0, pre.length)).to.be.equal(pre);
    return {
        line: line,
        pre: pre,
        post: line.slice(pre.length),
        col: pre.length,
        row: 1,
        selections: [{
            start: {
                row: 1,
                column: pre.length
            },
            end: {
                row: 1,
                column: pre.length
            }
        }],
        stopPropagation: function() {
            this.propagationStopped = true;
        }
    };
};


export function testMockedTooltipDetection (sandbox, tooltip, line, pre) {
    var event = getTooltipRequestEvent(line, pre);
    tooltip.placeOnScreen = sandbox.spy();
    tooltip.detector(event);
    return !!tooltip.placeOnScreen.called;
};

export function testReplace(sandbox, tooltip, line, pre, updates, result) {
    var event = getTooltipRequestEvent(line, pre);
    var newLine = line;
    var oldReplace = editor.session.replace;
    editor.session.replace = sandbox.spy(function(range, newText) {
        newLine = applyReplace(newLine, range, newText);
    });

    tooltip.detector(event);
    for (var key in updates) {
        var update = updates[key];
        tooltip.updateText(update);
    }

    editor.session.replace = oldReplace;

    expect(newLine).to.be.equal(result);
}

function applyReplace(line, range, newText) {
    return line.slice(0, range.start.column) + newText + line.slice(range.end.column);
}

function typeChars(text) {
    _.each(text, function(c) {
        editor.onTextInput(c);
    });
}

/*
// This is for testing only
// This allows you to see the text sent to typeChars being typed
// into ace at a regular pace to see exactly what happens.
function typeChars(text) {
    if (text) {
        editor.onTextInput(text[0]);
        setTimeout(function(){ typeChars(text.slice(1)) }, 100);
    }
}
/**/

export function typeLine(text) {
    editor.gotoLine(Infinity);
    editor.onTextInput("\n");
    typeChars(text);
}

export function getLine() {
    return editor.session.getDocument().getLine(editor.selection.getCursor().row);
}

function dumpDocument() {
    console.log(JSON.stringify(editor.session.getDocument().$lines, null, 2));
}