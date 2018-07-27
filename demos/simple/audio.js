import React from "react";
import ReactDOM from "react-dom";

const AceEditor = require("../../js/editors/ace/editor-ace.js");
const LiveEditor = require("../../js/live-editor.js");
const data = require("./test-audio.json");

LiveEditor.registerEditor("ace_pjs", AceEditor);

var liveEditorProps = {
    code: data.init.code,
    version: data.init.configVersion,
    recordingMP3: data.mp3,
    recordingCommands: data.commands,
    recordingInit: data.init,
    width: 400,
    height: 400,
    outputType: "pjs",
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    execFile: "output.html",
    jshintFile: "../../build/external/jshint/jshint.js",
};

ReactDOM.render(React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"));
