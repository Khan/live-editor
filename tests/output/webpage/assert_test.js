describe("Challenge Assertions", function() {
    var divTest = (function() {
        staticTest("Put a div in your page.", function() {
            var pattern = "#foo div";
            var result = match(pattern);
            if (fails(result)) {
                if (matches({"div": 1})) {
                    result = fail("Looks like you put the div in the wrong place! Be sure to put it inside the element with an id of 'foo'.");
                }
            }
            var descrip = "Add a div element to your page. Put it inside the element with an id of 'foo'.";
            assertMatch(result, descrip, pattern);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "Checking a div in the wrong place",
        code: "<div></div>",
        validate: divTest,
        fromTests: true,
        reason: "Looks like you put the div in the wrong place! Be sure to put it inside the element with an id of 'foo'."
    });

    assertTest({
        title: "Failing to complete any step",
        code: "<span></span>",
        validate: divTest,
        fromTests: true,
        reason: "Your HTML failed to match the following selector: '#foo div'. Expected '1' elements, found '0' instead."
    });

    assertTest({
        title: "Getting a Slowparse syntax error",
        code: "<div></div",
        validate: divTest,
        reason: "A closing </div> tag doesn\'t end with a >."
    });

    assertTest({
        title: "Doing the step with no errors",
        code: "<p id='foo'><div></div></p>",
        validate: divTest
    });
});