import React from "react";
import ReactDOM from "react-dom";

const LiveEditorOutput = require("../../js/output/shared/output.js");
const PJSOutput = require("../../js/output/pjs/pjs-output.js");
LiveEditorOutput.registerOutput("pjs", PJSOutput);

ReactDOM.render(React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"));