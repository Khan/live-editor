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
    getErrorMessage: function(errorMessage, statement) {
        errorMessage = errorMessage || "";
        statement = statement || "";
        statement = statement.toUpperCase();

        // Possible SELECT with missing FROM
        if (errorMessage.indexOf("no such column:") !== -1 &&
                statement.indexOf("SELECT") !== -1 &&
                statement.indexOf("FROM") === -1) {
            errorMessage += ". " + $._("Are you missing a FROM clause?");
        // Possible INSERT with missing INTO
        } else if (errorMessage.indexOf(": syntax error") !== -1 &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("VALUES") !== -1 &&
                statement.indexOf("INTO") === -1) {
            errorMessage += ". " + $._("Are you missing the INTO keyword?");
        // Possible INSERT INTO with missing VALUES
        } else if (errorMessage.indexOf(": syntax error") !== -1 &&
                statement.indexOf("INSERT") !== -1 &&
                statement.indexOf("INTO") !== -1 &&
                statement.indexOf("VALUES") === -1) {
            errorMessage += ". " +
                $._("Are you missing the VALUES keyword?");
        // Possible CREATE with missing what to create
        } else if (errorMessage.indexOf(": syntax error") !== -1 &&
                statement.indexOf("CREATE") !== -1 && (
                    statement.indexOf("INDEX") === -1 ||
                    statement.indexOf("TABLE") === -1 ||
                    statement.indexOf("TRIGGER") === -1 ||
                    statement.indexOf("VIEW") === -1)) {
            errorMessage += ". " +
                $._("You may be missing what to create. For " +
                    "example CREATE TABLE...");
        // Possible UPDATE without SET
        } else if (errorMessage.indexOf(": syntax error") !== -1 &&
                statement.indexOf("UPDATE") !== -1 &&
                statement.indexOf("SET") === -1) {
            errorMessage += ". " +
                $._("Are you missing the SET keyword?");
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
                  text: $._("Your browser is not recent enough to show " +
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
                    throw new Error($._("It looks like you have an " +
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
                            throw new Error($._("Please use one of the valid column " +
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
                    var message = $._("Error: %(message)s",
                        {message: errors[errors.length - 1].message});
                    // TODO(jeresig): Find a better way to show this
                    this.output.$el.find(".test-errors").text(message).show();
                    this.tester.testContext.assert(false, message,
                        $._("A critical problem occurred in your program " +
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
