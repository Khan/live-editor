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

    // Test that extra context is given other than the SQLite error
    failingTest("Testing for extra context",
        "CREATE TABLE characters (name TEXT);" +
        "SELECT name WHERE name = 3;",
        ["Are you missing a FROM clause?"]);
});
