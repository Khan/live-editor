import React from "react";
import ReactDOM from "react-dom";

const LiveEditorOutput = require("../../js/output/shared/output.js");
const SQLOutput = require("../../js/output/sql/sql-output.js");
LiveEditorOutput.registerOutput("sql", SQLOutput);

ReactDOM.render(React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"));