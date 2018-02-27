(function () {

    var worker = undefined;
    var incrementalId = 1;
    var pendingResponses = [];

    function postMessage(command, props) {
        var message = Object.assign({}, {
            id: (incrementalId++).toString(),
            command: command
        }, props);

        worker.postMessage(message);

        return message;
    }

    function waitForResponse(message, command, progress) {
        var result = new Promise(function (resolve) {
            pendingResponses.push({
                message: message,
                completionCommand: command,
                resolve: resolve,
                progressCallback: progress
            });
        });

        return result;
    }

    function isWorkerMessage(data) {
        return 'id' in data && typeof data.id === 'string';
    }

    function receiveMessageFromWorker(event) {
        if (!isWorkerMessage(event.data)) {
            return;
        }

        var message = event.data;

        var pending = pendingResponses.find(function (response) {
            return response.message.id === message.id;
        });

        if (pending) {
            var completed = pending.completionCommand === message.command;

            if (pending.progressCallback) {
                pending.progressCallback(message);
            }

            if (completed) {
                pending.resolve(message);

                pendingResponses = pendingResponses.filter(function (response) {
                    return response.message.id !== message.id;
                });
            }
        }
    }

    function receiveMessageFromWindow(event) {
        var messageString = event.data;

        if (typeof messageString !== 'string') {
            return;
        }

        try {
            var message = JSON.parse(messageString);
            if (message.command === 'stdout') {
                console.log(message.line);
            }
        } catch (e) {}
    }

    function reportProgress(data) {
        switch (data.command) {
            case 'phase':
                // the phase of compilation...
                // eg DEPENDENCY_ANALYSIS, LINKING, OPTIMIZATION
                console.log('');
                console.log('*********************************');
                console.log('Compile Phase: ' + data.phase);
                break;

            case 'compilation-complete':
                // Don't worry about this now.  The promise resolution will take
                // care of this
                break;

            case 'compiler-diagnostic':
                // for compiler errors
                reportCompilerDiagnostic(data);
                break;

            case 'diagnostic':
                // for things wrong with the code, not compilation diagnostic
                // eg "Main method not found"
                reportDiagnostic(data);
                break;

            default:
                console.log('Unrecognized command: ' + data.command);
                break;
        }
    }

    function reportCompilerDiagnostic(data) {
        var errorPrefix = '';
        var detail = '';

        switch (data.kind) {
            case 'ERROR':
                errorPrefix = 'ERROR';
                break;
            case 'WARNING':
            case 'MANDATORY_WARNING':
                errorPrefix = 'WARNING';
                break;

            default:
                errorPrefix = 'UNKNOWN(' + data.kind + ')';
                break;
        }

        if (data.object) {
            detail = 'at ' + data.object.name;

            if (data.lineNumber >= 0) {
                detail += '(' + (data.lineNumber + 1) + ':' + (data.columnNumber + 1) + ')';
            }
        }

        console.log(errorPrefix + ' ' + detail + ' ' + data.message);
    }

    function reportDiagnostic(data) {
        var diagnosticMessage = data.severity + ' ';

        if (data.fileName) {
            diagnosticMessage += 'at ' + data.fileName;

            if (data.lineNumber >= 0) {
                diagnosticMessage += ':' + (data.lineNumber + 1);
            }
        }

        console.log(diagnosticMessage + ' ' + data.text);
    }

    var engine = {
        init: function init() {
            if (worker) {
                return;
            }

            worker = new Worker('/build/workers/java/worker.js');

            worker.addEventListener('message', receiveMessageFromWorker);
            window.addEventListener('message', receiveMessageFromWindow);

            var message = postMessage('load-classlib', {
                url: 'classlib.txt'
            });

            return waitForResponse(message, 'ok').then(function (result) {
                if (result.command !== 'ok') {
                    console.log('Could not load standard library: ', result);
                    throw new Error('Could not load standard library');
                }

                console.log('Standard library initialized!!!');
            });
        },

        compile: function compile(code) {
            var message = postMessage('compile', { text: code });

            return waitForResponse(message, 'compilation-complete', reportProgress).then(function (result) {
                if (result.status !== 'successful') {
                    throw new Error('Failed to compile');
                }

                return result.script;
            });
        }
    };

    window.javaEngine = engine;
})();
window.JavaOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        var _this = this;

        this.initPromise = window.javaEngine.init().then(function () {
            return _this.engineInitialized = true;
        });

        this.config = options.config;
        this.output = options.output;
        this.tester = null;
        this.engineInitialized = false;
        this.render();
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe id='output_iframe'>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {},

    lint: function lint(userCode, skip) {
        // TODO(hannah): Implement!
        var deferred = $.Deferred();
        deferred.resolve({
            errors: [],
            warnings: []
        });
        return deferred;
    },

    flattenError: function flattenError(plainError, error, base) {
        return "";
    },

    getLintMessage: function getLintMessage(plainError) {
        return "";
    },

    initTests: function initTests(validate) {
        return;
    },

    test: function test(userCode, tests, errors, callback) {},

    postProcessing: function postProcessing(oldPageTitle) {},

    runCode: function runCode(codeObj, callback) {
        console.log("[Debug] Compiling Code", codeObj);

        this.initPromise.then(function () {
            window.javaEngine.compile(codeObj).then(function (transpiled) {
                console.log(transpiled);
            });
        });
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("java", JavaOutput);
