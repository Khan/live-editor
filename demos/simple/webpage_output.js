import React from "react";
import ReactDOM from "react-dom";

const LiveEditorOutput = require("../../js/output/shared/output.js");
const WebpageOutput = require("../../js/output/webpage/webpage-output.js");
LiveEditorOutput.registerOutput("webpage", WebpageOutput);

ReactDOM.render(React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"));