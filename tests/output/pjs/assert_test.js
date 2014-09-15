describe("Challenge Assertions", function() {
    var hopperTest = (function() {
        staticTest("Start the H!", function() {
            var pattern = function() {
                rect(80,70,60,240);
            };
            var anyRectP = function() {
                rect(_,_,_,_);
            };
            var result = match(structure(pattern));
            if (fails(result)) {
                if (matches(structure(anyRectP))) {
                    result = fail("Hmm, that rectangle\'s at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right.");
                }
            }
            var descrip = "To draw an H using rectangles, we need two tall ones on the side and a short one connecting them in the middle. Start the first side by typing in exactly the code on the right →";
            assertMatch(result, descrip, pattern,
                "https://s3.amazonaws.com/ka-cs-challenge-images/h1.png");
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "Getting a challenge message",
        code: "rect(-10, 70, 60, 240);",
        validate: hopperTest,
        fromTests: true,
        reason: "Hmm, that rectangle's at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right."
    });

    assertTest({
        title: "Getting a BabyHint syntax error",
        code: "reect(20, 20, 10, 20);",
        validate: hopperTest,
        reason: "Did you mean to type rect instead of reect?",
        babyhint: true
    }); 

    assertTest({
        title: "Getting a JSHint syntax error",
        code: "rect(80, 70, 60, 240,);",
        validate: hopperTest,
        reason: "I think you either have an extra comma or a missing argument?",
        jshint: true
    });

    assertTest({
        title: "Doing the step with no errors",
        code: "rect(20, 20, 10, 20);",
        validate: hopperTest
    });    

    // This has assertMatch with syntaxChecks array as final argument
    var syntaxChecksTests = (function() {
        var syntaxChecks = [
            {
                re: /^\((\s*\d+\s*,){3}\s*\d+\);*.*/,
                msg: $._("Make sure you specify the command name, rect! Check the hint code.")
            },
            {
                re: /rect\s*\((\s*\d+\s*,\s*){4}\)/,
                msg: $._("You have an extra comma after your last parameter.")
            }
        ];

        staticTest("Start the H!", function() {
            var pattern = function() {
                rect(80,70,60,240);
            };
            var anyRectP = function() {
                rect(_,_,_,_);
            };
            var result = match(structure(pattern));
            if (fails(result)) {
                if (matches(structure(anyRectP))) {
                    result = fail("Hmm, that rectangle\'s at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right.");
                }
            }
            var descrip = "To draw an H using rectangles, we need two tall ones on the side and a short one connecting them in the middle. Start the first side by typing in exactly the code on the right →";
            assertMatch(result, descrip, pattern,
                    "https://s3.amazonaws.com/ka-cs-challenge-images/h1.png",
                    syntaxChecks);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "Showing special syntax error for extra comma",
        code: "rect(80, 70, 60, 240,);",
        validate: syntaxChecksTests,
        reason: "You have an extra comma after your last parameter."
    });

    assertTest({
        title: "Not suppressing syntax warnings",
        code: "rect(80, 70, 60, 240)",
        validate: syntaxChecksTests,
        reason: "It looks like you're missing a semicolon.",
        jshint: true
    });
});