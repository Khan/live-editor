import LiveEditorOutput from "../../js/output/shared/output.js";
import SQLOutput from "../../js/output/sql/sql-output.js";

LiveEditorOutput.registerOutput("sql", SQLOutput);

new LiveEditorOutput({el: document.getElementById("live-editor-output")});