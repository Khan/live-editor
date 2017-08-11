/* global ProcessingDebugger */
window.PJSDebugger = Backbone.View.extend({
    
    initialize: function(options) {
        this.output = options.output;
        
        this.debugger = new ProcessingDebugger({ 
            context: options.context 
        });
        this.debugger.breakpointsEnabled = false;
        
        this.bind();
    },
    
    exec: function(code) {
        this.debugger.load(code);
        this.debugger.start();
    },
    
    bind: function() {
        window.addEventListener("message", this.handleMessage.bind(this), false);

        this.debugger.onNewObject = window.PJSOutput.newCallback.bind(PJSOutput);

        this.debugger.onBreakpoint = function() {
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine,
                scope: this.deconstruct(this["debugger"].currentScope),
                stack: this["debugger"].currentStack
            });
        }.bind(this);

        this.debugger.onFunctionDone = function() {
            this.postParent({
                type: "debugger",
                action: "done"
            });
        }.bind(this);
    },

    deconstruct: function deconstruct(root) {
        if (root === null || root === undefined) {
            return null;
        }
        var originalObjects = [];
        var descontructedObjects = [];
        var index = 0;
        var traverse = function (obj, isArray) {
            var result = isArray ? [] : {};

            if (originalObjects.indexOf(obj) === -1) {
                originalObjects[index] = obj;
                descontructedObjects[index] = result;

                index++;
            }

            return Object.keys(obj).reduce(function (acc, key) {
                var val = obj[key];

                if (val == null) {
                    acc[key] = val;
                } else if (typeof val === "object") {
                    if (originalObjects.indexOf(val) === -1) {
                        traverse(val, val instanceof Array);
                    }
                    acc[key] = {
                        id: originalObjects.indexOf(val),
                        isArray: val instanceof Array
                    };
                } else if (typeof val === "function") {
                    acc[key] = "[function]";
                } else {
                    acc[key] = val;
                }

                return acc;
            }, result);
        };

        traverse(root);
        return descontructedObjects;
    },

    handleMessage: function(event) {
        var data;
        this.frameSource = event.source;
        this.frameOrigin = event.origin;

        if (typeof event.data === "object") {
            return;
        }

        try {
            data = JSON.parse(event.data);
        } catch (err) {
            return;
        }

        if (data.type !== "debugger") {
            return;
        }

        if (data.action === "debug") {
            if (data.state === "on") {
                this.debugger.breakpointsEnabled = true;
                this.debugger.load(data.code);
            } else if (data.state === "off") {
                this.debugger.breakpointsEnabled = false;
                this.debugger.resume();
                this.output.restart();
            }
        }

        if (data.action === "start") {
            this.output.injector.clear();
            this.debugger.breakpoints = data.breakpoints;
            this.debugger.start(data.paused);
        }

        if (data.action === "resume") {
            this.debugger.resume();
        }

        if (data.action === "stepIn") {
            this.debugger.stepIn();
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine,
                scope: this.deconstruct(this["debugger"].currentScope),
                stack: this["debugger"].currentStack
            });
        }

        if (data.action === "stepOver") {
            this.debugger.stepOver();
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine,
                scope: this.deconstruct(this["debugger"].currentScope),
                stack: this["debugger"].currentStack
            });
        }

        if (data.action === "stepOut") {
            this.debugger.stepOut();
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine,
                scope: this.deconstruct(this["debugger"].currentScope),
                stack: this["debugger"].currentStack
            });
        }

        if (data.action === "setBreakpoint") {
            this.debugger.setBreakpoint(data.line);
        }

        if (data.action === "clearBreakpoint") {
            this.debugger.clearBreakpoint(data.line);
        }
    },

    // Send a message back to the parent frame
    postParent: function(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (this.frameSource) {
            this.frameSource.postMessage(
                typeof data === "string" ? data : JSON.stringify(data),
                this.frameOrigin);
        }
    }
});
