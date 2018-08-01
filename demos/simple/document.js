import React from "react";
import ReactDOM from "react-dom";

const TextareaEditor = require("../../js/editors/textarea/editor-textarea.js");
const LiveEditor = require("../../js/live-editor.js");
LiveEditor.registerEditor("textarea_document", TextareaEditor);

const defaultCode = "This is a simple writing project!";

const liveEditorProps = {
    editorHeight: "80%",
    editorType: "textarea_document",
    outputType: "document",
    code: window.localStorage["test-document-code"] || defaultCode,
    width: 400,
    height: 400,
    autoFocus: true,
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    onUserChanged: function(code) {
        window.localStorage["test-document-code"] = code;
    }
};

ReactDOM.render(React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"));