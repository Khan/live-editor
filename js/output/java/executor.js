// Use this if we want to send the console back to the live editor.
// For the time being, it will just use console.log by default
/*
var $stdoutBuffer = "";
function $rt_putStdout(ch) {
    if (ch === 0xA) {
        window.parent.postMessage(JSON.stringify({ command: "stdout", line: $rt_stdoutBuffer }), "*");
        $rt_stdoutBuffer = "";
    } else {
        $rt_stdoutBuffer += String.fromCharCode(ch);
    }
}
*/

(function() {

    function appendFile(file, callback, errorCallback) {
        console.log("Adding Script File...");

        var script = document.createElement("script");
        script.onload = function () {
            callback();
        };
        script.onerror = function () {
            errorCallback("failed to load script" + fileName);
        };
        script.text = file;
        document.body.appendChild(script);
    }

    function start() {
        window.parent.postMessage(JSON.stringify({
            command: "ready"
        }), "*");
    }

    const executor = {
        init: function() {
            window.addEventListener("message", function (event) {
                let message = undefined;
                try {
                    message = JSON.parse(event.data);
                } catch(e) {
                }

                if (!message || message.command !== "code") {
                    return;
                }

                appendFile(message.codeToExecute + "\nmain();\n", function () {
                    event.source.postMessage(JSON.stringify({
                        status: "loaded"
                    }), "*");
                }, function (error) {
                    event.source.postMessage(JSON.stringify({
                        status: "failed",
                        errorMessage: error
                    }), "*");
                });
            });
        }
    };

    window.javaExecutor = executor;
})();
