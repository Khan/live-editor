describe("Challenge Assertions - SQL Tables", function() {
    var basicTest = function() {
        staticTest($._("Create a table and insert some values"), function() {
            var description = $._("Now let's add 3 books into our bookshelf");
            var template = "CREATE TABLE _$1 (id INTEGER, name TEXT, rating " +
                "INTEGER);" +
                "INSERT INTO _$1 VALUES(1, \"book1\", 5);" +
                "INSERT INTO _$1 VALUES(1, \"book2\", 4);" +
                "INSERT INTO _$1 VALUES(2, \"book3\", 5);";
            var templateDB = initTemplateDB(template);
            // TODO(bbondy): This test could be improved by separating these
            // out and returning a different error for each. And then updating
            // the assertTest helper function could then check for the right
            // type of erros.
            var result = allPass(matchTableCount(templateDB),
                matchTableRowCount(templateDB),
                matchTableColumnCount(templateDB));
            assertMatch(result, description, "INSERT INTO _ VALUES (...);");
        });
    }.toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    // No code should not be accepted
    var userCode = "";
    assertTest({
        title: "No code not accepted",
        code: userCode,
        pass: false,
        validate: basicTest,
        errors: [{}]
    });

    // Table only should not be accepted
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);";
    assertTest({
        title: "Only a table",
        code: userCode,
        pass: false,
        validate: basicTest,
        errors: [{}]
    });

    // Not enough columns should not be accepted
    userCode = "CREATE TABLE books (id INTEGER, name TEXT);" +
            "INSERT INTO books VALUES(1, \"book1\");" +
            "INSERT INTO books VALUES(1, \"book2\");" +
            "INSERT INTO books VALUES(2, \"book3\");";
    assertTest({
        title: "Missing columns",
        code: userCode,
        pass: false,
        validate: basicTest,
        errors: [{}]
    });

    // Valid input
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);";
    assertTest({
        title: "Everything should match",
        code: userCode,
        pass: true,
        validate: basicTest
    });
});


describe("Challenge Assertions - SQL Results", function() {
    var basicTest = function() {
        staticTest($._("Query a table of values"), function() {
            var description = $._("Now let's add 3 books into our bookshelf");
            var template = "CREATE TABLE _$1 (id INTEGER, name TEXT, rating " +
                "INTEGER);" +
                "INSERT INTO _$1 VALUES(1, \"book1\", 5);" +
                "INSERT INTO _$1 VALUES(1, \"book2\", 4);" +
                "INSERT INTO _$1 VALUES(2, \"book3\", 5);" + 
                "SELECT name FROM _$1";
            var templateDB = initTemplateDB(template);

            var result = fail();
            if (!passes(matchResultCount(templateDB))) {
                result = fail("Not matching results!")
            } else if (!passes(matchResultRowCount(0, templateDB))) {
                result = fail("Not matching rows!");
            } else if (!passes(matchResultColumnCount(0, templateDB))) {
                result = fail("Not matching columns!");
            } else if (!passes(matchResultRowValues(0, templateDB))) {
                result = fail("Not matching row values!");
            } else if (!passes(matchResultColumnNames(0, templateDB))) {
                result = fail("Not matching column names!");
            }
            assertMatch(result, description, "INSERT INTO _ VALUES (...);");
        });
    }.toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    // Not enough results
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);";
    assertTest({
        title: "It should show failing message for result count",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not matching results!",
        errors: [{}]
    });

    // Not enough rows
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);" + 
            "SELECT name FROM books LIMIT 2;";
    assertTest({
        title: "It should show failing message for result row count",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not matching rows!",
        errors: [{}]
    });

    // Not matching columns
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);" + 
            "SELECT * FROM books";
    assertTest({
        title: "It should show failing message for result column count",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not matching columns!",
        errors: [{}]
    });

    // Not matching row values
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);" + 
            "SELECT id FROM books";
    assertTest({
        title: "It should show failing message for result row values",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not matching row values!",
        errors: [{}]
    });

    // Not matching column names
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);" + 
            "SELECT name AS book_name FROM books";
    assertTest({
        title: "It should show failing message for result column names",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not matching column names!",
        errors: [{}]
    });

    // Valid input
    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);" +
            "INSERT INTO books VALUES(1, \"book1\", 5);" +
            "INSERT INTO books VALUES(1, \"book2\", 4);" +
            "INSERT INTO books VALUES(2, \"book3\", 5);" + 
            "SELECT name FROM books;";
    assertTest({
        title: "Everything should match",
        code: userCode,
        pass: true,
        validate: basicTest
    });
});

