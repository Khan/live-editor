import React from "react";
import ReactDOM from "react-dom";

import LiveEditorOutput from "../../js/output/shared/output.js";
import SQLOutput from "../../js/output/sql/sql-output.js";

LiveEditorOutput.registerOutput("sql", SQLOutput);

ReactDOM.render(
    React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"),
);
