describe("Scratchpad Output - BabyHint checks", function() {
    /* Baby Hint errors */
    assertTest({
        title: "Misspelling a function name",
        reason: "reect is not defined. Maybe you meant to type rect, or you\'re using a variable you didn\'t define.",
        babyhint: true,
        code: "reect(20, 20, 10, 20);"
    });

    assertTest({
        title: "Using wrong capitalization",
        reason: "noSTROKE is not defined. Maybe you meant to type noStroke, or you\'re using a variable you didn\'t define.",
        babyhint: true,
        code: "noSTROKE();"
    });

    assertTest({
        title: "Using wrong capitalization and misspelling",
        reason: "noStrokee is not defined. Maybe you meant to type noStroke, or you\'re using a variable you didn\'t define.",
        babyhint: true,
        code: "noStrokee();"
    });

    assertTest({
        title: "Mispelling with too many letters",
        reason: "reeeect is not defined. Make sure you're spelling it correctly and that you declared it.",
        babyhint: true,
        code: "reeeect();"
    });

    assertTest({
        title: "Leaving off last parantheses in function call",
        reason: "It looks like you are missing a ) - does every ( have a corresponding closing )?",
        babyhint: true,
        code: "rect(80,70,60,240);\nrect("
    });

    assertTest({
        title: "Leaving off last parantheses in if statement",
        reason: "It looks like you are missing a ) - does every ( have a corresponding closing )?",
        babyhint: true,
        code: "if(\n"
    });

    assertTest({
        title: "Syntax error on line that has a keyword that looks like another keyword",
        reason: "I thought you were going to type { but you typed y.",
        babyhint: true,
        code: "var y;\nif(true)\ny=random(0,10);"
    });

    assertTest({
        title: "Spelling shouldn't check argument names for misspelling",
        reason: "'drawRainbow' was used before it was defined.",
        babyhint: true,
        code: "var Rainbow = function(){};var RainbowRed = new Rainbow();drawRainbow(RainbowRed);var drawRainbow = function(rainbow) {};"
    });

    assertTest({
        title: "Spelling error that should match lowercase version instead of uppercase",
        reason: "rainbo is not defined. Maybe you meant to type rainbow, or you\'re using a variable you didn\'t define.",
        babyhint: true,
        code: "var Rainbow = function(){};\nvar RainbowRed = new Rainbow();\nvar drawRainbow = function(rainbow){\nellipse(rainbo.x, 10, 10, 10);};"
    });

    assertTest({
        title: "Spelling error shouldn't warn about same word",
        reason: "I thought you were going to type an identifier but you typed '?'.",
        babyhint: true,
        code: "var numFlipped = 0; if (numFlipped === 2 && ?) {}"
    });

    // Don't check for errors inside strings (when they include comment syntax)
    assertTest({
        title: "No errors should trigger inside of strings",
        babyhint: true,
        code: "var foo = \"rect()//\";"
    });

    assertTest({
        title: "It should only trigger a single error for undefined var in for loop definition",
        reason: "x is not defined. Make sure you're spelling it correctly and that you declared it.",
        babyhint: true,
        code: "for (var i = 0; i < 10; x++) { }"
    });
    
    assertTest({
        title: "Missing comma should only report a single error",
        reason: "Did you forget to add a comma between two parameters?",
        babyhint: true,
        code: "fill(255, 0 0);",
        count: 1
    });
});

// Syntax errors - not controlled by JSHint options.
describe("Scratchpad Output - JSHint syntax errors", function() {
    assertTest({
        title: "Extra comma in parameters to function call",
        reason: "I think you either have an extra comma or a missing argument?",
        jshint: true,
        code: "rect(80, 70, 60, 240,);"
    });

    assertTest({
        title: "Missing value for argument",
        reason: "I think you meant to type a value or variable name before that comma?",
        jshint: true,
        code: "rect(,70,60,240);"
    });

    assertTest({
        title: "Missing value for third argument",
        reason: "I think you meant to type a value or variable name before that comma?",
        jshint: true,
        code: "rect(80, 70, 60, 240);\nrect(240, 70, 60, 240);\nrect(193, 139,,30);"
    });

    assertTest({
        title: "Putting too much on left side of assignment",
        reason: "The left side of an assignment must be a single variable name, not an expression.",
        jshint: true,
        code: "var x;\nx+x=1"
    });

    assertTest({
        title: "Typing a single number",
        reason: "I thought you were going to type an assignment or function call but you typed an expression instead.",
        jshint: true,
        code: "10"
    });

    assertTest({
        title: "Not closing a string",
        reason: "Unclosed string! Make sure you end your string with a quote.",
        jshint: true,
        code: "var myName=\"Stuff"
    });

    assertTest({
        title: "Not closing a string when there are errors in the string if it's considered as code",
        reason: "Unclosed string! Make sure you end your string with a quote.",
        jshint: true,
        code: "var greeting = \"Hello, my name is"
    });

    assertTest({
        title: "Not closing a comment",
        reason: "It looks like your comment isn't closed. Use \"*/\" to end a multi-line comment.",
        jshint: true,
        code: "/*"
    });

    assertTest({
        title: "Not starting a comment",
        reason: "It looks like you never started your comment. Use \"/*\" to start a multi-line comment.",
        jshint: true,
        code: "*/"
    });

    assertTest({
        title: "Not matching a curly bracket",
        reason: "Unmatched \"{\".",
        jshint: true,
        code: "var bla = function() { if (true) { }"
    });

    /* Syntax warnings - not controlled by JSHint options. */

    assertTest({
        title: "Not putting a 0 in front of a decimal",
        reason: "Please put a 0 in front of the decimal point: \".2\"!",
        jshint: true,
        code: "var x=.2;"
    });

    /* Fixed in JSHint updates */

    assertTest({
        title: "Shouldn't complain about break in blocks in switch",
        jshint: true,
        code: "switch ('a') { case 'a': { println('boo'); break; } case 'b': break; }"
    });

    assertTest({
        title: "Shouldn't complain about wrapped returned assignments",
        jshint: true,
        code: "var test = function(a) { return (a = 1); };"
    });
});

/* Errors controlled by JSHint options that we've turned on. */
describe("Scratchpad Output - JSHint syntax options", function() {
    /* Redefinition of globals - see exposedProps in output.js */
    assertTest({
        title: "Redefining ProcessingJS function",
        reason: "Redefinition of 'rect'.",
        jshint: true,
        code: "var rect = function() { ellipse(175, 220, 100, 150);};"
    });

    assertTest({
        title: "Redefining ProcessingJS function",
        reason: "Redefinition of 'key'.",
        jshint: true,
        code: "var key = function() { rect(175, 220, 100, 150);};"
    });

    /* See exports.undef in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using undefined variable",
        reason: "\"x\" is not defined. Make sure you're spelling it correctly and that you declared it.",
        jshint: true,
        code: "ellipse(x, 100, 100, 100);"
    });

    /* See exports.asi in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Missing a semicolon",
        reason: "It looks like you're missing a semicolon.",
        jshint: true,
        code: "var x = 2"
    });

    /* See exports.curly in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Not using brackets around while body",
        reason: "I thought you were going to type \"{\" but you typed \"doSomething\".",
        jshint: true,
        code: "while (true) doSomething();"
    });

    assertTest({
        title: "Not using brackets around if body",
        reason: "I thought you were going to type \"{\" but you typed \"return\".",
        jshint: true,
        code: "if (1) return true;"
    });

    /* See exports.supernew in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using new before a function declaration",
        reason: "Weird construction. Is 'new' necessary?",
        jshint: true,
        code: "var a = new function () {};"
    });

    assertTest({
        title: "Leaving off the parantheses in constructors",
        reason: "I think you're missing the \"()\" to invoke the constructor.",
        jshint: true,
        code: "var b = new Array;"
    });

    /* See exports.expr in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Typing an expression statement without assignment",
        reason: "I thought you were going to type an assignment or function call but you typed an expression instead.",
        jshint: true,
        code: "true;"
    });

    /* See exports.loopfunc in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using functions in a loop",
        reason: "It's not a good idea to define functions within a loop. Can you define them outside instead?",
        jshint: true,
        code: "while (true) {var x = function () {};};"
    });

    /* See exports.boss in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using = assignments instead of conditionals",
        reason: "I thought you were going to type a conditional expression but you typed an assignment instead. Maybe you meant to type === instead of =?",
        jshint: true,
        code: "var e;if (e = 1) {}"
    });

    assertTest({
        title: "Using other assignments instead of conditionals",
        reason: "I thought you were going to type a conditional expression but you typed an assignment instead.",
        jshint: true,
        code: "var e;if (e /= 1) {}"
    });

    assertTest({
        title: "Using assignments instead of conditionals in return statements",
        reason: "Did you mean to return a conditional instead of an assignment?",
        jshint: true,
        code: "var foo = function(a) { return a = 1;};"
    });

    /* See exports.sub in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using bracket notation with objects",
        reason: "['prop'] is better written in dot notation.",
        jshint: true,
        code: "window.obj = obj['prop'];"
    });

    /* See exports.unnecessarysemicolon in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    assertTest({
        title: "Using an unnecessary semicolon",
        reason: "It looks like you have an unnecessary semicolon.",
        jshint: true,
        code: "var foo = function() {var a;;};"
    });

    assertTest({
        title: "Using undefined variable where a BabyHint spelling suggestion exists should merge the two error messages.",
        reason: "examle is not defined. Maybe you meant to type example, or you're using a variable you didn't define.",
        babyhint: true,
        code: "var example = 100;\nexamle = 30;"
    });

    assertTest({
        title: "Using undefined variable where a BabyHint spelling suggestion exists for another variable shouldn't merge anything.",
        reason: "x is not defined. Make sure you're spelling it correctly and that you declared it.",
        babyhint: true,
        code: "x=0;\nvar example = 100;\nexamle = 30;"
    });
});

// Error report patterns
describe("Scratchpad Output - Error report pattern checks", function() {
    // De-duplication of same-line same-text errors
    allErrorsTest({
        title: "Report repeated error only once per line",
        reasons: ["\"i\" is not defined. Make sure you're spelling it correctly and that you declared it."],
        jshint: true,
        code: "for (i = 0; i < 10; i++) {}"
    });

    allErrorsTest({
        title: "Different errors on same line are still reported sepearately",
        reasons: ["\"i\" is not defined. Make sure you're spelling it correctly and that you declared it.", 
            "\"j\" is not defined. Make sure you're spelling it correctly and that you declared it."],
        jshint: true,
        code: "for (i = 0, j = 0; i * j < 100; i++, j++) {}"
    });

    allErrorsTest({
        title: "Same error on different lines are still reported separately",
        reasons: ["\"i\" is not defined. Make sure you're spelling it correctly and that you declared it.", 
            "\"i\" is not defined. Make sure you're spelling it correctly and that you declared it."],
        jshint: true,
        code: "for (i = 0; i < 10; i++) {} \n i = 4;"
    });
});
