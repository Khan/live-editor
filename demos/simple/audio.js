import React from "react";
import ReactDOM from "react-dom";

import AceEditor from "../../js/editors/ace/editor-ace.js";
import LiveEditor from "../../js/live-editor.js";

import data from "./test-audio.json";

LiveEditor.registerEditor("ace_pjs", AceEditor);

const liveEditorProps = {
    code: data.init.code,
    version: data.init.configVersion,
    recordingMP3: data.mp3,
    recordingCommands: data.commands,
    recordingInit: data.init,
    youtubeUrl: "https://www.youtubeeducation.com/embed/D5HQw_GKOwo",
    outputExecFile: "output.html",
    outputWidth: 400,
    outputHeight: 400,
    outputType: "pjs",
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    jshintFile: "../../build/external/jshint/jshint.js",
};

ReactDOM.render(
    React.createElement(LiveEditor, liveEditorProps),
    document.getElementById("sample-live-editor"),
);
