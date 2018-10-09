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

const liveEditorOpts = {
    el: document.getElementById("sample-live-editor"),
    code: code,
    width: 400,
    height: 400,
    editorHeight: "80%",
    autoFocus: true,
    workersDir: "../../build/workers/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    execFile: "output.html",
    jshintFile: "../../build/external/jshint/jshint.js",
};

const liveEditor = new LiveEditor(liveEditorOpts);

liveEditor.editor.on("change", function() {
    window.localStorage["test-code"] = liveEditor.editor.text();
});