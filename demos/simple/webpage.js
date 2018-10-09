import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("ace_webpage", AceEditor);

const code =
    window.localStorage["test-webpage-code"] ||
    "<!DOCTYPE html>\n<strong>Hello</strong>, world!";

const liveEditorOpts = {
    el: document.getElementById("sample-live-editor"),
    editorType: "ace_webpage",
    outputType: "webpage",
    code: code,
    width: 400,
    height: 400,
    editorHeight: "80%",
    autoFocus: true,
    workersDir: "../../build/workers/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    execFile: "output_webpage.html"
};

const liveEditor = new LiveEditor(liveEditorOpts);

liveEditor.editor.on("change", function() {
    window.localStorage["test-webpage-code"] = liveEditor.editor.text();
});