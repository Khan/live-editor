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
        },

        execute: function execute(transpiled) {
            var codeCommand = {
                command: 'code',
                codeToExecute: transpiled
            };

            window.postMessage(JSON.stringify(codeCommand), '*');
        }
    };

    window.javaEngine = engine;
})();
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

(function () {

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

    var executor = {
        init: function init() {
            window.addEventListener("message", function (event) {
                var message = undefined;
                try {
                    message = JSON.parse(event.data);
                } catch (e) {}

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

    render: function render() {},

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
                console.log("[Debug] Executing code");

                window.javaEngine.execute(transpiled);
            });
        });
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("java", JavaOutput);

//this.$el.empty();
//this.$frame = $("<iframe id='output_iframe'>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show()[0];
//this.frameDoc = this.$frame.contentDocument;
/*
 *  Copyright 2013 Alexey Andreev.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
"use strict";
var $rt_global = this;
var $rt_lastObjectId = 1;
function $rt_nextId() {
    var current = $rt_lastObjectId;
    var next = (current + 1) | 0;
    if (next === 0) {
        next = (next + 1) | 0;
    }
    $rt_lastObjectId = next;
    return current;
}
function $rt_compare(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}
function $rt_isInstance(obj, cls) {
    return obj !== null && !!obj.constructor.$meta && $rt_isAssignable(obj.constructor, cls);
}
function $rt_isAssignable(from, to) {
    if (from === to) {
        return true;
    }
    var supertypes = from.$meta.supertypes;
    for (var i = 0; i < supertypes.length; i = (i + 1) | 0) {
        if ($rt_isAssignable(supertypes[i], to)) {
            return true;
        }
    }
    return false;
}
function $rt_createArray(cls, sz) {
    var data = new Array(sz);
    var arr = new ($rt_arraycls(cls))(data);
    if (sz > 0) {
        var i = 0;
        do {
            data[i] = null;
            i = (i + 1) | 0;
        } while (i < sz);
    }
    return arr;
}
function $rt_wrapArray(cls, data) {
    return new ($rt_arraycls(cls))(data);
}
function $rt_createUnfilledArray(cls, sz) {
    return new ($rt_arraycls(cls))(new Array(sz));
}
function $rt_createLongArray(sz) {
    var data = new Array(sz);
    var arr = new ($rt_arraycls($rt_longcls()))(data);
    for (var i = 0; i < sz; i = (i + 1) | 0) {
        data[i] = Long_ZERO;
    }
    return arr;
}
var $rt_createNumericArray;
var $rt_createCharArray;
var $rt_createByteArray;
var $rt_createShortArray;
var $rt_createIntArray;
var $rt_createBooleanArray;
var $rt_createFloatArray;
var $rt_createDoubleArray;
if (typeof 'ArrayBuffer' !== 'undefined') {
    $rt_createNumericArray = function (cls, nativeArray) {
        return new ($rt_arraycls(cls))(nativeArray);
    };
    $rt_createCharArray = function (sz) {
        return $rt_createNumericArray($rt_charcls(), new Uint16Array(sz));
    };
    $rt_createByteArray = function (sz) {
        return $rt_createNumericArray($rt_bytecls(), new Int8Array(sz));
    };
    $rt_createShortArray = function (sz) {
        return $rt_createNumericArray($rt_shortcls(), new Int16Array(sz));
    };
    $rt_createIntArray = function (sz) {
        return $rt_createNumericArray($rt_intcls(), new Int32Array(sz));
    };
    $rt_createBooleanArray = function (sz) {
        return $rt_createNumericArray($rt_booleancls(), new Int8Array(sz));
    };
    $rt_createFloatArray = function (sz) {
        return $rt_createNumericArray($rt_floatcls(), new Float32Array(sz));
    };
    $rt_createDoubleArray = function (sz) {
        return $rt_createNumericArray($rt_doublecls(), new Float64Array(sz));
    };
} else {
    $rt_createNumericArray = function (cls, sz) {
        var data = new Array(sz);
        var arr = new ($rt_arraycls(cls))(data);
        for (var i = 0; i < sz; i = (i + 1) | 0) {
            data[i] = 0;
        }
        return arr;
    };
    $rt_createByteArray = function (sz) { return $rt_createNumericArray($rt_bytecls(), sz); };
    $rt_createShortArray = function (sz) { return $rt_createNumericArray($rt_shortcls(), sz); };
    $rt_createIntArray = function (sz) { return $rt_createNumericArray($rt_intcls(), sz); };
    $rt_createBooleanArray = function (sz) { return $rt_createNumericArray($rt_booleancls(), sz); };
    $rt_createFloatArray = function (sz) { return $rt_createNumericArray($rt_floatcls(), sz); };
    $rt_createDoubleArray = function (sz) { return $rt_createNumericArray($rt_doublecls(), sz); };
    $rt_createCharArray = function (sz) { return $rt_createNumericArray($rt_charcls(), sz); }
}
function $rt_arraycls(cls) {
    var result = cls.$array;
    if (result === null) {
        var arraycls = function (data) {
            this.data = data;
            this.$id$ = 0;
        };
        arraycls.prototype = new ($rt_objcls())();
        arraycls.prototype.constructor = arraycls;
        arraycls.prototype.toString = function () {
            var str = "[";
            for (var i = 0; i < this.data.length; ++i) {
                if (i > 0) {
                    str += ", ";
                }
                str += this.data[i].toString();
            }
            str += "]";
            return str;
        };
        $rt_setCloneMethod(arraycls.prototype, function () {
            var dataCopy;
            if ('slice' in this.data) {
                dataCopy = this.data.slice();
            } else {
                dataCopy = new this.data.constructor(this.data.length);
                for (var i = 0; i < dataCopy.length; ++i) {
                    dataCopy[i] = this.data[i];
                }
            }
            return new arraycls(dataCopy);
        });
        var name = "[" + cls.$meta.binaryName;
        arraycls.$meta = {
            item: cls, supertypes: [$rt_objcls()], primitive: false, superclass: $rt_objcls(),
            name: name, binaryName: name, enum: false
        };
        arraycls.classObject = null;
        arraycls.$array = null;
        result = arraycls;
        cls.$array = arraycls;
    }
    return result;
}
function $rt_createcls() {
    return {
        $array: null,
        classObject: null,
        $meta: {
            supertypes: [],
            superclass: null
        }
    };
}
function $rt_createPrimitiveCls(name, binaryName) {
    var cls = $rt_createcls();
    cls.$meta.primitive = true;
    cls.$meta.name = name;
    cls.$meta.binaryName = binaryName;
    cls.$meta.enum = false;
    cls.$meta.item = null;
    return cls;
}
var $rt_booleanclsCache = null;
function $rt_booleancls() {
    if ($rt_booleanclsCache === null) {
        $rt_booleanclsCache = $rt_createPrimitiveCls("boolean", "Z");
    }
    return $rt_booleanclsCache;
}
var $rt_charclsCache = null;
function $rt_charcls() {
    if ($rt_charclsCache === null) {
        $rt_charclsCache = $rt_createPrimitiveCls("char", "C");
    }
    return $rt_charclsCache;
}
var $rt_byteclsCache = null;
function $rt_bytecls() {
    if ($rt_byteclsCache === null) {
        $rt_byteclsCache = $rt_createPrimitiveCls("byte", "B");
    }
    return $rt_byteclsCache;
}
var $rt_shortclsCache = null;
function $rt_shortcls() {
    if ($rt_shortclsCache === null) {
        $rt_shortclsCache = $rt_createPrimitiveCls("short", "S");
    }
    return $rt_shortclsCache;
}
var $rt_intclsCache = null;
function $rt_intcls() {
    if ($rt_intclsCache === null) {
        $rt_intclsCache = $rt_createPrimitiveCls("int", "I");
    }
    return $rt_intclsCache;
}
var $rt_longclsCache = null;
function $rt_longcls() {
    if ($rt_longclsCache === null) {
        $rt_longclsCache = $rt_createPrimitiveCls("long", "J");
    }
    return $rt_longclsCache;
}
var $rt_floatclsCache = null;
function $rt_floatcls() {
    if ($rt_floatclsCache === null) {
        $rt_floatclsCache = $rt_createPrimitiveCls("float", "F");
    }
    return $rt_floatclsCache;
}
var $rt_doubleclsCache = null;
function $rt_doublecls() {
    if ($rt_doubleclsCache === null) {
        $rt_doubleclsCache = $rt_createPrimitiveCls("double", "D");
    }
    return $rt_doubleclsCache;
}
var $rt_voidclsCache = null;
function $rt_voidcls() {
    if ($rt_voidclsCache === null) {
        $rt_voidclsCache = $rt_createPrimitiveCls("void", "V");
    }
    return $rt_voidclsCache;
}
function $rt_init(cls, constructor, args) {
    var obj = new cls();
    cls.prototype[constructor].apply(obj, args);
    return obj;
}
function $rt_throw(ex) {
    throw $rt_exception(ex);
}
function $rt_exception(ex) {
    var err = ex.$jsException;
    if (!err) {
        err = new Error("Java exception thrown");
        err.$javaException = ex;
        ex.$jsException = err;
    }
    return err;
}
function $rt_createMultiArray(cls, dimensions) {
    var first = 0;
    for (var i = dimensions.length - 1; i >= 0; i = (i - 1) | 0) {
        if (dimensions[i] == 0) {
            first = i;
            break;
        }
    }
    if (first > 0) {
        for (i = 0; i < first; i = (i + 1) | 0) {
            cls = $rt_arraycls(cls);
        }
        if (first == dimensions.length - 1) {
            return $rt_createArray(cls, dimensions[first]);
        }
    }
    var arrays = new Array($rt_primitiveArrayCount(dimensions, first));
    var firstDim = dimensions[first] | 0;
    for (i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createArray(cls, firstDim);
    }
    return $rt_createMultiArrayImpl(cls, arrays, dimensions, first);
}
function $rt_createByteMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_bytecls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createByteArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_bytecls(), arrays, dimensions);
}
function $rt_createCharMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_charcls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createCharArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_charcls(), arrays, dimensions, 0);
}
function $rt_createBooleanMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_booleancls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createBooleanArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_booleancls(), arrays, dimensions, 0);
}
function $rt_createShortMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_shortcls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createShortArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_shortcls(), arrays, dimensions, 0);
}
function $rt_createIntMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_intcls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createIntArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_intcls(), arrays, dimensions, 0);
}
function $rt_createLongMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_longcls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createLongArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_longcls(), arrays, dimensions, 0);
}
function $rt_createFloatMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_floatcls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createFloatArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_floatcls(), arrays, dimensions, 0);
}
function $rt_createDoubleMultiArray(dimensions) {
    var arrays = new Array($rt_primitiveArrayCount(dimensions, 0));
    if (arrays.length == 0) {
        return $rt_createMultiArray($rt_doublecls(), dimensions);
    }
    var firstDim = dimensions[0] | 0;
    for (var i = 0; i < arrays.length; i = (i + 1) | 0) {
        arrays[i] = $rt_createDoubleArray(firstDim);
    }
    return $rt_createMultiArrayImpl($rt_doublecls(), arrays, dimensions, 0);
}
function $rt_primitiveArrayCount(dimensions, start) {
    var val = dimensions[start + 1] | 0;
    for (var i = start + 2; i < dimensions.length; i = (i + 1) | 0) {
        val = (val * (dimensions[i] | 0)) | 0;
        if (val == 0) {
            break;
        }
    }
    return val;
}
function $rt_createMultiArrayImpl(cls, arrays, dimensions, start) {
    var limit = arrays.length;
    for (var i = (start + 1) | 0; i < dimensions.length; i = (i + 1) | 0) {
        cls = $rt_arraycls(cls);
        var dim = dimensions[i];
        var index = 0;
        var packedIndex = 0;
        while (index < limit) {
            var arr = $rt_createUnfilledArray(cls, dim);
            for (var j = 0; j < dim; j = (j + 1) | 0) {
                arr.data[j] = arrays[index];
                index = (index + 1) | 0;
            }
            arrays[packedIndex] = arr;
            packedIndex = (packedIndex + 1) | 0;
        }
        limit = packedIndex;
    }
    return arrays[0];
}
function $rt_assertNotNaN(value) {
    if (typeof value === 'number' && isNaN(value)) {
        throw "NaN";
    }
    return value;
}
var $rt_stdoutBuffer = "";
function $rt_putStdout(ch) {
    if (ch == 0xA) {
        if (console) {
            console.info($rt_stdoutBuffer);
        }
        $rt_stdoutBuffer = "";
    } else {
        $rt_stdoutBuffer += String.fromCharCode(ch);
    }
}
var $rt_stderrBuffer = "";
function $rt_putStderr(ch) {
    if (ch == 0xA) {
        if (console) {
            console.info($rt_stderrBuffer);
        }
        $rt_stderrBuffer = "";
    } else {
        $rt_stderrBuffer += String.fromCharCode(ch);
    }
}
function $rt_metadata(data) {
    for (var i = 0; i < data.length; i += 8) {
        var cls = data[i];
        cls.$meta = {};
        var m = cls.$meta;
        m.name = data[i + 1];
        m.binaryName = "L" + m.name + ";";
        var superclass = data[i + 2];
        m.superclass = superclass !== 0 ? superclass : null;
        m.supertypes = data[i + 3];
        if (m.superclass) {
            m.supertypes.push(m.superclass);
            cls.prototype = new m.superclass();
        } else {
            cls.prototype = {};
        }
        var flags = data[i + 4];
        m.enum = (flags & 16) != 0;
        m.flags = flags;
        m.primitive = false;
        m.item = null;
        cls.prototype.constructor = cls;
        cls.classObject = null;

        m.accessLevel = data[i + 5];

        var clinit = data[i + 6];
        cls.$clinit = clinit !== 0 ? clinit : function () { };

        var virtualMethods = data[i + 7];
        for (var j = 0; j < virtualMethods.length; j += 2) {
            var name = virtualMethods[j];
            var func = virtualMethods[j + 1];
            if (typeof name === 'string') {
                name = [name];
            }
            for (var k = 0; k < name.length; ++k) {
                cls.prototype[name[k]] = func;
            }
        }

        cls.$array = null;
    }
}
function $rt_threadStarter(f) {
    return function () {
        var args = Array.prototype.slice.apply(arguments);
        $rt_startThread(function () {
            f.apply(this, args);
        });
    }
}
function $rt_mainStarter(f) {
    return function (args) {
        if (!args) {
            args = [];
        }
        var javaArgs = $rt_createArray($rt_objcls(), args.length);
        for (var i = 0; i < args.length; ++i) {
            javaArgs.data[i] = $rt_str(args[i]);
        }
        $rt_threadStarter(f)(javaArgs);
    };
}
var $rt_stringPool_instance;
function $rt_stringPool(strings) {
    $rt_stringPool_instance = new Array(strings.length);
    for (var i = 0; i < strings.length; ++i) {
        $rt_stringPool_instance[i] = $rt_intern($rt_str(strings[i]));
    }
}
function $rt_s(index) {
    return $rt_stringPool_instance[index];
}
function TeaVMThread(runner) {
    this.status = 3;
    this.stack = [];
    this.suspendCallback = null;
    this.runner = runner;
    this.attribute = null;
    this.completeCallback = null;
}
TeaVMThread.prototype.push = function () {
    for (var i = 0; i < arguments.length; ++i) {
        this.stack.push(arguments[i]);
    }
    return this;
};
TeaVMThread.prototype.s = TeaVMThread.prototype.push;
TeaVMThread.prototype.pop = function () {
    return this.stack.pop();
};
TeaVMThread.prototype.l = TeaVMThread.prototype.pop;
TeaVMThread.prototype.isResuming = function () {
    return this.status == 2;
};
TeaVMThread.prototype.isSuspending = function () {
    return this.status == 1;
};
TeaVMThread.prototype.suspend = function (callback) {
    this.suspendCallback = callback;
    this.status = 1;
};
TeaVMThread.prototype.start = function (callback) {
    if (this.status != 3) {
        throw new Error("Thread already started");
    }
    if ($rt_currentNativeThread !== null) {
        throw new Error("Another thread is running");
    }
    this.status = 0;
    this.completeCallback = callback ? callback : function (result) {
        if (result instanceof Error) {
            throw result;
        }
    };
    this.run();
};
TeaVMThread.prototype.resume = function () {
    if ($rt_currentNativeThread !== null) {
        throw new Error("Another thread is running");
    }
    this.status = 2;
    this.run();
};
TeaVMThread.prototype.run = function () {
    $rt_currentNativeThread = this;
    var result;
    try {
        result = this.runner();
    } catch (e) {
        result = e;
    } finally {
        $rt_currentNativeThread = null;
    }
    if (this.suspendCallback !== null) {
        var self = this;
        var callback = this.suspendCallback;
        this.suspendCallback = null;
        callback(function () {
            self.resume();
        });
    } else if (this.status === 0) {
        this.completeCallback(result);
    }
};
function $rt_suspending() {
    var thread = $rt_nativeThread();
    return thread != null && thread.isSuspending();
}
function $rt_resuming() {
    var thread = $rt_nativeThread();
    return thread != null && thread.isResuming();
}
function $rt_suspend(callback) {
    return $rt_nativeThread().suspend(callback);
}
function $rt_startThread(runner, callback) {
    new TeaVMThread(runner).start(callback);
}
var $rt_currentNativeThread = null;
function $rt_nativeThread() {
    return $rt_currentNativeThread;
}
function $rt_invalidPointer() {
    throw new Error("Invalid recorded state");
}

function $dbg_repr(obj) {
    return obj.toString ? obj.toString() : "";
}
function $dbg_class(obj) {
    if (obj instanceof Long) {
        return "long";
    }
    var cls = obj.constructor;
    var arrayDegree = 0;
    while (cls.$meta && cls.$meta.item) {
        ++arrayDegree;
        cls = cls.$meta.item;
    }
    var clsName = "";
    if (cls === $rt_booleancls()) {
        clsName = "boolean";
    } else if (cls === $rt_bytecls()) {
        clsName = "byte";
    } else if (cls === $rt_shortcls()) {
        clsName = "short";
    } else if (cls === $rt_charcls()) {
        clsName = "char";
    } else if (cls === $rt_intcls()) {
        clsName = "int";
    } else if (cls === $rt_longcls()) {
        clsName = "long";
    } else if (cls === $rt_floatcls()) {
        clsName = "float";
    } else if (cls === $rt_doublecls()) {
        clsName = "double";
    } else {
        clsName = cls.$meta ? cls.$meta.name : "@" + cls.name;
    }
    while (arrayDegree-- > 0) {
        clsName += "[]";
    }
    return clsName;
}

function Long(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
}
Long.prototype.toString = function () {
    var result = [];
    var n = this;
    var positive = Long_isPositive(n);
    if (!positive) {
        n = Long_neg(n);
    }
    var radix = new Long(10, 0);
    do {
        var divRem = Long_divRem(n, radix);
        result.push(String.fromCharCode(48 + divRem[1].lo));
        n = divRem[0];
    } while (n.lo != 0 || n.hi != 0);
    result = result.reverse().join('');
    return positive ? result : "-" + result;
};
var Long_ZERO = new Long(0, 0);
var Long_MAX_NORMAL = 1 << 18;
function Long_fromInt(val) {
    return val >= 0 ? new Long(val, 0) : new Long(val, -1);
}
function Long_fromNumber(val) {
    if (val >= 0) {
        return new Long(val | 0, (val / 0x100000000) | 0);
    } else {
        return Long_neg(new Long(-val | 0, (-val / 0x100000000) | 0));
    }
}
function Long_toNumber(val) {
    var lo = val.lo;
    var hi = val.hi;
    if (lo < 0) {
        lo += 0x100000000;
    }
    return 0x100000000 * hi + lo;
}
function Long_eq(a, b) {
    return a.hi === b.hi && a.lo === b.lo;
}
function Long_ne(a, b) {
    return a.hi !== b.hi || a.lo !== b.lo;
}
function Long_gt(a, b) {
    if (a.hi < b.hi) {
        return false;
    }
    if (a.hi > b.hi) {
        return true;
    }
    var x = a.lo >>> 1;
    var y = b.lo >>> 1;
    if (x != y) {
        return x > y;
    }
    return (a.lo & 1) > (b.lo & 1);
}
function Long_ge(a, b) {
    if (a.hi < b.hi) {
        return false;
    }
    if (a.hi > b.hi) {
        return true;
    }
    var x = a.lo >>> 1;
    var y = b.lo >>> 1;
    if (x != y) {
        return x >= y;
    }
    return (a.lo & 1) >= (b.lo & 1);
}
function Long_lt(a, b) {
    if (a.hi > b.hi) {
        return false;
    }
    if (a.hi < b.hi) {
        return true;
    }
    var x = a.lo >>> 1;
    var y = b.lo >>> 1;
    if (x != y) {
        return x < y;
    }
    return (a.lo & 1) < (b.lo & 1);
}
function Long_le(a, b) {
    if (a.hi > b.hi) {
        return false;
    }
    if (a.hi < b.hi) {
        return true;
    }
    var x = a.lo >>> 1;
    var y = b.lo >>> 1;
    if (x != y) {
        return x <= y;
    }
    return (a.lo & 1) <= (b.lo & 1);
}

function Long_add(a, b) {
    if (a.hi === (a.lo >> 31) && b.hi === (b.lo >> 31)) {
        return Long_fromNumber(a.lo + b.lo);
    } else if (Math.abs(a.hi) < Long_MAX_NORMAL && Math.abs(b.hi) < Long_MAX_NORMAL) {
        return Long_fromNumber(Long_toNumber(a) + Long_toNumber(b));
    }
    var a_lolo = a.lo & 0xFFFF;
    var a_lohi = a.lo >>> 16;
    var a_hilo = a.hi & 0xFFFF;
    var a_hihi = a.hi >>> 16;
    var b_lolo = b.lo & 0xFFFF;
    var b_lohi = b.lo >>> 16;
    var b_hilo = b.hi & 0xFFFF;
    var b_hihi = b.hi >>> 16;

    var lolo = (a_lolo + b_lolo) | 0;
    var lohi = (a_lohi + b_lohi + (lolo >> 16)) | 0;
    var hilo = (a_hilo + b_hilo + (lohi >> 16)) | 0;
    var hihi = (a_hihi + b_hihi + (hilo >> 16)) | 0;
    return new Long((lolo & 0xFFFF) | ((lohi & 0xFFFF) << 16), (hilo & 0xFFFF) | ((hihi & 0xFFFF) << 16));
}
function Long_inc(a) {
    var lo = (a.lo + 1) | 0;
    var hi = a.hi;
    if (lo === 0) {
        hi = (hi + 1) | 0;
    }
    return new Long(lo, hi);
}
function Long_dec(a) {
    var lo = (a.lo - 1) | 0;
    var hi = a.hi;
    if (lo === -1) {
        hi = (hi - 1) | 0;
    }
    return new Long(lo, hi);
}
function Long_neg(a) {
    return Long_inc(new Long(a.lo ^ 0xFFFFFFFF, a.hi ^ 0xFFFFFFFF));
}
function Long_sub(a, b) {
    if (a.hi === (a.lo >> 31) && b.hi === (b.lo >> 31)) {
        return Long_fromNumber(a.lo - b.lo);
    }
    var a_lolo = a.lo & 0xFFFF;
    var a_lohi = a.lo >>> 16;
    var a_hilo = a.hi & 0xFFFF;
    var a_hihi = a.hi >>> 16;
    var b_lolo = b.lo & 0xFFFF;
    var b_lohi = b.lo >>> 16;
    var b_hilo = b.hi & 0xFFFF;
    var b_hihi = b.hi >>> 16;

    var lolo = (a_lolo - b_lolo) | 0;
    var lohi = (a_lohi - b_lohi + (lolo >> 16)) | 0;
    var hilo = (a_hilo - b_hilo + (lohi >> 16)) | 0;
    var hihi = (a_hihi - b_hihi + (hilo >> 16)) | 0;
    return new Long((lolo & 0xFFFF) | ((lohi & 0xFFFF) << 16), (hilo & 0xFFFF) | ((hihi & 0xFFFF) << 16));
}
function Long_compare(a, b) {
    var r = a.hi - b.hi;
    if (r !== 0) {
        return r;
    }
    r = (a.lo >>> 1) - (b.lo >>> 1);
    if (r !== 0) {
        return r;
    }
    return (a.lo & 1) - (b.lo & 1);
}
function Long_isPositive(a) {
    return (a.hi & 0x80000000) === 0;
}
function Long_isNegative(a) {
    return (a.hi & 0x80000000) !== 0;
}
function Long_mul(a, b) {
    var positive = Long_isNegative(a) === Long_isNegative(b);
    if (Long_isNegative(a)) {
        a = Long_neg(a);
    }
    if (Long_isNegative(b)) {
        b = Long_neg(b);
    }
    var a_lolo = a.lo & 0xFFFF;
    var a_lohi = a.lo >>> 16;
    var a_hilo = a.hi & 0xFFFF;
    var a_hihi = a.hi >>> 16;
    var b_lolo = b.lo & 0xFFFF;
    var b_lohi = b.lo >>> 16;
    var b_hilo = b.hi & 0xFFFF;
    var b_hihi = b.hi >>> 16;

    var lolo = 0;
    var lohi = 0;
    var hilo = 0;
    var hihi = 0;
    lolo = (a_lolo * b_lolo) | 0;
    lohi = lolo >>> 16;
    lohi = ((lohi & 0xFFFF) + a_lohi * b_lolo) | 0;
    hilo = (hilo + (lohi >>> 16)) | 0;
    lohi = ((lohi & 0xFFFF) + a_lolo * b_lohi) | 0;
    hilo = (hilo + (lohi >>> 16)) | 0;
    hihi = hilo >>> 16;
    hilo = ((hilo & 0xFFFF) + a_hilo * b_lolo) | 0;
    hihi = (hihi + (hilo >>> 16)) | 0;
    hilo = ((hilo & 0xFFFF) + a_lohi * b_lohi) | 0;
    hihi = (hihi + (hilo >>> 16)) | 0;
    hilo = ((hilo & 0xFFFF) + a_lolo * b_hilo) | 0;
    hihi = (hihi + (hilo >>> 16)) | 0;
    hihi = (hihi + a_hihi * b_lolo + a_hilo * b_lohi + a_lohi * b_hilo + a_lolo * b_hihi) | 0;
    var result = new Long((lolo & 0xFFFF) | (lohi << 16), (hilo & 0xFFFF) | (hihi << 16));
    return positive ? result : Long_neg(result);
}
function Long_div(a, b) {
    if (Math.abs(a.hi) < Long_MAX_NORMAL && Math.abs(b.hi) < Long_MAX_NORMAL) {
        return Long_fromNumber(Long_toNumber(a) / Long_toNumber(b));
    }
    return Long_divRem(a, b)[0];
}
function Long_rem(a, b) {
    if (Math.abs(a.hi) < Long_MAX_NORMAL && Math.abs(b.hi) < Long_MAX_NORMAL) {
        return Long_fromNumber(Long_toNumber(a) % Long_toNumber(b));
    }
    return Long_divRem(a, b)[1];
}
function Long_divRem(a, b) {
    if (b.lo == 0 && b.hi == 0) {
        throw new Error("Division by zero");
    }
    var positive = Long_isNegative(a) === Long_isNegative(b);
    if (Long_isNegative(a)) {
        a = Long_neg(a);
    }
    if (Long_isNegative(b)) {
        b = Long_neg(b);
    }
    a = new LongInt(a.lo, a.hi, 0);
    b = new LongInt(b.lo, b.hi, 0);
    var q = LongInt_div(a, b);
    a = new Long(a.lo, a.hi);
    q = new Long(q.lo, q.hi);
    return positive ? [q, a] : [Long_neg(q), Long_neg(a)];
}
function Long_shiftLeft16(a) {
    return new Long(a.lo << 16, (a.lo >>> 16) | (a.hi << 16));
}
function Long_shiftRight16(a) {
    return new Long((a.lo >>> 16) | (a.hi << 16), a.hi >>> 16);
}
function Long_and(a, b) {
    return new Long(a.lo & b.lo, a.hi & b.hi);
}
function Long_or(a, b) {
    return new Long(a.lo | b.lo, a.hi | b.hi);
}
function Long_xor(a, b) {
    return new Long(a.lo ^ b.lo, a.hi ^ b.hi);
}
function Long_shl(a, b) {
    b &= 63;
    if (b == 0) {
        return a;
    } else if (b < 32) {
        return new Long(a.lo << b, (a.lo >>> (32 - b)) | (a.hi << b));
    } else if (b == 32) {
        return new Long(0, a.lo);
    } else {
        return new Long(0, a.lo << (b - 32));
    }
}
function Long_shr(a, b) {
    b &= 63;
    if (b == 0) {
        return a;
    } else if (b < 32) {
        return new Long((a.lo >>> b) | (a.hi << (32 - b)), a.hi >> b);
    } else if (b == 32) {
        return new Long(a.hi, a.hi >> 31);
    } else {
        return new Long((a.hi >> (b - 32)), a.hi >> 31);
    }
}
function Long_shru(a, b) {
    b &= 63;
    if (b == 0) {
        return a;
    } else if (b < 32) {
        return new Long((a.lo >>> b) | (a.hi << (32 - b)), a.hi >>> b);
    } else if (b == 32) {
        return new Long(a.hi, 0);
    } else {
        return new Long((a.hi >>> (b - 32)), 0);
    }
}

// Represents a mutable 80-bit unsigned integer
function LongInt(lo, hi, sup) {
    this.lo = lo;
    this.hi = hi;
    this.sup = sup;
}
function LongInt_mul(a, b) {
    var a_lolo = ((a.lo & 0xFFFF) * b) | 0;
    var a_lohi = ((a.lo >>> 16) * b) | 0;
    var a_hilo = ((a.hi & 0xFFFF) * b) | 0;
    var a_hihi = ((a.hi >>> 16) * b) | 0;
    var sup = (a.sup * b) | 0;

    a_lohi = (a_lohi + (a_lolo >>> 16)) | 0;
    a_hilo = (a_hilo + (a_lohi >>> 16)) | 0;
    a_hihi = (a_hihi + (a_hilo >>> 16)) | 0;
    sup = (sup + (a_hihi >>> 16)) | 0;
    a.lo = (a_lolo & 0xFFFF) | (a_lohi << 16);
    a.hi = (a_hilo & 0xFFFF) | (a_hihi << 16);
    a.sup = sup & 0xFFFF;
}
function LongInt_sub(a, b) {
    var a_lolo = a.lo & 0xFFFF;
    var a_lohi = a.lo >>> 16;
    var a_hilo = a.hi & 0xFFFF;
    var a_hihi = a.hi >>> 16;
    var b_lolo = b.lo & 0xFFFF;
    var b_lohi = b.lo >>> 16;
    var b_hilo = b.hi & 0xFFFF;
    var b_hihi = b.hi >>> 16;

    a_lolo = (a_lolo - b_lolo) | 0;
    a_lohi = (a_lohi - b_lohi + (a_lolo >> 16)) | 0;
    a_hilo = (a_hilo - b_hilo + (a_lohi >> 16)) | 0;
    a_hihi = (a_hihi - b_hihi + (a_hilo >> 16)) | 0;
    var sup = (a.sup - b.sup + (a_hihi >> 16)) | 0;
    a.lo = (a_lolo & 0xFFFF) | (a_lohi << 16);
    a.hi = (a_hilo & 0xFFFF) | (a_hihi << 16);
    a.sup = sup;
}
function LongInt_add(a, b) {
    var a_lolo = a.lo & 0xFFFF;
    var a_lohi = a.lo >>> 16;
    var a_hilo = a.hi & 0xFFFF;
    var a_hihi = a.hi >>> 16;
    var b_lolo = b.lo & 0xFFFF;
    var b_lohi = b.lo >>> 16;
    var b_hilo = b.hi & 0xFFFF;
    var b_hihi = b.hi >>> 16;

    a_lolo = (a_lolo + b_lolo) | 0;
    a_lohi = (a_lohi + b_lohi + (a_lolo >> 16)) | 0;
    a_hilo = (a_hilo + b_hilo + (a_lohi >> 16)) | 0;
    a_hihi = (a_hihi + b_hihi + (a_hilo >> 16)) | 0;
    var sup = (a.sup + b.sup + (a_hihi >> 16)) | 0;
    a.lo = (a_lolo & 0xFFFF) | (a_lohi << 16);
    a.hi = (a_hilo & 0xFFFF) | (a_hihi << 16);
    a.sup = sup;
}
function LongInt_inc(a) {
    a.lo = (a.lo + 1) | 0;
    if (a.lo == 0) {
        a.hi = (a.hi + 1) | 0;
        if (a.hi == 0) {
            a.sup = (a.sup + 1) & 0xFFFF;
        }
    }
}
function LongInt_dec(a) {
    a.lo = (a.lo - 1) | 0;
    if (a.lo == -1) {
        a.hi = (a.hi - 1) | 0;
        if (a.hi == -1) {
            a.sup = (a.sup - 1) & 0xFFFF;
        }
    }
}
function LongInt_ucompare(a, b) {
    var r = (a.sup - b.sup);
    if (r != 0) {
        return r;
    }
    r = (a.hi >>> 1) - (b.hi >>> 1);
    if (r != 0) {
        return r;
    }
    r = (a.hi & 1) - (b.hi & 1);
    if (r != 0) {
        return r;
    }
    r = (a.lo >>> 1) - (b.lo >>> 1);
    if (r != 0) {
        return r;
    }
    return (a.lo & 1) - (b.lo & 1);
}
function LongInt_numOfLeadingZeroBits(a) {
    var n = 0;
    var d = 16;
    while (d > 0) {
        if ((a >>> d) !== 0) {
            a >>>= d;
            n = (n + d) | 0;
        }
        d = (d / 2) | 0;
    }
    return 31 - n;
}
function LongInt_shl(a, b) {
    if (b == 0) {
        return;
    }
    if (b < 32) {
        a.sup = ((a.hi >>> (32 - b)) | (a.sup << b)) & 0xFFFF;
        a.hi = (a.lo >>> (32 - b)) | (a.hi << b);
        a.lo <<= b;
    } else if (b == 32) {
        a.sup = a.hi & 0xFFFF;
        a.hi = a.lo;
        a.lo = 0;
    } else if (b < 64) {
        a.sup = ((a.lo >>> (64 - b)) | (a.hi << (b - 32))) & 0xFFFF;
        a.hi = a.lo << b;
        a.lo = 0;
    } else if (b == 64) {
        a.sup = a.lo & 0xFFFF;
        a.hi = 0;
        a.lo = 0;
    } else {
        a.sup = (a.lo << (b - 64)) & 0xFFFF;
        a.hi = 0;
        a.lo = 0;
    }
}
function LongInt_shr(a, b) {
    if (b == 0) {
        return;
    }
    if (b == 32) {
        a.lo = a.hi;
        a.hi = a.sup;
        a.sup = 0;
    } else if (b < 32) {
        a.lo = (a.lo >>> b) | (a.hi << (32 - b));
        a.hi = (a.hi >>> b) | (a.sup << (32 - b));
        a.sup >>>= b;
    } else if (b == 64) {
        a.lo = a.sup;
        a.hi = 0;
        a.sup = 0;
    } else if (b < 64) {
        a.lo = (a.hi >>> (b - 32)) | (a.sup << (64 - b));
        a.hi = a.sup >>> (b - 32);
        a.sup = 0;
    } else {
        a.lo = a.sup >>> (b - 64);
        a.hi = 0;
        a.sup = 0;
    }
}
function LongInt_copy(a) {
    return new LongInt(a.lo, a.hi, a.sup);
}
function LongInt_div(a, b) {
    // Normalize divisor
    var bits = b.hi !== 0 ? LongInt_numOfLeadingZeroBits(b.hi) : LongInt_numOfLeadingZeroBits(b.lo) + 32;
    var sz = 1 + ((bits / 16) | 0);
    var dividentBits = bits % 16;
    LongInt_shl(b, bits);
    LongInt_shl(a, dividentBits);
    var q = new LongInt(0, 0, 0);
    while (sz-- > 0) {
        LongInt_shl(q, 16);
        // Calculate approximate q
        var digitA = (a.hi >>> 16) + (0x10000 * a.sup);
        var digitB = b.hi >>> 16;
        var digit = (digitA / digitB) | 0;
        var t = LongInt_copy(b);
        LongInt_mul(t, digit);
        // Adjust q either down or up
        if (LongInt_ucompare(t, a) >= 0) {
            while (LongInt_ucompare(t, a) > 0) {
                LongInt_sub(t, b);
                --digit;
            }
        } else {
            while (true) {
                var nextT = LongInt_copy(t);
                LongInt_add(nextT, b);
                if (LongInt_ucompare(nextT, a) > 0) {
                    break;
                }
                t = nextT;
                ++digit;
            }
        }
        LongInt_sub(a, t);
        q.lo |= digit;
        LongInt_shl(a, 16);
    }
    LongInt_shr(a, bits + 16);
    return q;
}

"use strict";
function $rt_setCloneMethod(target, f) { target.a = f; }
function $rt_cls(cls) { return A(cls); }
function $rt_str(str) { if (str === null) { return null; } var characters = $rt_createCharArray(str.length); var charsBuffer = characters.data; for (var i = 0; i < str.length; i = (i + 1) | 0) { charsBuffer[i] = str.charCodeAt(i) & 0xFFFF; } return B(characters); }
function $rt_ustr(str) { if (str === null) { return null; } var result = ""; var sz = C(str); var array = $rt_createCharArray(sz); D(str, 0, sz, array, 0); for (var i = 0; i < sz; i = (i + 1) | 0) { result += String.fromCharCode(array.data[i]); } return result; }
function $rt_objcls() { return E; }
function $rt_nullCheck(val) { if (val === null) { $rt_throw(F()); } return val; }
function $rt_intern(str) { return G(str); }
function $rt_getThread() { return H(); }
function $rt_setThread(t) { return I(t); }
var Yr = $rt_throw; var Zr = $rt_compare; var As = $rt_nullCheck; var Bs = $rt_cls; var Cs = $rt_createArray; var Ds = $rt_isInstance; var J = $rt_nativeThread; var Es = $rt_suspending; var O = $rt_resuming; var N = $rt_invalidPointer; var Fs = $rt_s;
function E() { this.Nb = null; this.$id$ = 0; }
function Gs() { var $r = new E(); Xi($r); return $r; }
function Or(a) { var b; if (a.Nb === null) { a.Nb = Hs(); } b = a.Nb; if (b.ib === null) { a.Nb.ib = H(); } else if (a.Nb.ib !== H()) { Yr(Is(Fs(0))); } a = a.Nb; a.gd = a.gd + 1 | 0; }
function Dr(a) { var b, c; if (Jp(a) == 0) { b = a.Nb; if (b.ib === H()) { b = a.Nb; c = b.gd - 1 | 0; b.gd = c; if (c == 0) { a.Nb.ib = null; } Jp(a); return; } } Yr(Js()); }
function Tg(a) { var b, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) { switch ($p) { case 0: b = 1; $p = 1; case 1: Gp(a, b); if (Es()) { break _; } return; default: N(); } } J().s(a, b, $p); }
function Gp(a, b) { var c, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); c = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) { switch ($p) { case 0: if (a.Nb === null) { a.Nb = Hs(); } c = a.Nb; if (c.ib === null) { a.Nb.ib = H(); } if (a.Nb.ib === H()) { a = a.Nb; a.gd = a.gd + b | 0; return; } $p = 1; case 1: Em(a, b); if (Es()) { break _; } return; default: N(); } } J().s(a, b, c, $p); }
function Em(a, b) { var thread = $rt_nativeThread(); var javaThread = $rt_getThread(); if (thread.isResuming()) { thread.status = 0; var result = thread.attribute; if (result instanceof Error) { throw result; } return result; } var callback = function () { }; callback.vc = function (val) { thread.attribute = val; $rt_setThread(javaThread); thread.resume(); }; callback.R = function (e) { thread.attribute = $rt_exception(e); $rt_setThread(javaThread); thread.resume(); }; callback = Eq(callback); return thread.suspend(function () { try { Br(a, b, callback); } catch ($e) { callback.R($rt_exception($e)); } }); }
function Br(a, b, c) { var d, e; d = H(); if (a.Nb === null) { a.Nb = Hs(); I(d); a = a.Nb; a.gd = a.gd + b | 0; Rm(c, null); return; } e = a.Nb; if (e.ib !== null) { Mq(a.Nb.Rd, Ks(d, a, b, c)); return; } a.Nb.ib = d; I(d); a = a.Nb; a.gd = a.gd + b | 0; Rm(c, null); }
function Hq(a) { Tq(a, 1); }
function Tq(a, b) { var c; if (Jp(a) == 0) { c = a.Nb; if (c.ib === H()) { c = a.Nb; c.gd = c.gd - b | 0; if (a.Nb.gd > 0) { return; } a.Nb.ib = null; if (Mr(a.Nb.Rd) != 0) { Jp(a); } else { Gq(Ls(a)); } return; } } Yr(Js()); }
function Jp($t) { var a; if ($t.Nb === null) { return 1; } a = $t.Nb; if (a.ib === null && Mr($t.Nb.Rd) != 0 && Mr($t.Nb.ie) != 0) { $t.Nb = null; return 1; } return 0; }
function Xr(a) { var b; a: { if (a.Nb !== null) { a = a.Nb; if (a.ib === H()) { b = 1; break a; } } b = 0; } return b; }
function Xi($t) { return; }
function Eh($t) { return A($t.constructor); }
function Lo($t) { var a, b, c; if (Ds($t, Gb) == 0 && $t.constructor.$meta.item === null) { Yr(Ms()); } a = Lq($t); b = a; c = $rt_nextId(); b.$id$ = c; return a; }
function Mk($t) { var a, b; if (Xr($t) == 0) { Yr(Js()); } a = $t.Nb; a = a.ie; while (Mr(a) == 0) { b = Wr(a); if (b.Je() == 0) { Gq(b); } } }
function Ar(a) { return a; }
function Hr(a) { var b; if (Jp(a) == 0) { b = a.Nb; if (b.ib === null) { if (Mr(a.Nb.Rd) == 0) { Gf(Wr(a.Nb.Rd)); } return; } } }
function Nq(a, b, c, d) { I(a); b.Nb.ib = a; a = b.Nb; a.gd = a.gd + c | 0; Rm(d, null); }
function K() { E.call(this); }
var Ns = null; var Os = null; var Ps = null; var Qs = null; var Rs = 0; var Ss = null; var Ts = null; var Us = null; var Vs = null; var Ws = null; var Xs = null; var Ys = null; var Zs = null; var At = null; var Bt = null; function K_$callClinit() {
    K_$callClinit = function () { };
    Kk();
}
function Kd(a) { var b, c, d, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); d = $T.l(); c = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) { switch ($p) { case 0: K_$callClinit(); console.log("LOGGING FROM THE UI"); At = Er().getElementById("result"); Op(); Zh(); Mh(); $p = 1; case 1: Ee(); if (Es()) { break _; } b = Os; c = Fs(1); d = Ct(); b.addEventListener($rt_ustr(c), Kq(d, "handleEvent")); return; default: N(); } } J().s(a, b, c, d, $p); }
function Op() { var a, b, c, d; K_$callClinit(); a = {}; b = 4; a.indentUnit = b; b = !!1; a.lineNumbers = b; c = Cs(Dc, 2); d = c.data; d[0] = Fs(2); d[1] = Fs(3); b = Sr(c); a.gutters = b; Ss = CodeMirror.fromTextArea(Er().getElementById("source-code"), a); Ao(); Ur(window, Dt()); Lr(window, Et()); }
function Zh() { var a, b, c; K_$callClinit(); a = Er(); Cr(Gr(a.getElementById("choose-example")), Ft()); Cr(Gr(a.getElementById("cancel-example-selection")), Gt()); b = new XMLHttpRequest(); c = Fs(4); a = Gj(Qj(Qj(Ht(), Ys), Fs(5))); b.open($rt_ustr(c), $rt_ustr(a)); Tr(b, It(b)); b.send(); }
function Ym(a) { var b, c, d, e, f, g, h, i, j, k, l, m; K_$callClinit(); b = Rq(Object.keys(a)).data; c = b.length; d = 0; while (d < c) { e = b[d]; f = Jt(); g = a[$rt_ustr(e)]; f.Yc = $rt_str(g.title); Xl(Zs, e, f); h = g.items; i = Rq(Object.keys(h)).data; j = i.length; k = 0; while (k < j) { l = i[k]; m = $rt_str(h[$rt_ustr(l)]); Sg(f.ab, l, m); k = k + 1 | 0; } d = d + 1 | 0; } }
function Sh() { var a, b, c, d, e, f, g, h, i; K_$callClinit(); a = Er(); b = a.getElementById("examples-content"); c = Qh(Sn(Zs)); while (Dm(c) != 0) { d = Hk(c); e = Fm(d); f = a.createElement("h3"); g = Pr(f, e.Yc); b.appendChild(g); h = Do(Ho(e.ab)); while (Tj(h) != 0) { f = Rh(h); i = a.createElement("div"); g = Pr(a.createElement("span"), Fm(f)); i.appendChild(g); g = "example-item"; i.className = g; Cr(i, Kt(d, f)); b.appendChild(i); } } }
function Pm(a, b) { var c, d, e, f, g; K_$callClinit(); c = Er().getElementById("examples-content-progress"); d = c.style; e = Fs(6); f = Fs(7); d.setProperty($rt_ustr(e), $rt_ustr(f)); g = new XMLHttpRequest(); f = Fs(4); a = Gj(Qj(Qj(Qj(Qj(Qj(Qj(Ht(), Ys), Fs(8)), a), Fs(8)), b), Fs(9))); g.open($rt_ustr(f), $rt_ustr(a)); Tr(g, Lt(g, c)); g.send(); }
function Ui() { var a, b, c, d; K_$callClinit(); a = Er(); b = Ws.style; c = Fs(6); d = Fs(7); b.setProperty($rt_ustr(c), $rt_ustr(d)); c = Ws; d = "modal fade in"; c.className = d; Xs = Oq(a.createElement("div"), Fs(10), Fs(11)); c = a.body; a = Xs; c.appendChild(a); }
function Ih() { var a, b, c; K_$callClinit(); a = Ws.style; b = Fs(6); c = Fs(12); a.setProperty($rt_ustr(b), $rt_ustr(c)); b = Ws; c = "modal fade"; b.className = c; Cq(Xs); Xs = null; }
function Mh() { var a, b, c; K_$callClinit(); Qs = Er().getElementById("stdout"); a = window; b = Fs(13); c = Mt(); a.addEventListener($rt_ustr(b), Kq(c, "handleEvent")); }
function Wm(a, b) { var c, d; K_$callClinit(); c = 0; d = 0; while (d < C(a)) { if (Mp(a, d) == 10) { Jm(Ck(a, c, d), b); c = d + 1 | 0; } d = d + 1 | 0; } Jm(Vi(a, c), b); }
function Jm(a, b) { var c; K_$callClinit(); c = Pr(Er().createElement("div"), a); if (b != 0) { c.className = "compile-time"; } Qs.appendChild(c); c = Qs; a = Qq(0, Qs.scrollHeight - Qs.clientHeight | 0); c.scrollTop = a; }
function Ee() {
    var a, b, c, d, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); d = $T.l(); c = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) {
        switch ($p) {
            case 0: K_$callClinit(); Os.disabled = !!1; a = Gr(Er().head.querySelector("[property=workerLocation]")); if (a === null) { alert("Can\'t initialize: not workerLocation meta tag specified"); return 0; } b = Gr(Er().head.querySelector("[property=stdlibLocation]")); if (a === null) { alert("Can\'t initialize: not stdlibLocation meta tag specified"); return 0; } Ns = new Worker($rt_ustr($rt_str(a.content))); c = Zm(Fs(14)); a
                = $rt_ustr($rt_str(b.content)); c.url = a; Ns.postMessage(c); $p = 1; case 1: $z = Ef(c); if (Es()) { break _; } d = $z; if (Aq($rt_str(d.command), Fs(15)) != 0) { Os.disabled = !!0; return 1; } alert($rt_ustr(Gj(Qj(Qj(Ht(), Fs(16)), $rt_str(d.text))))); return 0; default: N();
        }
    } J().s(a, b, c, d, $p);
}
function Dg() {
    var a, b, c, d, e, f, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); f = $T.l(); e = $T.l(); d = $T.l(); c = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) {
        switch ($p) {
            case 0: K_$callClinit(); Sq(Qs); a = Ss.getAllMarks(); b = 0; while (b < a.length) { a[b].clear(); b = b + 1 | 0; } c = Ss; a = Fs(2); c.clearGutter($rt_ustr(a)); Us = Cs(Zf, Ss.lineCount()); Vs = $rt_createIntArray(Ss.lineCount()); c = Zm(Fs(17)); d = $rt_str(Ss.getValue()); Ts = Nt(d); a = $rt_ustr(d); c.text = a; Ns.postMessage(c); $p = 1; case 1: a: {
                $z = Ef(c); if (Es()) { break _; } e = $z; d = $rt_str(e.command); b = -1; switch
                (Dp(d)) { case -1547904089: if (Aq(d, Fs(18)) == 0) { break a; } b = 2; break a; case 1201050005: if (Aq(d, Fs(19)) == 0) { break a; } b = 1; break a; case 1838383619: if (Aq(d, Fs(20)) == 0) { break a; } b = 0; break a; default: }
            } b: { switch (b) { case 0: f = Gr(e); c = Aq($rt_str(f.status), Fs(21)) == 0 ? null : $rt_str(f.script); return c; case 1: break; case 2: Yh(Gr(e)); break b; default: break b; }Bq(Gr(e)); } continue _; default: N();
        }
    } J().s(a, b, c, d, e, f, $p);
}
function Bq(a) {
    var b, c, d; K_$callClinit(); a: { b = Ht(); c = $rt_str(a.kind); d = -1; switch (Dp(c)) { case -1229401354: if (Aq(c, Fs(22)) == 0) { break a; } d = 2; break a; case 66247144: if (Aq(c, Fs(23)) == 0) { break a; } d = 0; break a; case 1842428796: if (Aq(c, Fs(24)) == 0) { break a; } d = 1; break a; default: } } b: { switch (d) { case 0: break; case 1: case 2: Qj(b, Fs(25)); break b; default: break b; }Qj(b, Fs(26)); } if (a.object !== null) {
        Qj(b, Gj(Qj(Qj(Ht(), Fs(27)), $rt_str(a.object.name)))); if (a.lineNumber >= 0) {
            Qj(Bm(Qj(Bm(Qj(b, Fs(28)), a.lineNumber + 1 | 0), Fs(29)), a.columnNumber
                + 1 | 0), Fs(30));
        } Si(b, 32);
    } Qj(b, $rt_str(a.message)); Wm(Gj(b), 1); if (a.startPosition >= 0) { Ch(a); }
}
function Yh(a) {
    var b, c, d; K_$callClinit(); b = Si(Ot($rt_str(a.severity)), 32); if ($rt_str(a.fileName) !== null) { Qj(b, Gj(Qj(Qj(Ht(), Fs(27)), $rt_str(a.fileName)))); if (a.lineNumber >= 0) { Bm(Qj(b, Fs(29)), a.lineNumber + 1 | 0); } Si(b, 32); } Qj(b, $rt_str(a.text)); Wm(Gj(b), 1); if (a.lineNumber >= 0) {
        a: { c = $rt_str(a.severity); d = -1; switch (Dp(c)) { case 66247144: if (Aq(c, Fs(23)) == 0) { break a; } d = 0; break a; case 1842428796: if (Aq(c, Fs(24)) == 0) { break a; } d = 1; break a; default: } } b: { switch (d) { case 0: d = 2; break b; case 1: d = 1; break b; default: }return; } Aj(d,
            a.lineNumber, $rt_str(a.text));
    }
}
function Ch(a) {
    var b, c, d, e, f, g, h, i; K_$callClinit(); b = Ep(Ts, a.startPosition, 1); if (b.ue >= Us.data.length) { return; } c = a.endPosition; if (c == a.startPosition) { c = c + 1 | 0; } a: { d = Ep(Ts, c, 0); e = {}; f = $rt_str(a.kind); g = -1; switch (Dp(f)) { case -1229401354: if (Aq(f, Fs(22)) == 0) { break a; } g = 2; break a; case 66247144: if (Aq(f, Fs(23)) == 0) { break a; } g = 0; break a; case 1842428796: if (Aq(f, Fs(24)) == 0) { break a; } g = 1; break a; default: } } b: { switch (g) { case 0: e.className = "red-wave"; h = 2; break b; case 1: case 2: e.className = "yellow-wave"; h = 1; break b; default: }return; } f
        = !!1; e.inclusiveLeft = f; f = !!1; e.inclusiveRight = f; f = $rt_ustr($rt_str(a.message)); e.title = f; f = Ss; i = Xq(b.ue, b.td); d = Xq(d.ue, d.td); f.markText(i, d, e); Aj(h, b.ue, $rt_str(a.message));
}
function Aj(a, b, c) { var d, e, f, g; K_$callClinit(); if (Vs.data[b] < a) { Vs.data[b] = a; } a: { switch (Vs.data[b]) { case 1: d = Fs(31); break a; case 2: d = Fs(32); break a; default: }return; } e = Us.data[b]; if (e === null) { e = Er().createElement("span"); Us.data[b] = e; } e.className = $rt_ustr(Gj(Qj(Qj(Ht(), Fs(33)), d))); f = $rt_str(e.title); if (Gl(f) == 0) { c = Gj(Qj(Qj(Qj(Ht(), f), Fs(34)), c)); } c = $rt_ustr(c); e.title = c; g = Ss; f = Fs(2); g.setGutterMarker(b, $rt_ustr(f), e); }
function Zm(a) { var b, c; K_$callClinit(); b = {}; a = $rt_ustr(a); b.command = a; c = Rs; Rs = c + 1 | 0; a = $rt_ustr(Oo(c)); b.id = a; return b; }
function Ef(a) { var thread = $rt_nativeThread(); var javaThread = $rt_getThread(); if (thread.isResuming()) { thread.status = 0; var result = thread.attribute; if (result instanceof Error) { throw result; } return result; } var callback = function () { }; callback.vc = function (val) { thread.attribute = val; $rt_setThread(javaThread); thread.resume(); }; callback.R = function (e) { thread.attribute = $rt_exception(e); $rt_setThread(javaThread); thread.resume(); }; callback = Eq(callback); return thread.suspend(function () { try { Ej(a, callback); } catch ($e) { callback.R($rt_exception($e)); } }); }
function Ej(a, b) { K_$callClinit(); Th(Pt(a, b)); }
function Qm(a) { var b, c, d; K_$callClinit(); if (At !== null) { Cq(At); } b = window.document; At = b.createElement("iframe"); c = At; d = "frame.html"; c.src = d; c = At; d = "1px"; c.width = d; c = At; d = "1px"; c.height = d; c = At; d = "result"; c.className = d; Bt = Qt(a); d = window; c = Fs(13); a = Bt; d.addEventListener($rt_ustr(c), Kq(a, "handleEvent")); c = b.getElementById("result-container"); a = At; c.appendChild(a); }
function Ao() { var a; K_$callClinit(); a = $rt_str(window.localStorage.getItem("teavm-java-code")); if (a !== null) { Ss.setValue($rt_ustr(a)); } }
function Vl() { var a, b, c; K_$callClinit(); a = window.localStorage; b = Fs(35); c = $rt_str(Ss.getValue()); a.setItem($rt_ustr(b), $rt_ustr(c)); }
function Xh(a, b) { var c; K_$callClinit(); if (Aq($rt_str(Gr(JSON.parse($rt_ustr(Fr(b.data)))).command), Fs(36)) != 0) { c = {}; c.command = "code"; c.code = $rt_ustr(a); At.contentWindow.postMessage($rt_ustr($rt_str(JSON.stringify(c))), "*"); window.removeEventListener("message", Kq(Bt, "handleEvent")); Bt = null; } }
function Po(a) { var b; K_$callClinit(); b = Gr(JSON.parse($rt_ustr(Fr(a.data)))); if (Aq($rt_str(b.command), Fs(37)) != 0) { Jm($rt_str(Gr(b).line), 0); } }
function Bo(a, b) { var c; K_$callClinit(); c = $rt_str(a.responseText); Ss.setValue($rt_ustr(c)); Ih(); c = b.style; b = Fs(6); a = Fs(12); c.setProperty($rt_ustr(b), $rt_ustr(a)); }
function Rn(a, b, c) { K_$callClinit(); Pm(Ei(a), Ei(b)); }
function Lj(a) { var b; K_$callClinit(); Ym(Gr(JSON.parse($rt_ustr($rt_str(a.responseText))))); Sh(); a = Ps; b = !!0; a.disabled = b; }
function Up(a) { K_$callClinit(); Ih(); }
function Wl(a) { K_$callClinit(); Ui(); }
function Ug(a) { K_$callClinit(); Vl(); }
function Uk(a) { K_$callClinit(); Vl(); }
function Rl(a) { K_$callClinit(); Ik(Rt(St())); }
function Ig() { var a, b, c, $$je, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); c = $T.l(); b = $T.l(); a = $T.l(); } _: while (true) { switch ($p) { case 0: try { K_$callClinit(); Os.disabled = !!1; $p = 1; continue _; } catch ($$e) { $$je = $$e.$javaException; if ($$je) { a = $$je; } else { throw $$e; } } b = Os; c = !!0; b.disabled = c; Yr(a); case 1: a: { try { $z = Dg(); if (Es()) { break _; } a = $z; break a; } catch ($$e) { $$je = $$e.$javaException; if ($$je) { a = $$je; } else { throw $$e; } } b = Os; c = !!0; b.disabled = c; Yr(a); } Os.disabled = !!0; if (a !== null) { Qm(a); } return; default: N(); } } J().s(a, b, c, $p); }
function Un() { K_$callClinit(); return Ns; }
function Vk(a) { K_$callClinit(); return Dl(a) ? 1 : 0; }
function Kk() { Os = Gr(Er().getElementById("compile-button")); Ps = Gr(Er().getElementById("choose-example")); Ws = Er().getElementById("examples"); Ys = Fs(38); Zs = Tt(); }
function Dl(a) { return 'id' in a && typeof a.id === 'string'; }
function Mf() { E.call(this); }
function Sr(a) { var b, c, d, e; if (a === null) { return null; } a = a.data; b = a.length; c = new Array(b); d = 0; while (d < b) { e = $rt_ustr(a[d]); c[d] = e; d = d + 1 | 0; } return c; }
function Rq(a) { var b, c, d, e; if (a === null) { return null; } b = Cs(Dc, a.length); c = b.data; d = 0; e = c.length; while (d < e) { c[d] = Fr(a[d]); d = d + 1 | 0; } return b; }
function Kq(a, b) { var name = 'jso$functor$' + b; if (!a[name]) { var fn = function () { return a[b].apply(a, arguments); }; a[name] = function () { return fn; }; } return a[name](); }
function Vr(a, b) { if (a === null) return null; var result = {}; result[b] = a; return result; }
function Yd() { E.call(this); }
function M() { E.call(this); }
function Gr(a) { return a; }
function Hb() { E.call(this); }
function Cq(a) { if (a.parentNode !== null) { a.parentNode.removeChild(a); } }
function Kc() { E.call(this); }
function P() { E.call(this); }
function Pe() { E.call(this); }
function Er() { return window.document; }
function Q() { E.call(this); }
function Ie() { E.call(this); }
function Ct() { var $r = new Ie(); En($r); return $r; }
function En($t) { Xi($t); }
function Pg($t, a) { Rl(a); }
function Ni($t, a) { Pg($t, a); }
function Rc() { E.call(this); }
function Bf() { E.call(this); this.qc = null; }
function Ut(b) { var $r = new Bf(); Zj($r, b); return $r; }
function Zj($t, a) { var b; Xi($t); $t.qc = a; b = $t; a.classObject = b; }
function A(a) { var b; if (a === null) { return null; } b = a.classObject; if (b === null) { b = Ut(a); } return b; }
function Bh($t) { return $t.qc; }
function Bi($t) { return A(Uq($t.qc)); }
function Zd() { E.call(this); }
function Lq(a) { var copy = new a.constructor(); for (var field in a) { if (!a.hasOwnProperty(field)) { continue; } copy[field] = a[field]; } return copy; }
function Wq(a) { return setTimeout(function () { $rt_threadStarter(Rp)(a); }, 0); }
function Rp(a) { var $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); a = $T.l(); } _: while (true) { switch ($p) { case 0: $p = 1; case 1: a.f(); if (Es()) { break _; } return; default: N(); } } J().s(a, $p); }
function Gq(a) { Jq(a, 0); }
function Jq(a, b) { return setTimeout(function () { Rp(a); }, b); }
function Uq(a) { return a.$meta.item; }
function U() { E.call(this); }
function W() { E.call(this); }
function Kb() { E.call(this); }
function Dc() { var a = this; E.call(a); a.F = null; a.bb = 0; }
var Vt = null; var Wt = null; function Dc_$callClinit() {
    Dc_$callClinit = function () { };
    Qo();
}
function B(b) { var $r = new Dc(); Re($r, b); return $r; }
function Xt(b, c, d) { var $r = new Dc(); Fg($r, b, c, d); return $r; }
function Re($t, a) { var b, c; Dc_$callClinit(); a = a.data; Xi($t); b = a.length; $t.F = $rt_createCharArray(b); c = 0; while (c < b) { $t.F.data[c] = a[c]; c = c + 1 | 0; } }
function Fg($t, a, b, c) { var d, e; Dc_$callClinit(); Xi($t); $t.F = $rt_createCharArray(c); d = 0; while (d < c) { e = a.data; $t.F.data[d] = e[d + b | 0]; d = d + 1 | 0; } }
function Mp($t, a) { if (a >= 0 && a < $t.F.data.length) { return $t.F.data[a]; } Yr(Yt()); }
function C($t) { return $t.F.data.length; }
function Gl($t) { return $t.F.data.length != 0 ? 0 : 1; }
function D($t, a, b, c, d) { var e, f; if (a >= 0 && a <= b && b <= $t.jc() && d >= 0) { c = c.data; if ((d + (b - a | 0) | 0) <= c.length) { while (a < b) { e = d + 1 | 0; f = a + 1 | 0; c[d] = $t.ad(a); d = e; a = f; } return; } } Yr(Zt()); }
function Ck($t, a, b) { if (a > b) { Yr(Zt()); } return Xt($t.F, a, b - a | 0); }
function Vi($t, a) { return Ck($t, a, C($t)); }
function Oo(a) { Dc_$callClinit(); return Il(Gj(Bm(Ht(), a))); }
function Aq($t, a) { var b, c; if ($t === a) { return 1; } if (a instanceof Dc == 0) { return 0; } b = a; if (C(b) != C($t)) { return 0; } c = 0; while (c < C(b)) { if (Mp($t, c) != Mp(b, c)) { return 0; } c = c + 1 | 0; } return 1; }
function Dp($t) { var a, b, c, d; if ($t.bb == 0) { a = $t.F.data; b = a.length; c = 0; while (c < b) { d = a[c]; $t.bb = (31 * $t.bb | 0) + d | 0; c = c + 1 | 0; } } return $t.bb; }
function Il(a) { Dc_$callClinit(); return a; }
function G($t) { var a; a = Hp(Wt, $t); if (a !== null) { $t = a; } else { Xl(Wt, $t, $t); } return $t; }
function Qo() { Vt = Au(); Wt = Tt(); }
function Y() { var a = this; E.call(a); a.rd = null; a.Ib = 0; a.yd = 0; }
function Bu() { var $r = new Y(); Jo($r); return $r; }
function Cu(b) { var $r = new Y(); Yj($r, b); return $r; }
function Jo($t) { $t.Ib = 1; $t.yd = 1; Lk($t); }
function Yj($t, a) { $t.Ib = 1; $t.yd = 1; Lk($t); $t.rd = a; }
function Lk($t) { return $t; }
function T() { Y.call(this); }
function Du() { var $r = new T(); Qk($r); return $r; }
function Eu(b) { var $r = new T(); Ki($r, b); return $r; }
function Qk($t) { Jo($t); }
function Ki($t, a) { Yj($t, a); }
function L() { T.call(this); }
function Fu() { var $r = new L(); Hl($r); return $r; }
function Hl($t) { Qk($t); }
function Tb() { L.call(this); }
function Zt() { var $r = new Tb(); Xk($r); return $r; }
function Xk($t) { Hl($t); }
function Gb() { E.call(this); }
function Ld() { T.call(this); }
function Ms() { var $r = new Ld(); Ij($r); return $r; }
function Ij($t) { Qk($t); }
function Bb() { E.call(this); }
function X() { var a = this; E.call(a); a.Bb = Long_ZERO; a.V = Long_ZERO; a.jb = null; a.Wb = null; a.Pc = 0; a.jd = null; }
var Gu = null; var Hu = null; var Iu = Long_ZERO; var Ju = 0; function X_$callClinit() {
    X_$callClinit = function () { };
    Qg();
}
function Ku(b) { var $r = new X(); Vd($r, b); return $r; }
function Rt(b) { var $r = new X(); Le($r, b); return $r; }
function Lu(b, c) { var $r = new X(); Of($r, b, c); return $r; }
function Vd($t, a) { X_$callClinit(); Of($t, null, a); }
function Le($t, a) { X_$callClinit(); Of($t, a, null); }
function Of($t, a, b) { var c; X_$callClinit(); Xi($t); $t.jb = Gs(); $t.Pc = 1; $t.Wb = b; $t.jd = a; c = Iu; Iu = Long_add(c, Long_fromInt(1)); $t.Bb = c; }
function Ik($t) { Wq(Mu($t)); }
function I(a) { X_$callClinit(); if (Hu !== a) { Hu = a; } Hu.V = Kh(); }
function Nn() { X_$callClinit(); return Gu; }
function Jg($t) { var a, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); a = $T.l(); $t = $T.l(); } _: while (true) { switch ($p) { case 0: if ($t.jd === null) { return; } a = $t.jd; $p = 1; case 1: Oe(a); if (Es()) { break _; } return; default: N(); } } J().s($t, a, $p); }
function H() { X_$callClinit(); return Hu; }
function Jf($t) {
    var a, b, $$je, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); b = $T.l(); a = $T.l(); $t = $T.l(); } _: while (true) {
        switch ($p) {
            case 0: try { Ju = Ju + 1 | 0; I($t); $p = 2; continue _; } catch ($$e) { $$je = $$e.$javaException; if ($$je) { a = $$je; } else { throw $$e; } } b = $t.jb; $p = 1; case 1: Tg(b); if (Es()) { break _; } a: { try { Mk($t.jb); Hq(b); break a; } catch ($$e) { $$je = $$e.$javaException; if ($$je) { a = $$je; } else { throw $$e; } } Hq(b); Yr(a); } $t.Pc = 0; Ju = Ju - 1 | 0; I(Gu); Yr(a); case 2: a: {
                try { Jg($t); if (Es()) { break _; } } catch ($$e) {
                    $$je = $$e.$javaException; if ($$je) {
                        a =
                        $$je; break a;
                    } else { throw $$e; }
                } a = $t.jb; $p = 3; continue _;
            } b = $t.jb; $p = 1; continue _; case 3: Tg(a); if (Es()) { break _; } a: { try { Mk($t.jb); Hq(a); break a; } catch ($$e) { $$je = $$e.$javaException; if ($$je) { b = $$je; } else { throw $$e; } } Hq(a); Yr(b); } $t.Pc = 0; Ju = Ju - 1 | 0; I(Gu); return; default: N();
        }
    } J().s($t, a, b, $p);
}
function Qg() { Gu = Ku(Il(Fs(39))); Hu = Gu; Iu = Long_fromInt(1); Ju = 1; }
function Db() { E.call(this); }
var Nu = null; var Ou = null; var Pu = null; function Db_$callClinit() {
    Db_$callClinit = function () { };
    Gm();
}
function Kh() { Db_$callClinit(); return Long_fromNumber(new Date().getTime()); }
function Gm() { Nu = Qu(Ru(), 0); Ou = Qu(Su(), 0); Pu = Tu(); }
function Lb() { Y.call(this); }
function Uu(b) { var $r = new Lb(); Ng($r, b); return $r; }
function Ng($t, a) { Yj($t, a); }
function Ab() { Lb.call(this); }
function Vu(b) { var $r = new Ab(); Xj($r, b); return $r; }
function Xj($t, a) { Ng($t, a); }
function Gd() { Ab.call(this); }
function Z() { Ab.call(this); }
function Wu(b) { var $r = new Z(); Ro($r, b); return $r; }
function Ro($t, a) { Xj($t, a); }
function Eg() { Z.call(this); }
function Xu(b) { var $r = new Eg(); Tk($r, b); return $r; }
function Tk($t, a) { Ro($t, a); }
function If() { Z.call(this); }
function Yu(b) { var $r = new If(); Im($r, b); return $r; }
function Im($t, a) { Ro($t, a); }
function Hc() { E.call(this); }
function Lr(a, b) { var c; c = Fs(40); a.addEventListener($rt_ustr(c), Kq(b, "handleEvent")); }
function Pb() { E.call(this); }
function Cr(a, b) { var c; c = Fs(1); a.addEventListener($rt_ustr(c), Kq(b, "handleEvent")); }
function Jb() { E.call(this); }
function Fc() { E.call(this); }
function Tc() { E.call(this); }
function Ur(a, b) { var c; c = Fs(41); a.addEventListener($rt_ustr(c), Kq(b, "handleEvent")); }
function Pc() { E.call(this); }
function Ac() { E.call(this); }
function Nf() { E.call(this); }
function Pl($t, a, b) { $t.Ef($rt_str(a), Vr(b, "handleEvent")); }
function Jl($t, a, b, c) { $t.Gf($rt_str(a), Vr(b, "handleEvent"), c ? 1 : 0); }
function Zk($t, a) { return !!$t.Hf(a); }
function Go($t, a, b) { $t.If($rt_str(a), Vr(b, "handleEvent")); }
function Pj($t, a) { return $t.Jf(a); }
function Kl($t) { return $t.Kf(); }
function Oi($t, a, b, c) { $t.Lf($rt_str(a), Vr(b, "handleEvent"), c ? 1 : 0); }
function Ze() { E.call(this); }
function Ce() { E.call(this); }
function Dt() { var $r = new Ce(); Ok($r); return $r; }
function Ok($t) { Xi($t); }
function Oh($t, a) { Uk(a); }
function Ai($t, a) { Oh($t, a); }
function Te() { E.call(this); }
function Et() { var $r = new Te(); Fn($r); return $r; }
function Fn($t) { Xi($t); }
function Sj($t, a) { Ug(a); }
function Ip($t, a) { Sj($t, a); }
function Me() { E.call(this); }
function Ft() { var $r = new Me(); Lp($r); return $r; }
function Lp($t) { Xi($t); }
function Ek($t, a) { Nk($t, a); }
function Nk($t, a) { Wl(a); }
function Mo($t, a) { Ek($t, a); }
function Hf() { E.call(this); }
function Gt() { var $r = new Hf(); Xm($r); return $r; }
function Xm($t) { Xi($t); }
function Cl($t, a) { Bn($t, a); }
function Bn($t, a) { Up(a); }
function Ul($t, a) { Cl($t, a); }
function Ne() { E.call(this); }
function Tr(a, b) { b = Kq(Zu(a, b), "stateChanged"); a.onreadystatechange = b; }
function Kr(a, b) { if (a.readyState == 4) { b.f(); } }
function R() { var a = this; E.call(a); a.lb = null; a.Qd = 0; }
var Av = null; var Bv = null; var Cv = null; var Dv = null; var Ev = null; var Fv = null; var Gv = null; function R_$callClinit() {
    R_$callClinit = function () { };
    Wh();
}
function Hv() { var $r = new R(); Qd($r); return $r; }
function Iv(b) { var $r = new R(); Ve($r, b); return $r; }
function Jv(b) { var $r = new R(); Ge($r, b); return $r; }
function Kv(b) { var $r = new R(); Cg($r, b); return $r; }
function Qd($t) { R_$callClinit(); Ve($t, 16); }
function Ve($t, a) { R_$callClinit(); Xi($t); $t.lb = $rt_createCharArray(a); }
function Ge($t, a) { R_$callClinit(); Cg($t, a); }
function Cg($t, a) { var b; R_$callClinit(); Xi($t); $t.lb = $rt_createCharArray(C(a)); b = 0; while (b < $t.lb.data.length) { $t.lb.data[b] = Mp(a, b); b = b + 1 | 0; } $t.Qd = C(a); }
function Og($t, a) { return Fp($t, $t.Qd, a); }
function Xg($t, a, b) { var c, d, e; if (a >= 0 && a <= $t.Qd) { if (b === null) { b = Il(Fs(42)); } else if (Gl(b) != 0) { return $t; } Io($t, $t.Qd + C(b) | 0); c = $t.Qd - 1 | 0; while (c >= a) { $t.lb.data[c + C(b) | 0] = $t.lb.data[c]; c = c + -1 | 0; } $t.Qd = $t.Qd + C(b) | 0; c = 0; while (c < C(b)) { d = $t.lb.data; e = a + 1 | 0; d[a] = Mp(b, c); c = c + 1 | 0; a = e; } return $t; } Yr(Yt()); }
function Vh($t, a) { return Yn($t, a, 10); }
function Yn($t, a, b) { return Ri($t, $t.Qd, a, b); }
function Ri($t, a, b, c) { var d, e, f, g, h, i, j; d = 1; if (b < 0) { d = 0; b = -b; } if (b < c) { if (d != 0) { Wn($t, a, a + 1 | 0); } else { Wn($t, a, a + 2 | 0); e = $t.lb.data; f = a + 1 | 0; e[a] = 45; a = f; } $t.lb.data[a] = Hn(b, c); } else { g = 1; h = 1; i = 2147483647 / c | 0; a: { while (true) { j = g * c | 0; if (j > b) { j = g; break a; } h = h + 1 | 0; if (j > i) { break; } g = j; } } if (d == 0) { h = h + 1 | 0; } Wn($t, a, a + h | 0); if (d != 0) { d = a; } else { e = $t.lb.data; d = a + 1 | 0; e[a] = 45; } while (j > 0) { e = $t.lb.data; a = d + 1 | 0; e[d] = Hn(b / j | 0, c); b = b % j | 0; j = j / c | 0; d = a; } } return $t; }
function Sl($t, a) { return Jh($t, $t.Qd, a); }
function Uj($t, a, b) { Wn($t, a, a + 1 | 0); $t.lb.data[a] = b; return $t; }
function Gh($t, a) { if ($t.lb.data.length >= a) { return; } $t.lb = Nr($t.lb, $t.lb.data.length >= 1073741823 ? 2147483647 : Qq(a, Qq($t.lb.data.length * 2 | 0, 5))); }
function Yk($t) { return Xt($t.lb, 0, $t.Qd); }
function Wn($t, a, b) { var c, d; c = $t.Qd - a | 0; Io($t, ($t.Qd + b | 0) - a | 0); d = c - 1 | 0; while (d >= 0) { $t.lb.data[b + d | 0] = $t.lb.data[a + d | 0]; d = d + -1 | 0; } $t.Qd = $t.Qd + (b - a | 0) | 0; }
function Wh() {
    var a, b, c, d, e, f, g, h; a = $rt_createFloatArray(6); b = a.data; b[0] = 10.0; b[1] = 100.0; b[2] = 10000.0; b[3] = 1.0E8; b[4] = 1.00000003E16; b[5] = 1.0E32; Av = a; c = $rt_createDoubleArray(9); d = c.data; d[0] = 10.0; d[1] = 100.0; d[2] = 10000.0; d[3] = 1.0E8; d[4] = 1.0E16; d[5] = 1.0E32; d[6] = 1.0E64; d[7] = 1.0E128; d[8] = 1.0E256; Bv = c; a = $rt_createFloatArray(6); b = a.data; b[0] = 0.1; b[1] = 0.01; b[2] = 1.0E-4; b[3] = 1.0E-8; b[4] = 1.0E-16; b[5] = 1.0E-32; Cv = a; c = $rt_createDoubleArray(9); d = c.data; d[0] = 0.1; d[1] = 0.01; d[2] = 1.0E-4; d[3] = 1.0E-8; d[4] = 1.0E-16; d[5] = 1.0E-32; d[6]
        = 1.0E-64; d[7] = 1.0E-128; d[8] = 1.0E-256; Dv = c; e = $rt_createIntArray(10); f = e.data; f[0] = 1; f[1] = 10; f[2] = 100; f[3] = 1000; f[4] = 10000; f[5] = 100000; f[6] = 1000000; f[7] = 10000000; f[8] = 100000000; f[9] = 1000000000; Ev = e; g = $rt_createLongArray(19); h = g.data; h[0] = Long_fromInt(1); h[1] = Long_fromInt(10); h[2] = Long_fromInt(100); h[3] = Long_fromInt(1000); h[4] = Long_fromInt(10000); h[5] = Long_fromInt(100000); h[6] = Long_fromInt(1000000); h[7] = Long_fromInt(10000000); h[8] = Long_fromInt(100000000); h[9] = Long_fromInt(1000000000); h[10] = new Long(1410065408, 2); h[11]
            = new Long(1215752192, 23); h[12] = new Long(3567587328, 232); h[13] = new Long(1316134912, 2328); h[14] = new Long(276447232, 23283); h[15] = new Long(2764472320, 232830); h[16] = new Long(1874919424, 2328306); h[17] = new Long(1569325056, 23283064); h[18] = new Long(2808348672, 232830643); Fv = g; g = $rt_createLongArray(6); h = g.data; h[0] = Long_fromInt(1); h[1] = Long_fromInt(10); h[2] = Long_fromInt(100); h[3] = Long_fromInt(10000); h[4] = Long_fromInt(100000000); h[5] = new Long(1874919424, 2328306); Gv = g;
}
function Ad() { E.call(this); }
function Td() { R.call(this); }
function Ht() { var $r = new Td(); Bk($r); return $r; }
function Ot(b) { var $r = new Td(); Rj($r, b); return $r; }
function Bk($t) { Qd($t); }
function Rj($t, a) { Ge($t, a); }
function Qj($t, a) { Og($t, a); return $t; }
function Bm($t, a) { Vh($t, a); return $t; }
function Si($t, a) { Sl($t, a); return $t; }
function Uo($t, a, b) { Uj($t, a, b); return $t; }
function Mn($t, a, b) { Xg($t, a, b); return $t; }
function Gj($t) { return Yk($t); }
function Io($t, a) { Gh($t, a); }
function Jh($t, a, b) { return Uo($t, a, b); }
function Fp($t, a, b) { return Mn($t, a, b); }
function Cf() { E.call(this); this.oe = null; }
function It(b) { var $r = new Cf(); An($r, b); return $r; }
function An($t, a) { Xi($t); $t.oe = a; }
function Je($t) { Lj($t.oe); }
function Vf() { E.call(this); }
function Mt() { var $r = new Vf(); Vm($r); return $r; }
function Vm($t) { Xi($t); }
function Hj($t, a) { Zo($t, a); }
function Zo($t, a) { Po(a); }
function Rk($t, a) { Hj($t, a); }
function Lc() { E.call(this); }
function Gg() { E.call(this); }
function Nm($t, a, b) { $t.Ef($rt_str(a), Vr(b, "handleEvent")); }
function Xn($t, a, b, c) { $t.Gf($rt_str(a), Vr(b, "handleEvent"), c ? 1 : 0); }
function Al($t, a) { return !!$t.Hf(a); }
function Mi($t, a, b) { $t.If($rt_str(a), Vr(b, "handleEvent")); }
function Yg($t, a, b, c) { $t.Lf($rt_str(a), Vr(b, "handleEvent"), c ? 1 : 0); }
function Kj($t, a) { $t.Uf(Vr(a, "handleEvent")); }
function Qb() { E.call(this); }
function Xb() { E.call(this); }
function Lv() { var $r = new Xb(); Wg($r); return $r; }
function Wg($t) { Xi($t); }
function Ub() { var a = this; Xb.call(a); a.xd = 0; a.Gb = null; a.Uc = 0; a.Id = 0.0; a.Kb = 0; }
function Tt() { var $r = new Ub(); Hh($r); return $r; }
function Mv(b) { var $r = new Ub(); Lh($r, b); return $r; }
function Nv(b, c) { var $r = new Ub(); Fj($r, b, c); return $r; }
function Xo($t, a) { return Cs(Sb, a); }
function Hh($t) { Lh($t, 16); }
function Lh($t, a) { Fj($t, a, 0.75); }
function Fq(a) { var b; if (a >= 1073741824) { return 1073741824; } if (a == 0) { return 16; } b = a - 1 | 0; a = b | b >> 1; a = a | a >> 2; a = a | a >> 4; a = a | a >> 8; return (a | a >> 16) + 1 | 0; }
function Fj($t, a, b) { Wg($t); if (a >= 0 && b > 0.0) { a = Fq(a); $t.xd = 0; $t.Gb = $t.s(a); $t.Id = b; Ql($t); return; } Yr(Ov()); }
function Ql($t) { $t.Kb = $t.Gb.data.length * $t.Id | 0; }
function Sn($t) { return Pv($t); }
function Hp($t, a) { var b; b = Nl($t, a); if (b === null) { return null; } return b.Zc; }
function Nl($t, a) { var b, c; if (a === null) { b = Yo($t); } else { c = Vq(a); b = Ol($t, a, c & ($t.Gb.data.length - 1 | 0), c); } return b; }
function Ol($t, a, b, c) { var d; d = $t.Gb.data[b]; while (d !== null) { if (d.Mc == c) { if (Qr(a, d.Md) != 0) { break; } } d = d.Ad; } return d; }
function Yo($t) { var a; a = $t.Gb.data[0]; while (a !== null) { if (a.Md === null) { break; } a = a.Ad; } return a; }
function Xl($t, a, b) { return Fo($t, a, b); }
function Fo($t, a, b) { var c, d, e, f; if (a === null) { c = Yo($t); if (c === null) { $t.Uc = $t.Uc + 1 | 0; c = Wk($t, null, 0, 0); d = $t.xd + 1 | 0; $t.xd = d; if (d > $t.Kb) { Gn($t); } } } else { d = Vq(a); e = d & ($t.Gb.data.length - 1 | 0); c = Ol($t, a, e, d); if (c === null) { $t.Uc = $t.Uc + 1 | 0; c = Wk($t, a, e, d); d = $t.xd + 1 | 0; $t.xd = d; if (d > $t.Kb) { Gn($t); } } } f = c.Zc; c.Zc = b; return f; }
function Wk($t, a, b, c) { var d; d = Qv(a, c); d.Ad = $t.Gb.data[b]; $t.Gb.data[b] = d; return d; }
function Pn($t, a) { var b, c, d, e, f, g, h; b = Fq(a == 0 ? 1 : a << 1); c = $t.s(b); d = 0; b = b - 1 | 0; while (d < $t.Gb.data.length) { e = $t.Gb.data[d]; $t.Gb.data[d] = null; while (e !== null) { f = c.data; g = e.Mc & b; h = e.Ad; e.Ad = f[g]; f[g] = e; e = h; } d = d + 1 | 0; } $t.Gb = c; Ql($t); }
function Gn($t) { Pn($t, $t.Gb.data.length); }
function Hi($t, a) { var b, c, d, e, f, g; a: { b = 0; c = null; if (a === null) { d = $t.Gb.data[0]; while (d !== null) { if (d.Md === null) { break a; } a = d.Ad; c = d; d = a; } } else { e = Vq(a); b = e & ($t.Gb.data.length - 1 | 0); d = $t.Gb.data[b]; while (d !== null) { if (d.Mc == e) { if (Qr(a, d.Md) != 0) { break; } } f = d.Ad; c = d; d = f; } } } if (d === null) { return null; } if (c !== null) { c.Ad = d.Ad; } else { g = $t.Gb.data; g[b] = d.Ad; } $t.Uc = $t.Uc + 1 | 0; $t.xd = $t.xd - 1 | 0; return d; }
function Vq(a) { return Dp(a); }
function Qr(a, b) { return a !== b && Aq(a, b) == 0 ? 0 : 1; }
function Ye() { E.call(this); }
function Vn($t, a) { return $t.Jf(a); }
function Fl($t) { return $t.Kf(); }
function Wd() { E.call(this); }
function Fr(a) { return $rt_str(a); }
function Xc() { E.call(this); }
function Pf() { var a = this; E.call(a); a.Z = null; a.X = null; }
function Zu(b, c) { var $r = new Pf(); Kp($r, b, c); return $r; }
function Kp($t, a, b) { Xi($t); $t.Z = a; $t.X = b; }
function Pp($t) { Kr($t.Z, $t.X); }
function Yi($t) { Pp($t); }
function Zc() { E.call(this); }
function Id() { E.call(this); this.ld = null; }
function Rv(b) { var $r = new Id(); Xp($r, b); return $r; }
function Xp($t, a) { Xi($t); $t.ld = a; }
function Eq(a) { return Rv(a); }
function Rm($t, a) { $t.ld.vc(a); }
function Bl($t, a) { $t.ld.R(a); }
function Af() { var a = this; E.call(a); a.Eb = null; a.Nd = null; a.uc = null; }
function Pt(b, c) { var $r = new Af(); Wp($r, b, c); return $r; }
function Wp($t, a, b) { $t.Nd = a; $t.uc = b; Xi($t); }
function Th($t) { var a, b, c; $t.Eb = Sv($t, $t.Nd, $t.uc); a = Un(); b = Fs(13); c = $t.Eb; a.addEventListener($rt_ustr(b), Kq(c, "handleEvent")); }
function Tm($t, a, b, c) { var d; if (Vk(c.data) == 0) { return; } d = Gr(c.data); if (Aq($rt_str(d.id), $rt_str(a.id)) != 0) { Un().removeEventListener("message", Kq($t.Eb, "handleEvent")); Rm(b, d); } }
function Oc() { E.call(this); }
function Hg() { E.call(this); }
function Au() { var $r = new Hg(); Um($r); return $r; }
function Um($t) { Xi($t); }
function Vc() { E.call(this); }
function Bc() { E.call(this); }
function Qc() { E.call(this); }
function S() { E.call(this); }
function Tv() { var $r = new S(); Mg($r); return $r; }
function Mg($t) { Xi($t); }
function Ec() { S.call(this); this.ee = null; }
function Uv(b) { var $r = new Ec(); Pk($r, b); return $r; }
function Pk($t, a) { Mg($t); $t.ee = a; }
function Ff() { var a = this; Ec.call(a); a.yb = 0; a.hb = null; a.me = null; a.ud = null; }
function Qu(b, c) { var $r = new Ff(); So($r, b, c); return $r; }
function So($t, a, b) { Pk($t, a); $t.hb = Ht(); $t.me = $rt_createCharArray(32); $t.yb = b; $t.ud = Vv(); }
function Xd() { S.call(this); }
function Ru() { var $r = new Xd(); Dk($r); return $r; }
function Dk($t) { Mg($t); }
function Uf() { S.call(this); }
function Su() { var $r = new Uf(); Vj($r); return $r; }
function Vj($t) { Mg($t); }
function Nb() { E.call(this); }
function Wv() { var $r = new Nb(); Ti($r); return $r; }
function Ti($t) { Xi($t); }
function Md() { Nb.call(this); }
function Tu() { var $r = new Md(); Dh($r); return $r; }
function Dh($t) { Ti($t); }
function Fb() { var a = this; E.call(a); a.tb = null; a.cd = null; }
var Xv = null; function Fb_$callClinit() {
    Fb_$callClinit = function () { };
    Ll();
}
function Yv(b, c) { var $r = new Fb(); We($r, b, c); return $r; }
function We($t, a, b) { var c, d, e; Fb_$callClinit(); c = b.data; Xi($t); To(a); d = c.length; e = 0; while (e < d) { To(c[e]); e = e + 1 | 0; } $t.tb = a; $t.cd = b.a(); }
function To(a) { var b, c; Fb_$callClinit(); if (Gl(a) != 0) { Yr(Zv(a)); } if (Vo(Mp(a, 0)) == 0) { Yr(Zv(a)); } b = 1; while (b < C(a)) { a: { c = Mp(a, b); switch (c) { case 43: case 45: case 46: case 58: case 95: break; default: if (Vo(c) != 0) { break a; } else { Yr(Zv(a)); } } } b = b + 1 | 0; } }
function Vo(a) { Fb_$callClinit(); return !(a >= 48 && a <= 57) && !(a >= 97 && a <= 122) && a < 65 && a > 90 ? 0 : 1; }
function Ll() { Xv = Tt(); Xl(Xv, Fs(43), Vv()); }
function Qf() { Fb.call(this); }
function Vv() { var $r = new Qf(); Ji($r); return $r; }
function Ji($t) { We($t, Fs(43), Cs(Dc, 0)); }
function Vb() { L.call(this); }
function Ov() { var $r = new Vb(); Bj($r); return $r; }
function Bj($t) { Hl($t); }
function Bg() { Vb.call(this); this.G = null; }
function Zv(b) { var $r = new Bg(); Tl($r, b); return $r; }
function Tl($t, a) { Bj($t); $t.G = a; }
function Jc() { E.call(this); }
function Wb() { var a = this; E.call(a); a.Md = null; a.Zc = null; }
function Aw(b, c) { var $r = new Wb(); No($r, b, c); return $r; }
function No($t, a, b) { Xi($t); $t.Md = a; $t.Zc = b; }
function Ei($t) { return $t.Md; }
function Fm($t) { return $t.Zc; }
function Sb() { var a = this; Wb.call(a); a.Mc = 0; a.Ad = null; }
function Qv(b, c) { var $r = new Sb(); Mj($r, b, c); return $r; }
function Mj($t, a, b) { No($t, a, null); $t.Mc = b; }
function Ae() { Tb.call(this); }
function Yt() { var $r = new Ae(); El($r); return $r; }
function El($t) { Xk($t); }
function Ag() { var a = this; E.call(a); a.Rc = null; a.Vc = null; a.Tc = null; }
function Sv(b, c, d) { var $r = new Ag(); Di($r, b, c, d); return $r; }
function Di($t, a, b, c) { Xi($t); $t.Rc = a; $t.Vc = b; $t.Tc = c; }
function Fi($t, a) { Ko($t, a); }
function Ko($t, a) { Tm($t.Rc, $t.Vc, $t.Tc, a); }
function Sm($t, a) { Fi($t, a); }
function He() { E.call(this); }
function St() { var $r = new He(); Km($r); return $r; }
function Km($t) { Xi($t); }
function Oe($t) { var $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); $t = $T.l(); } _: while (true) { switch ($p) { case 0: $p = 1; case 1: Ig(); if (Es()) { break _; } return; default: N(); } } J().s($t, $p); }
function Bd() { E.call(this); }
function Yc() { E.call(this); }
function Wc() { E.call(this); }
function Nc() { E.call(this); }
function Zf() { E.call(this); }
function Oq(a, b, c) { a.setAttribute($rt_ustr(b), $rt_ustr(c)); return a; }
function Sq(a) { var b, c; b = a.lastChild; while (b !== null) { c = b.previousSibling; if (b.nodeType != 2) { a.removeChild(b); } b = c; } return a; }
function Pr(a, b) { var c; c = Sq(a); b = a.ownerDocument.createTextNode($rt_ustr(b)); c.appendChild(b); return a; }
function Od() { E.call(this); }
function Ir(a, b) { if (a < b) { b = a; } return b; }
function Qq(a, b) { if (a > b) { b = a; } return b; }
function Eb() { E.call(this); }
function Be() { E.call(this); this.vd = null; }
function Mu(b) { var $r = new Be(); Sp($r, b); return $r; }
function Sp($t, a) { Xi($t); $t.vd = a; }
function Ud($t) { var a, $p, $z; $p = 0; if (O()) { var $T = J(); $p = $T.l(); a = $T.l(); $t = $T.l(); } _: while (true) { switch ($p) { case 0: a = $t.vd; $p = 1; case 1: Jf(a); if (Es()) { break _; } return; default: N(); } } J().s($t, a, $p); }
function Lf() { var a = this; E.call(a); a.Yc = null; a.ab = null; }
function Jt() { var $r = new Lf(); Ph($r); return $r; }
function Ph($t) { Xi($t); $t.ab = Bw(); }
function Hd() { var a = this; E.call(a); a.Q = null; a.S = null; }
function Kt(b, c) { var $r = new Hd(); Lm($r, b, c); return $r; }
function Lm($t, a, b) { Xi($t); $t.Q = a; $t.S = b; }
function Oj($t, a) { Dn($t, a); }
function Dn($t, a) { Rn($t.Q, $t.S, a); }
function Yl($t, a) { Oj($t, a); }
function Tf() { var a = this; Ub.call(a); a.pd = 0; a.Xb = null; a.he = null; }
function Bw() { var $r = new Tf(); Ap($r); return $r; }
function Ap($t) { Hh($t); $t.pd = 0; $t.Xb = null; }
function Qi($t, a) { return Cs(Sf, a); }
function Mm($t, a, b, c) { var d; d = Cw(a, c); d.Ad = $t.Gb.data[b]; $t.Gb.data[b] = d; Ii($t, d); return d; }
function Sg($t, a, b) { var c; c = Om($t, a, b); if (Wj($t, $t.Xb) != 0) { a = $t.Xb; Tn($t, a.Md); } return c; }
function Om($t, a, b) { var c, d, e, f, g; if ($t.xd == 0) { $t.Xb = null; $t.he = null; } if (a === null) { c = Yo($t); if (c !== null) { Ii($t, c); } else { $t.Uc = $t.Uc + 1 | 0; d = $t.xd + 1 | 0; $t.xd = d; if (d > $t.Kb) { Gn($t); } c = Mm($t, null, 0, 0); } } else { e = Dp(a); d = (e & 2147483647) % $t.Gb.data.length | 0; c = Ol($t, a, d, e); if (c !== null) { Ii($t, c); } else { $t.Uc = $t.Uc + 1 | 0; f = $t.xd + 1 | 0; $t.xd = f; if (f > $t.Kb) { Gn($t); d = (e & 2147483647) % $t.Gb.data.length | 0; } c = Mm($t, a, d, e); } } g = c.Zc; c.Zc = b; return g; }
function Ii($t, a) { var b, c; if ($t.he === a) { return; } if ($t.Xb === null) { $t.Xb = a; $t.he = a; return; } b = a.H; c = a.Yd; if (b !== null) { if (c === null) { return; } if ($t.pd != 0) { b.Yd = c; c.H = b; a.Yd = null; a.H = $t.he; $t.he.Yd = a; $t.he = a; } return; } if (c === null) { a.H = $t.he; a.Yd = null; $t.he.Yd = a; $t.he = a; } else if ($t.pd != 0) { $t.Xb = c; c.H = null; a.H = $t.he; a.Yd = null; $t.he.Yd = a; $t.he = a; } }
function Ho($t) { return Dw($t); }
function Tn($t, a) { var b, c, d; b = Hi($t, a); if (b === null) { return null; } c = b.H; d = b.Yd; if (c === null) { $t.Xb = d; } else { c.Yd = d; } if (d === null) { $t.he = c; } else { d.H = c; } return b.Zc; }
function Wj($t, a) { return 0; }
function Rr(a) { return a.Xb; }
function Sc() { E.call(this); }
function Cb() { E.call(this); }
function V() { E.call(this); }
function Ew() { var $r = new V(); Zp($r); return $r; }
function Zp($t) { Xi($t); }
function Uc() { E.call(this); }
function Mb() { V.call(this); }
function Fw() { var $r = new Mb(); Ml($r); return $r; }
function Ml($t) { Zp($t); }
function Yb() { Mb.call(this); this.wd = null; }
function Pv(b) { var $r = new Yb(); Co($r, b); return $r; }
function Co($t, a) { Ml($t); $t.wd = a; }
function Cn($t) { return $t.wd; }
function Qh($t) { return Gw($t.wd); }
function Sf() { var a = this; Sb.call(a); a.Yd = null; a.H = null; }
function Cw(b, c) { var $r = new Sf(); Zn($r, b, c); return $r; }
function Zn($t, a, b) { Mj($t, a, b); $t.Yd = null; $t.H = null; }
function Jd() { Yb.call(this); }
function Dw(b) { var $r = new Jd(); On($r, b); return $r; }
function On($t, a) { Co($t, a); }
function Do($t) { return Hw(Cn($t)); }
function Rb() { E.call(this); }
var Iw = null; var Jw = null; function Rb_$callClinit() {
    Rb_$callClinit = function () { };
    Kn();
}
function Hn(a, b) { Rb_$callClinit(); if (b >= 2 && b <= 36 && a < b) { return a < 10 ? (48 + a | 0) & 65535 : ((97 + a | 0) - 10 | 0) & 65535; } return 0; }
function Kn() { Iw = Bs($rt_charcls()); Jw = Cs(Rb, 128); }
function Fd() { var a = this; E.call(a); a.Fd = null; a.Gd = null; }
function Lt(b, c) { var $r = new Fd(); In($r, b, c); return $r; }
function In($t, a, b) { Xi($t); $t.Fd = a; $t.Gd = b; }
function Xf($t) { Bo($t.Fd, $t.Gd); }
function Ic() { var a = this; E.call(a); a.pc = 0; a.ve = 0; a.Bc = null; a.ob = null; a.Ud = null; a.gb = null; }
function Kw(b) { var $r = new Ic(); Fh($r, b); return $r; }
function Fh($t, a) { Xi($t); $t.gb = a; $t.ve = a.Uc; $t.Bc = null; }
function Dm($t) { var a, b; if ($t.Bc !== null) { return 1; } while (true) { a = $t.pc; b = $t.gb; if (a >= b.Gb.data.length) { break; } if ($t.gb.Gb.data[$t.pc] !== null) { return 1; } $t.pc = $t.pc + 1 | 0; } return 0; }
function Yp($t) { var a, b; a = $t.ve; b = $t.gb; if (a == b.Uc) { return; } Yr(Lw()); }
function Wi($t) { var a, b, c; Yp($t); if (Dm($t) == 0) { Yr(Mw()); } if ($t.Bc === null) { a = $t.gb; b = a.Gb.data; c = $t.pc; $t.pc = c + 1 | 0; $t.ob = b[c]; a = $t.ob; $t.Bc = a.Ad; $t.Ud = null; } else { if ($t.ob !== null) { $t.Ud = $t.ob; } $t.ob = $t.Bc; a = $t.Bc; $t.Bc = a.Ad; } }
function Gc() { E.call(this); }
function Fe() { Ic.call(this); }
function Gw(b) { var $r = new Fe(); Vp($r, b); return $r; }
function Vp($t, a) { Fh($t, a); }
function Dj($t) { Wi($t); return $t.ob; }
function Hk($t) { return Dj($t); }
function Zb() { var a = this; E.call(a); a.Cd = 0; a.Yb = null; a.md = null; a.fe = null; }
function Nw(b) { var $r = new Zb(); Fk($r, b); return $r; }
function Fk($t, a) { Xi($t); $t.Cd = a.Uc; $t.Yb = Rr(a); $t.fe = a; }
function Tj($t) { return $t.Yb === null ? 0 : 1; }
function Hm($t) { var a, b; a = $t.Cd; b = $t.fe; if (a == b.Uc) { return; } Yr(Lw()); }
function Jk($t) { var a; Hm($t); if (Tj($t) == 0) { Yr(Mw()); } $t.md = $t.Yb; a = $t.Yb; $t.Yb = a.Yd; }
function Ue() { Zb.call(this); }
function Hw(b) { var $r = new Ue(); Gk($r, b); return $r; }
function Gk($t, a) { Fk($t, a); }
function Ci($t) { Jk($t); return $t.md; }
function Rh($t) { return Ci($t); }
function Rf() { L.call(this); }
function Js() { var $r = new Rf(); Vg($r); return $r; }
function Vg($t) { Hl($t); }
function Kf() { var a = this; E.call(a); a.Rd = null; a.ie = null; a.ib = null; a.gd = 0; }
function Hs() { var $r = new Kf(); Bp($r); return $r; }
function Bp($t) { Xi($t); $t.ib = H(); $t.Rd = []; $t.ie = []; }
function Qe() { T.call(this); }
function Is(b) { var $r = new Qe(); Ah($r, b); return $r; }
function Ah($t, a) { Ki($t, a); }
function Lg() { E.call(this); }
function Nr(a, b) { var c, d, e, f; a = a.data; c = $rt_createCharArray(b); d = c.data; e = Ir(b, a.length); f = 0; while (f < e) { d[f] = a[f]; f = f + 1 | 0; } return c; }
function Pq(a, b) { var c, d, e, f; c = a.data; d = Yq(Bi(Eh(a)), b); e = Ir(b, c.length); f = 0; while (f < e) { d.data[f] = c[f]; f = f + 1 | 0; } return d; }
function Jr(a, b) { return Dq(a, 0, a.data.length, b); }
function Dq(a, b, c, d) { var e, f, g, h; if (b > c) { Yr(Ov()); } e = c - 1 | 0; while (true) { f = a.data; g = (b + e | 0) / 2 | 0; h = f[g]; if (h == d) { break; } if (d >= h) { b = g + 1 | 0; if (b > e) { return -g - 2 | 0; } } else { e = g - 1 | 0; if (e < b) { return -g - 1 | 0; } } } return g; }
function Ke() { E.call(this); }
function Zq(a) { return a; }
function Mr(a) { return a.length != 0 ? 0 : 1; }
function Mq(a, b) { b = Zq(b); a.push(b); }
function Wr(a) { return a.shift(); }
function Sd() { E.call(this); this.nd = null; }
function Ls(b) { var $r = new Sd(); Nj($r, b); return $r; }
function Nj($t, a) { Xi($t); $t.nd = a; }
function De($t) { Hr($t.nd); }
function Nd() { var a = this; E.call(a); a.Sb = null; a.Tb = null; a.Ub = 0; a.Vb = null; }
function Ks(b, c, d, e) { var $r = new Nd(); Ak($r, b, c, d, e); return $r; }
function Ak($t, a, b, c, d) { Xi($t); $t.Sb = a; $t.Tb = b; $t.Ub = c; $t.Vb = d; }
function Gf($t) { Nq($t.Sb, $t.Tb, $t.Ub, $t.Vb); }
function Dd() { E.call(this); this.Nc = null; }
function Nt(b) { var $r = new Dd(); Cm($r, b); return $r; }
function Cm($t, a) { var b, c, d; Xi($t); b = Ow(); Rg(b, Qp(0)); c = 0; while (c < C(a)) { if (Mp(a, c) == 10) { Rg(b, Qp(c + 1 | 0)); } c = c + 1 | 0; } $t.Nc = $rt_createIntArray(Zg(b)); d = 0; while (d < Zg(b)) { $t.Nc.data[d] = Wo(Eo(b, d)); d = d + 1 | 0; } }
function Ep($t, a, b) { var c, d; c = Jr($t.Nc, a); if (c < 0) { c = -c - 2 | 0; } d = a - $t.Nc.data[c] | 0; if (d > 0 && (c + 1 | 0) < $t.Nc.data.length && (a + 2 | 0) >= $t.Nc.data[c + 1 | 0]) { if (b != 0) { d = d + -1 | 0; } else { d = 0; c = c + 1 | 0; } } return Pw(c, d); }
function Yf() { E.call(this); this.Td = null; }
function Qt(b) { var $r = new Yf(); Tp($r, b); return $r; }
function Tp($t, a) { Xi($t); $t.Td = a; }
function Cp($t, a) { Zi($t, a); }
function Zi($t, a) { Xh($t.Td, a); }
function Uh($t, a) { Cp($t, a); }
function Mc() { E.call(this); }
function Ib() { V.call(this); this.sb = 0; }
function Qw() { var $r = new Ib(); Jj($r); return $r; }
function Jj($t) { Zp($t); }
function Ed() { var a = this; Ib.call(a); a.kc = null; a.N = 0; }
function Ow() { var $r = new Ed(); Am($r); return $r; }
function Rw(b) { var $r = new Ed(); Gi($r, b); return $r; }
function Am($t) { Gi($t, 10); }
function Gi($t, a) { Jj($t); $t.kc = Cs(E, a); }
function Jn($t, a) { if ($t.kc.data.length < a) { $t.kc = Pq($t.kc, $t.kc.data.length >= 1073741823 ? 2147483647 : Qq(a, Qq($t.kc.data.length * 2 | 0, 5))); } }
function Eo($t, a) { Cj($t, a); return $t.kc.data[a]; }
function Zg($t) { return $t.N; }
function Rg($t, a) { var b, c; Jn($t, $t.N + 1 | 0); b = $t.kc.data; c = $t.N; $t.N = c + 1 | 0; b[c] = a; $t.sb = $t.sb + 1 | 0; return 1; }
function Cj($t, a) { if (a >= 0 && a < $t.N) { return; } Yr(Zt()); }
function Cc() { E.call(this); }
function Sw() { var $r = new Cc(); Li($r); return $r; }
function Li($t) { Xi($t); }
function Ob() { Cc.call(this); this.ac = 0; }
var Tw = null; var Uw = null; function Ob_$callClinit() {
    Ob_$callClinit = function () { };
    Pi();
}
function Vw(b) { var $r = new Ob(); Cd($r, b); return $r; }
function Cd($t, a) { Ob_$callClinit(); Li($t); $t.ac = a; }
function Qp(a) { Ob_$callClinit(); if (a >= -128 && a <= 127) { Np(); return Uw.data[a + 128 | 0]; } return Vw(a); }
function Np() { var a; Ob_$callClinit(); if (Uw === null) { Uw = Cs(Ob, 256); a = 0; while (a < Uw.data.length) { Uw.data[a] = Vw(a - 128 | 0); a = a + 1 | 0; } } }
function Wo($t) { return $t.ac; }
function Pi() { Tw = Bs($rt_intcls()); }
function Se() { var a = this; E.call(a); a.ue = 0; a.td = 0; }
function Pw(b, c) { var $r = new Se(); Ln($r, b, c); return $r; }
function Ln($t, a, b) { Xi($t); $t.ue = a; $t.td = b; }
function Pd() { E.call(this); }
function Xq(a, b) { return { line: a, ch: b }; }
function Wf() { L.call(this); }
function Mw() { var $r = new Wf(); Sk($r); return $r; }
function Sk($t) { Hl($t); }
function Df() { L.call(this); }
function Lw() { var $r = new Df(); Qn($r); return $r; }
function Qn($t) { Hl($t); }
function Xe() { E.call(this); }
function Yq(a, b) { if (a === null) { Yr(F()); } if (a === Ar(Bs($rt_voidcls()))) { Yr(Ov()); } if (b >= 0) { return Iq(Bh(a), b); } Yr(Ww()); }
function Iq(a, b) { if (a.$meta.primitive) { if (a == $rt_bytecls()) { return $rt_createByteArray(b); } if (a == $rt_shortcls()) { return $rt_createShortArray(b); } if (a == $rt_charcls()) { return $rt_createCharArray(b); } if (a == $rt_intcls()) { return $rt_createIntArray(b); } if (a == $rt_longcls()) { return $rt_createLongArray(b); } if (a == $rt_floatcls()) { return $rt_createFloatArray(b); } if (a == $rt_doublecls()) { return $rt_createDoubleArray(b); } if (a == $rt_booleancls()) { return $rt_createBooleanArray(b); } } else { return $rt_createArray(a, b) } }
function Rd() { L.call(this); }
function F() { var $r = new Rd(); Zl($r); return $r; }
function Zl($t) { Hl($t); }
function Kg() { L.call(this); }
function Ww() { var $r = new Kg(); Nh($r); return $r; }
function Nh($t) { Hl($t); }
$rt_metadata([E, "java.lang.Object", 0, [], 3072, 3, 0, ["ed", function () { return Jp(this); }, "b", function () { Xi(this); }, "xc", function () { return Eh(this); }, "a", function () { return Lo(this); }, "wc", function () { Mk(this); }], K, "org.teavm.javac.ui.Client", E, [], 3104, 3, K_$callClinit, [], Mf, "org.teavm.jso.impl.JS", E, [], 3104, 0, 0, [], Yd, "org.teavm.javac.ui.Processing", E, [], 3104, 3, 0, [], M, "org.teavm.jso.JSObject", E, [], 65, 3, 0, [], Hb, "org.teavm.jso.dom.xml.Node", E, [M], 65, 3, 0, [], Kc, "org.teavm.jso.dom.xml.Document", E, [Hb], 65, 3, 0, [], P, "org.teavm.jso.dom.events.EventTarget",
    E, [M], 65, 3, 0, [], Pe, "org.teavm.jso.dom.html.HTMLDocument", E, [Kc, P], 65, 3, 0, [], Q, "org.teavm.jso.dom.events.EventListener", E, [M], 65, 3, 0, [], Ie, "$$LAMBDA0$$", E, [Q], 0, 3, 0, ["b", function () { En(this); }, "d", function (b) { Pg(this, b); }, "e", function (b) { return Ni(this, b); }], Rc, "java.lang.reflect.AnnotatedElement", E, [], 65, 3, 0, [], Bf, "java.lang.Class", E, [Rc], 3072, 3, 0, ["Fb", function (b) { Zj(this, b); }, "dc", function () { return Bh(this); }, "Zd", function () { return Bi(this); }], Zd, "org.teavm.platform.Platform", E, [], 3104, 3, 0, [], U, "java.io.Serializable",
    E, [], 65, 3, 0, [], W, "java.lang.Comparable", E, [], 65, 3, 0, [], Kb, "java.lang.CharSequence", E, [], 65, 3, 0, [], Dc, "java.lang.String", E, [U, W, Kb], 3072, 3, Dc_$callClinit, ["Ab", function (b) { Re(this, b); }, "ec", function (b, c, d) { Fg(this, b, c, d); }, "ad", function (b) { return Mp(this, b); }, "jc", function () { return C(this); }, "Od", function () { return Gl(this); }, "de", function (b, c, d, e) { D(this, b, c, d, e); }, "Hc", function (b, c) { return Ck(this, b, c); }, "Y", function (b) { return Vi(this, b); }, "Sd", function (b) { return Aq(this, b); }, "cb", function () {
        return Dp(this);
    }, "K", function () { return G(this); }], Y, "java.lang.Throwable", E, [], 3072, 3, 0, ["b", function () { Jo(this); }, "c", function (b) { Yj(this, b); }, "Ec", function () { return Lk(this); }], T, "java.lang.Exception", Y, [], 3072, 3, 0, ["b", function () { Qk(this); }, "c", function (b) { Ki(this, b); }], L, "java.lang.RuntimeException", T, [], 3072, 3, 0, ["b", function () { Hl(this); }], Tb, "java.lang.IndexOutOfBoundsException", L, [], 3072, 3, 0, ["b", function () { Xk(this); }], Gb, "java.lang.Cloneable", E, [], 65, 3, 0, [], Ld, "java.lang.CloneNotSupportedException", T, [], 3072, 3, 0, ["b",
        function () { Ij(this); }], Bb, "java.lang.Runnable", E, [], 65, 3, 0, [], X, "java.lang.Thread", E, [Bb], 3072, 3, X_$callClinit, ["c", function (b) { Vd(this, b); }, "vb", function (b) { Le(this, b); }, "Qb", function (b, c) { Of(this, b, c); }, "Pd", function () { Ik(this); }, "f", function () { Jg(this); }, "db", function () { Jf(this); }], Db, "java.lang.System", E, [], 3104, 3, Db_$callClinit, [], Lb, "java.lang.Error", Y, [], 3072, 3, 0, ["c", function (b) { Ng(this, b); }], Ab, "java.lang.LinkageError", Lb, [], 3072, 3, 0, ["c", function (b) { Xj(this, b); }], Gd, "java.lang.NoClassDefFoundError",
    Ab, [], 3072, 3, 0, [], Z, "java.lang.IncompatibleClassChangeError", Ab, [], 3072, 3, 0, ["c", function (b) { Ro(this, b); }], Eg, "java.lang.NoSuchFieldError", Z, [], 3072, 3, 0, ["c", function (b) { Tk(this, b); }], If, "java.lang.NoSuchMethodError", Z, [], 3072, 3, 0, ["c", function (b) { Im(this, b); }], Hc, "org.teavm.jso.dom.events.FocusEventTarget", E, [P], 65, 3, 0, [], Pb, "org.teavm.jso.dom.events.MouseEventTarget", E, [P], 65, 3, 0, [], Jb, "org.teavm.jso.dom.events.KeyboardEventTarget", E, [P], 65, 3, 0, [], Fc, "org.teavm.jso.dom.events.LoadEventTarget", E, [P], 65, 3, 0,
    [], Tc, "org.teavm.jso.browser.WindowEventTarget", E, [P, Hc, Pb, Jb, Fc], 65, 3, 0, [], Pc, "org.teavm.jso.browser.StorageProvider", E, [], 65, 3, 0, [], Ac, "org.teavm.jso.core.JSArrayReader", E, [M], 65, 3, 0, [], Nf, "org.teavm.jso.browser.Window", E, [M, Tc, Pc, Ac], 3073, 3, 0, ["x", function (b, c) { return Pl(this, b, c); }, "u", function (b, c, d) { return Jl(this, b, c, d); }, "v", function (b) { return Zk(this, b); }, "w", function (b, c) { return Go(this, b, c); }, "Rb", function (b) { return Pj(this, b); }, "Xd", function () { return Kl(this); }, "Zb", function (b, c, d) {
        return Oi(this,
            b, c, d);
    }], Ze, "org.teavm.javac.ui.codemirror.CodeMirror", E, [M], 3073, 3, 0, [], Ce, "$$LAMBDA1$$", E, [Q], 0, 3, 0, ["b", function () { Ok(this); }, "d", function (b) { Oh(this, b); }, "e", function (b) { return Ai(this, b); }], Te, "$$LAMBDA2$$", E, [Q], 0, 3, 0, ["b", function () { Fn(this); }, "d", function (b) { Sj(this, b); }, "e", function (b) { return Ip(this, b); }], Me, "$$LAMBDA3$$", E, [Q], 0, 3, 0, ["b", function () { Lp(this); }, "d", function (b) { Ek(this, b); }, "h", function (b) { Nk(this, b); }, "e", function (b) { return Mo(this, b); }], Hf, "$$LAMBDA4$$", E, [Q], 0, 3, 0, ["b", function () { Xm(this); }, "d", function (b) { Cl(this, b); }, "h", function (b) { Bn(this, b); }, "e", function (b) { return Ul(this, b); }], Ne, "org.teavm.jso.ajax.XMLHttpRequest", E, [M], 3073, 3, 0, [], R, "java.lang.AbstractStringBuilder", E, [U, Kb], 3072, 0, R_$callClinit, ["b", function () { Qd(this); }, "g", function (b) { Ve(this, b); }, "c", function (b) { Ge(this, b); }, "Fc", function (b) { Cg(this, b); }, "ke", function (b) { return Og(this, b); }, "o", function (b, c) { return Xg(this, b, c); }, "sc", function (b) { return Vh(this, b); }, "Kd", function (b, c) { return Yn(this, b, c); }, "Dc", function (b,
        c, d) { return Ri(this, b, c, d); }, "xb", function (b) { return Sl(this, b); }, "z", function (b, c) { return Uj(this, b, c); }, "j", function (b) { Gh(this, b); }, "B", function () { return Yk(this); }, "cc", function (b, c) { Wn(this, b, c); }], Ad, "java.lang.Appendable", E, [], 65, 3, 0, [], Td, "java.lang.StringBuilder", R, [Ad], 3072, 3, 0, ["b", function () { Bk(this); }, "c", function (b) { Rj(this, b); }, "Lb", function (b) { return Qj(this, b); }, "ic", function (b) { return Bm(this, b); }, "Cc", function (b) { return Si(this, b); }, "nb", function (b, c) { return Uo(this, b, c); }, "I", function (b,
            c) { return Mn(this, b, c); }, "B", function () { return Gj(this); }, "j", function (b) { Io(this, b); }, "z", function (b, c) { return Jh(this, b, c); }, "o", function (b, c) { return Fp(this, b, c); }], Cf, "$$LAMBDA5$$", E, [Bb], 0, 3, 0, ["fc", function (b) { An(this, b); }, "f", function () { Je(this); }], Vf, "$$LAMBDA6$$", E, [Q], 0, 3, 0, ["b", function () { Vm(this); }, "d", function (b) { Hj(this, b); }, "i", function (b) { Zo(this, b); }, "e", function (b) { return Rk(this, b); }], Lc, "org.teavm.jso.workers.AbstractWorker", E, [M, P], 65, 3, 0, [], Gg, "org.teavm.jso.workers.Worker", E, [Lc], 3073,
    3, 0, ["x", function (b, c) { return Nm(this, b, c); }, "u", function (b, c, d) { return Xn(this, b, c, d); }, "v", function (b) { return Al(this, b); }, "w", function (b, c) { return Mi(this, b, c); }, "rb", function (b, c, d) { return Yg(this, b, c, d); }, "Gc", function (b) { return Kj(this, b); }], Qb, "java.util.Map", E, [], 65, 3, 0, [], Xb, "java.util.AbstractMap", E, [Qb], 3073, 3, 0, ["b", function () { Wg(this); }], Ub, "java.util.HashMap", Xb, [Gb, U], 3072, 3, 0, ["s", function (b) { return Xo(this, b); }, "b", function () { Hh(this); }, "g", function (b) { Lh(this, b); }, "eb", function (b, c) {
        Fj(this,
            b, c);
    }, "Ob", function () { Ql(this); }, "y", function () { return Sn(this); }, "le", function (b) { return Hp(this, b); }, "qe", function (b) { return Nl(this, b); }, "mb", function (b, c, d) { return Ol(this, b, c, d); }, "Ac", function () { return Yo(this); }, "D", function (b, c) { return Xl(this, b, c); }, "r", function (b, c) { return Fo(this, b, c); }, "C", function (b, c, d) { return Wk(this, b, c, d); }, "yc", function (b) { Pn(this, b); }, "Ld", function () { Gn(this); }, "Hb", function (b) { return Hi(this, b); }], Ye, "org.teavm.jso.core.JSArray", E, [Ac], 3073, 3, 0, ["L", function (b) {
        return Vn(this,
            b);
    }, "fd", function () { return Fl(this); }], Wd, "org.teavm.jso.core.JSString", E, [M], 3073, 3, 0, [], Xc, "org.teavm.jso.ajax.ReadyStateChangeHandler", E, [M], 65, 3, 0, [], Pf, "$$LAMBDA7$$", E, [Xc], 0, 3, 0, ["pe", function (b, c) { Kp(this, b, c); }, "Lc", function () { Pp(this); }, "qd", function () { return Yi(this); }], Zc, "org.teavm.platform.async.AsyncCallback", E, [], 65, 3, 0, [], Id, "org.teavm.platform.plugin.AsyncCallbackWrapper", E, [Zc], 3072, 0, 0, ["ge", function (b) { Xp(this, b); }, "vc", function (b) { Rm(this, b); }, "R", function (b) { Bl(this, b); }], Af, "org.teavm.javac.ui.Client$1ResponseWait",
    E, [], 3072, 0, 0, ["zc", function (b, c) { Wp(this, b, c); }, "f", function () { Th(this); }, "re", function (b, c, d) { Tm(this, b, c, d); }], Oc, "java.util.Comparator", E, [], 65, 3, 0, [], Hg, "$$LAMBDA8$$", E, [Oc], 0, 3, 0, ["b", function () { Um(this); }], Vc, "java.lang.AutoCloseable", E, [], 65, 3, 0, [], Bc, "java.io.Closeable", E, [Vc], 65, 3, 0, [], Qc, "java.io.Flushable", E, [], 65, 3, 0, [], S, "java.io.OutputStream", E, [Bc, Qc], 3073, 3, 0, ["b", function () { Mg(this); }], Ec, "java.io.FilterOutputStream", S, [], 3072, 3, 0, ["Wd", function (b) { Pk(this, b); }], Ff, "java.io.PrintStream", Ec,
    [], 3072, 3, 0, ["we", function (b, c) { So(this, b, c); }], Xd, "java.lang.ConsoleOutputStreamStdout", S, [], 3072, 0, 0, ["b", function () { Dk(this); }], Uf, "java.lang.ConsoleOutputStreamStderr", S, [], 3072, 0, 0, ["b", function () { Vj(this); }], Nb, "java.io.InputStream", E, [Bc], 3073, 3, 0, ["b", function () { Ti(this); }], Md, "java.lang.ConsoleInputStream", Nb, [], 3072, 0, 0, ["b", function () { Dh(this); }], Fb, "java.nio.charset.Charset", E, [W], 3073, 3, Fb_$callClinit, ["zd", function (b, c) { We(this, b, c); }], Qf, "java.nio.charset.impl.UTF8Charset", Fb, [], 3072, 3, 0, ["b",
        function () { Ji(this); }], Vb, "java.lang.IllegalArgumentException", L, [], 3072, 3, 0, ["b", function () { Bj(this); }], Bg, "java.nio.charset.IllegalCharsetNameException", Vb, [], 3072, 3, 0, ["c", function (b) { Tl(this, b); }], Jc, "java.util.Map$Entry", E, [], 65, 3, 0, [], Wb, "java.util.MapEntry", E, [Jc, Gb], 3072, 0, 0, ["Hd", function (b, c) { No(this, b, c); }, "Mb", function () { return Ei(this); }, "T", function () { return Fm(this); }], Sb, "java.util.HashMap$HashEntry", Wb, [], 3072, 0, 0, ["p", function (b, c) { Mj(this, b, c); }], Ae, "java.lang.StringIndexOutOfBoundsException",
    Tb, [], 3072, 3, 0, ["b", function () { El(this); }], Ag, "$$LAMBDA9$$", E, [Q], 0, 3, 0, ["bc", function (b, c, d) { Di(this, b, c, d); }, "d", function (b) { Fi(this, b); }, "i", function (b) { Ko(this, b); }, "e", function (b) { return Sm(this, b); }], He, "$$LAMBDA10$$", E, [Bb], 0, 3, 0, ["b", function () { Km(this); }, "f", function () { Oe(this); }], Bd, "org.teavm.jso.json.JSON", E, [], 3104, 3, 0, [], Yc, "org.teavm.jso.dom.xml.Element", E, [Hb], 65, 3, 0, [], Wc, "org.teavm.jso.dom.css.ElementCSSInlineStyle", E, [M], 65, 3, 0, [], Nc, "org.teavm.jso.dom.events.WheelEventTarget", E, [P], 65, 3,
    0, [], Zf, "org.teavm.jso.dom.html.HTMLElement", E, [Yc, Wc, P, Hc, Pb, Nc, Jb, Fc], 65, 3, 0, [], Od, "java.lang.Math", E, [], 3104, 3, 0, [], Eb, "org.teavm.platform.PlatformRunnable", E, [], 65, 3, 0, [], Be, "$$LAMBDA11$$", E, [Eb], 0, 3, 0, ["W", function (b) { Sp(this, b); }, "f", function () { Ud(this); }], Lf, "org.teavm.javac.ui.Client$ExampleCategory", E, [], 3072, 0, 0, ["b", function () { Ph(this); }], Hd, "$$LAMBDA12$$", E, [Q], 0, 3, 0, ["hc", function (b, c) { Lm(this, b, c); }, "d", function (b) { Oj(this, b); }, "h", function (b) { Dn(this, b); }, "e", function (b) { return Yl(this, b); }], Tf,
    "java.util.LinkedHashMap", Ub, [Qb], 3072, 3, 0, ["b", function () { Ap(this); }, "s", function (b) { return Qi(this, b); }, "C", function (b, c, d) { return Mm(this, b, c, d); }, "D", function (b, c) { return Sg(this, b, c); }, "r", function (b, c) { return Om(this, b, c); }, "qb", function (b) { Ii(this, b); }, "y", function () { return Ho(this); }, "Jb", function (b) { return Tn(this, b); }, "ne", function (b) { return Wj(this, b); }], Sc, "java.lang.Iterable", E, [], 65, 3, 0, [], Cb, "java.util.Collection", E, [Sc], 65, 3, 0, [], V, "java.util.AbstractCollection", E, [Cb], 3073, 3, 0, ["b", function () { Zp(this); }], Uc, "java.util.Set", E, [Cb], 65, 3, 0, [], Mb, "java.util.AbstractSet", V, [Uc], 3073, 3, 0, ["b", function () { Ml(this); }], Yb, "java.util.HashMap$HashMapEntrySet", Mb, [], 3072, 0, 0, ["l", function (b) { Co(this, b); }, "gc", function () { return Cn(this); }, "A", function () { return Qh(this); }], Sf, "java.util.LinkedHashMap$LinkedHashMapEntry", Sb, [], 3104, 0, 0, ["p", function (b, c) { Zn(this, b, c); }], Jd, "java.util.LinkedHashMap$LinkedHashMapEntrySet", Yb, [], 3104, 0, 0, ["k", function (b) { On(this, b); }, "A", function () { return Do(this); }], Rb, "java.lang.Character",
    E, [W], 3072, 3, Rb_$callClinit, [], Fd, "$$LAMBDA13$$", E, [Bb], 0, 3, 0, ["Kc", function (b, c) { In(this, b, c); }, "f", function () { Xf(this); }], Ic, "java.util.HashMap$AbstractMapIterator", E, [], 3072, 0, 0, ["l", function (b) { Fh(this, b); }, "E", function () { return Dm(this); }, "t", function () { Yp(this); }, "q", function () { Wi(this); }], Gc, "java.util.Iterator", E, [], 65, 3, 0, [], Fe, "java.util.HashMap$EntryIterator", Ic, [Gc], 3072, 0, 0, ["l", function (b) { Vp(this, b); }, "m", function () { return Dj(this); }, "n", function () { return Hk(this); }], Zb, "java.util.LinkedHashMap$AbstractMapIterator",
    E, [], 3072, 0, 0, ["k", function (b) { Fk(this, b); }, "E", function () { return Tj(this); }, "t", function () { Hm(this); }, "q", function () { Jk(this); }], Ue, "java.util.LinkedHashMap$EntryIterator", Zb, [Gc], 3072, 0, 0, ["k", function (b) { Gk(this, b); }, "m", function () { return Ci(this); }, "n", function () { return Rh(this); }], Rf, "java.lang.IllegalMonitorStateException", L, [], 3072, 3, 0, ["b", function () { Vg(this); }], Kf, "java.lang.Object$Monitor", E, [], 3072, 0, 0, ["b", function () { Bp(this); }], Qe, "java.lang.IllegalStateException", T, [], 3072, 3, 0, ["c", function (b) { Ah(this, b); }], Lg, "java.util.Arrays", E, [], 3072, 3, 0, [], Ke, "org.teavm.platform.PlatformQueue", E, [M], 3073, 3, 0, [], Sd, "$$LAMBDA14$$", E, [Eb], 0, 3, 0, ["Sc", function (b) { Nj(this, b); }, "f", function () { De(this); }], Nd, "$$LAMBDA15$$", E, [Eb], 0, 3, 0, ["id", function (b, c, d, e) { Ak(this, b, c, d, e); }, "f", function () { Gf(this); }], Dd, "org.teavm.javac.ui.PositionIndexer", E, [], 3072, 3, 0, ["c", function (b) { Cm(this, b); }, "P", function (b, c) { return Ep(this, b, c); }], Yf, "$$LAMBDA16$$", E, [Q], 0, 3, 0, ["c", function (b) { Tp(this, b); }, "d", function (b) {
        Cp(this, b);
    }, "i", function (b) { Zi(this, b); }, "e", function (b) { return Uh(this, b); }], Mc, "java.util.List", E, [Cb], 65, 3, 0, [], Ib, "java.util.AbstractList", V, [Mc], 3073, 3, 0, ["b", function () { Jj(this); }], Ed, "java.util.ArrayList", Ib, [Gb, U], 3072, 3, 0, ["b", function () { Am(this); }, "g", function (b) { Gi(this, b); }, "j", function (b) { Jn(this, b); }, "Oc", function (b) { return Eo(this, b); }, "J", function () { return Zg(this); }, "Bd", function (b) { return Rg(this, b); }, "tc", function (b) { Cj(this, b); }], Cc, "java.lang.Number", E, [U], 3073, 3, 0, ["b", function () { Li(this); }], Ob,
    "java.lang.Integer", Cc, [W], 3072, 3, Ob_$callClinit, ["g", function (b) { Cd(this, b); }, "bd", function () { return Wo(this); }], Se, "org.teavm.javac.ui.Position", E, [], 3072, 3, 0, ["mc", function (b, c) { Ln(this, b, c); }], Pd, "org.teavm.javac.ui.codemirror.TextLocation", E, [M], 3073, 3, 0, [], Wf, "java.util.NoSuchElementException", L, [], 3072, 3, 0, ["b", function () { Sk(this); }], Df, "java.util.ConcurrentModificationException", L, [], 3072, 3, 0, ["b", function () { Qn(this); }], Xe, "java.lang.reflect.Array", E, [], 3104, 3, 0, [], Rd, "java.lang.NullPointerException",
    L, [], 3072, 3, 0, ["b", function () { Zl(this); }], Kg, "java.lang.NegativeArraySizeException", L, [], 3072, 3, 0, ["b", function () { Nh(this); }]]);
$rt_stringPool(["Can\'t enter monitor from another thread synchronously", "click", "diagnostics", "CodeMirror-linenumbers", "get", "examples.json", "display", "block", "/", ".java", "class", "modal-backdrop fade in", "none", "message", "load-classlib", "ok", "Could not load standard library: ", "compile", "diagnostic", "compiler-diagnostic", "compilation-complete", "successful", "MANDATORY_WARNING", "ERROR", "WARNING", "WARNING ", "ERROR ", "at ", "(", ":", ")", "warning-sign gutter-warning", "exclamation-sign gutter-error", "glyphicon glyphicon-",
    "\n", "teavm-java-code", "ready", "stdout", "examples/", "main", "blur", "beforeunload", "null", "UTF-8"]);
var main = Kd;
(function () {
    var c; c = Ie.prototype; c.handleEvent = c.e; c = Nf.prototype; c.removeEventListener = c.x; c.removeEventListener = c.u; c.dispatchEvent = c.v; c.getLength = c.Xd; c.addEventListener = c.w; c.get = c.Rb; c.addEventListener = c.Zb; c = Ce.prototype; c.handleEvent = c.e; c = Te.prototype; c.handleEvent = c.e; c = Me.prototype; c.handleEvent = c.e; c = Hf.prototype; c.handleEvent = c.e; c = Vf.prototype; c.handleEvent = c.e; c = Gg.prototype; c.removeEventListener = c.x; c.removeEventListener = c.u; c.addEventListener = c.rb; c.dispatchEvent = c.v; c.addEventListener = c.w; c.onError
        = c.Gc; c = Ye.prototype; c.get = c.L; c.getLength = c.fd; c = Pf.prototype; c.stateChanged = c.qd; c = Ag.prototype; c.handleEvent = c.e; c = Hd.prototype; c.handleEvent = c.e; c = Yf.prototype; c.handleEvent = c.e;
})();
main = $rt_mainStarter(main);

//# sourceMappingURL=classes.js.map
