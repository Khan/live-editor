/* eslint-disable */
import React from "react";
import ReactDOM from "react-dom";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("ace_pjs", AceEditor);

export function renderLiveEditor(extraProps) {
    const ref = React.createRef();

    const props = Object.assign({}, {
        ref,
        editorAutoFocus: true,
        outputType: "pjs",
        workersDir: "../../build/",
        externalsDir: "../../build/external/",
        imagesDir: "../../build/images/",
        soundsDir: "../../build/sounds/",
    }, extraProps || {});

    ReactDOM.render(React.createElement(LiveEditor, props),
        document.getElementById("live-editor"));
    return ref;
};

export function removeLiveEditor() {
    ReactDOM.unmountComponentAtNode(
        document.getElementById("live-editor"));
}

function getEditor(liveEditorRef) {
    return liveEditorRef.current.aceWrapperRef.current.editor;
}

export function typeLine(liveEditorRef, text) {
    const editor = getEditor(liveEditorRef);
    editor.gotoLine(Infinity);
    editor.onTextInput("\n");
    text.split('').forEach((c) => {
        editor.onTextInput(c);
    });
}

export function getLine(liveEditorRef) {
    const editor = getEditor(liveEditorRef);
    return editor.session.getDocument().getLine(
        editor.selection.getCursor().row);
}

export function getCurrentTooltip(liveEditorRef) {
    const state = liveEditorRef.current.aceWrapperRef.current.state;
    return state.tooltipName;
}

export function getTooltipEvent(line, pre, source) {
    expect(line.slice(0, pre.length)).to.be.equal(pre);
    return {
        line: line,
        pre: pre,
        post: line.slice(pre.length),
        col: pre.length,
        row: 1,
        timestamp: Date.now(),
        selections: [
            {
                start: {
                    row: 1,
                    column: pre.length,
                },
                end: {
                    row: 1,
                    column: pre.length,
                },
            },
        ],
        source: source && {
            action: "insert",
            lines: pre.substr(pre.length - 2),
        },
        stopPropagation: function() {
            this.propagationStopped = true;
        },
    };
}

export function clickEditor(leRef, row, col) {
    const aceEditor = leRef.current.aceWrapperRef.current.editor;
    const editorEl = aceEditor.container;
    const coords = aceEditor.renderer.textToScreenCoordinates(row, col);
    const evt = new MouseEvent('mousedown', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': coords.pageX,
        'clientY': coords.pageY
    });
   editorEl.dispatchEvent(evt);
}