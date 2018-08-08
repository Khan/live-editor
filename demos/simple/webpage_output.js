import React from "react";
import ReactDOM from "react-dom";

import LiveEditorOutput from "../../js/output/shared/output.js";
import WebpageOutput from "../../js/output/webpage/webpage-output.js";

LiveEditorOutput.registerOutput("webpage", WebpageOutput);

ReactDOM.render(React.createElement(LiveEditorOutput, {}),
    document.getElementById("live-editor-output"));