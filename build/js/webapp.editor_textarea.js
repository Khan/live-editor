module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 175);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ 175:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(176);


/***/ }),

/***/ 176:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextareaEditor = function (_Component) {
    _inherits(TextareaEditor, _Component);

    function TextareaEditor(props) {
        _classCallCheck(this, TextareaEditor);

        var _this = _possibleConstructorReturn(this, (TextareaEditor.__proto__ || Object.getPrototypeOf(TextareaEditor)).call(this, props));

        _this.config = props.config;
        _this.config.editor = _this;

        _this.editorRef = _react2.default.createRef();
        _this.handleInput = _this.handleInput.bind(_this);
        return _this;
    }

    _createClass(TextareaEditor, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.reset();
        }
    }, {
        key: "handleInput",
        value: function handleInput() {
            this.props.onChange();
        }
    }, {
        key: "reset",
        value: function reset(code, focus) {
            code = code || this.props.code;

            this.config.runCurVersion(this.props.type + "_editor", this);

            // Reset the editor
            this.text(code);
            this.setCursor({ start: 0, end: 0 }, focus);
        }

        // Focus the editor

    }, {
        key: "focus",
        value: function focus() {
            if (this.autoFocus !== false) {
                this.editorRef.current.focus();
            }
        }
    }, {
        key: "getCursor",
        value: function getCursor() {
            return {
                start: this.editorRef.current.selectionStart,
                end: this.editorRef.current.selectionEnd
            };
        }
    }, {
        key: "getSelectionIndices",
        value: function getSelectionIndices() {
            return this.getCursor();
        }

        // Set the cursor position on the editor

    }, {
        key: "setCursor",
        value: function setCursor(cursorPos, focus) {
            if (this.editorRef.current.setSelectionRange) {
                this.editorRef.current.focus();
                this.editorRef.current.setSelectionRange(cursorPos.start, cursorPos.end);
            } else if (this.editorRef.current.createTextRange) {
                var range = this.editorRef.current.createTextRange();
                range.collapse(true);
                range.moveEnd("character", cursorPos.end);
                range.moveStart("character", cursorPos.start);
                range.select();
            }

            if (focus !== false && this.autoFocus !== false) {
                this.editorRef.current.focus();
            }
        }
    }, {
        key: "setSelection",
        value: function setSelection(selection) {
            this.setCursor(selection);
        }
    }, {
        key: "setReadOnly",
        value: function setReadOnly(readOnly) {
            this.editorRef.current.readOnly = readOnly;
        }
    }, {
        key: "text",
        value: function text(_text) {
            if (_text != null) {
                this.editorRef.current.value = _text;
            } else {
                return this.editorRef.current.value;
            }

            return this;
        }
    }, {
        key: "undo",
        value: function undo() {}
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement("textarea", {
                ref: this.editorRef,
                style: { fontSize: "16px", height: "100%", width: "100%" },
                onInput: this.handleInput
            });
        }
    }]);

    return TextareaEditor;
}(_react.Component);

exports.default = TextareaEditor;

/***/ })

/******/ });