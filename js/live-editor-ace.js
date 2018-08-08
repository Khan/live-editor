import AceEditor from "./editors/ace/editor-ace.js";
import LiveEditor from "./live-editor.js";

LiveEditor.registerEditor("ace_pjs", AceEditor);
LiveEditor.registerEditor("ace_webpage", AceEditor);
LiveEditor.registerEditor("ace_sql", AceEditor);

window.LiveEditor = LiveEditor;