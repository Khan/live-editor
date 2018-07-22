const AceEditor = require("../../js/editors/ace/editor-ace.js");
const LiveEditor = require("../../js/live-editor.js");
LiveEditor.registerEditor("ace_pjs", AceEditor);

var outputUrl = "output.html";
var useDebugger = false;
// TODO(kevinb7) conditionally load live-editor.debugger.js
// if (location.search.indexOf("debugger=true") !== -1) {
//     outputUrl += "?debugger=true";
//     useDebugger = true;
// }

var code = window.localStorage["test-code"] || "rect(10, 10, 100, 100);";

var search = location.search.substring(1);
var params = {};
search.split("&").forEach(function(param) {
    var tokens = param.split("=");
    params[tokens[0]] = tokens[1];
});

if (params.scratchpad) {
    var xhr = new XMLHttpRequest();
    var baseUrl = "https://www.khanacademy.org/api/internal/scratchpads/";
    xhr.open("GET", baseUrl + params.scratchpad, false);
    xhr.addEventListener("load", function() {
        var scratchpad = JSON.parse(this.responseText);
        code = scratchpad.revision.code;
        var h1 = document.querySelector('h1');
        h1.innerText = scratchpad.title;
    });
    xhr.send();
}

var liveEditor = new LiveEditor({
    el: document.getElementById("sample-live-editor"),
    code: code,
    width: 400,
    height: 400,
    editorHeight: "80%",
    autoFocus: true,
    workersDir: "../../build/",
    externalsDir: "../../build/external/",
    imagesDir: "../../build/images/",
    soundsDir: "../../build/sounds/",
    execFile: outputUrl,
    jshintFile: "../../build/external/jshint/jshint.js",
    useDebugger: useDebugger
});
liveEditor.editor.on("change", function() {
    window.localStorage["test-code"] = liveEditor.editor.text();
});
//ScratchpadAutosuggest.init(liveEditor.editor.editor);