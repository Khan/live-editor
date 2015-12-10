describe("Output Methods", function() {
    runTest({
        title: "getScreenshot",
        code: "CREATE TABLE characters (name TEXT);",
        test: function(output, errors, testResults, callback) {
            output.output.getScreenshot(200, function(data) {
                // Testing with a truncated base64 png
                expect(data).to.contain("data:image/png;base64,iVBOR");
                callback();
            });
        }
    });
});

describe("Linting", function() {
    // Linting for CREATE
    test("Creating a table with valid column types\n",
        "CREATE TABLE characters (name TEXT, age INTEGER, x NUMERIC, y\n" +
        "REAL, z NONE);");
    failingTest("Creating a table with invalid column types",
        "CREATE TABLE characters (name FDSFSD)");
    failingTest("Creating a table with duplicate column names",
        "CREATE TABLE characters (name TEXT, name TEXT)");
    failingTest("Creating a table with no columns",
        "CREATE TABLE characters;");

    // Linting for comments
    test("Parsing of SQL single lint comments",
        "-- Design a database for Rick and Morty;;*");
    test("Multiline comment", "/* Design a database for Rick, \n" +
        "\nand Morty; */");
    // Make sure operators which are also part of comment indicators work.
    test("Testing arithmetic operator '-' works", "SELECT 3-2");
    test("Testing arithmetic operator '/' works", "SELECT 3/2");

    // Linting for inserting rows
    test("Inserting rows",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Rick\");" +
        "INSERT INTO characters VALUES (\"Morty\");");
    failingTest("Inserting rows missing VALUES",
        "INSERT INTO characters (\"Jerry\");");
    failingTest("Inserting rows missing INTO",
        "INSERT characters VALUES (\"Beth\");");
    failingTest("Inserting rows missing VALUES and INTO",
        "INSERT characters (\"Summer\");");
    failingTest("Inserting rows unquoted",
        "INSERT characters (Summer);");
    failingTest("Inserting rows mismatching quote",
        "INSERT characters ('Summer);");

    // Linting for select statements
    test("Simple select",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Rick\");" +
        "SELECT name FROM characters;" +
        "SELECT * FROM characters WHERE name = 'Rick'" +
        "ORDER BY name DESC;");
    failingTest("Missing table name",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Rick\");" +
        "SELECT name FROM characters;" +
        "SELECT * WHERE name = 'hi';");

    // Deleting rows
    test("Deleting rows",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Morty\");" +
        "INSERT INTO characters VALUES (\"Morty clone\");" +
        "INSERT INTO characters VALUES (\"Morty clone\");" +
        "DELETE FROM characters WHERE name = \"Morty\";");
    test("Deleting all rows",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Morty\");" +
        "DELETE FROM characters;");
    failingTest("Deleting rows missing FROM",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Morty\");" +
        "DELETE characters WHERE name = \"Morty\";");

    // Updating rows
    test("Updating rows",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Morty clone\");" +
        "UPDATE characters SET name = \"Morty\" WHERE name = 'Morty clone';");
    failingTest("Updating rows missing SET",
        "CREATE TABLE characters (name TEXT);" +
        "INSERT INTO characters VALUES (\"Morty clone\");" +
        "UPDATE characters name = \"Morty\" WHERE name = 'Morty clone';");

    // Joins
    test("Inner joins",
        "CREATE TABLE characters (id INTEGER NOT NULL, name TEXT);" +
        "CREATE TABLE character_episodes (characterId  INTEGER, " +
        "episodeNum INTEGER);" +
        "INSERT INTO characters VALUES (1, 'Morty');" +
        "INSERT INTO character_episodes VALUES (2, 'Rick');" +
        "SELECT * FROM characters INNER JOIN character_episodes ON " +
        "id = characterId");
    test("Outer joins",
        "CREATE TABLE characters (id INTEGER NOT NULL, name TEXT);" +
        "CREATE TABLE character_episodes (characterId  INTEGER, " +
        "episodeNum INTEGER);" +
        "INSERT INTO characters VALUES (1, 'Morty');" +
        "INSERT INTO character_episodes VALUES (2, 'Rick');" +
        "SELECT * FROM characters LEFT OUTER JOIN character_episodes ON " +
        "id = characterId");

    // NOT NULL constraint
    test("NOT NULL constraints enabled",
        "CREATE TABLE episodes(id INTEGER NOT NULL, name TEXT);" +
        "INSERT INTO episodes VALUES (1, 'Pilot');" +
        "INSERT INTO episodes VALUES (2, 'Lawnmower Dog');");
    failingTest("NOT NULL constraints violated",
        "CREATE TABLE episodes(id INTEGER NOT NULL, name TEXT);" +
        "INSERT INTO episodes VALUES (1, 'Pilot');" +
        "INSERT INTO episodes VALUES (NULL, 'Lawnmower Dog');");

    // Primary Key constraint
    test("Primary key constraints failing",
        "CREATE TABLE episodes(id INTEGER PRIMARY KEY, name TEXT);" +
        "INSERT INTO episodes VALUES (8, 'Rixty Minutes');" +
        "INSERT INTO episodes VALUES (9, 'Something Rick This Way Comes');");
    failingTest("Primary key constraints failing",
        "CREATE TABLE episodes(id INTEGER PRIMARY KEY, name TEXT);" +
        "INSERT INTO episodes VALUES (9, 'Something Ricked This Way Comes');" +
        "INSERT INTO episodes VALUES (9, 'Something Rick This Way Comes');");

    // Foreign key constraint violation
    test("Foreign key constraint",
        "CREATE TABLE characters (id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name TEXT);" +
        "CREATE TABLE character_episodes (id INTEGER, episodeId INTEGER, " +
        "FOREIGN KEY (id) REFERENCES characters(id));" +
        "INSERT INTO characters VALUES (1, 'RicK');" +
        "INSERT INTO character_episodes VALUES (1, 1);");
    test("Foreign key constraint",
        "CREATE TABLE characters (id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name TEXT);" +
        "CREATE TABLE character_episodes (id INTEGER, episodeId INTEGER, " +
        "FOREIGN KEY (id) REFERENCES characters(id));" +
        "INSERT INTO characters VALUES (1, 'RicK');" +
        "INSERT INTO character_episodes VALUES (1, 73);");

    // Tests for extra syntax checks

    failingTest("Testing for extra context, missing FROM",
        "CREATE TABLE characters (name TEXT);" +
        "SELECT name WHERE name = 3;",
        ["Are you missing a FROM clause?"]);

    failingTest("Testing for misspelling INTEGER",
        "CREATE TABLE books(id INTERGER PRIMARY KEY, name TEXT);",
        ["Is INTEGER spelled correctly?"]);

    failingTest("Testing for wrong order of PRIMARY KEY",
        "CREATE TABLE books (id PRIMARY KEY INTEGER,name TEXT,rating INTEGER );",
        ["Did you mean to put PRIMARY KEY after INTEGER?"]);

    failingTest("Testing for missing parenthesis",
        "CREATE TABLE books (id INTEGER PRIMARY KEY, name TEXT, rating INTEGER; ",
        ["Are you missing a parenthesis?"]);

    failingTest("Testing for extra comma at end",
        "CREATE TABLE books(id INTEGER PRIMARY KEY, name TEXT, );",
        ["Do you have an extra comma?"]);

    failingTest("Testing for bad CREATE syntax",
        "CREATE TABLE books(id INTEGER PRIMARY KEY name TEXT);",
        ["There's a syntax error near "]);

    failingTest("Testing for CREATE missing TABLE",
        "CREATE books(id INTEGER PRIMARY KEY name TEXT);",
        ["You may be missing what to create. For example, CREATE TABLE..."]);

    failingTest("Testing for bad table name",
        "CREATE TABLE favorite books (name TEXT);" +
        "SELECT name WHERE name = 3;",
        ["You can't have a space in your table name."]);
    
    failingTest("Testing for missing table name",
        "CREATE TABLE (name TEXT);",
        ["Are you missing the table name?"]);

    failingTest("Testing for extra commas in column types",
        "CREATE TABLE books (id INTEGER PRIMARY KEY,name,TEXT,rating INTEGER);",
        ["Do you have an extra comma between the name and type?"]);

    failingTest("Testing for extra commas in column types #2",
        "CREATE TABLE booklist (id, INTEGER PRIMARY KEY, name TEXT, rating INTEGER);",
        ["Do you have an extra comma between the name and type?"]);

    failingTest("Testing for space in column name",
        "CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, rating out of ten INTEGER);",
        ["You can't have a space in your column name."]);
 
    failingTest("Testing for missing quotes #1",
        "INSERT INTO FavBooks VALUES (1, Beautiful Creatures, 10);",
        ["Are you missing quotes around text values?"]);
    failingTest("Testing for missing quotes #2",
        "insert into Books VALUES(1,\"Harry Potter\",5 star); ",
        ["Are you missing quotes around text values?"]);

    failingTest("Testing for missing semi-colon #1",
        "CREATE TABLE books (name TEXT)" +
        "INSERT INTO books VALUES (1, 'book a', 100)" + 
        "INSERT INTO books VALUES (2, 'book b', 110)" + 
        "INSERT INTO books VALUES (3, 'book c', 1)",
        ["Do you have a semi-colon after each statement?"]);
    failingTest("Testing for missing semi-colon #2",
        "CREATE TABLE books (id INTEGER PRIMARY KEY, bookname TEXT, ratingoutof5 INTEGER);\n" +
        "INSERT INTO books VALUES (1, 'Harry Potter', 5)\n" + 
        "INSERT INTO books VALUES (2, 'Percy Jackson and the Olympians', 5)\n" + 
        "INSERT INTO books VALUES (3, 'The Hunger Games', 5)\n",
        ["Do you have a semi-colon after each statement?"]);
    failingTest("Testing for missing semi-colon #3",
        "CREATE TABLE books (id INTEGER PRIMARY KEY, name TEXT, rating INTEGER)" + 
        "INSERT INTO books VALUES (1 , 'Rumo', 5);",
        ["Do you have a semi-colon after each statement?"]);
    failingTest("Testing for missing semi-colon #4",
        "CREATE TABLE books (id INTEGER PRIMARY KEY, name TEXT, rating INTEGER)\n" + 
        "     INSERT INTO books VALUES (1 , 'Rumo', 5);",
        ["Do you have a semi-colon after each statement?"]);
    failingTest("Testing for missing semi-colon #5",
        "SELECT * FROM movies\n" + 
        " SELECT * FROM movies WHERE release_year > 1999;",
        ["Do you have a semi-colon after each statement?"]);
    failingTest("Testing for missing semi-colon #6",
        "CREATE TABLE customers (id INTEGER\n" +
        "PRIMARY KEY, name TEXT, rating INTEGER)\n" +
        "INSERT INTO customers VALUES (73, \"Brian\", 33);",
        ["Do you have a semi-colon after each statement?"]);
    /* TODO(pamela): Add tests to make sure the following *don't* generate the message
        SELECT SUM(minutes INTEGER) FROM todo_list; 
        SELECT minutes SUM(quantity) FROM todo_list ORDER BY minutes;
        SELECT minutes SUM(item) FROM todo_list GROUP BY minutes;
        SELECT minutes SUM(quantity), FROM todo_list;
    */

    failingTest("Testing for extra comma",
        "CREATE TABLE books (id INTEGER, name TEXT, rating INTEGER);" +
        "INSERT, INTO books VALUES (1, \"gone with the wind\", 1)",
        ["There shouldn't be a comma after INSERT."]);


    failingTest("Testing for UNIQUE constraint",
        "CREATE TABLE customers (id INTEGER PRIMARY KEY);\n" + 
        "INSERT INTO customers VALUES (1);" +
        "INSERT INTO customers VALUES (1);",
        ["Are you specifying a different value for each row?"]);

});
