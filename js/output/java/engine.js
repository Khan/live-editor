(function() {

    let worker = undefined;
    let incrementalId = 1;
    let pendingResponses = [];

    function postMessage(command: string, props: any): Message {
        const message = Object.assign({}, {
            id: (incrementalId++).toString(),
            command
        }, props);

        worker.postMessage(message);

        return message;
    }

    function waitForResponse(message, command, progress){
        const result = new Promise((resolve) => {
            pendingResponses.push({
                message,
                completionCommand: command,
                resolve,
                progressCallback: progress,
            });
        });

        return result;
    }

    function isWorkerMessage(data: any) {
        return 'id' in data && typeof data.id === 'string';
    }

    function receiveMessageFromWorker(event: any) {
        if (!isWorkerMessage(event.data)) {
            return;
        }

        const message = event.data;

        const pending = pendingResponses.find(
            response => response.message.id === message.id);

        if (pending) {
            const completed = pending.completionCommand === message.command;

            if (pending.progressCallback) {
                pending.progressCallback(message);
            }

            if (completed) {
                pending.resolve(message);

                pendingResponses = pendingResponses.filter(
                    response => response.message.id !== message.id);
            }
        }
    }

    function receiveMessageFromWindow(event: any) {
        const messageString = event.data;

        if ((typeof messageString) !== "string") {
            return;
        }

        try {
            const message = JSON.parse(messageString);
            if (message.command === "stdout") {
                console.log(message.line);
            }
        } catch (e) {
        }
    }

    function reportProgress(data: any) {
        switch (data.command) {
            case "phase":
                // the phase of compilation...
                // eg DEPENDENCY_ANALYSIS, LINKING, OPTIMIZATION
                console.log("");
                console.log("*********************************");
                console.log("Compile Phase: " + data.phase);
                break;

            case "compilation-complete":
                // Don't worry about this now.  The promise resolution will take
                // care of this
                break;

            case "compiler-diagnostic":
                // for compiler errors
                reportCompilerDiagnostic(data);
                break;

            case "diagnostic":
                // for things wrong with the code, not compilation diagnostic
                // eg "Main method not found"
                reportDiagnostic(data);
                break;

            default:
                console.log("Unrecognized command: " + data.command);
                break;
        }
    }

    function reportCompilerDiagnostic(data: any) {
        let errorPrefix = "";
        let detail = "";

        switch (data.kind) {
            case "ERROR":
                errorPrefix = "ERROR";
                break;
            case "WARNING":
            case "MANDATORY_WARNING":
                errorPrefix = "WARNING";
                break;

            default:
                errorPrefix = `UNKNOWN(${data.kind})`
                break;
        }

        if (data.object) {
            detail = `at ${data.object.name}`;

            if (data.lineNumber >= 0) {
                detail += `(${data.lineNumber + 1}:${data.columnNumber + 1})`;
            }
        }

        console.log(`${errorPrefix} ${detail} ${data.message}`);
    }

    function reportDiagnostic(data: any) {
        let diagnosticMessage = `${data.severity} `;

        if (data.fileName) {
            diagnosticMessage += `at ${data.fileName}`;

            if (data.lineNumber >= 0) {
                diagnosticMessage += `:${data.lineNumber + 1}`;
            }
        }

        console.log(`${diagnosticMessage} ${data.text}`);
    }

    const engine = {
        init: function() {
            if (worker) {
                return;
            }

            worker = new Worker("/build/workers/java/worker.js");

            worker.addEventListener("message", receiveMessageFromWorker);
            window.addEventListener("message", receiveMessageFromWindow);

            const message = postMessage("load-classlib", {
                url: "classlib.txt",
            });

            return waitForResponse(message, "ok")
                .then(result => {
                    if (result.command !== "ok") {
                        console.log("Could not load standard library: ", result);
                        throw new Error("Could not load standard library");
                    }

                    console.log("Standard library initialized!!!");
                });
        },

        compile: function(code) {
            const message = postMessage("compile", { text: code });

            return waitForResponse(message, "compilation-complete", reportProgress)
                .then(result => {
                    if (result.status !== "successful") {
                        throw new Error("Failed to compile");
                    }

                    return result.script;
                });
        },

        execute: function(transpiled) {
            const codeCommand = {
                command: "code",
                codeToExecute: transpiled
            };

            window.postMessage(JSON.stringify(codeCommand), "*");
        }
    };

    window.javaEngine = engine;
})();
