import React from "react";
import ReactDOM from "react-dom";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("ace_pjs", AceEditor);

let code = window.localStorage["test-code"] || "rect(10, 10, 100, 100);";

const search = location.search.substring(1);
const params = {};
search.split("&").forEach(function(param) {
    const tokens = param.split("=");
    params[tokens[0]] = tokens[1];
});

if (params.scratchpad) {
    const xhr = new XMLHttpRequest();
    const baseUrl = "https://www.khanacademy.org/api/internal/scratchpads/";
    xhr.open("GET", baseUrl + params.scratchpad, false);
    xhr.addEventListener("load", function() {
        const scratchpad = JSON.parse(this.responseText);
        code = scratchpad.revision.code;
        const h1 = document.querySelector("h1");
        h1.innerText = scratchpad.title;
    });
    xhr.send();
}

const liveEditorProps = {
    code: code,
    editorHeight: "50%",
    editorAutoFocus: true,
    outputExecFile: "output.html",
    outputHeight: 400,
    outputWidth: 400,
    outputType: "pjs",
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    jshintFile: "../../build/external/jshint/jshint.js",
    onEditorUserChange: function(code) {
        window.localStorage["test-code"] = code;
    },
};

ReactDOM.render(
    React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"),
);
