/* global ProcessingDebugger */

import Backbone from "backbone";

Backbone.$ = require("jquery");

const PJSDebugger = Backbone.View.extend({

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
                line: this.debugger.currentLine
            });
        }.bind(this);

        this.debugger.onFunctionDone = function() {
            this.postParent({
                type: "debugger",
                action: "done"
            });
        }.bind(this);
    },

    handleMessage: function(event) {
        let data;

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
            } else if (data.state === "off") {
                this.debugger.breakpointsEnabled = false;
                this.debugger.resume();
                this.output.restart();
            }
        }

        if (data.action === "start") {
            this.output.clear();
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
                line: this.debugger.currentLine
            });
        }

        if (data.action === "stepOver") {
            this.debugger.stepOver();
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine
            });
        }

        if (data.action === "stepOut") {
            this.debugger.stepOut();
            this.postParent({
                type: "debugger",
                action: "step",
                line: this.debugger.currentLine
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

export default PJSDebugger;
