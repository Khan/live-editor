/* eslint-disable no-var, no-redeclare, no-new-func */
/* TODO: Fix the lint errors */
/* globals i18n */
import React, {Component} from "react";
import ReactDOM from "react-dom";
import SQL from "sql.js";

import SQLTester from "./sql-tester.js";
import SQLResults from "./sql-results.js";

export default class SQLOutput extends Component {
    props: {
        config: Object,
        imagesDir: string,
        onCodeLint: Function,
        onCodeRun: Function,
        onCodeTest: Function,
    };

    constructor(props) {
        super(props);

        this.config = props.config;

        this.frameRef = React.createRef();

        this.tester = new SQLTester(props);

        this.handleResultsMounted = this.handleResultsMounted.bind(this);
    }

    componentDidMount() {
        // Load SQL config options
        this.config.runCurVersion("sql", this);

        this.handleParentRequests(this.props, {});
    }

    componentDidUpdate(prevProps) {
        this.handleParentRequests(this.props, prevProps);
    }

    componentWillUnmount() {
        const doc = this.getDocument();
        if (doc.body && doc.body.children[0]) {
            ReactDOM.unmountComponentAtNode(doc.body.children[0]);
        }
    }

    handleParentRequests(props, prevProps) {
        const foundNewRequest = (reqName) => {
            return (
                props[reqName] &&
                (!prevProps[reqName] ||
                    props[reqName].timestamp !== prevProps[reqName].timestamp)
            );
        };

        // Generate a screenshot of current output and send it back
        if (foundNewRequest("screenshotReq")) {
            this.getScreenshot(props.screenshotReq.size, (data) => {
                props.onScreenshotCreate(data);
            });
        }
        if (foundNewRequest("lintCodeReq")) {
            const req = props.lintCodeReq;
            this.lint(req.code, req.skip, req.timestamp);
        }
        if (foundNewRequest("runCodeReq")) {
            const req = props.runCodeReq;
            this.runCode(req.code, req.timestamp);
        }
        if (foundNewRequest("testCodeReq")) {
            const req = props.testCodeReq;
            this.test(req.code, req.tests, req.errors, req.timestamp);
        }
    }

    handleResultsMounted() {
        if (this.state.scrollToResults && this.state.resultsMounted) {
            // If a new result set was added, scroll to the bottom
            // But ignore the first time the scratchpad loads
            const docEl = this.getDocument().documentElement;
            docEl.scrollTop = docEl.scrollHeight;
        }
        this.setState({resultsMounted: true});
    }

    getDocument() {
        return this.frameRef.current.contentWindow.document;
    }

    getScreenshot(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
            imagesDir: this.props.imagesDir,
            onrendered: function(canvas) {
                var width = screenshotSize;
                var height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(
                    canvas, 0, 0, width, height);

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
    getErrorMessage(errorMessage, statement) {
        errorMessage = errorMessage || "";
        statement = statement || "";
        statement = statement.toUpperCase();

        var isSyntaxError = errorMessage.indexOf(": syntax error") > -1;
        if (isSyntaxError) {
            errorMessage = i18n._("There's a syntax error " +
                errorMessage.split(":")[0]);
        }

        // Possible SELECT with missing FROM
        if (errorMessage.indexOf("no such column:") !== -1 &&
                statement.indexOf("SELECT") !== -1 &&
                statement.indexOf("FROM") === -1) {
            errorMessage += ". " + i18n._("Are you missing a FROM clause?");
        // Possible INSERT with missing INTO
        } else if (isSyntaxError &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("VALUES") !== -1 &&
                statement.indexOf("INTO") === -1) {
            errorMessage += ". " + i18n._("Are you missing the INTO keyword?");
        // Possible INSERT INTO with missing VALUES
        } else if (isSyntaxError &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("INTO") !== -1 &&
                statement.indexOf("VALUES") === -1) {
            errorMessage += ". " +
                i18n._("Are you missing the VALUES keyword?");
        } else if (statement.indexOf("INTERGER") !== -1) {
            errorMessage += ". " +
                i18n._(" Is INTEGER spelled correctly?");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE") !== -1 &&
                statement.search(/CREATE TABLE \w+\s\w+/) > -1) {
            errorMessage += ". " +
                i18n._("You can't have a space in your table name.");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE TABLE (") > -1) {
            errorMessage += ". " +
                i18n._("Are you missing the table name?");
        } else if (isSyntaxError &&
                statement.indexOf("PRIMARY KEY INTEGER") !== -1) {
            errorMessage += ". " +
                i18n._("Did you mean to put PRIMARY KEY after INTEGER?");
        } else if (isSyntaxError &&
                statement.indexOf("(") !== -1 &&
                statement.indexOf(")") === -1) {
            errorMessage += ". " +
                i18n._("Are you missing a parenthesis?");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE") !== -1 &&
                statement.indexOf("TABLE") === -1 && (
                    statement.indexOf("INDEX") === -1 ||
                    statement.indexOf("TRIGGER") === -1 ||
                    statement.indexOf("VIEW") === -1)) {
            errorMessage += ". " +
                i18n._("You may be missing what to create. For " +
                    "example, CREATE TABLE...");
        } else if (isSyntaxError &&
                statement.indexOf("UPDATE") !== -1 &&
                statement.indexOf("SET") === -1) {
            errorMessage += ". " +
                i18n._("Are you missing the SET keyword?");
        } else if (isSyntaxError &&
                statement.search(/[^SUM]\s*\(.*\)\n*\s*\w+/) > -1 ||
                statement.search(/\n+\s*SELECT/) > -1 ||
                statement.search(/\)\n+\s*INSERT/) > -1
                ) {
            errorMessage += ". " +
                i18n._("Do you have a semi-colon after each statement?");
        } else if (isSyntaxError &&
            statement.indexOf("INSERT") !== -1 &&
            statement.search(/[^INSERT],\d*\s*[a-zA-Z]+/) > -1
            ) {
            errorMessage += ". " +
                i18n._("Are you missing quotes around text values?");
        } else if (isSyntaxError &&
            statement.search(/,\s*\)/) > -1) {
            errorMessage += ". " +
                i18n._("Do you have an extra comma?");
        } else if (isSyntaxError &&
            statement.indexOf("INSERT,") > -1 ) {
            errorMessage += ". " +
                i18n._("There shouldn't be a comma after INSERT.");
        } else if (errorMessage.indexOf("column types") > -1 &&
            statement.search(/(\w+\s*,\s*((TEXT)|(INTEGER))+)/) > -1) {
            errorMessage += ". " +
                i18n._("Do you have an extra comma between the name and type?");
        } else if (errorMessage.indexOf("column types") > -1 &&
            statement.search(/(\w+\s+\w+\s*((TEXT)|(INTEGER)|(REAL))+)/) > -1) {
            errorMessage = i18n._("You can't have a space in your column name.");
        } else if (errorMessage.indexOf("UNIQUE constraint failed") !== -1) {
            errorMessage += ". " +
                i18n._("Are you specifying a different value for each row?");
        } else if (errorMessage.indexOf("duplicate column name:") !== -1) {
            errorMessage = i18n._("You have multiple columns named `%(name)s` - " +
                "column names must be unique.",
                {name: errorMessage.split(":")[1].trim()});
        }
        return errorMessage;
    }

    lint(userCode, skip, timestamp) {
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
                    text: i18n._("Your browser is not recent enough to show " +
                                "SQL output. Please upgrade your browser."),
                    type: "error",
                    source: "sqlite",
                    lint: undefined,
                    priority: 2
                }],
                warnings: [],
            });
        }

        // To lint we execute each statement in an isolated environment.
        // We also test for foreign key constraints being violated after
        // each statement so we can give proper line numbers to the user
        // if anything is violated.
        var error;
        var db = new SQL.Database();
        var results = [];
        SQLTester.Util.forEachStatement(userCode,
                function(statement, lineNumber) {
            try {
                if (!statement) {
                    throw new Error(i18n._("It looks like you have an " +
                        "unnecessary semicolon."));
                }
                var result =
                    SQLTester.Util.execSingleStatementWithResults(db,
                        statement);
                if (result) {
                    results.push(result);
                }

                // SQLite allows any column type name and uses these rules
                // to determine the storage type:
                // https://www.sqlite.org/datatype3.html
                // Instead it would be better for learning purposes to require
                // the valid names that things coerce to.
                var tables = SQLTester.Util.getTables(db);
                tables.forEach(function(table) {
                    table.columns.forEach(function(column) {
                        var type = column.type.toUpperCase();
                        var allowedTypes = ["TEXT", "NUMERIC", "INTEGER",
                            "REAL", "NONE"];
                        if (allowedTypes.indexOf(type) === -1) {
                            throw new Error(i18n._("Please use one of the valid column " +
                                "types when creating a table: ") +
                                allowedTypes.join(", "));
                        }
                    });
                });

                // Check if we have any new foreign key constraint violations
                var fkResults = db.exec("PRAGMA foreign_key_check;");
                if (fkResults.length > 0) {
                    var result = fkResults[0];
                    throw new Error("Please check for a foreign key constraint " +
                        "on table " + result.values[0][0] +
                        " for parent table " + result.values[0][2]);
                }

                // Check if we have any new integrity errors such as NOT NULL
                // vilolations
                var integrityResults = db.exec("PRAGMA integrity_check(1);");
                var result = integrityResults[0];
                if (result.values[0][0] !== "ok") {
                    throw new Error("Integrity error: " + result.values[0][0]);
                }

                return true;
            } catch (e) {
                error = true;
                this.props.onCodeLint({
                    code: userCode,
                    timestamp: timestamp,
                    errors: [{
                        row: lineNumber,
                        column: 0,
                        text: this.getErrorMessage(e.message, statement),
                        type: "error",
                        source: "sqlite",
                        lint: undefined,
                        priority: 2
                    }],
                    warnings: []
                });
                return false;
            }
        }.bind(this));

        var tables = SQLTester.Util.getTables(db);
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

    initTests(validate) {
        if (!validate) {
            return;
        }

        try {
            var code = "with(arguments[0]){\n" + validate + "\n}";
            (new Function(code)).apply({}, this.tester.testContext);

        } catch (e) {
            return e;
        }
    }

    test(code, tests, errors, timestamp) {
        const errorCount = errors.length;

        this.tester.test(this.dbInfo, tests, errors,
            function(errors, testResults) {
            if (errorCount !== errors.length) {
                // Note: Scratchpad challenge checks against the exact
                // translated text "A critical problem occurred..." to
                // figure out whether we hit this case.
                var message = i18n._("Error: %(message)s",
                    {message: errors[errors.length - 1].message});
                this.tester.testContext.assert(false, message,
                    i18n._("A critical problem occurred in your program " +
                        "making it unable to run."));
            }
            this.props.onCodeTest({
                code,
                errors,
                results: testResults,
                timestamp,
            });
        }.bind(this));
    }

    runCode(userCode, timestamp) {
        if (!SQLOutput.isSupported()) {
            return this.props.onCodeRun({
                code: userCode,
                errors: [],
                timestamp,
            });
        }

        var db = new SQL.Database();

        var results = SQLTester.Util.execWithResults(db, userCode);
        var tables = SQLTester.Util.getTables(db);
        db.close();

        this.setState({scrollToResults: results && results.length});

        var doc = this.getDocument();
        doc.open();
        doc.write(
            '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>',
        );
        const props = {
            tables,
            results,
            onMounted: this.handleResultsMounted,
        };
        ReactDOM.render(
            React.createElement(SQLResults, props, null),
            doc.body.children[0],
        );
        doc.close();

        this.props.onCodeRun({
            code: userCode,
            errors: [],
            timestamp,
        });
    }

    clear() {
        // Clear the output
    }

    kill() {
        // Completely stop and clear the output
    }

    render() {
        return (
            <iframe
                ref={this.frameRef}
                style={{width: "100%", height: "100%", border: 0}}
            />
        );
    }
}

SQLOutput.isSupported = function() {
    // Check to make sure the typed arrays dependency is supported.
    return "Uint8ClampedArray" in window;
};
