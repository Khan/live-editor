describe("Output Methods", function() {
    runTest({
        title: "getScreenshot",
        code: "<!DOCTYPE html><html><body></body></html>",
        test: function(output, errors, testResults, callback) {
            output.output.getScreenshot(200, function(data) {
                // Testing with a truncated base64 png
                expect(data).to.contain("data:image/png;base64,iVBOR");
                callback();
            });
        }
    });
});

describe("Tag highlighting", function() {
    var tests = [{
        title: "Cursor at start of tag",
        html: "<div id='selected'>Hello</div>",
        pre: "<"
    }, {
        title: "Cursor at end of tag",
        html: "<div id='selected'>Hello</div>",
        pre: "<div id='selected'"
    }, {
        title: "Cursor in body",
        html: "<div>Hello</div>",
        pre: "<div>"
    }, {
        title: "Cursor in close tag",
        html: "<div>Hello</div>",
        pre: "<div>Hello</d"
    }, {
        title: "Tag selected",
        html: "<div id='selected'>Hello</div>",
        pre: "",
        body: "<div id='selected'>Hello</div>",
    }, {
        title: "Selected less first char",
        html: "<div>Hello</div>",
        pre: "<",
        body: "div>Hello</div>",
    }, {
        title: "Selected less last char",
        html: "<div>Hello</div>",
        pre: "",
        body: "<div>Hello</div",
    }, {
        title: "Selected up to siblings",
        html: "<span></span> <div id='selected'>Hello</div> <span></span>",
        pre: "<span></span>",
        body: " <div id='selected'>Hello</div> ",
    }, {
        title: "Selected too far left",
        html: "<span></span> <div>Hello</div> <span></span>",
        pre: "<span></span",
        body: "> <div>Hello</div> ",
    }, {
        title: "Selected too far right",
        html: "<span></span> <div>Hello</div> <span></span>",
        pre: "<span></span>",
        body: " <div>Hello</div> <",
    }, {
        title: "Selected including parent end tag",
        html: "<div> <span></span> <div>Hello</div> </div>",
        pre: "<div> <span></span> ",
        body: "<div>Hello</div> <",
    }];

    var mockedOutput = new WebpageOutput({
        output: {
            lastRunWasSuccess: true
        },
        config: {
            runCurVersion: function(){}
        }
    });

    var $container = $("<div style='display: none;'>").appendTo("body");

    _.each(tests, function(test) {
        if (!test.body) test.body = "";
        if (test.result == undefined) {
            test.result = true;
        }
        var dom1 = $("<div>").append(Slowparse.HTML(document, test.html).document)[0];
        var dom2 = $("<div>").append($(test.html))[0];
        $container.append(dom1).append(dom2);
        var cursor = {
            start: test.pre.length,
            end: test.pre.length + test.body.length
        };
        if (!$(dom2).find("#selected").length) {
            test.title = "!"+test.title;
        }

        it(test.title, function() {
            if (test.pre+test.body !== test.html.slice(0,test.pre.length+test.body.length)) {
                throw "Invalid prefix/body";
            } 
            var tag = mockedOutput.findTagForCursor(cursor, dom1, dom2);
            expect($(tag).length).to.be.equal($(dom2).find("#selected").length);
            $(dom1).remove();
            $(dom2).remove();
        });
    });
});

describe("Linting", function() {
    // Tests brought over from the Slowparse test suite

    test("parsing of valid DOCTYPE", '<!DOCTYPE html><p>hi</p>');

    failingTest("parsing of misplaced DOCTYPE",
        '<p>hi</p><!DOCTYPE html>', [
            {row: 0, column: 9, lint: {type: "INVALID_TAG_NAME"}}
        ]
    );

    test("parsing of HTML comments", 'hi<!--testing-->there');

    failingTest("UNQUOTED_ATTR_VALUE in <h2><span start=</h2>",
        '<h2><span start=</h2>', [
            {row: 0, column: 16, lint: {type: "UNQUOTED_ATTR_VALUE"}}
        ]
    );

    test("parsing of elements with boolean attributes", '<a href></a>');

    failingTest("parsing of elements with boolean attributes",
        '<a href+></a>', [
            {row: 0, column: 3, lint: {type: "INVALID_ATTR_NAME"}}
        ]
    );

    test("parsing of elements with boolean attributes",
        '<a href class="foo"></a>');

    test("parsing of valid HTML", '<p class="foo">hello there</p>');

    test("parsing of HTML comments with '--' in them",
        '<!-- allow\n--\nin comments plz -->');

    var text = "\nThis is CDATA with <p>, <i> and" +
        " <script> in it.\nThis should not trigger errors.";
    test("parsing of CDATA in <textarea> elements",
        "<textarea>" + text + "</textarea>");

    test("parsing of HTML is case-insensitive", [
        '<P CLASS="FOO">hi</P>',
        '<P class="FOO">hi</P>',
        '<p class="FOO">hi</P>',
        '<P class="FOO">hi</p>'
    ]);

    test("parsing of HTML with void elements:", [
        '<br>',
        '<img src="data:image/png,aaaa">'
    ]);

    test("parsing of text content w/ newlines", [
        '<p>hello\nthere</p>',
        '<p>\n  hello there</p>'
    ]);

    test("parsing of valid HTML w/ whitespace", [
        '<p class = "foo">hello there</p><p>u</p>',
        '<p class="foo"  >hello there</p><p>u</p>',
        '<p \nclass="foo">hello there</p><p>u</p>',
        '<p class="foo">hello there</p ><p>u</p>'
    ]);

    test("parsing of self-closing void elements works", 'hello<br/>');

    test("parsing of self-closing void elements w/ spaces works",
        'hello<br />');

    test("parsing of text content w/ HTML entities", '<p>&lt;p&gt;</p>');

    test("parsing of attr content w/ HTML entities",
        '<p class="1 &lt; 2 &LT; 3"></p>');

    failingTest("INVALID_TAG_NAME raised by < at EOF",
        '<', [
            {row: 0, column: 0, lint: {type: "INVALID_TAG_NAME"}}
        ]
    );

    failingTest("MISSING_CSS_SELECTOR works after comment",
        '<style>/* hello */ {</style>', [
            {row: 0, column: 18, lint: {type: "MISSING_CSS_SELECTOR"}}
        ]
    );

    failingTest("UNTERMINATED_ATTR_VALUE works at end of stream",
        '<a href="', [
            {row: 0, column: 8, lint: {type: "UNTERMINATED_ATTR_VALUE"}}
        ]
    );

    failingTest("UNQUOTED_ATTR_VALUE works at end of stream",
        '<a href=', [
            {row: 0, column: 8, lint: {type: "UNQUOTED_ATTR_VALUE"}}
        ]
    );

    failingTest("UNTERMINATED_CLOSE_TAG works at end of stream",
        "<span>test</span", [
            {row: 0, column: 10, lint: {type: "UNTERMINATED_CLOSE_TAG"}}
        ]
    );

    // Custom additions to Slowparse, to ban JavaScript stuff

    failingTest("Script element banned",
        "<script>alert('hi');</script>", [
            {row: 0, column: 0, lint: {type: "SCRIPT_ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("JavaScript URL banned",
        "<a href='javascript:alert(\"hi\");'></a>", [
            {row: 0, column: 9, lint: {type: "JAVASCRIPT_URL_NOT_ALLOWED"}}
        ]
    );

    failingTest("Event handler attribute banned",
        "<a onclick='alert(\"hi\")'></a>", [
            {row: 0, column: 3, lint: {type: "EVENT_HANDLER_ATTR_NOT_ALLOWED"}}
        ]
    );

    failingTest("Audio element banned",
        "<audio></audio>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Video element banned",
        "<video></video>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Iframe element banned",
        "<iframe></iframe>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Embed element banned",
        "<embed></embed>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Object element banned",
        "<object></object>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Fatal slowparse error detected",
        "<li><a href='</li><img src='https://www.kasandbox.org'>", [
            {row: 0, column: 0, lint: {type: "UNKNOWN_SLOWPARSE_ERROR"}}
        ]
    );
});
