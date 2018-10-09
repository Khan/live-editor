import TextareaEditor from "../../js/editors/textarea/editor-textarea.js";
import LiveEditor from "../../js/live-editor.js";

LiveEditor.registerEditor("textarea_document", TextareaEditor);

const defaultCode = "This is a simple writing project!";

const liveEditorOpts = {
    el: document.getElementById("sample-live-editor"),
    editorType: "textarea_document",
    outputType: "document",
    code: window.localStorage["test-document-code"] || defaultCode,
    width: 400,
    height: 400,
    editorHeight: "80%",
    autoFocus: true,
    workersDir: "../../build/workers/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/"
};

const liveEditor = new LiveEditor(liveEditorOpts);

liveEditor.editor.on("change", function() {
    window.localStorage["test-document-code"] = liveEditor.editor.text();
});