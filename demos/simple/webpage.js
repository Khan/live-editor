import React from "react";
import ReactDOM from "react-dom";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("ace_webpage", AceEditor);

const code = window.localStorage["test-webpage-code"] ||
    "<!DOCTYPE html>\n<strong>Hello</strong>, world!";

const liveEditorProps = {
    editorHeight: "80%",
    editorType: "ace_webpage",
    outputType: "webpage",
    code: code,
    width: 400,
    height: 400,
    autoFocus: true,
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    execFile: "output_webpage.html",
    jshintFile: "../../build/external/jshint/jshint.js",
    onUserChanged: function(code) {
        window.localStorage["test-webpage-code"] = code;
    }
};

ReactDOM.render(React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"));