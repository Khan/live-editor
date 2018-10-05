import {assertTest, createLiveEditorOutput, runTest} from "./test_utils.js";

// TODO(kevinb) remove after challenges have been converted to use i18n._
const $ = {};
$._ = i18n._;

describe("Challenge Assertions - HTML", function() {
    var divTest = (function() {

        var syntaxChecks = [{
            re: /<p>\w*<h1>\w*<\/h1>\w*<\/p>/,
            msg: "No h1 inside p!"
        }];

        staticTest("Put a div in your page.", function() {
            var pattern = "#foo div";
            var result = htmlMatch(pattern);
            if (fails(result)) {
                if (htmlMatches({"div": 1})) {
                    result = fail("Looks like you put the div in the wrong place! Be sure to put it inside the element with an id of 'foo'.");
                }
            }
            var descrip = "Add a div element to your page. Put it inside the element with an id of 'foo'.";
            assertMatch(result, descrip, pattern, null, syntaxChecks);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "Getting a syntax error",
        code: "<div id='foo'><div><p><h1>hi</h1></p></div></div>",
        validate: divTest,
        fromTests: false,
        reason: "No h1 inside p!"
    });

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
        reason: "fail"
    });

    assertTest({
        title: "Failing to complete any step",
        code: "<span></span>",
        validate: divTest,
        fromTests: true,
        reason: "fail"
    });

    assertTest({
        title: "Getting a Slowparse syntax error",
        code: "<div></div",
        validate: divTest,
        reason: "It looks like your closing \"</div>\" tag doesn\'t end with a \">\"."
    });

    assertTest({
        title: "Doing the step with no errors",
        code: "<p id='foo'><div></div></p>",
        validate: divTest,
        fromTests: true
    });
});

describe("Challenge Assertions - HTML Scripting", function() {
    var xTest = (function() {
        staticTest("Set X", function() {
            var result = pass();
            if (document.querySelector("iframe").contentWindow.x !== 4) {
                result = fail("Did you set x to 4?");
            }
            var descrip = "I don't really care";
            assertMatch(result, descrip);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "Scripting Works",
        code: "<div><script>window.x = 4;</script></div>",
        validate: xTest,
        fromTests: true,
    });

    assertTest({
        title: "Scripting Test fails",
        code: "<div></div>",
        validate: xTest,
        fromTests: true,
        reason: "Did you set x to 4?"
    });

    var jQueryTest = (function() {
        var jQueryC = constraint(function($jQuery) {
            return $jQuery.name === "$" || $jQuery.name === "jQuery";
        });

        staticTest($._("Animate the image"), function() {
            var result = null;
            var descrip = $._("This webpage displays an avatar's image and name (Aqualine!). In this first step, use jQuery's `animate` function to make Aqualine grow larger.\nTip: Try using a CSS 'descendant selector' to select the image.");
            var displayP = "_.animate(...);";

            var match1P = function() {
                $jQuery($selector).animate({
                    $prop: $propVal
                }, $delay);
            };

            var match2P = function() {
                $jQuery($selector).animate({
                    $prop: $propVal
                });
            };

            var selectorC = constraint(function($selector) {
                return $selector.value === ".avatar img" || $selector.value === "img";
            });

            var usedIdC = constraint(function($selector) {
                return $selector.value && $selector.value.indexOf('#') === 0;
            });

            var propC = constraint(function($prop) {
                return ($prop.type === "Identifier" && ($prop.name === "width" || $prop.name === "height"))
                    || ($prop.type === "Literal" &&  ($prop.value === "width" || $prop.value === "height"));
            });

            var propValC = constraint(function($propVal) {
                return $propVal && $propVal.value && $propVal.value > 150;
            });
            var matchP = firstMatchingPattern([match1P, match2P]);
            result = match(structure(matchP, jQueryC));

            if (passes(result)) {
                if (matches(structure(matchP, usedIdC))) {
                    result = fail($._("It looks like you're selecting by ID. Can you try selecting using the parent element's class name and a descendant selector instead?"));
                } else if (!matches(structure(matchP, selectorC))) {
                    result = fail($._("Hm, how are you selecting the image? The selector doesn't look like what I expected."));
                } else if (!matches(structure(matchP, propC))) {
                    result = fail($._("What property are you animating? To change the size, you should animate the `width` or the `height`."));
                } else if (!matches(structure(matchP, propValC))) {
                    result = fail($._("Are you making it bigger than it started?"));
                }
            }
            assertMatch(result, descrip, displayP);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "jQuery scripting works",
        code: '<div><script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script><script>$("img").animate({width:500});</script></div>',
        validate: jQueryTest,
        fromTests: true
    });
});

describe("scriptTest tests", function() {
    var xTest = (function() {
        scriptTest("Set X", function() {
            var result = match(function(){
                var x = 4;
            })
            var descrip = "I don't really care";
            assertMatch(result, descrip);
        });
    }).toString().replace(/^function.*?{([\s\S]*?)}$/, "$1");

    assertTest({
        title: "scriptTest reports success for matching code",
        code: "<div><script>var x = 4;</script></div>",
        validate: xTest,
    });

    assertTest({
        title: "scriptTest reports failure for not matching code",
        code: "<div></div>",
        validate: xTest,
        fromTests: true,
        reason: "fail"
    });

    assertTest({
        title: "scriptTest reports failure for not matching code",
        code: "<div><script>var y = 4;</script></div>",
        validate: xTest,
        fromTests: true,
        reason: "fail"
    });
});

describe("CSS selector matching with wildcards", function() {
    var output;

    before(function() {
        output = createLiveEditorOutput();
    });

    var selectorTests = [
        [true, "div", "div"],
        [false, "div", "li"],
        [true, "_", "div"],
        [false, "_", "a a"],
        [true, "_ _", "a b"],
        [true, "$1 div, $1 li", ".home div, .home li"],
        [true, "$1 div, $1 li, _ div", ".home div, #foo li, #foo div"],
        [false, "_", "table, li"],
    ];
    _.each(selectorTests, function(test) {
        var goal = test[0];
        var pattern = test[1];
        var selector = test[2];
        var title = "\"" + pattern.substring(0, 50) + "\" " + (goal ? "=" : "!") + "= \"" + selector.substring(0, 50) + "\"";
        it(title, function() {
            var P = output.output.tester.testContext.normalizeSelector(pattern);
            var S = output.output.tester.testContext.normalizeSelector(selector);
            var result = output.output.tester.testContext.selectorMatch(P, S);
            expect(result == goal).to.be.ok();
        });
    });
});

describe("Full CSS matching with wildcards", function() {
    var CSSTests = [{
        res: true,
        pat: "div{ color: blue }",
        css: "div{ color: blue; }",
    }, {
        res: false,
        pat: "div{ color: blue }",
        css: "div{ background-color: blue; }",
    }, {
        res: false,
        pat: "div{ color: blue }",
        css: "li{ color: blue; }",
    }, {
        res: false,
        pat: "div{ color: blue }",
        css: "div{ color: red; }",
    }, {
        res: true,
        title: "Having to re-guess",
        pat: "$id _ div { color: $1; }" +
            "$id a{ color: $1 }",
        css: ".home b div{ color: blue; }" +
            ".home a { color: red; }" +
            ".home c div{ color: red }"
    }, {
        res: false,
        title: "Re-guess to exhaustion",
        pat: "$id _ div { color: $1; }" +
            "$id a{ color: $1 }",
        css: ".home b div{ color: blue; }" +
            ".home a { color: green; }" +
            ".home c div{ color: red }"
    }, {
        res: true,
        pat: "div { }",
        css: "div, li { }"
    }, {
        res: true,
        pat: "h1 ,h2{}",
        css: "h1,h2{ }"
    }, {
        res: true,
        title: "Single selector matches Multiple selectors",
        pat: "div {color: red; height: 5px;} div, li {display: none;}",
        css: "div, li {color: red; display: none;} div {height: 5px;}"
    }, {
        res: false,
        title: "Multiple selectors do not match Single Selector",
        pat: "div, li {display: none;}",
        css: "div {display: none;} li {display: none;}"
    }, {
        res: true,
        pat: "h1 { height:  $h }",
        css: "h1 { height: 11px; }",
        callbacks: function($h) {
            return parseInt($h) > 10;
        }
    }, {
        res: false,
        pat: "h1 { height:  $h }",
        css: "h1 { height: 9px; }",
        callbacks: function($h) {
            return parseInt($h) > 10;
        }
    }, {
        res: true,
        title: "Using wildcards without callbacks works",
        pat: ".apples { color: $1; }",
        css: ".apples { color: red; }"
    }, {
        res: true,
        title: "Callbacks forcing recursion",
        pat: "_{height: $h2} _{height:  $h1} ",
        css: "h1 { height: 9px; } h2 { height: 6px; }",
        callbacks: function($h1, $h2) {
            return parseInt($h1) > parseInt($h2);
        }
    }, {
        res: false,
        title: "Callbacks forcing recursion to fail",
        pat: "_{height: $h2; color: red;} _{height:  $h1} ",
        css: "h1 { height: 9px; color: red;} h2 { height: 6px; }",
        callbacks: function($h1, $h2) {
            return parseInt($h1) > parseInt($h2);
        }
    }, {
        res: true,
        title: "notDefaultColor() passes",
        pat: "_{color: $1}",
        css: "h1 { color: rgb(255, 255,  255); }",
        callbacks: 'notDefaultColor("$1")'
    }, {
        res: false,
        title: "notDefaultColor() fails",
        pat: "_{color: $1}",
        css: "h1 { color: rgb(255, 0, 0); }",
        callbacks: 'notDefaultColor("$1")'
    },  {
        res: true,
        title: "isValidColor() passes for rgb color",
        pat: "_ {color: $1}",
        css: "h1 { color: rgb(255, 0, 0); }",
        callbacks: 'isValidColor("$1")'
    },  {
        res: true,
        title: "isValidColor() passes for named color",
        pat: "_ {color: $1}",
        css: "h1 { color: red; }",
        callbacks: 'isValidColor("$1")'
    }, {
        res: false,
        title: "isValidColor() fails for no rgb args ",
        pat: "_ {color: $1}",
        css: "h1 { color: rgb(); }",
        callbacks: 'isValidColor("$1")'
    }, {
        res: false,
        title: "isValidColor() fails for no rgb parantheses",
        pat: "_ {color: $1}",
        css: "h1 { color: rgb; }",
        callbacks: 'isValidColor("$1")'
    }, {
        res: false,
        title: "isValidColor() fails for no rgb wrapper ",
        pat: "_ {color: $1}",
        css: "h1 { color: (0, 10, 20); }",
        callbacks: 'isValidColor("$1")'
    }, {
        res: true,
        title: "Concatenating multiple stylesheets",
        pat: "h1{color: red} h2{color: black}",
        html: "<style>h1{color: red}</style><style>h2{color: black}</style>",
    }, {
        res: false,
        title: "Later styles override earlier styles",
        pat: "h1{color: red}",
        html: "<style>h1{color: red}</style><style>h1{color: black}</style>"
    }];

    _.each(CSSTests, function(options) {
        if (!options.title) {
            options.title = "\"" + options.pat.substring(0, 50) + "\" " + (options.res ? "=" : "!") + "= \"" +
                  options.css.substring(0, 50) + "\"" + (options.callbacks ? "+ callbacks" : "");
        }

        if (!options.html) {
            options.html = "<html><style>" + options.css + "</style></html>";
        }

        if(!options.validate) {
            options.validate = (function() {
                staticTest("Testing CSS", function() {
                    var result = cssMatch("$$PAT", $$CALLBACKS);
                    assertMatch(result);
                });
            }).toString()
                .replace(/^function.*?{([\s\S]*?)}$/, "$1")
                .replace("$$PAT", options.pat)
                .replace("$$CALLBACKS", (options.callbacks || "[]").toString());
        }

        runTest({
            title: options.title,
            validate: options.validate,
            code: options.html,
            test: function (output, errors, testResults) {
                expect(testResults[0].state !== "fail").to.be.equal(options.res);
            }
        });
    });
});
