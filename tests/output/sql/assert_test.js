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
            
            var result = allPass(matchTableCount(templateDB),
                matchTableRowCount(templateDB),
                matchTableColumnCount(templateDB));

            var result = fail();
            if (!passes(matchTableCount(templateDB))) {
                result = fail("Not enough tables!");
            } else if (passes(matchTableRowCount(1))) {
                result = fail("You only have 1 row, add 2 more!");
            } else if (!passes(matchTableRowCount(templateDB))) {
                result = fail("Not enough rows!");
            } else if (passes(matchTableColumnCount(1))) {
                result = fail("You only have 1 column, add 2 more!");
            } else if (!passes(matchTableColumnCount(templateDB))) {
                result = fail("Not enough columns!");
            } else if (!passes(matchTableColumnNames(templateDB))) {
                result = fail("Not the right column names!");
            } else {
                result = matchTableColumnNames(templateDB);
            }

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

    userCode = "CREATE TABLE books (id INTEGER);" +
            "INSERT INTO books VALUES(1);";
    assertTest({
        title: "Has a certain # of rows",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "You only have 1 row, add 2 more!",
        errors: [{}]
    });

    userCode = "CREATE TABLE books (id INTEGER, name TEXT, rating " +
            "INTEGER);";
    assertTest({
        title: "Doesn't have enough rows",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not enough rows!",
        errors: [{}]
    });

     // Not enough columns should not be accepted
    userCode = "CREATE TABLE books (id INTEGER);" +
            "INSERT INTO books VALUES(1);" +
            "INSERT INTO books VALUES(2);" +
            "INSERT INTO books VALUES(3);";
    assertTest({
        title: "Has a certain # of columns",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "You only have 1 column, add 2 more!",
        errors: [{}]
    });

    // Not enough columns should not be accepted
    userCode = "CREATE TABLE books (id INTEGER, name TEXT);" +
            "INSERT INTO books VALUES(1, \"book1\");" +
            "INSERT INTO books VALUES(1, \"book2\");" +
            "INSERT INTO books VALUES(2, \"book3\");";
    assertTest({
        title: "Doesn't have the right # of columns",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not enough columns!",
        errors: [{}]
    });

    // Not matching columns should not be accepted
    userCode = "CREATE TABLE books (id INTEGER, author TEXT, year TEXT);" +
            "INSERT INTO books VALUES(1, \"book1\", \"1984\");" +
            "INSERT INTO books VALUES(1, \"book2\", \"1944\");" +
            "INSERT INTO books VALUES(2, \"book3\", \"1934\");";
    assertTest({
        title: "Wrong column names",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "Not the right column names!",
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
            } else if (passes(matchResultRowValues(0, templateDB, {ignoreOrder: true}))) {
                result = fail("You got the row values but in wrong order!");
            } else {
                result = pass();
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
            "INSERT INTO books VALUES(2, \"book2\", 4);" +
            "INSERT INTO books VALUES(3, \"book3\", 5);" + 
            "SELECT name FROM books ORDER BY name ASC";
    assertTest({
        title: "It should show that you got values but in wrong order ",
        code: userCode,
        pass: false,
        validate: basicTest,
        fromTests: true,
        reason: "You got the row values but in wrong order!",
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

