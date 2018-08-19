import React from "react";
import ReactDOM from "react-dom";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("ace_webpage", AceEditor);

const code =
    window.localStorage["test-webpage-code"] ||
    "<!DOCTYPE html>\n<strong>Hello</strong>, world!";

const liveEditorProps = {
    editorHeight: "80%",
    editorType: "ace_webpage",
    outputType: "webpage",
    code: code,
    outputWidth: 400,
    outputHeight: 400,
    editorAutoFocus: true,
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    outputExecFile: "output_webpage.html",
    jshintFile: "../../build/external/jshint/jshint.js",
    onEditorUserChange: function(code) {
        window.localStorage["test-webpage-code"] = code;
    },
};

ReactDOM.render(
    React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"),
);
