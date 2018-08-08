/* eslint-disable no-var, one-var, import/no-commonjs */
/* TODO: Fix the lint errors */
const Backbone = require("backbone");
Backbone.$ = require("jquery");
const iframeOverlay = require("iframe-overlay");
const React = require("react");
const ReactDOM = require("react-dom");

const DebuggerControls = require("./debugger-controls.jsx");

/* Provides debugging support for live-editor */
const ScratchpadDebugger = Backbone.View.extend({

    el: ".scratchpad-debugger",

    initialize: function(options) {
        this.editor = options.editor;
        this.liveEditor = options.liveEditor;

        this.render();
        this.bind();
    },

    render: function() {
        ReactDOM.render(
            React.createElement(DebuggerControls, {}, null),
            this.el);
    },

    remove: function() {
        ReactDOM.unmountComponentAtNode(this.$el[0]);
        this.$el.remove();
    },

    postFrame: function(data) {
        this.liveEditor.postFrame(data);
    },

    bind: function() {
        // create the overlay first before binding any event handlers because
        // createOverlay moves the iframe's position in the DOM tree which
        // unbinds existing event handlers
        var iframe = $("iframe").get(0);
        this.overlay = iframeOverlay.createOverlay(iframe);

        var $el = this.$el;
        var $container = $(this.editor.container);
        var self = this;

        $(window).on("message", this.listenMessages.bind(this));

        $el.on("change", ".debug-mode", function() {
            self.debuggerLevel = $el.find(".debugger-level-select option:selected").val();

            if (this.checked) {
                self.trigger("enabled", true);
                self.editor.setReadOnly(true);
                $container.addClass("debugging");
                $el.find(".ace_cursor").hide();

                $el.find(".debugger-level").show();
                if (self.debuggerLevel === "beginner") {
                    $el.find(".debugger-simple").show();
                } else if (self.debuggerLevel === "advanced") {
                    $el.find(".debugger-complex").show();
                }
            } else {
                self.trigger("enabled", false);
                self.editor.setReadOnly(false);
                $container.removeClass("debugging");
                $el.find(".ace_cursor").show();

                $el.find(".debugger-level").hide();
                $el.find(".debugger-simple").hide();
                $el.find(".debugger-complex").hide();
            }

            self.postFrame({
                type: "debugger",
                action: "debug",
                state: this.checked ? "on": "off"
            });
        });

        var scroller = self.liveEditor.$el.find(".ace_scroller").get(0);
        // needs to be on the capture phase to prevent existing event handlers
        // from firing
        scroller.addEventListener("mousedown", function(e) {
            if (self.get("enabled")) {
                e.stopImmediatePropagation();
            }
        }, true);

        $el.on("change", ".debugger-level-select", function() {
            self.debuggerLevel = $(this).find("option:selected").val();

            if (self.debuggerLevel === "beginner") {
                $el.find(".debugger-complex").hide();
                $el.find(".debugger-simple").show();
            } else if (self.debuggerLevel === "advanced") {
                $el.find(".debugger-simple").hide();
                $el.find(".debugger-complex").show();
            }
        });

        $el.on("click", ".debug-begin", function() {
            self.postFrame({
                type: "debugger",
                action: "start",
                paused: true,
                breakpoints: self.getBreakpoints()
            });

            self.enableButtons();
        });

        $el.on("click", ".debug-end", function() {
            self.postFrame({
                type: "debugger",
                action: "resume",
                ignoreBreakpoints: true
            });
        });

        $el.on("click", ".debug-restart", function() {
            self.postFrame({
                type: "debugger",
                action: "start",
                breakpoints: self.getBreakpoints()
            });
        });

        $el.on("click", ".debug-continue", function() {
            self.postFrame({
                type: "debugger",
                action: "resume"
            });
        });

        $el.on("click", ".step-over", function() {
            self.postFrame({
                type: "debugger",
                action: "stepOver"
            });
        });

        $el.on("click", ".step-in", function() {
            self.postFrame({
                type: "debugger",
                action: "stepIn"
            });
        });

        $el.on("click", ".step-out", function() {
            self.postFrame({
                type: "debugger",
                action: "stepOut"
            });
        });

        // set/clear breakpoints by clicking in the gutter
        this.editor.on("guttermousedown", function(e) {
            var target = e.domEvent.target;
            if (target.className.indexOf("ace_gutter-cell") === -1) {
                return;
            }

            // only set a breakpoint when clicking on the left side of the target
            if (e.clientX > 25 + target.getBoundingClientRect().left) {
                return;
            }

            var row = e.getDocumentPosition().row;

            if (e.editor.session.getBreakpoints()[row]) {
                e.editor.session.clearBreakpoint(row);

                self.postFrame({
                    type: "debugger",
                    action: "clearBreakpoint",
                    line: row + 1
                });
            } else {
                e.editor.session.setBreakpoint(row);

                self.postFrame({
                    type: "debugger",
                    action: "setBreakpoint",
                    line: row + 1
                });
            }

            e.stop();
        });

        // Based on:
        // https://github.com/ajaxorg/cloud9/blob/master/plugins-client/ext.debugger/breakpoints.js#L170
        var session = this.editor.session;
        session.on("change", function(e) {
            if (!session.$breakpoints.length) {
                return;
            }

            var delta = e.data;
            var range = delta.range;
            if (range.end.row === range.start.row) {
                return;
            }

            var len, firstRow;
            len = range.end.row - range.start.row;

            if (delta.action === "insertText" || delta.action === "insertLines") {
                if (delta.action === "insertText") {
                    firstRow = range.start.column ? range.start.row + 1 : range.start.row;
                }

                var args = new Array(len);
                args.unshift(firstRow, 0);
                Array.prototype.splice.apply(session.$breakpoints, args);
            } else if (delta.action === "removeText" || delta.action === "removeLines") {
                firstRow = range.start.row;

                if (range.start.column === 0 && range.end.column === 0) {
                    session.$breakpoints.splice(firstRow, len);
                } else {
                    session.$breakpoints.splice(firstRow + 1, len);
                }
            }
        });
    },

    getBreakpoints: function() {
        var breakpoints = {};
        this.editor.session.getBreakpoints().forEach(function(value, index) {
            breakpoints[index + 1] = true;
        });
        return breakpoints;
    },

    listenMessages: function(e) {
        // DANGER!  The data coming in from the iframe could be anything,
        // because with some cleverness the author of the program can send an
        // arbitrary message up to us.  We need to be careful to sanitize it
        // before doing anything with it, to avoid XSS attacks.  For more
        // information, see the comment in handleMessages in live-editor.js.
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);
        } catch (err) {
            // Malformed JSON, we don't care about it
        }

        if (!data) {
            return;
        }

        if (data.type !== "debugger") {
            return;
        }

        var editor = this.editor;

        if (data.action === "halted") {
            this.disableButtons();
            editor.setHighlightActiveLine(false);
        } else if (data.action === "step") {
            // Coerce to number just in case
            if (+data.line > 0) {
                this.enableButtons();
                editor.gotoLine(+data.line);
                editor.setHighlightActiveLine(true);
                this.overlay.pause();
            } else {
                // TODO: don't post messages when there's no line number
                editor.setHighlightActiveLine(false);
                this.overlay.resume();
            }
        } else if (data.action === "done") {
            editor.setHighlightActiveLine(false);
            this.disableButtons();
            this.overlay.resume();
        }
    },

    enableButtons: function() {
        this.$el.find(".step-over").removeAttr("disabled");
        this.$el.find(".step-in").removeAttr("disabled");
        this.$el.find(".step-out").removeAttr("disabled");
        this.$el.find(".debug-end").removeAttr("disabled");
        this.$el.find(".debug-continue").removeAttr("disabled");
    },

    disableButtons: function() {
        this.$el.find(".step-over").attr("disabled", "");
        this.$el.find(".step-in").attr("disabled", "");
        this.$el.find(".step-out").attr("disabled", "");
        this.$el.find(".debug-end").attr("disabled", "");
        this.$el.find(".debug-continue").attr("disabled", "");
    }
});

module.exports = ScratchpadDebugger;