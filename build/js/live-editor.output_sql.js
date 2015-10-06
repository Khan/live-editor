this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["sql-results"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "\n        <h1>Database Schema</h1>\n    ";}

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        <table class=\"sql-schema-table\" data-table-name=\"";
  foundHelper = helpers.name;
  stack1 = foundHelper || depth0.name;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n        <thead>\n        ";
  foundHelper = helpers.hasSingleRow;
  stack1 = foundHelper || depth0.hasSingleRow;
  stack2 = helpers['if'];
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(6, program6, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </thead>\n        <tbody>\n        ";
  foundHelper = helpers.columns;
  stack1 = foundHelper || depth0.columns;
  stack2 = helpers.each;
  tmp1 = self.program(8, program8, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </tbody>\n        </table>\n    ";
  return buffer;}
function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <th><a href=\"javascript:void(0)\">";
  foundHelper = helpers.name;
  stack1 = foundHelper || depth0.name;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a> <span class=\"row-count\">";
  foundHelper = helpers.rowCount;
  stack1 = foundHelper || depth0.rowCount;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "rowCount", { hash: {} }); }
  buffer += escapeExpression(stack1) + " row</span></th>\n        ";
  return buffer;}

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <th><a href=\"javascript:void(0)\">";
  foundHelper = helpers.name;
  stack1 = foundHelper || depth0.name;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a> <span class=\"row-count\">";
  foundHelper = helpers.rowCount;
  stack1 = foundHelper || depth0.rowCount;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "rowCount", { hash: {} }); }
  buffer += escapeExpression(stack1) + " rows</span></th>\n        ";
  return buffer;}

function program8(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <tr><td>\n            ";
  foundHelper = helpers.name;
  stack1 = foundHelper || depth0.name;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + " ";
  foundHelper = helpers.pk;
  stack1 = foundHelper || depth0.pk;
  stack2 = helpers['if'];
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " <span class=\"column-type-wrap\"><span class=\"schema-column-type\">";
  foundHelper = helpers.type;
  stack1 = foundHelper || depth0.type;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span></span>\n            </td></tr>\n        ";
  return buffer;}
function program9(depth0,data) {
  
  
  return "<span class=\"schema-pk\">(PK)</span>";}

function program11(depth0,data) {
  
  
  return "\n        <h1>Results</h1>\n    ";}

function program13(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        <table class=\"sql-result-table\">\n        <thead>\n        ";
  foundHelper = helpers.columns;
  stack1 = foundHelper || depth0.columns;
  stack2 = helpers.each;
  tmp1 = self.program(14, program14, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </thead>\n        <tbody>\n        ";
  foundHelper = helpers.values;
  stack1 = foundHelper || depth0.values;
  stack2 = helpers.each;
  tmp1 = self.program(16, program16, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </tbody>\n        </table>\n    ";
  return buffer;}
function program14(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <th>";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</th>\n        ";
  return buffer;}

function program16(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <tr>\n                ";
  foundHelper = helpers.result;
  stack1 = foundHelper || depth0.result;
  stack2 = helpers.each;
  tmp1 = self.program(17, program17, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </tr>\n        ";
  return buffer;}
function program17(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                    ";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  foundHelper = helpers.isNull;
  stack2 = foundHelper || depth0.isNull;
  tmp1 = self.program(18, program18, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(20, program20, data);
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;}
function program18(depth0,data) {
  
  
  return "\n                        <td>NULL</td>\n                    ";}

function program20(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                        <td>";
  foundHelper = helpers.data;
  stack1 = foundHelper || depth0.data;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "data", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n                    ";
  return buffer;}

  buffer += "<html>\n<head>\n";
  buffer += "\n<style>\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n    empty-cells: show;\n    width: 100%;\n    margin-bottom: 20px;\n}\ntable thead {\n    background: #e6e6e6;\n    color: #000;\n    text-align: left;\n    vertical-align: bottom;\n}\nth:first-child {\n    border-radius: 6px 0 0 0;\n}\nth:last-child {\n    border-radius: 0 6px 0 0;\n}\nth:only-child{\n    border-radius: 6px 6px 0 0;\n}\ntbody {\n    border: 1px solid #dbdbdb;\n}\ntd {\n    border: 1px solid #eeeeee;\n    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;\n    font-size: inherit;\n    margin: 0;\n    overflow: visible;\n    padding: .3em 1em;\n}\nth {\n    font-family: \"Proxima Nova\", sans-serif;\n    padding: .4em 1em;\n}\nth a {\n    color: #699c52;\n}\nh1 {\n    clear: both;\n    color: #aaa;\n    font-family: \"Proxima Nova\", sans-serif;\n    font-size: 1.1em;\n    font-weight: normal;\n    margin-top: 10px;\n    text-transform: uppercase;\n}\ntable.sql-schema-table {\n    float:left;\n    width: auto;\n}\ntable.sql-schema-table .column-type-wrap {\n    float: right;\n    margin-left: 20px;\n    min-width: 70px;\n}\ntable.sql-schema-table .schema-pk {\n    color: #999;\n}\ntable.sql-schema-table .schema-column-type {\n    float: left;\n    color: #999;\n}\ntable.sql-schema-table + table.sql-schema-table {\n    margin-left: 10px\n}\ntable.sql-schema-table .row-count {\n    color: #999;\n    float: right;\n    margin-left: 30px;\n    text-align: right;\n    font-weight: normal;\n}\n</style>\n</head>\n\n<body>\n<div class=\"sql-output\">\n    ";
  foundHelper = helpers.tables;
  stack1 = foundHelper || depth0.tables;
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  foundHelper = helpers.tables;
  stack1 = foundHelper || depth0.tables;
  stack2 = helpers.each;
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    ";
  foundHelper = helpers.results;
  stack1 = foundHelper || depth0.results;
  stack2 = helpers['if'];
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  foundHelper = helpers.results;
  stack1 = foundHelper || depth0.results;
  stack2 = helpers.each;
  tmp1 = self.program(13, program13, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n</body>\n</html>\n";
  return buffer;});;
var SQLTester = function SQLTester(options) {
    this.initialize(options);
    this.bindTestContext();
};

SQLTester.prototype = new OutputTester();

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
                hasSingleRow: rowCount === 1, // lame, for handlebars :(
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
        var templateDB = new SQL.Database();
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
     * Returns the result of matching a structure against the user's SQL
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

    matchTableRowCount: function matchTableRowCount(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
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

    matchTableColumnCount: function matchTableColumnCount(templateDBInfo) {
        // If there were errors from linting, don't even try to match it
        if (this.errors.length) {
            return { success: false };
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
            if (res.columns.length !== templateRes.columns.length) {
                return { success: false };
            }
            for (var c = 0; c < res.columns.length; c++) {
                var col = res.columns[c].toLowerCase().replace(/ /g, "");
                var templateCol = templateRes.columns[c].toLowerCase().replace(/ /g, "");
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

            if (res.values.length !== templateRes.values.length) {
                return { success: false };
            }
            if (exactValues) {
                for (var r = 0; r < res.values.length; r++) {
                    // These can be objects
                    if (!_.isEqual(res.values[r], templateRes.values[r])) {
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
/* global SQLTester */
window.SQLOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;
        this.externalsDir = options.externalsDir;

        this.tester = new SQLTester(options);

        this.render();

        // Load SQL config options
        this.config.runCurVersion("sql", this);

        // Register a helper to tell the difference between null and 0
        Handlebars.registerHelper("isNull", function (variable, options) {
            if (variable === null) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe>").css({ width: "100%", height: "100%", border: "0" }).appendTo(this.el).show();
    },

    getDocument: function getDocument() {
        return this.$frame[0].contentWindow.document;
    },

    getScreenshot: function getScreenshot(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
            imagesDir: this.output.imagesDir,
            onrendered: function onrendered(canvas) {
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
    },

    /**
     * Given an SQLite error and the current statement, suggest a better
     * error message.  SQLlite error messages aren't always very descriptive,
     * this should make common syntax errors easier to understand.
     */
    getErrorMessage: function getErrorMessage(errorMessage, statement) {
        errorMessage = errorMessage || "";
        statement = statement || "";
        statement = statement.toUpperCase();

        // Possible SELECT with missing FROM
        if (errorMessage.indexOf("no such column:") !== -1 && statement.indexOf("SELECT") !== -1 && statement.indexOf("FROM") === -1) {
            errorMessage += ". " + $._("Are you missing a FROM clause?");
            // Possible INSERT with missing INTO
        } else if (errorMessage.indexOf(": syntax error") !== -1 && statement.indexOf("INSERT") !== -1 && statement.indexOf("VALUES") !== -1 && statement.indexOf("INTO") === -1) {
            errorMessage += ". " + $._("Are you missing the INTO keyword?");
            // Possible INSERT INTO with missing VALUES
        } else if (errorMessage.indexOf(": syntax error") !== -1 && statement.indexOf("INSERT") !== -1 && statement.indexOf("INTO") !== -1 && statement.indexOf("VALUES") === -1) {
            errorMessage += ". " + $._("Are you missing the VALUES keyword?");
            // Possible CREATE with missing what to create
        } else if (errorMessage.indexOf(": syntax error") !== -1 && statement.indexOf("CREATE") !== -1 && (statement.indexOf("INDEX") === -1 || statement.indexOf("TABLE") === -1 || statement.indexOf("TRIGGER") === -1 || statement.indexOf("VIEW") === -1)) {
            errorMessage += ". " + $._("You may be missing what to create. For " + "example CREATE TABLE...");
            // Possible UPDATE without SET
        } else if (errorMessage.indexOf(": syntax error") !== -1 && statement.indexOf("UPDATE") !== -1 && statement.indexOf("SET") === -1) {
            errorMessage += ". " + $._("Are you missing the SET keyword?");
        }
        return errorMessage;
    },

    lint: function lint(userCode, skip) {
        // the deferred isn't required in this case, but we need to match the
        // same API as the pjs-output.js' lint method.
        var deferred = $.Deferred();
        if (skip) {
            deferred.resolve({
                errors: [],
                warnings: []
            });
            return deferred;
        }

        if (!window.SQLOutput.isSupported()) {
            deferred.resolve({
                errors: [{
                    row: -1,
                    column: -1,
                    text: $._("Your browser is not recent enough to show " + "SQL output. Please upgrade your browser."),
                    type: "error",
                    source: "sqlite",
                    lint: undefined,
                    priority: 2
                }],
                warnings: []
            });
            return deferred;
        }

        // To lint we execute each statement in an isolated environment.
        // We also test for foreign key constraints being violated after
        // each statement so we can give proper line numbers to the user
        // if anything is violated.
        var error;
        var db = new SQL.Database();
        var results = [];
        SQLTester.Util.forEachStatement(userCode, (function (statement, lineNumber) {
            try {
                if (!statement) {
                    throw new Error($._("It looks like you have an " + "unnecessary semicolon."));
                }
                var result = SQLTester.Util.execSingleStatementWithResults(db, statement);
                if (result) {
                    results.push(result);
                }

                // SQLite allows any column type name and uses these rules
                // to determine the storage type:
                // https://www.sqlite.org/datatype3.html
                // Instead it would be better for learning purposes to require
                // the valid names that things coerce to.
                var tables = SQLTester.Util.getTables(db);
                tables.forEach(function (table) {
                    table.columns.forEach(function (column) {
                        var type = column.type.toUpperCase();
                        var allowedTypes = ["TEXT", "NUMERIC", "INTEGER", "REAL", "NONE"];
                        if (allowedTypes.indexOf(type) === -1) {
                            throw new Error($._("Please use one of the valid column " + "types when creating a table: ") + allowedTypes.join(", "));
                        }
                    });
                });

                // Check if we have any new foreign key constraint violations
                var fkResults = db.exec("PRAGMA foreign_key_check;");
                if (fkResults.length > 0) {
                    var result = fkResults[0];
                    throw new Error("Please check for a foreign key constraint " + "on table " + result.values[0][0] + " for parent table " + result.values[0][2]);
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
                deferred.resolve({
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
        }).bind(this));

        var tables = SQLTester.Util.getTables(db);
        db.close();

        this.dbInfo = {
            tables: tables,
            results: results,
            userCode: userCode
        };

        if (!error) {
            deferred.resolve({
                errors: [],
                warnings: []
            });
        }

        return deferred;
    },

    initTests: function initTests(validate) {
        if (!validate) {
            return;
        }

        try {
            var code = "with(arguments[0]){\n" + validate + "\n}";
            new Function(code).apply({}, this.tester.testContext);
        } catch (e) {
            return e;
        }
    },

    test: function test(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        this.tester.test(this.dbInfo, tests, errors, (function (errors, testResults) {
            if (errorCount !== errors.length) {
                // Note: Scratchpad challenge checks against the exact
                // translated text "A critical problem occurred..." to
                // figure out whether we hit this case.
                var message = $._("Error: %(message)s", { message: errors[errors.length - 1].message });
                // TODO(jeresig): Find a better way to show this
                this.output.$el.find(".test-errors").text(message).show();
                this.tester.testContext.assert(false, message, $._("A critical problem occurred in your program " + "making it unable to run."));
            }

            callback(errors, testResults);
        }).bind(this));
    },

    postProcessing: function postProcessing() {
        var doc = this.getDocument();
        var self = this;
        $(doc).find("table.sql-schema-table").each(function () {
            var tableName = $(this).data("table-name");
            $(this).find("th a").click(function () {
                self.output.postParent({
                    action: "sql-table-click",
                    table: tableName
                });
            });
        });
    },

    runCode: function runCode(userCode, callback) {
        if (!window.SQLOutput.isSupported()) {
            return callback([], userCode);
        }

        var db = new SQL.Database();

        var results = SQLTester.Util.execWithResults(db, userCode);
        var tables = SQLTester.Util.getTables(db);
        db.close();

        var output = Handlebars.templates["sql-results"]({
            tables: tables,
            results: results
        });

        var doc = this.getDocument();
        doc.open();
        doc.write(output);
        doc.close();

        // If a new result set was added, scroll to the bottom
        if (results && results.length) {
            // Ignore the first time the scratchpad loads
            if (window.SQLOutput.lastResultsLen !== undefined) {
                $(doc).scrollTop($(doc).height());
            }
            window.SQLOutput.lastResultsLen = results.length;
        }

        this.postProcessing();

        callback([], userCode);
    },

    clear: function clear() {},

    kill: function kill() {}
});

window.SQLOutput.isSupported = function () {
    // Check to make sure the typed arrays dependency is supported.
    return "Uint8ClampedArray" in window;
};

LiveEditorOutput.registerOutput("sql", SQLOutput);

// Clear the output

// Completely stop and clear the output
