import LiveEditorOutput from "../../js/output/shared/output.js";
import PJSOutput from "../../js/output/pjs/pjs-output.js";

LiveEditorOutput.registerOutput("pjs", PJSOutput);

new LiveEditorOutput({el: document.getElementById("live-editor-output")});