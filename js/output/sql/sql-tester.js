var SQLTester = function(options) {
    this.initialize(options);
    this.bindTestContext();
};

SQLTester.prototype = new OutputTester();


/*
 * Returns a callback which will accept arguments and make a constriant
 * used internally to create shorthand functions that accept arguments
 */
var constraintPartial = function(callback) {
    return function() {
        return {
            variables: arguments,
            fn: callback
        };
    };
};

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
    getTables: function(db) {
        var tablesResult = db.exec("SELECT name FROM sqlite_master WHERE " +
                "type='table' and tbl_name != 'sqlite_sequence';");
        var tables = tablesResult.length === 0? [] :
                tablesResult[0].values.map(function(t) {
            return t[0];
        });

        tables = tables.map(function(table) {
            var rowCount = SQLTester.Util.getRowCount(db, table);
            var tablesInfoResult = db.exec("PRAGMA table_info(" + table + ")");
            var v = tablesInfoResult[0].values;
            // Return a table object which also contains each column info
            return {
                name: table,
                rowCount: rowCount,
                hasSingleRow: rowCount === 1, // lame, for handlebars :(
                columns: v.map(function(v) {
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
    getRowCount: function(db, table) {
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
    forEachStatement: function(userCode, callback) {

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
            IN_DOUBLE_QUOTE_STRING: 8,
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
    execWithResults: function(db, userCode) {
        var results = [];
        SQLTester.Util.forEachStatement(userCode, function(statementCode) {
            // Ignore empty statements, this should be caught be linting
            if (!statementCode) {
                return;
            }
            var result =
                SQLTester.Util.execSingleStatementWithResults(db,
                    statementCode);
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
    execSingleStatementWithResults: function(db, statementCode) {
        var stmt = db.prepare(statementCode);
        var o = { values: []};
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
                rowData = rowData.map(function(data) {
                    return { data: data };
                });
            }
            o.values.push({ result: rowData});
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
    constraint: function(callback) {
        var paramText = /^function [^\(]*\(([^\)]*)\)/
            .exec(callback.toString())[1];
        var params = paramText.match(/[$_a-zA-z0-9]+/g);

        for (key in params) {
            if (params[key][0] !== "$") {
                if (window.console) {
                    console.warn("Invalid parameter in constraint " +
                            "(should begin with a '$'): ", params[key]);
                }
                return null;
            }
        }
        return {
            variables: params,
            fn: callback
        };
    },

    initTemplateDB: function(structure) {
        var templateDB = new SQL.Database();
        var templateResults =
            SQLTester.Util.execWithResults(templateDB, structure);
        var templateTables = SQLTester.Util.getTables(templateDB, true);
        templateDB.close();
        return {
            results: templateResults,
            tables: templateTables,
            userCode: structure
        };
    },

    /*
     * Returns the result of matching a structure against the user's SQL
     */
    matchTableCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        if (tables.length < templateTables.length) {
            return { success: false };
        }
        return { success: true };
    },

    matchTableRowCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        // Make sure we have similar table info
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var templateTable = templateTables[i];
            // This checks the actual row count of the whole table which
            // may be different from the result set rows.
            if (table.rowCount !== templateTable.rowCount) {
                return { success: false };
            }
        }
        return { success: true };
    },

    matchTableColumnCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var tables = dbInfo.tables;
        var templateTables = templateDBInfo.tables;

        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var templateTable = templateTables[i];
            if (table.columns.length !== templateTable.columns.length) {
                return { success: false };
            }
        }
        return { success: true };
    },

    matchResultCount: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length !== templateResults.length) {
            return { success: false };
        }
        return { success: true };
    },

    matchResultColumns: function(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        for (var i = 0; i < results.length; i++) {
            var res = results[i];
            var templateRes = templateResults[i];
            if (res.columns.length !== templateRes.columns.length) {
                return { success: false };
            }
            for (var c = 0; c < res.columns.length; c++) {
                var col = res.columns[c].toLowerCase().replace(/ /g,'');
                var templateCol =
                    templateRes.columns[c].toLowerCase().replace(/ /g,'');
                if (col !== templateCol) {
                    return { success: false };
                }
            }
        }
        return { success: true };
    },

    matchResultValues: function(templateDBInfo, exactValues) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return {success: false};
        }

        var dbInfo = this.userCode;
        var results = dbInfo.results;
        var templateResults = templateDBInfo.results;

        if (results.length < templateResults.length) {
            return { success: false };
        }

        // Make sure we have similar results
        for (var i = 0; i < templateResults.length; i++) {
            var res = results[i];
            var templateRes = templateResults[i];

            if (res.values.length !== templateRes.values.length) {
                return { success: false };
            }
            if (exactValues) {
                for (var r = 0; r < res.values.length; r++) {
                    if (res.values[r] !== templateRes.values[r]) {
                        return { success: false };
                    }
                }
            }
        }
        return { success: true };
    },

    /*
     * Creates a new test result (i.e. new challenge tab)
     */
    assertMatch: function(result, description, hint, image) {
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
    },
};


