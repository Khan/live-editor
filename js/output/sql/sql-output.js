/* global SQLTester */
window.SQLOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;
        this.externalsDir = options.externalsDir;

        this.tester = new SQLTester(options);

        this.render();

        // Load SQL config options
        this.config.runCurVersion("sql", this);

        // Register a helper to tell the difference between null and 0
        Handlebars.registerHelper('isNull', function(variable, options) {
            if (variable === null) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
    },

    getDocument: function() {
        return this.$frame[0].contentWindow.document;
    },

    getScreenshot: function(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
            imagesDir: this.output.imagesDir,
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
    },

    /**
     * Given an SQLite error and the current statement, suggest a better
     * error message.  SQLlite error messages aren't always very descriptive,
     * this should make common syntax errors easier to understand.
     */
    getErrorMessage: function(sqliteError, statement) {
        sqliteError = sqliteError || "";
        statement = statement || "";
        statement = statement.toUpperCase();

        let errorMessage = sqliteError;

        // First, we translate SQLite errors into friendly i18n-able messages

        const colTypesError = sqliteError.indexOf("valid column types") > -1;
        if (colTypesError) {
            errorMessage = i18n._("Please use one of the valid column types " +
                "when creating a table: ")
                + "\"TEXT\", \"NUMERIC\", \"INTEGER\", \"REAL\", \"NONE\".";
        }
        const uniqStr = "UNIQUE constraint failed:";
        const uniqError = sqliteError.indexOf(uniqStr) > -1;
        if (uniqError) {
            const colName = sqliteError.split(uniqStr)[1].trim();
            errorMessage = i18n._("\"UNIQUE\" constraint failed on column \"%(colName)s\".",
                {colName});
        }
        const notNullStr = "NOT NULL constraint failed:"
        const notNullError = sqliteError.indexOf(notNullStr) > -1;
        if (notNullError) {
            const colName = sqliteError.split(notNullStr)[1].trim();
            errorMessage = i18n._("\"NOT NULL\" constraint failed on column \"%(colName)s\".",
                {colName});
        }
        const dupColStr = "duplicate column name:";
        const dupColError = sqliteError.indexOf(dupColStr) > -1;
        if (dupColError) {
            const colName = errorMessage.split(dupColStr)[1].trim();
            errorMessage = i18n._("You have multiple columns named \"%(colName)s\" - " +
                "column names must be unique.", {colName});
        }
        const ambColStr = "ambiguous column name:";
        const ambColError = sqliteError.indexOf(ambColStr) > -1;
        if (ambColError) {
            const colName = errorMessage.split(ambColStr)[1].trim();
            errorMessage = i18n._("Ambiguous column name \"%(colName)s\".",
                {colName});
            // Note(danielhollas): Added a more helpful text as a separate string
            // to preserve existing translations.
            // I18N: This Oh Noes message follows "Ambiguous column name" SQL error
            errorMessage += " " + i18n._("Multiple tables that you're joining " +
               "contain a column with that name. Specify the name of the table that " +
               "contains the column, using the format \"tableName.columnName\".");
        }
        const unknownColStr = "no such column:";
        const unknownColError = sqliteError.indexOf(unknownColStr) > -1;
        if (unknownColError) {
            const colName = sqliteError.split(unknownColStr)[1].trim();
            errorMessage = i18n._("We can't find the column named \"%(colName)s\".",
                {colName});
        }
        const noTablesError = sqliteError.indexOf("no tables specified") > -1;
        if (noTablesError) {
            errorMessage = i18n._("You didn't specify any tables for your \"SELECT\".");
        }
        // Generic syntax error messages take form: 'near \"%T\": syntax error'
        const syntaxErrStr = ": syntax error";
        const isSyntaxError = sqliteError.indexOf(syntaxErrStr) > -1;
        if (isSyntaxError) {
            const nearPhrase = errorMessage.split(syntaxErrStr)[0];
            errorMessage = i18n._("There's a syntax error near %(nearThing)s.",
                {nearThing: nearPhrase.substr(5)});
        }
        const colValueMismatchReg = /has (\d+) columns but (\d+) values were supplied/;
        const colMismatchError = sqliteError.match(colValueMismatchReg);
        if (colMismatchError) {
          const tableName = sqliteError.split(" ")[1];
          const numCols = colMismatchError[1];
          const numVals = colMismatchError[2];

          // I18N: The first part of "Oh noes" error in the SQL course.
          // I18N: "Table %(tableName)s has %(num)s columns"
          // I18N: "but %(num)s values were supplied."
          // I18N: You can reorder the parts in string "%(columns)s %(values)s"
          const tableHasColumns = i18n.ngettext(
              "Table \"%(tableName)s\" has %(num)s column",
              "Table \"%(tableName)s\" has %(num)s columns",
              numCols, {tableName: tableName});

          // I18N: The second part of "Oh noes" error in the SQL course.
          // I18N: "Table %(tableName)s has %(num)s columns"
          // I18N: "but %(num)s values were supplied."
          // I18N: You can reorder the parts in string "%(columns)s %(values)s"
          const valuesSupplied = i18n.ngettext(
              "but %(num)s value was supplied.",
              "but %(num)s values were supplied.",
              numVals);

          // I18N: Oh noes error in the SQL course.
          // I18N: %(columns)s = "Table %(tableName)s has %(num)s columns"
          // I18N: %(values)s  = "but %(num)s values were supplied."
          // I18N: The sentences are translated in two different Crowdin strings,
          // I18N: but can be reordered here
          errorMessage = i18n._("%(columns)s %(values)s",
              {columns: tableHasColumns, values: valuesSupplied});
        }

        // Now that we've translated the base error messages,
        // we add on additional helper messages for common mistakes
        if (unknownColError &&
                statement.indexOf("SELECT") !== -1 &&
                statement.indexOf("FROM") === -1) {
            errorMessage += " " + i18n._("Are you perhaps missing a \"FROM\" clause?");
        } else if (isSyntaxError &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("VALUES") !== -1 &&
                statement.indexOf("INTO") === -1) {
            errorMessage += " " + i18n._("Are you missing the \"INTO\" keyword?");
        } else if (isSyntaxError &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("INTO") !== -1 &&
                statement.indexOf("VALUES") === -1) {
            errorMessage += " " +
                i18n._("Are you missing the \"VALUES\" keyword?");
        } else if (statement.indexOf("INTERGER") !== -1) {
            errorMessage += " " +
                i18n._("Is \"INTEGER\" spelled correctly?");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE") !== -1 &&
                statement.search(/CREATE TABLE \w+\s\w+/) > -1) {
            errorMessage += " " +
                i18n._("You can't have a space in your table name.");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE TABLE (") > -1) {
            errorMessage += " " +
                i18n._("Are you missing the table name?");
        } else if (isSyntaxError &&
                statement.indexOf("PRIMARY KEY INTEGER") !== -1) {
            errorMessage += " " +
                i18n._("Perhaps you meant to put \"PRIMARY KEY\" after \"INTEGER\"?");
        } else if (isSyntaxError &&
                statement.indexOf("(") !== -1 &&
                statement.indexOf(")") === -1) {
            errorMessage += " " +
                i18n._("Are you missing a parenthesis?");
        } else if (isSyntaxError &&
                statement.indexOf("CREATE") !== -1 &&
                statement.indexOf("TABLE") === -1 && (
                    statement.indexOf("INDEX") === -1 ||
                    statement.indexOf("TRIGGER") === -1 ||
                    statement.indexOf("VIEW") === -1)) {
            errorMessage += " " +
                i18n._("You may be missing what to create. For " +
                    "example, \"CREATE TABLE...\"");
        } else if (isSyntaxError &&
                statement.indexOf("UPDATE") !== -1 &&
                statement.indexOf("SET") === -1) {
            errorMessage += " " +
                i18n._("Are you missing the \"SET\" keyword?");
        } else if (isSyntaxError &&
                statement.search(/[^SUM]\s*\(.*\)\n*\s*\w+/) > -1 ||
                statement.search(/\n+\s*SELECT/) > -1 ||
                statement.search(/\)\n+\s*INSERT/) > -1
                ) {
            errorMessage += " " +
                i18n._("Do you have a semi-colon after each statement?");
        } else if (isSyntaxError &&
            statement.indexOf("INSERT") !== -1 &&
            statement.search(/[^INSERT],\d*\s*[a-zA-Z]+/) > -1
            ) {
            errorMessage += " " +
                i18n._("Are you missing quotes around text values?");
        } else if (isSyntaxError &&
            statement.search(/,\s*\)/) > -1) {
            errorMessage += " " +
                i18n._("Do you have an extra comma?");
        } else if (isSyntaxError &&
            statement.indexOf("INSERT,") > -1 ) {
            errorMessage += " " +
                i18n._("There shouldn't be a comma after \"INSERT\".");
        } else if (colTypesError &&
            statement.search(/(\w+\s*,\s*((TEXT)|(INTEGER))+)/) > -1) {
            errorMessage += " " +
                i18n._("Do you have an extra comma between the name and type?");
        } else if (colTypesError &&
            statement.search(/(\w+\s+\w+\s*((TEXT)|(INTEGER)|(REAL))+)/) > -1) {
            errorMessage = i18n._("You can't have a space in your column name.");
        } else if (uniqError) {
            errorMessage += " " +
                i18n._("Are you specifying a different value for each row?");
        }
        return errorMessage;
    },

    lint: function(userCode, skip) {
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
                  text: i18n._("Your browser is not recent enough to show " +
                            "SQL output. Please upgrade your browser."),
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
                        var type =  column.type.toUpperCase();
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
                deferred.resolve({
                    errors:[{
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
            deferred.resolve({
                errors: [],
                warnings: []
            });
        }

        return deferred;
    },

    initTests: function(validate) {
        if (!validate) {
            return;
        }

        try {
            var code = "with(arguments[0]){\n" + validate + "\n}";
            (new Function(code)).apply({}, this.tester.testContext);

        } catch (e) {
            return e;
        }
    },

    test: function(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        this.tester.test(this.dbInfo, tests, errors,
            function(errors, testResults) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    var message = i18n._("Error: %(message)s",
                        {message: errors[errors.length - 1].message});
                    console.warn(message);
                    this.tester.testContext.assert(false, message,
                        i18n._("A critical problem occurred in your program " +
                            "making it unable to run."));
                }

                callback(errors, testResults);
            }.bind(this));
    },

    postProcessing: function() {
        var doc = this.getDocument();
        var self = this;
        $(doc).find("table.sql-schema-table").each(function() {
            var tableName = $(this).data("table-name");
            $(this).find("th a").click(function() {
                self.output.postParent({
                    action: "sql-table-click",
                    table: tableName
                });
            });
        });
    },

    runCode: function(userCode, callback) {
        if (!window.SQLOutput.isSupported()) {
            return callback([], userCode);
        }

        var db = new SQL.Database();

        var results = SQLTester.Util.execWithResults(db, userCode);
        var tables = SQLTester.Util.getTables(db);
        db.close();

        var output = Handlebars.templates["sql-results"]({
            tables: tables,
            results: results,
            databaseMsg: i18n._("Database Schema"),
            resultsMsg: i18n._("Query results"),
            rowMsg: i18n._("row"),
            rowsMsg: i18n._("rows"),
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

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

window.SQLOutput.isSupported = function() {
    // Check to make sure the typed arrays dependency is supported.
    return "Uint8ClampedArray" in window;
};

LiveEditorOutput.registerOutput("sql", SQLOutput);
