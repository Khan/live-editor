!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.iframeOverlay=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Creates an overlay on top of an iframe that intercepts and retriggers mouse
 * events.  The purpose of this is two-fold:
 * - provide better user experience when a drag operation leaves iframe's bounds
 * - allow events to be filtered to toggle interactivity without having to modify
 *   the code runing inside the iframe
 */

var Poster = require("poster");
var EventSim = require("eventsim");
var LinkedList = require("basic-ds").LinkedList;

function createOverlay(iframe) {
    var wrapper = document.createElement("span");
    wrapper.setAttribute("style", "position:relative;padding:0;margin:0;display:inline-block;");
    wrapper.setAttribute("class", "wrapper");

    var overlay = document.createElement("span");
    overlay.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("tabindex", "0"); // allwos the span to have focus

    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);

    var down = false;
    var paused = false;
    var queue = new LinkedList();

    var poster = new Poster(iframe.contentWindow);

    function postMouseEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            var bounds = wrapper.getBoundingClientRect();
            poster.post("mouse", {
                type: e.type,
                x: e.pageX - bounds.left,
                y: e.pageY - bounds.top,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    function postKeyboardEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            poster.post("keyboard", {
                type: e.type,
                keyCode: e.keyCode,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    overlay.addEventListener("click", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("dblclick", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseover", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseout", function (e) {
        return postMouseEvent(e);
    });

    overlay.addEventListener("mousedown", function (e) {
        down = true;
        postMouseEvent(e);
    });

    overlay.addEventListener("mousemove", function (e) {
        if (!down) {
            postMouseEvent(e);
        }
    });

    window.addEventListener("mousemove", function (e) {
        if (down) {
            e.preventDefault();
            postMouseEvent(e);
        }
    });

    window.addEventListener("mouseup", function (e) {
        if (down) {
            down = false;
            postMouseEvent(e);
        }
    });

    overlay.addEventListener("keydown", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keypress", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keyup", function (e) {
        return postKeyboardEvent(e);
    });

    var keyEventRegex = /key(up|down|press)/;
    var mouseEventRegex = /click|dblclick|mouse(up|down|move|over|out)/;

    return {
        pause: function pause() {
            paused = true;
        },
        resume: function resume() {
            if (!paused) {
                // guard against multiple calls to resume()
                return;
            }
            paused = false;

            function pop() {
                if (paused) {
                    return; // if something has paused use since we posted the last event return
                }

                var e = queue.pop_back();
                if (!e) {
                    return;
                }

                if (e instanceof MouseEvent) {
                    postMouseEvent(e);
                } else if (e instanceof KeyboardEvent) {
                    postKeyboardEvent(e);
                } else if (mouseEventRegex.test(e.type)) {
                    postMouseEvent(e);
                } else if (keyEventRegex.test(e.type)) {
                    postKeyboardEvent(e);
                }

                if (queue.last && queue.last.value) {
                    var next = queue.last.value; // TODO: change last to lastNode
                    var delay = next.timestamp - e.timestamp; // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
                    setTimeout(pop, delay);
                }
            }
            pop();
        }
    };
}

function createRelay(element) {
    var poster = new Poster(window.parent);

    poster.listen("mouse", function (e) {
        EventSim.simulate(element, e.type, {
            clientX: e.x,
            clientY: e.y,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });

    poster.listen("keyboard", function (e) {
        EventSim.simulate(element, e.type, {
            keyCode: e.keyCode,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });
}


exports.createOverlay = createOverlay;
exports.createRelay = createRelay;
},{"basic-ds":5,"eventsim":7,"poster":8}],2:[function(require,module,exports){
var ListNode = require("./ListNode");
var LinkedList = (function () {
    function LinkedList() {
        this.first = null;
        this.last = null;
    }
    LinkedList.prototype.push_back = function (value) {
        var node = new ListNode(value);
        if (this.first === null && this.last === null) {
            this.first = node;
            this.last = node;
        }
        else {
            node.prev = this.last;
            this.last.next = node;
            this.last = node;
        }
    };
    LinkedList.prototype.push_front = function (value) {
        var node = new ListNode(value);
        if (this.first === null && this.last === null) {
            this.first = node;
            this.last = node;
        }
        else {
            node.next = this.first;
            this.first.prev = node;
            this.first = node;
        }
    };
    LinkedList.prototype.pop_back = function () {
        if (this.last) {
            var value = this.last.value;
            if (this.last.prev) {
                var last = this.last;
                this.last = last.prev;
                this.last.next = null;
                last.destroy();
            }
            else {
                this.last = null;
                this.first = null;
            }
            return value;
        }
        else {
            return null;
        }
    };
    LinkedList.prototype.pop_front = function () {
        if (this.first) {
            var value = this.first.value;
            if (this.first.next) {
                var first = this.first;
                this.first = first.next;
                this.first.prev = null;
                first.destroy();
            }
            else {
                this.first = null;
                this.last = null;
            }
            return value;
        }
        else {
            return null;
        }
    };
    LinkedList.prototype.clear = function () {
        this.first = this.last = null;
    };
    LinkedList.prototype.insertBeforeNode = function (refNode, value) {
        if (refNode === this.first) {
            this.push_front(value);
        }
        else {
            var node = new ListNode(value);
            node.prev = refNode.prev;
            node.next = refNode;
            refNode.prev.next = node;
            refNode.prev = node;
        }
    };
    LinkedList.prototype.forEachNode = function (callback, _this) {
        var node = this.first;
        var index = 0;
        while (node !== null) {
            callback.call(_this, node, index);
            node = node.next;
            index++;
        }
    };
    LinkedList.prototype.forEach = function (callback, _this) {
        this.forEachNode(function (node, index) { return callback.call(_this, node.value, index); }, _this);
    };
    LinkedList.prototype.nodeAtIndex = function (index) {
        var i = 0;
        var node = this.first;
        while (node !== null) {
            if (index === i) {
                return node;
            }
            i++;
            node = node.next;
        }
        return null;
    };
    LinkedList.prototype.valueAtIndex = function (index) {
        var node = this.nodeAtIndex(index);
        return node ? node.value : undefined;
    };
    LinkedList.prototype.toArray = function () {
        var array = [];
        var node = this.first;
        while (node !== null) {
            array.push(node.value);
            node = node.next;
        }
        return array;
    };
    LinkedList.fromArray = function (array) {
        var list = new LinkedList();
        array.forEach(function (value) {
            list.push_back(value);
        });
        return list;
    };
    return LinkedList;
})();
module.exports = LinkedList;

},{"./ListNode":3}],3:[function(require,module,exports){
var ListNode = (function () {
    function ListNode(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    ListNode.prototype.destroy = function () {
        this.value = null;
        this.prev = null;
        this.next = null;
    };
    return ListNode;
})();
module.exports = ListNode;

},{}],4:[function(require,module,exports){
var Stack = (function () {
    function Stack() {
        this.items = [];
        this.poppedLastItem = function (item) {
        };
    }
    Stack.prototype.push = function (item) {
        this.items.push(item);
    };
    Stack.prototype.pop = function () {
        var item = this.items.pop();
        if (this.isEmpty) {
            this.poppedLastItem(item);
        }
        return item;
    };
    Stack.prototype.peek = function () {
        return this.items[this.items.length - 1];
    };
    Stack.prototype.toArray = function () {
        return this.items.map(function (item) { return item; });
    };
    Object.defineProperty(Stack.prototype, "size", {
        get: function () {
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "isEmpty", {
        get: function () {
            return this.items.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    return Stack;
})();
module.exports = Stack;

},{}],5:[function(require,module,exports){
exports.LinkedList = require("./LinkedList");
exports.Stack = require("./Stack");

},{"./LinkedList":2,"./Stack":4}],6:[function(require,module,exports){
var initKeyboardEvent_variant = (function (event) {
    try {
        event.initKeyboardEvent("keyup", false, false, window, "+", 3, true, false, true, false, false);
        if ((event["keyIdentifier"] || event["key"]) == "+" && (event["keyLocation"] || event["location"]) == 3) {
            return event.ctrlKey ? (event.altKey ? 1 : 3) : (event.shiftKey ? 2 : 4);
        }
        return 9;
    }
    catch (e) {
        return 0;
    }
})(document.createEvent("KeyboardEvent"));
var keyboardEventProperties = {
    "char": "",
    "key": "",
    "location": 0,
    "ctrlKey": false,
    "shiftKey": false,
    "altKey": false,
    "metaKey": false,
    "repeat": false,
    "locale": "",
    "detail": 0,
    "bubbles": false,
    "cancelable": false,
    "keyCode": 0,
    "charCode": 0,
    "which": 0
};
function createModifersList(dict) {
    var modifiers = ["Ctrl", "Shift", "Alt", "Meta", "AltGraph"];
    return modifiers.filter(function (mod) {
        return dict.hasOwnProperty([mod.toLowerCase() + "Key"]);
    }).join(" ");
}
function createKeyboardEvent(type, dict) {
    var event;
    if (initKeyboardEvent_variant) {
        event = document.createEvent("KeyboardEvent");
    }
    else {
        event = document.createEvent("Event");
    }
    var propName, localDict = {};
    for (propName in keyboardEventProperties) {
        if (keyboardEventProperties.hasOwnProperty(propName)) {
            if (dict && dict.hasOwnProperty(propName)) {
                localDict[propName] = dict[propName];
            }
            else {
                localDict[propName] = keyboardEventProperties[propName];
            }
        }
    }
    var ctrlKey = localDict["ctrlKey"];
    var shiftKey = localDict["shiftKey"];
    var altKey = localDict["altKey"];
    var metaKey = localDict["metaKey"];
    var altGraphKey = localDict["altGraphKey"];
    var key = localDict["key"] + "";
    var char = localDict["char"] + "";
    var location = localDict["location"];
    var keyCode = localDict["keyCode"] || (localDict["keyCode"] = key && key.charCodeAt(0) || 0);
    var charCode = localDict["charCode"] || (localDict["charCode"] = char && char.charCodeAt(0) || 0);
    var bubbles = localDict["bubbles"];
    var cancelable = localDict["cancelable"];
    var repeat = localDict["repeat"];
    var local = localDict["locale"];
    var view = window;
    localDict["which"] || (localDict["which"] = localDict["keyCode"]);
    if ("initKeyEvent" in event) {
        event.initKeyEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
    }
    else if (initKeyboardEvent_variant && "initKeyboardEvent" in event) {
        switch (initKeyboardEvent_variant) {
            case 1:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, shiftKey, altKey, metaKey, altGraphKey);
                break;
            case 2:
                event.initKeyboardEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
                break;
            case 3:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, ctrlKey, altKey, shiftKey, metaKey, altGraphKey);
                break;
            case 4:
                event.initKeyboardEvent(type, bubbles, cancelable, view, key, location, createModifersList(localDict), repeat, local);
                break;
            default:
                event.initKeyboardEvent(type, bubbles, cancelable, view, char, key, location, createModifersList(localDict), repeat, local);
        }
    }
    else {
        event.initEvent(type, bubbles, cancelable);
    }
    for (propName in keyboardEventProperties) {
        if (keyboardEventProperties.hasOwnProperty(propName)) {
            if (event[propName] != localDict[propName]) {
                try {
                    delete event[propName];
                    Object.defineProperty(event, propName, { writable: true, value: localDict[propName] });
                }
                catch (e) {
                }
            }
        }
    }
    return event;
}
module.exports = createKeyboardEvent;

},{}],7:[function(require,module,exports){
var createKeyboardEvent = require("./createKeyboardEvent");
var EventSim;
(function (EventSim) {
    var mouseRegex = /click|dblclick|(mouse(down|move|up|over|out|enter|leave))/;
    var pointerRegex = /pointer(down|move|up|over|out|enter|leave)/;
    var keyboardRegex = /key(up|down|press)/;
    function simulate(target, name, options) {
        var event;
        if (mouseRegex.test(name)) {
            event = new MouseEvent(name, options);
        }
        else if (keyboardRegex.test(name)) {
            event = createKeyboardEvent(name, options);
        }
        else if (pointerRegex.test(name)) {
            event = new PointerEvent(name, options);
        }
        target.dispatchEvent(event);
    }
    EventSim.simulate = simulate;
})(EventSim || (EventSim = {}));
module.exports = EventSim;

},{"./createKeyboardEvent":6}],8:[function(require,module,exports){
var posters = [];
if (self.document) {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            if (poster.target === e.source) {
                var listeners = poster.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            }
        });
    });
}
else {
    self.addEventListener("message", function (e) {
        var channel = e.data.channel;
        posters.forEach(function (poster) {
            var listeners = poster.channels[channel];
            if (listeners) {
                listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
            }
        });
    });
}
var Poster = (function () {
    function Poster(target, origin) {
        var _this = this;
        if (origin === void 0) { origin = "*"; }
        if (self.window && target instanceof HTMLIFrameElement) {
            target = target.contentWindow;
        }
        this.origin = origin;
        this.target = target;
        this.channels = {};
        if (self.window && target instanceof Worker) {
            target.addEventListener("message", function (e) {
                var channel = e.data.channel;
                var listeners = _this.channels[channel];
                if (listeners) {
                    listeners.forEach(function (listener) { return listener.apply(null, e.data.args); });
                }
            });
        }
        posters.push(this);
    }
    Poster.prototype.post = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var message = {
            channel: channel,
            args: args
        };
        if (self.document && !(this.target instanceof Worker)) {
            this.target.postMessage(message, this.origin);
        }
        else {
            this.target.postMessage(message);
        }
    };
    Poster.prototype.emit = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.unshift(channel);
        this.post.apply(this, args);
    };
    Poster.prototype.listen = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners === undefined) {
            listeners = this.channels[channel] = [];
        }
        listeners.push(callback);
        return this;
    };
    Poster.prototype.addListener = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.on = function (channel, callback) {
        return this.listen(channel, callback);
    };
    Poster.prototype.removeListener = function (channel, callback) {
        var listeners = this.channels[channel];
        if (listeners) {
            var index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    };
    Poster.prototype.removeAllListeners = function (channel) {
        this.channels[channel] = [];
    };
    Poster.prototype.listeners = function (channel) {
        var listeners = this.channels[channel];
        return listeners || [];
    };
    return Poster;
})();
module.exports = Poster;

},{}]},{},[1])(1)
});
/* Provides debugging support for live-editor */

window.ScratchpadDebugger = Backbone.View.extend({

    el: ".scratchpad-debugger",

    initialize: function(options) {
        this.editor = options.editor;
        this.liveEditor = options.liveEditor;

        this.render();
        this.bind();
    },

    render: function() {
        this.$el.html(Handlebars.templates["debugger"]({
            execFile: this.execFile,
            imagesDir: this.imagesDir,
            colors: this.colors
        }));
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
            if (target.className.indexOf("ace_gutter-cell") == -1) {
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
            if (range.end.row == range.start.row) {
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
            if (data.line > 0) {
                this.enableButtons();
                editor.gotoLine(data.line);
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

this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["debugger"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<div class=\"scratchpad-debugger\">\n    Debug Mode\n    <input type=\"checkbox\" class=\"debug-mode\">\n    <span class=\"debugger-level\" style=\"display:none;margin-left:20px;\">\n        Level\n        <select class=\"debugger-level-select\">\n            <option value=\"beginner\" selected>Beginner</option>\n            <option value=\"advanced\">Advanced</option>\n        </select>\n    </span>\n\n    <div class=\"debugger-simple\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-begin\" style=\"margin-right:20px;\">Begin</button>\n        <button class=\"step-in\" disabled>Step</button>\n        <button class=\"debug-end\" disabled style=\"margin-left:20px;\">End\n        </button>\n    </div>\n    <div class=\"debugger-complex\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-restart\" style=\"margin-right:10px;\">Restart\n        </button>\n        <!-- start/restart -->\n        <button class=\"step-over\" disabled>Step Over</button>\n        <button class=\"step-in\" disabled>Step In</button>\n        <button class=\"step-out\" disabled>Step Out</button>\n        <button class=\"debug-continue\" disabled style=\"margin-left:10px;\">\n            Continue\n        </button>\n    </div>\n</div>\n";});;