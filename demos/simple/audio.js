import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

import data from "./test-audio.json";

LiveEditor.registerEditor("ace_pjs", AceEditor);

const liveEditorOpts = {
    el: document.getElementById("sample-live-editor"),
    code: data.init.code,
    version: data.init.configVersion,
    recordingMP3: data.mp3,
    recordingCommands: data.commands,
    recordingInit: data.init,
    width: 400,
    height: 400,
    workersDir: "../../build/workers/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    execFile: "output.html",
    jshintFile: "../../build/external/jshint/jshint.js"
};

const liveEditor = new LiveEditor(liveEditorOpts);

liveEditor.editor.on("change", function() {
    window.localStorage["test-code"] = liveEditor.editor.text();
});