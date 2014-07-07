/* global ellipse, getImage, image, background, loadImage, requestImage */
/* global text, color, textFont, fill, text, background, createFont */
/* global externals, exp, link */

var testutil = require("../testutil.js");
var Output = require("./output.js");
var ScratchpadConfig = require("../scratchpads-package/scratchpad-config.js");

var describe = testutil.describe;
var it = testutil.it;
var expect = testutil.expect;


var runTest = function(options) {
    if (options.version === undefined) {
        options.version = ScratchpadConfig.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    // Assume the code is a string, by default
    var code = options.code;

    // If not then we assume that it's a function so we need to
    // extract the code to run from the serialized function
    if (typeof code !== "string") {
        code = code.toString();
        code = code.substr(code.indexOf("{") + 1);
        code = code.substr(0, code.length - 1);
    }

    // Start an asynchronous test
    it(displayTitle, function(done) {
        Output.init();

        // Switch to the Scratchpad's version
        ScratchpadConfig.switchVersion(options.version);

        // Run once to make sure that no errors are thrown
        // during execution
        Output.runCode(code, function(errors) {
            expect(errors).to.have.length.above(0);
            if (options.jshint) {
                expect(errors[0].lint).to.exist;
                expect(errors[0].lint.reason).to.be.equal(options.reason);
            } else {
                var $html = $("<div>" + errors[0].text + "</div>");
                expect($html.text()).to.be.equal(options.reason);
            }
            done();
        });
    });
};


describe("Scratchpad Output - BabyHint checks", function() {

    /* Baby Hint errors */

    runTest({
        title: "Misspelling a function name",
        reason: "Did you mean to type rect instead of reect?",
        babyhint: true,
        code: "reect(20, 20, 10, 20);"
    });
    
    runTest({
        title: "Using wrong capitalization",
        reason: "Did you mean to type noStroke instead of noSTROKE?",
        babyhint: true,
        code: "noSTROKE();"
    });

    runTest({
        title: "Using wrong capitalization and misspelling",
        reason: "Did you mean to type noStroke instead of noStrokee?",
        babyhint: true,
        code: "noStrokee();"
    });
    

    runTest({
        title: "Mispelling with too many letters",
        reason: "reeeect is not defined. Make sure you're spelling it correctly and that you declared it.",
        babyhint: true,
        code: "reeeect();"
    });
    
    runTest({
        title: "Leaving off last parantheses in function call",
        reason: "It looks like you are missing a ) - does every ( have a corresponding closing )?",
        babyhint: true,
        code: "rect(80,70,60,240);\nrect("
    });

    runTest({
        title: "Leaving off last parantheses in if statement",
        reason: "It looks like you are missing a ) - does every ( have a corresponding closing )?",
        babyhint: true,
        code: "if(\n"
    });

    runTest({
        title: "Syntax error on line that has a keyword that looks like another keyword",
        reason: "I thought you were going to type { but you typed y.",
        babyhint: true,
        code: "var y;\nif(true)\ny=random(0,10);"
    });

    runTest({
        title: "Spelling shouldn't check argument names for misspelling",
        reason: "'drawRainbow' was used before it was defined.",
        babyhint: true,
        code: "var Rainbow = function(){};var RainbowRed = new Rainbow();drawRainbow(RainbowRed);var drawRainbow = function(rainbow) {};"
    });

    runTest({
        title: "Spelling error that should match lowercase version instead of uppercase",
        reason: "Did you mean to type rainbow instead of rainbo?",
        babyhint: true,
        code: "var Rainbow = function(){};\nvar RainbowRed = new Rainbow();\nvar drawRainbow = function(rainbow){\nellipse(rainbo.x, 10, 10, 10);};"
    });

    runTest({
        title: "Spelling error shouldn't warn about same word",
        reason: "I thought you were going to type an identifier but you typed '?'.",
        babyhint: true,
        code: "var numFlipped = 0; if (numFlipped === 2 && ?) {}"
    });
    
});

// Syntax errors - not controlled by JSHint options.
describe("Scratchpad Output - JSHint syntax errors", function() {

    runTest({
        title: "Extra comma in parameters to function call",
        reason: "I think you either have an extra comma or a missing argument?",
        jshint: true,
        code: "rect(80, 70, 60, 240,);"
    });

    runTest({
        title: "Missing value for argument",
        reason: "I think you meant to type a value or variable name before that comma?",
        jshint: true,
        code: "rect(,70,60,240);"
    });

    runTest({
        title: "Missing value for third argument",
        reason: "I think you meant to type a value or variable name before that comma?",
        jshint: true,
        code: "rect(80, 70, 60, 240);\nrect(240, 70, 60, 240);\nrect(193, 139,,30);"
    });

    runTest({
        title: "Putting too much on left side of assignment",
        reason: "The left side of an assignment must be a single variable name, not an expression.",
        jshint: true,
        code: "var x;\nx+x=1"
    });

    runTest({
        title: "Typing a single number",
        reason: "I thought you were going to type an assignment or function call but you typed an expression instead.",
        jshint: true,
        code: "10"
    });

    runTest({
        title: "Not closing a string",
        reason: "Unclosed string! Make sure you end your string with a quote.",
        jshint: true,
        code: "var myName=\"Stuff"
    });

    runTest({
        title: "Not closing a comment",
        reason: "It looks like your comment isn't closed. Use \"*/\" to end a multi-line comment.",
        jshint: true,
        code: "/*"
    });

    runTest({
        title: "Not starting a comment",
        reason: "It looks like you never started your comment. Use \"/*\" to start a multi-line comment.",
        jshint: true,
        code: "*/"
    });

    runTest({
        title: "Not matching a curly bracket",
        reason: "Unmatched \"{\".",
        jshint: true,
        code: "var bla = function() { if (true) { }"
    });

    /* Syntax warnings - not controlled by JSHint options. */

    runTest({
        title: "Not putting a 0 in front of a decimal",
        reason: "Please put a 0 in front of the decimal point: \".2\"!",
        jshint: true,
        code: "var x=.2;"
    });
});

/* Errors controlled by JSHint options that we've turned on. */
describe("Scratchpad Output - JSHint syntax options", function() {

    /* Redefinition of globals - see exposedProps in output.js */
    runTest({
        title: "Redefining ProcessingJS function",
        reason: "Redefinition of 'rect'.",
        jshint: true,
        code: "var rect = function() { ellipse(175, 220, 100, 150);};"
    });

    runTest({
        title: "Redefining ProcessingJS function",
        reason: "Redefinition of 'key'.",
        jshint: true,
        code: "var key = function() { rect(175, 220, 100, 150);};"
    });

    /* See exports.undef in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using undefined variable",
        reason: "\"x\" is not defined. Make sure you're spelling it correctly and that you declared it.",
        jshint: true,
        code: "ellipse(x, 100, 100, 100);"
    });

    /* See exports.asi in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Missing a semicolon",
        reason: "It looks like you're missing a semicolon.",
        jshint: true,
        code: "var x = 2"
    });

    /* See exports.curly in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Not using brackets around while body",
        reason: "I thought you were going to type \"{\" but you typed \"doSomething\".",
        jshint: true,
        code: "while (true) doSomething();"
    });

    runTest({
        title: "Not using brackets around if body",
        reason: "I thought you were going to type \"{\" but you typed \"return\".",
        jshint: true,
        code: "if (1) return true;"
    });


    /* See exports.supernew in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using new before a function declaration",
        reason: "Weird construction. Is 'new' necessary?",
        jshint: true,
        code: "var a = new function () {};"
    });

    runTest({
        title: "Leaving off the parantheses in constructors",
        reason: "I think you're missing the \"()\" to invoke the constructor.",
        jshint: true,
        code: "var b = new Array;"
    });

    /* See exports.expr in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Typing an expression statement without assignment",
        reason: "I thought you were going to type an assignment or function call but you typed an expression instead.",
        jshint: true,
        code: "true;"
    });

    /* See exports.loopfunc in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using functions in a loop",
        reason: "It's not a good idea to define functions within a loop. Can you define them outside instead?",
        jshint: true,
        code: "while (true) {var x = function () {};};"
    });

    /* See exports.boss in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using = assignments instead of conditionals",
        reason: "I thought you were going to type a conditional expression but you typed an assignment instead. Maybe you meant to type === instead of =?",
        jshint: true,
        code: "var e;if (e = 1) {}"
    });

    runTest({
        title: "Using other assignments instead of conditionals",
        reason: "I thought you were going to type a conditional expression but you typed an assignment instead.",
        jshint: true,
        code: "var e;if (e /= 1) {}"
    });

    runTest({
        title: "Using assignments instead of conditionals in return statements",
        reason: "Did you mean to return a conditional instead of an assignment?",
        jshint: true,
        code: "var foo = function(a) { return a = 1;};"
    });

    /* See exports.sub in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using bracket notation with objects",
        reason: "['prop'] is better written in dot notation.",
        jshint: true,
        code: "window.obj = obj['prop'];"
    });

    /* See exports.unnecessarysemicolon in https://github.com/jshint/jshint/blob/master/tests/unit/options.js */
    runTest({
        title: "Using an unnecessary semicolon",
        reason: "It looks like you have an unnecessary semicolon.",
        jshint: true,
        code: "var foo = function() {var a;;};"
    });

});
