import React from "react";
import ReactDOM from "react-dom";

import LiveEditorOutput from "../../js/output/shared/output.js";
import PJSOutput from "../../js/output/pjs/pjs-output.js";

LiveEditorOutput.registerOutput("pjs", PJSOutput);

ReactDOM.render(React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"));