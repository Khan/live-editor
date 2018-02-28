(function() {
    var $stdoutBuffer = "";
    window.$rt_putStdout = function(ch) {
        if (ch === 0xA) {
            console.log(`[System.out] ${$rt_stdoutBuffer}`);
            if (window.processing) {
                window.processing.println($rt_stdoutBuffer);
            }
            $rt_stdoutBuffer = "";
        } else {
            $rt_stdoutBuffer += String.fromCharCode(ch);
        }
    };

    function appendFile(file, callback, errorCallback) {
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
