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
/******/ 	return __webpack_require__(__webpack_require__.s = 229);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ 12:
/***/ (function(module, exports) {

module.exports = require("underscore");

/***/ }),

/***/ 121:
/***/ (function(module, exports) {

module.exports = require("SQL");

/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(230);


/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(24);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _sql = __webpack_require__(121);

var _sql2 = _interopRequireDefault(_sql);

var _sqlTester = __webpack_require__(231);

var _sqlTester2 = _interopRequireDefault(_sqlTester);

var _sqlResults = __webpack_require__(232);

var _sqlResults2 = _interopRequireDefault(_sqlResults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* globals i18n */


var SQLOutput = function (_Component) {
    _inherits(SQLOutput, _Component);

    function SQLOutput(props) {
        _classCallCheck(this, SQLOutput);

        var _this = _possibleConstructorReturn(this, (SQLOutput.__proto__ || Object.getPrototypeOf(SQLOutput)).call(this, props));

        _this.config = props.config;

        _this.frameRef = _react2.default.createRef();

        _this.tester = new _sqlTester2.default(props);

        _this.handleResultsMounted = _this.handleResultsMounted.bind(_this);
        return _this;
    }

    _createClass(SQLOutput, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            // Load SQL config options
            this.config.runCurVersion("sql", this);

            this.handleParentRequests(this.props, {});
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps) {
            this.handleParentRequests(this.props, prevProps);
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            var doc = this.getDocument();
            if (doc.body && doc.body.children[0]) {
                _reactDom2.default.unmountComponentAtNode(doc.body.children[0]);
            }
        }
    }, {
        key: "handleParentRequests",
        value: function handleParentRequests(props, prevProps) {
            var foundNewRequest = function foundNewRequest(reqName) {
                return props[reqName] && (!prevProps[reqName] || props[reqName].timestamp !== prevProps[reqName].timestamp);
            };

            // Generate a screenshot of current output and send it back
            if (foundNewRequest("screenshotReq")) {
                this.getScreenshot(props.screenshotReq.size, function (data) {
                    props.onScreenshotCreate(data);
                });
            }
            if (foundNewRequest("lintCodeReq")) {
                var req = props.lintCodeReq;
                this.lint(req.code, req.skip, req.timestamp);
            }
            if (foundNewRequest("runCodeReq")) {
                var _req = props.runCodeReq;
                this.runCode(_req.code, _req.timestamp);
            }
            if (foundNewRequest("testCodeReq")) {
                var _req2 = props.testCodeReq;
                this.test(_req2.code, _req2.tests, _req2.errors, _req2.timestamp);
            }
        }
    }, {
        key: "getDocument",
        value: function getDocument() {
            return this.frameRef.current.contentWindow.document;
        }
    }, {
        key: "getScreenshot",
        value: function getScreenshot(screenshotSize, callback) {
            html2canvas(this.getDocument().body, {
                imagesDir: this.props.imagesDir,
                onrendered: function onrendered(canvas) {
                    // Note: this code is the same in webpage-output.js
                    var width = screenshotSize;
                    var height = screenshotSize / canvas.width * canvas.height;

                    // We want to resize the image to a thumbnail,
                    // which we can do by creating a temporary canvas
                    var tmpCanvas = document.createElement("canvas");
                    tmpCanvas.width = screenshotSize;
                    tmpCanvas.height = screenshotSize;
                    tmpCanvas.getContext("2d").drawImage(canvas, 0, 0, width, height);

                    // Send back the screenshot data
                    callback(tmpCanvas.toDataURL("image/png"));
                }
            });
        }

        /**
         * Given an SQLite error and the current statement, suggest a better
         * error message.  SQLlite error messages aren't always very descriptive,
         * this should make common syntax errors easier to understand.
         */

    }, {
        key: "getErrorMessage",
        value: function getErrorMessage(errorMessage, statement) {
            errorMessage = errorMessage || "";
            statement = statement || "";
            statement = statement.toUpperCase();

            var isSyntaxError = errorMessage.indexOf(": syntax error") > -1;
            if (isSyntaxError) {
                errorMessage = i18n._("There's a syntax error " + errorMessage.split(":")[0]);
            }

            // Possible SELECT with missing FROM
            if (errorMessage.indexOf("no such column:") !== -1 && statement.indexOf("SELECT") !== -1 && statement.indexOf("FROM") === -1) {
                errorMessage += ". " + i18n._("Are you missing a FROM clause?");
                // Possible INSERT with missing INTO
            } else if (isSyntaxError && statement.indexOf("INSERT") !== -1 && statement.indexOf("VALUES") !== -1 && statement.indexOf("INTO") === -1) {
                errorMessage += ". " + i18n._("Are you missing the INTO keyword?");
                // Possible INSERT INTO with missing VALUES
            } else if (isSyntaxError && statement.indexOf("INSERT") !== -1 && statement.indexOf("INTO") !== -1 && statement.indexOf("VALUES") === -1) {
                errorMessage += ". " + i18n._("Are you missing the VALUES keyword?");
            } else if (statement.indexOf("INTERGER") !== -1) {
                errorMessage += ". " + i18n._(" Is INTEGER spelled correctly?");
            } else if (isSyntaxError && statement.indexOf("CREATE") !== -1 && statement.search(/CREATE TABLE \w+\s\w+/) > -1) {
                errorMessage += ". " + i18n._("You can't have a space in your table name.");
            } else if (isSyntaxError && statement.indexOf("CREATE TABLE (") > -1) {
                errorMessage += ". " + i18n._("Are you missing the table name?");
            } else if (isSyntaxError && statement.indexOf("PRIMARY KEY INTEGER") !== -1) {
                errorMessage += ". " + i18n._("Did you mean to put PRIMARY KEY after INTEGER?");
            } else if (isSyntaxError && statement.indexOf("(") !== -1 && statement.indexOf(")") === -1) {
                errorMessage += ". " + i18n._("Are you missing a parenthesis?");
            } else if (isSyntaxError && statement.indexOf("CREATE") !== -1 && statement.indexOf("TABLE") === -1 && (statement.indexOf("INDEX") === -1 || statement.indexOf("TRIGGER") === -1 || statement.indexOf("VIEW") === -1)) {
                errorMessage += ". " + i18n._("You may be missing what to create. For " + "example, CREATE TABLE...");
            } else if (isSyntaxError && statement.indexOf("UPDATE") !== -1 && statement.indexOf("SET") === -1) {
                errorMessage += ". " + i18n._("Are you missing the SET keyword?");
            } else if (isSyntaxError && statement.search(/[^SUM]\s*\(.*\)\n*\s*\w+/) > -1 || statement.search(/\n+\s*SELECT/) > -1 || statement.search(/\)\n+\s*INSERT/) > -1) {
                errorMessage += ". " + i18n._("Do you have a semi-colon after each statement?");
            } else if (isSyntaxError && statement.indexOf("INSERT") !== -1 && statement.search(/[^INSERT],\d*\s*[a-zA-Z]+/) > -1) {
                errorMessage += ". " + i18n._("Are you missing quotes around text values?");
            } else if (isSyntaxError && statement.search(/,\s*\)/) > -1) {
                errorMessage += ". " + i18n._("Do you have an extra comma?");
            } else if (isSyntaxError && statement.indexOf("INSERT,") > -1) {
                errorMessage += ". " + i18n._("There shouldn't be a comma after INSERT.");
            } else if (errorMessage.indexOf("column types") > -1 && statement.search(/(\w+\s*,\s*((TEXT)|(INTEGER))+)/) > -1) {
                errorMessage += ". " + i18n._("Do you have an extra comma between the name and type?");
            } else if (errorMessage.indexOf("column types") > -1 && statement.search(/(\w+\s+\w+\s*((TEXT)|(INTEGER)|(REAL))+)/) > -1) {
                errorMessage = i18n._("You can't have a space in your column name.");
            } else if (errorMessage.indexOf("UNIQUE constraint failed") !== -1) {
                errorMessage += ". " + i18n._("Are you specifying a different value for each row?");
            } else if (errorMessage.indexOf("duplicate column name:") !== -1) {
                errorMessage = i18n._("You have multiple columns named `%(name)s` - " + "column names must be unique.", { name: errorMessage.split(":")[1].trim() });
            }
            return errorMessage;
        }
    }, {
        key: "lint",
        value: function lint(userCode, skip, timestamp) {
            var _this2 = this;

            if (skip) {
                return this.props.onCodeLint({
                    code: userCode,
                    timestamp: timestamp,
                    errors: [],
                    warnings: []
                });
            }

            if (!SQLOutput.isSupported()) {
                return this.props.onCodeLint({
                    code: userCode,
                    timestamp: timestamp,
                    errors: [{
                        row: -1,
                        column: -1,
                        text: i18n._("Your browser is not recent enough to show " + "SQL output. Please upgrade your browser."),
                        type: "error",
                        source: "sqlite",
                        lint: undefined,
                        priority: 2
                    }],
                    warnings: []
                });
            }

            // To lint we execute each statement in an isolated environment.
            // We also test for foreign key constraints being violated after
            // each statement so we can give proper line numbers to the user
            // if anything is violated.
            var error = void 0;
            var result = void 0;
            var db = new _sql2.default.Database();
            var results = [];
            _sqlTester2.default.Util.forEachStatement(userCode, function (statement, lineNumber) {
                try {
                    if (!statement) {
                        throw new Error(i18n._("It looks like you have an " + "unnecessary semicolon."));
                    }
                    result = _sqlTester2.default.Util.execSingleStatementWithResults(db, statement);
                    if (result) {
                        results.push(result);
                    }

                    // SQLite allows any column type name and uses these rules
                    // to determine the storage type:
                    // https://www.sqlite.org/datatype3.html
                    // Instead it would be better for learning purposes to require
                    // the valid names that things coerce to.
                    var _tables = _sqlTester2.default.Util.getTables(db);
                    _tables.forEach(function (table) {
                        table.columns.forEach(function (column) {
                            var type = column.type.toUpperCase();
                            var allowedTypes = ["TEXT", "NUMERIC", "INTEGER", "REAL", "NONE"];
                            if (allowedTypes.indexOf(type) === -1) {
                                throw new Error(i18n._("Please use one of the valid column " + "types when creating a table: ") + allowedTypes.join(", "));
                            }
                        });
                    });

                    // Check if we have any new foreign key constraint violations
                    var fkResults = db.exec("PRAGMA foreign_key_check;");
                    if (fkResults.length > 0) {
                        result = fkResults[0];
                        throw new Error("Please check for a foreign key constraint " + "on table " + result.values[0][0] + " for parent table " + result.values[0][2]);
                    }

                    // Check if we have any new integrity errors such as
                    //  NOT NULL violations
                    var integrityResults = db.exec("PRAGMA integrity_check(1);");
                    result = integrityResults[0];
                    if (result.values[0][0] !== "ok") {
                        throw new Error("Integrity error: " + result.values[0][0]);
                    }

                    return true;
                } catch (e) {
                    error = true;
                    _this2.props.onCodeLint({
                        code: userCode,
                        timestamp: timestamp,
                        errors: [{
                            row: lineNumber,
                            column: 0,
                            text: _this2.getErrorMessage(e.message, statement),
                            type: "error",
                            source: "sqlite",
                            lint: undefined,
                            priority: 2
                        }],
                        warnings: []
                    });
                    return false;
                }
            });

            var tables = _sqlTester2.default.Util.getTables(db);
            db.close();

            this.dbInfo = {
                tables: tables,
                results: results,
                userCode: userCode
            };

            if (!error) {
                return this.props.onCodeLint({
                    code: userCode,
                    timestamp: timestamp,
                    errors: [],
                    warnings: []
                });
            }
        }
    }, {
        key: "initTests",
        value: function initTests(validate) {
            if (!validate) {
                return;
            }

            try {
                var code = "with(arguments[0]){\n" + validate + "\n}";
                // eslint-disable-next-line no-new-func
                new Function(code).apply({}, this.tester.testContext);
            } catch (e) {
                return e;
            }
        }
    }, {
        key: "test",
        value: function test(code, tests, errors, timestamp) {
            var _this3 = this;

            var errorCount = errors.length;

            this.tester.test(this.dbInfo, tests, errors, function (errors, results) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    var message = i18n._("Error: %(message)s", {
                        message: errors[errors.length - 1].message
                    });
                    _this3.tester.testContext.assert(false, message, i18n._("A critical problem occurred in your program " + "making it unable to run."));
                }
                _this3.props.onCodeTest({
                    code: code,
                    errors: errors,
                    results: results,
                    timestamp: timestamp
                });
            });
        }
    }, {
        key: "runCode",
        value: function runCode(code, timestamp) {
            if (!SQLOutput.isSupported()) {
                return this.props.onCodeRun({
                    code: code,
                    errors: [],
                    timestamp: timestamp
                });
            }

            var db = new _sql2.default.Database();

            var results = _sqlTester2.default.Util.execWithResults(db, code);
            var tables = _sqlTester2.default.Util.getTables(db);
            db.close();

            this.setState({ scrollToResults: results && results.length });

            var doc = this.getDocument();
            doc.open();
            doc.write('<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>');
            var props = {
                tables: tables,
                results: results,
                onMounted: this.handleResultsMounted
            };
            _reactDom2.default.render(_react2.default.createElement(_sqlResults2.default, props, null), doc.body.children[0]);
            doc.close();

            this.props.onCodeRun({
                code: code,
                errors: [],
                timestamp: timestamp
            });
        }
    }, {
        key: "kill",
        value: function kill() {
            // Completely stop and clear the output
        }
    }, {
        key: "handleResultsMounted",
        value: function handleResultsMounted() {
            if (this.state.scrollToResults && this.state.resultsMounted) {
                // If a new result set was added, scroll to the bottom
                // But ignore the first time the scratchpad loads
                var docEl = this.getDocument().documentElement;
                docEl.scrollTop = docEl.scrollHeight;
            }
            this.setState({ resultsMounted: true });
        }
    }, {
        key: "render",
        value: function render() {
            return _react2.default.createElement("iframe", {
                ref: this.frameRef,
                style: { width: "100%", height: "100%", border: 0 }
            });
        }
    }]);

    return SQLOutput;
}(_react.Component);

exports.default = SQLOutput;


SQLOutput.isSupported = function () {
    // Check to make sure the typed arrays dependency is supported.
    return "Uint8ClampedArray" in window;
};

/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = __webpack_require__(12);

var _lodash2 = _interopRequireDefault(_lodash);

var _sql = __webpack_require__(121);

var _sql2 = _interopRequireDefault(_sql);

var _outputTester = __webpack_require__(34);

var _outputTester2 = _interopRequireDefault(_outputTester);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SQLTester = function SQLTester(options) {
    this.initialize(options);
    this.bindTestContext();
}; /* eslint-disable no-empty, no-var, no-throw-literal, no-redeclare, no-useless-escape */
/* TODO: Fix the lint errors */


SQLTester.prototype = new _outputTester2.default();

/**
 * Small collection of some utility functions to tack onto the function
 * constructor itself.  Does not store state so don't require an object.
 */
SQLTester.Util = {
    /**
     * Obtains a list of all of the tables with information on each table
     *
     * @param db The database to perform the query on
     * @return An array of objects with the fields:
     *   - table: string
     *   - rowCount: number
     *   - columns: array of object of extra properties on each column
     *      cid, name, type, notnul, dflt_value, pk
     */
    getTables: function getTables(db) {
        var tablesResult = db.exec("SELECT name FROM sqlite_master WHERE " + "type='table' and tbl_name != 'sqlite_sequence';");
        var tables = tablesResult.length === 0 ? [] : tablesResult[0].values.map(function (t) {
            return t[0];
        });

        tables = tables.map(function (table) {
            var rowCount = SQLTester.Util.getRowCount(db, table);
            var tablesInfoResult = db.exec("PRAGMA table_info(" + table + ")");
            var v = tablesInfoResult[0].values;
            // Return a table object which also contains each column info
            return {
                name: table,
                rowCount: rowCount,
                columns: v.map(function (v) {
                    return {
                        cid: v[0],
                        name: v[1],
                        type: v[2].toUpperCase(),
                        notnull: v[3],
                        dflt_value: v[4],
                        pk: v[5]
                    };
                })
            };
        });
        return tables;
    },

    /**
     * Obtains the number of rows for the specified table
     *
     * @param db The database to perform the query on
     * @param table The name of the table to query
     */
    getRowCount: function getRowCount(db, table) {
        var result = db.exec("SELECT count(*) FROM " + table);
        return result[0].values[0][0];
    },

    /**
     * Parses out each statement and calls the callback
     *
     * @param userCode the user code to parse
     * @param callback callback(statement, lineNumber)
     *     statement is the statement to execute (could span multiple lines)
     *     lineNumber is the line of code corresponding to the statement
     *     return false from the callback to cancel executing
     */
    forEachStatement: function forEachStatement(userCode, callback) {

        // Implements a simple state machine by hand which will parse out
        // comments and separate on semicolons.
        var currentStatement = "";
        var lineNumber = 0;
        var state = {
            NORMAL: 1,
            ONE_DASH: 2,
            IN_SINGLE_LINE_COMMENT: 3,
            ONE_SLASH: 4,
            IN_MULTI_LINE_COMMENT: 5,
            IN_MULTI_LINE_COMMENT_PLUS_STAR: 6,
            IN_SINGLE_QUOTE_STRING: 7,
            IN_DOUBLE_QUOTE_STRING: 8
        };

        var currentState = state.NORMAL;
        for (var i = 0; i < userCode.length; i++) {
            if (userCode[i] === "\n") {
                lineNumber++;
            }
            switch (currentState) {
                case state.NORMAL:
                    if (userCode[i] === "-") {
                        currentState = state.ONE_DASH;
                        continue;
                    } else if (userCode[i] === "'") {
                        currentState = state.IN_SINGLE_QUOTE_STRING;
                    } else if (userCode[i] === "\"") {
                        currentState = state.IN_DOUBLE_QUOTE_STRING;
                    } else if (userCode[i] === "/") {
                        currentState = state.ONE_SLASH;
                        continue;
                    } else if (userCode[i] === ";") {
                        currentStatement = currentStatement.trim();
                        if (callback(currentStatement, lineNumber) === false) {
                            return;
                        }
                        currentStatement = "";
                        continue;
                    }
                    currentStatement += userCode[i];
                    break;
                case state.ONE_DASH:
                    if (userCode[i] === "-") {
                        currentState = state.IN_SINGLE_LINE_COMMENT;
                        continue;
                    }
                    currentStatement += "-" + userCode[i];
                    currentState = state.NORMAL;
                    break;
                case state.IN_SINGLE_LINE_COMMENT:
                    if (userCode[i] === "\n") {
                        currentState = state.NORMAL;
                    }
                    break;
                case state.ONE_SLASH:
                    if (userCode[i] === "*") {
                        currentState = state.IN_MULTI_LINE_COMMENT;
                        continue;
                    }
                    currentStatement += "/" + userCode[i];
                    currentState = state.NORMAL;
                    break;
                case state.IN_MULTI_LINE_COMMENT:
                    if (userCode[i] === "*") {
                        currentState = state.IN_MULTI_LINE_COMMENT_PLUS_STAR;
                        continue;
                    }
                    break;
                case state.IN_MULTI_LINE_COMMENT_PLUS_STAR:
                    if (userCode[i] === "/") {
                        currentState = state.NORMAL;
                        continue;
                    }
                    break;
                case state.IN_SINGLE_QUOTE_STRING:
                    if (userCode[i] === "'") {
                        currentState = state.NORMAL;
                    }
                    currentStatement += userCode[i];
                    break;
                case state.IN_DOUBLE_QUOTE_STRING:
                    if (userCode[i] === "\"") {
                        currentState = state.NORMAL;
                    }
                    currentStatement += userCode[i];
                    break;
                default:
                    throw "Invalid condition met when parsing code";
            }
        }

        if (currentStatement) {
            currentStatement = currentStatement.trim();
            if (currentStatement) {
                callback(currentStatement, lineNumber);
            }
        }
    },
    /**
     * Executes the results with the specified userCode
     *
     * @param db The databaes to run the code on
     * @param userCode The code to run
     * @return An array of result objects
     */
    execWithResults: function execWithResults(db, userCode) {
        var results = [];
        SQLTester.Util.forEachStatement(userCode, function (statementCode) {
            // Ignore empty statements, this should be caught be linting
            if (!statementCode) {
                return;
            }
            var result = SQLTester.Util.execSingleStatementWithResults(db, statementCode);
            if (result) {
                results.push(result);
            }
        });
        return results;
    },
    /**
     * Executes a single statement
     *
     * @param db The database to execute the statement in
     * @param statement The statement to execute
     * @return a result object or if no results returns null
     */
    execSingleStatementWithResults: function execSingleStatementWithResults(db, statementCode) {
        var stmt = db.prepare(statementCode);
        var o = { values: [] };
        while (stmt.step()) {
            if (!o.columns) {
                o.columns = stmt.getColumnNames();
            }
            // Re-map the data so that arrays never contain arrays.
            // Instead each sub-array will be nested in an object.
            // For some unknown reason, handlebars 1.0.5 doesn't like
            // arrays within arrays on Firefox.
            var rowData = stmt.get();
            if (rowData) {
                rowData = rowData.map(function (data) {
                    return { data: data };
                });
            }
            o.values.push({ result: rowData });
        }
        if (o.columns) {
            return o;
        }
        return null;
    }
};

SQLTester.prototype.testMethods = {
    /*
     * Introspect a callback to determine it's parameters and then
     * produces a constraint that contains the appropriate variables
     * and callbacks.
     *
     * This allows much terser definition of callback functions since you
     * don't have to explicitly state the parameters in a separate list.
     */
    constraint: function constraint(callback) {
        var paramText = /^function [^\(]*\(([^\)]*)\)/.exec(callback.toString())[1];
        var params = paramText.match(/[$_a-zA-z0-9]+/g);

        for (var key in params) {
            if (params[key][0] !== "$") {
                if (window.console) {
                    // eslint-disable-next-line no-console
                    console.warn("Invalid parameter in constraint " + "(should begin with a '$'): ", params[key]);
                }
                return null;
            }
        }
        return {
            variables: params,
            fn: callback
        };
    },

    initTemplateDB: function initTemplateDB(structure) {
        var templateDB = new _sql2.default.Database();
        var templateResults = SQLTester.Util.execWithResults(templateDB, structure);
        var templateTables = SQLTester.Util.getTables(templateDB, true);
        templateDB.close();
        return {
            results: templateResults,
            tables: templateTables,
            userCode: structure
        };
    },

    /*
     *
     * @return {success} if the user DB has at least as many tables as
     *  the comparison DB
     */
    matchTableCount: function matchTableCount(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        if (tables.length < templateTables.length) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     * @return {success} if user table contains same # of rows
     */
    matchTableRowCount: function matchTableRowCount(templateDBOrCount) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;

        if (templateDBOrCount.tables) {
            var templateTables = templateDBOrCount.tables;
            // Make sure we have similar table info
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                var templateTable = templateTables[i];
                // This checks the actual row count of the whole table which
                // may be different from the result set rows.
                if (templateTable && table.rowCount !== templateTable.rowCount) {
                    return { success: false };
                }
            }
        } else {
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                if (table.rowCount !== templateDBOrCount) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    /**
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     * @return {success} if user table contains same # of columns
     */
    matchTableColumnCount: function matchTableColumnCount(templateDBOrCount) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;

        if (templateDBOrCount.tables) {
            var templateTables = templateDBOrCount.tables;

            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                var templateTable = templateTables[i];

                if (templateTable && table.columns.length !== templateTable.columns.length) {
                    return { success: false };
                }
            }
        } else {
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                if (table.columns.length !== templateDBOrCount) {
                    return { success: false };
                }
            }
        }

        return { success: true };
    },

    /**
     * @param templateDBInfo: A template DB to match column names
     * @return {success} if user table contains same column names
     *   Note - it could also contain other names,
     *   use matchTableColumnCount if you need to be exact.
     */
    matchTableColumnNames: function matchTableColumnNames(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        if (!tables.length) {
            return { success: false };
        }
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var tableColumns = table.columns.map(function (obj) {
                return obj.name;
            });
            var templateTable = templateTables[i];
            for (var c = 0; c < templateTable.columns.length; c++) {
                if (!tableColumns.includes(templateTable.columns[c].name)) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    matchResultCount: function matchResultCount(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length !== templateResults.length) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDBOrCount: Either a template DB to match rows against
     *  or an integer of the amount to match against
     */
    matchResultRowCount: function matchResultRowCount(resultIndex, templateDBOrCount) {
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;

        if (results.length < resultIndex + 1) {
            return { success: false };
        }
        if (templateDBOrCount.results && !templateDBOrCount.results[resultIndex]) {
            return { success: false };
        }

        var res = results[resultIndex];
        var targetCount;
        if (templateDBOrCount.results) {
            targetCount = templateDBOrCount.results[resultIndex].values.length;
        } else {
            targetCount = templateDBOrCount;
        }

        if (res.values.length !== targetCount) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDBOrCount: Either a template DB to match columns against
     *  or an integer of the amount to match against
     */
    matchResultColumnCount: function matchResultColumnCount(resultIndex, templateDBOrCount) {
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;

        if (results.length < resultIndex + 1) {
            return { success: false };
        }
        if (templateDBOrCount.results && !templateDBOrCount.results[resultIndex]) {
            return { success: false };
        }

        var res = results[resultIndex];
        var targetCount;
        if (templateDBOrCount.results) {
            targetCount = templateDBOrCount.results[resultIndex].columns.length;
        } else {
            targetCount = templateDBOrCount;
        }

        if (res.columns.length !== targetCount) {
            return { success: false };
        }
        return { success: true };
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDB: The templateDB to match row values against
     */
    matchResultRowValues: function matchResultRowValues(resultIndex, templateDB, options) {
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        options = options || {};

        if (results.length < resultIndex + 1) {
            return { success: false };
        }
        if (templateDB.results && !templateDB.results[resultIndex]) {
            return { success: false };
        }
        var result = results[resultIndex];
        var templateResult = templateDB.results[resultIndex];
        if (options.ignoreOrder) {
            // To compare rows while ignoring order,
            // we stringify each row and sort the array of rows,
            // then do an equality check.
            var resultStringified = result.values.map(function (value) {
                return JSON.stringify(value);
            }).sort();
            var templateStringified = templateResult.values.map(function (value) {
                return JSON.stringify(value);
            }).sort();
            if (!_lodash2.default.isEqual(resultStringified, templateStringified)) {
                return { success: false };
            }
        } else {
            for (var i = 0; i < result.values.length; i++) {
                if (!_lodash2.default.isEqual(result.values[i], templateResult.values[i])) {
                    return { success: false };
                }
            }
        }

        return { success: true };
    },

    /**
     * @param resultIndex: The index of the result to check
     * @param templateDB: The templateDB to match column names against
     */
    matchResultColumnNames: function matchResultColumnNames(resultIndex, templateDB) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDB.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        var result = results[resultIndex];
        var templateResult = templateResults[resultIndex];
        if (result.columns.length !== templateResult.columns.length) {
            return { success: false };
        }
        for (var c = 0; c < result.columns.length; c++) {
            var col = result.columns[c].toLowerCase().replace(/ /g, '');
            var templateCol = templateResult.columns[c].toLowerCase().replace(/ /g, '');
            if (col !== templateCol) {
                return { success: false };
            }
        }
        return { success: true };
    },

    matchResultColumns: function matchResultColumns(templateDBInfo, numResults) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        // This allows us to check Step 1 results even if
        //  Step 2 results are not correct, for example.
        numResults = numResults || results.length;
        for (var i = 0; i < numResults; i++) {
            var res = results[i];
            var templateRes = templateResults[i];
            if (!templateRes || res.columns.length !== templateRes.columns.length) {
                return { success: false };
            }
            for (var c = 0; c < res.columns.length; c++) {
                var col = res.columns[c].toLowerCase().replace(/ /g, '');
                var templateCol = templateRes.columns[c].toLowerCase().replace(/ /g, '');
                if (col !== templateCol) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    matchResultValues: function matchResultValues(templateDBInfo, exactValues, numResults) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        // This allows us to check Step 1 results even if
        //  Step 2 results are not correct, for example.
        numResults = numResults || results.length;

        // Make sure we have similar results
        for (var i = 0; i < numResults; i++) {
            var res = results[i];
            var templateRes = templateResults[i];
            if (!templateRes || res.values.length !== templateRes.values.length) {
                return { success: false };
            }
            if (exactValues) {
                for (var r = 0; r < res.values.length; r++) {
                    // These can be objects
                    if (!_lodash2.default.isEqual(res.values[r], templateRes.values[r])) {
                        return { success: false };
                    }
                }
            }
        }
        return { success: true };
    },

    moreResultsThan: function moreResultsThan(num) {
        var dbInfo = this.userCode;
        var results = dbInfo.results;
        return { success: results.length > num };
    },


    /*
     * Creates a new test result (i.e. new challenge tab)
     */
    assertMatch: function assertMatch(result, description, hint, image) {

        var alternateMessage;
        var alsoMessage;

        if (result.success) {
            alternateMessage = result.message;
        } else {
            alsoMessage = result.message;
        }

        this.testContext.assert(result.success, description, "", {
            structure: hint,
            alternateMessage: alternateMessage,
            alsoMessage: alsoMessage,
            image: image
        });
    }
};

exports.default = SQLTester;

/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(1);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* globals i18n */


var SQLResults = function (_Component) {
    _inherits(SQLResults, _Component);

    function SQLResults() {
        _classCallCheck(this, SQLResults);

        return _possibleConstructorReturn(this, (SQLResults.__proto__ || Object.getPrototypeOf(SQLResults)).apply(this, arguments));
    }

    _createClass(SQLResults, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.props.onMounted();
        }
    }, {
        key: "render",
        value: function render() {
            var schemasHeading = void 0;
            var resultsHeading = void 0;
            if (this.props.tables.length > 0) {
                schemasHeading = _react2.default.createElement(
                    "h1",
                    { style: styles.h1 },
                    i18n._("Database Schema")
                );
            }
            if (this.props.results.length > 0) {
                resultsHeading = _react2.default.createElement(
                    "h1",
                    { style: styles.h1 },
                    i18n._("Results")
                );
            }

            var schemasTables = this.props.tables.map(function (table) {
                var rowText = i18n._("row");
                if (table.columns.length > 1) {
                    rowText = i18n._("rows");
                }
                var columnRows = table.columns.map(function (column) {
                    return _react2.default.createElement(
                        "tr",
                        { key: column.name },
                        _react2.default.createElement(
                            "td",
                            { style: styles.td },
                            column.name,
                            column.pk > 0 && _react2.default.createElement(
                                "span",
                                { style: styles.schemaPK },
                                "(PK)"
                            ),
                            _react2.default.createElement(
                                "span",
                                { style: styles.schemaColumnTypeWrap },
                                _react2.default.createElement(
                                    "span",
                                    { style: styles.schemaColumnType },
                                    column.type
                                )
                            )
                        )
                    );
                });

                return _react2.default.createElement(
                    "table",
                    {
                        style: _extends({}, styles.table, styles.schemaTable),
                        "data-table-name": table.name,
                        key: table.name
                    },
                    _react2.default.createElement(
                        "thead",
                        { style: styles.thead },
                        _react2.default.createElement(
                            "tr",
                            null,
                            _react2.default.createElement(
                                "th",
                                { style: styles.th },
                                _react2.default.createElement(
                                    "strong",
                                    null,
                                    table.name
                                ),
                                _react2.default.createElement(
                                    "span",
                                    { style: styles.schemaRowCount },
                                    table.rowCount,
                                    " ",
                                    rowText
                                )
                            )
                        )
                    ),
                    _react2.default.createElement(
                        "tbody",
                        { style: styles.tbody },
                        columnRows
                    )
                );
            });

            var resultsTables = this.props.results.map(function (result, resultInd) {
                var columnHeaders = result.columns.map(function (columnName, colInd) {
                    return _react2.default.createElement(
                        "th",
                        { key: "col" + colInd, style: styles.th },
                        columnName
                    );
                });
                var valuesRows = result.values.map(function (rowValues, rowInd) {
                    var valuesCells = rowValues.result.map(function (value, colInd) {
                        return _react2.default.createElement(
                            "td",
                            { key: rowInd + "_" + colInd, style: styles.td },
                            value.data === null ? "NULL" : value.data
                        );
                    });
                    return _react2.default.createElement(
                        "tr",
                        { key: "row" + rowInd },
                        valuesCells
                    );
                });

                return _react2.default.createElement(
                    "table",
                    { key: "result" + resultInd, style: styles.table },
                    _react2.default.createElement(
                        "thead",
                        { style: styles.thead },
                        _react2.default.createElement(
                            "tr",
                            null,
                            columnHeaders
                        )
                    ),
                    _react2.default.createElement(
                        "tbody",
                        { style: styles.tbody },
                        valuesRows
                    )
                );
            });
            return _react2.default.createElement(
                "div",
                null,
                schemasHeading,
                schemasTables,
                resultsHeading,
                resultsTables
            );
        }
    }]);

    return SQLResults;
}(_react.Component);

// Note: We cannot use Aphrodite because it inserts the <style> tag
//  into the parent frame, not the iframe.


SQLResults.defaultProps = {
    tables: [],
    results: []
};
exports.default = SQLResults;
var styles = {
    table: {
        borderCollapse: "collapse",
        borderSpacing: 0,
        emptyCells: "show",
        width: "100%",
        marginBottom: "20px"
    },
    schemaTable: {
        float: "left",
        marginRight: "10px",
        width: "auto"
    },
    thead: {
        background: "#e6e6e6",
        color: "#000",
        textAlign: "left",
        verticalAlign: "bottom"
    },
    tbody: {
        border: "1px solid #dbdbdb"
    },
    th: {
        fontFamily: "sans-serif",
        padding: ".4em 1em"
    },
    td: {
        border: "1px solid #eeeeee",
        fontFamily: "Monaco, Menlo, Consolas, monospace",
        fontSize: "inherit",
        margin: 0,
        overflow: "visible",
        padding: ".3em 1em"
    },
    h1: {
        clear: "both",
        color: "#aaa",
        fontFamily: "sans-serif",
        fontSize: "1.1em",
        fontWeight: "normal",
        marginTop: "10px",
        textTransform: "uppercase"
    },
    schemaColumnTypeWrap: {
        float: "right",
        marginLeft: "20px",
        minWidth: "70px"
    },
    schemaColumnType: {
        float: "left",
        color: "#999"
    },
    schemaPK: {
        marginLeft: "8px",
        color: "#999"
    },
    schemaRowCount: {
        color: "#999",
        float: "right",
        marginLeft: "30px",
        textAlign: "right",
        fontWeight: "normal"
    }
};

/***/ }),

/***/ 24:
/***/ (function(module, exports) {

module.exports = require("react-dom");

/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var PooledWorker = function PooledWorker(filename, workersDir, onExec) {
    this.pool = [];
    this.curID = 0;
    this.filename = filename;
    this.workersDir = workersDir;
    this.onExec = onExec || function () {};
};

PooledWorker.prototype.getURL = function () {
    return this.workersDir + this.filename + "?cachebust=G" + new Date().toDateString();
};

PooledWorker.prototype.getWorkerFromPool = function () {
    // NOTE(jeresig): This pool of workers is used to cut down on the
    // number of new web workers that we need to create. If the user
    // is typing really fast, or scrubbing numbers, it has the
    // potential to use a lot of workers. We want to re-use as many of
    // them as possible as their creation can be expensive. (Chrome
    // seems to freak out, use lots of memory, and sometimes crash.)
    var worker = this.pool.shift();
    if (!worker) {
        worker = new window.Worker(this.getURL());
    }
    // Keep track of what number worker we're running so that we know
    // if any new hint workers have been started after this one
    this.curID += 1;
    worker.id = this.curID;
    return worker;
};

/* Returns true if the passed in worker is the most recently created */
PooledWorker.prototype.isCurrentWorker = function (worker) {
    return this.curID === worker.id;
};

PooledWorker.prototype.addWorkerToPool = function (worker) {
    // Return the worker back to the pool
    this.pool.push(worker);
};

PooledWorker.prototype.exec = function () {
    this.onExec.apply(this, arguments);
};

PooledWorker.prototype.kill = function () {
    this.pool.forEach(function (worker) {
        worker.terminate();
    }, this);
    this.pool = [];
};

exports.default = PooledWorker;

/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* eslint-disable no-var, no-redeclare, no-new-func, no-unused-vars, no-undef */
/* TODO: Fix the lint errors */
/* We list i18n and lodash as globals instead of require() them
  due to how we load this file in the test-worker */
/* global i18n, _ */


var _pooledWorker = __webpack_require__(33);

var _pooledWorker2 = _interopRequireDefault(_pooledWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OutputTester = function OutputTester() {};

OutputTester.prototype = {
    initialize: function initialize(options) {
        var tester = this;

        this.tests = [];
        this.testContext = {};

        for (var prop in this.testMethods) {
            if (this.testMethods.hasOwnProperty(prop)) {
                this.testContext[prop] = this.testMethods[prop];
            }
        }

        for (var prop in this.defaultTestContext) {
            /* jshint forin:false */
            if (!(prop in this.testContext)) {
                this.testContext[prop] = this.defaultTestContext[prop];
            }
        }

        // When we call this from a worker, we don't specify a workerFile,
        // and that signifies that we don't need to spawn a worker
        if (!options || !options.workerFile) {
            return;
        }

        /*
         * The worker that runs the tests in the background, if possible.
         */
        this.testWorker = new _pooledWorker2.default(options.workerFile, options.workersDir, function (code, validate, errors, callback) {
            var _this = this;

            // If there are syntax errors in the tests themselves,
            //  then we ignore the request to test.
            try {
                tester.exec(validate);
            } catch (e) {
                // eslint-disable-next-line no-console
                console && console.warn(e.message);
                return;
            }

            // If there's no Worker support *or* there
            //  are syntax errors in user code, we do the testing in
            //  the browser instead.
            // We do it in-browser in the latter case as
            //  the code is often in a syntax-error state,
            //  and the browser doesn't like creating that many workers,
            //  and the syntax error tests that we have are fast.
            if (!window.Worker || errors.length > 0) {
                return tester.test(code, validate, errors, callback);
            }

            var worker = this.getWorkerFromPool();

            worker.onmessage = function (event) {
                if (event.data.type === "test") {
                    // PJSOutput.prototype.kill() is called synchronously
                    // from callback so if we want test workers to be
                    // cleaned up properly we need to add them back to the
                    // pool first.
                    // TODO(kevinb) track workers that have been removed
                    // from the PooledWorker's pool so we don't have to
                    // worry about returning workers to the pool before
                    // calling kill()
                    _this.addWorkerToPool(worker);
                    if (_this.isCurrentWorker(worker)) {
                        var data = event.data.message;
                        callback(data.errors, data.testResults);
                    }
                }
            };
            worker.postMessage({
                code: code,
                validate: validate,
                errors: errors,
                externalsDir: options.externalsDir
            });
        });
    },

    bindTestContext: function bindTestContext(obj) {
        obj = obj || this.testContext;

        /* jshint forin:false */
        for (var prop in obj) {
            if (_typeof(obj[prop]) === "object") {
                this.bindTestContext(obj[prop]);
            } else if (typeof obj[prop] === "function") {
                obj[prop] = obj[prop].bind(this);
            }
        }
    },

    test: function test(userCode, validate, errors, callback) {
        var testResults = [];
        errors = this.errors = errors || [];
        this.userCode = userCode;
        this.tests = [];

        // This will also fill in tests, as it will end up
        // referencing functions like staticTest and that
        // function will fill in this.tests
        this.exec(validate);

        this.curTask = null;
        this.curTest = null;

        for (var i = 0; i < this.tests.length; i++) {
            testResults.push(this.runTest(this.tests[i], i));
        }

        callback(errors, testResults);
    },

    runTest: function runTest(test, i) {
        var result = {
            name: test.name,
            state: "pass",
            results: []
        };

        this.curTest = result;

        test.fn.call(this);

        this.curTest = null;

        return result;
    },

    exec: function exec(code) {
        if (!code) {
            return true;
        }
        code = code.replace(/\$\._/g, "i18n._");
        code = "with(arguments[0]){\n" + code + "\n}";
        new Function(code).call({}, this.testContext);

        return true;
    },

    defaultTestContext: {
        test: function test(name, _fn, type) {
            if (!_fn) {
                _fn = name;
                name = i18n._("Test Case");
            }

            this.tests.push({
                name: name,

                type: type || "default",

                fn: function fn() {
                    try {
                        return _fn.apply(this, arguments);
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console && console.warn(e);
                    }
                }
            });
        },

        staticTest: function staticTest(name, fn) {
            this.testContext.test(name, fn, "static");
        },

        log: function log(msg, state, expected, type, meta) {
            type = type || "info";

            var item = {
                type: type,
                msg: msg,
                state: state,
                expected: expected,
                meta: meta || {}
            };

            if (this.curTest) {
                if (state !== "pass") {
                    this.curTest.state = state;
                }

                this.curTest.results.push(item);
            }

            return item;
        },

        task: function task(msg, tip) {
            this.curTask = this.testContext.log(msg, "pass", tip, "task");
            this.curTask.results = [];
        },

        endTask: function endTask() {
            this.curTask = null;
        },

        assert: function assert(pass, msg, expected, meta) {
            pass = !!pass;
            this.testContext.log(msg, pass ? "pass" : "fail", expected, "assertion", meta);
            return pass;
        },

        isEqual: function isEqual(a, b, msg) {
            return this.testContext.assert(a === b, msg, [a, b]);
        },

        /*
         * Returns a pass result with an optional message
         */
        pass: function pass(message) {
            return {
                success: true,
                message: message
            };
        },

        /*
         * Returns a fail result with an optional message
         */
        fail: function fail(message) {
            return {
                success: false,
                message: message
            };
        },

        /*
         * If any of results passes, returns the first pass. Otherwise, returns
         * the first fail.
         */
        anyPass: function anyPass() {
            return _.find(arguments, this.testContext.passes) || arguments[0] || this.testContext.fail();
        },

        /*
         * If any of results fails, returns the first fail. Otherwise, returns
         * the first pass.
         */
        allPass: function allPass() {
            return _.find(arguments, this.testContext.fails) || arguments[0] || this.testContext.pass();
        },

        /*
         * Returns true if the result represents a pass.
         */
        passes: function passes(result) {
            return result.success;
        },

        /*
         * Returns true if the result represents a fail.
         */
        fails: function fails(result) {
            return !result.success;
        }
    }
};

exports.default = OutputTester;

/***/ })

/******/ });