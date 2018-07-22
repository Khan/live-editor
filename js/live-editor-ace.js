const AceEditor = require("./editors/ace/editor-ace.js");
const LiveEditor = require("./live-editor.js");

LiveEditor.registerEditor("ace_pjs", AceEditor);
LiveEditor.registerEditor("ace_webpage", AceEditor);
LiveEditor.registerEditor("ace_sql", AceEditor);