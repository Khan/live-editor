import LiveEditorOutput from "../../js/output/shared/output.js";
import WebpageOutput from "../../js/output/webpage/webpage-output.js";

LiveEditorOutput.registerOutput("webpage", WebpageOutput);

new LiveEditorOutput({el: document.getElementById("live-editor-output")});