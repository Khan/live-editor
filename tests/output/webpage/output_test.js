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

    runTest({
        title: "transformUrl",
        code: "<!DOCTYPE html><html><body></body></html>",
        test: function(output, errors, testResults) {
            expect(output.output.transformUrl("http://www.g.com"))
                .to.be.equal("http://ka.org/r?url=http%3A%2F%2Fwww.g.com");
        }
    });

    runTest({
        title: "transformUrl",
        code: "<!DOCTYPE html><html><body></body></html>",
        test: function(output, errors, testResults) {
            expect(output.output.transformUrl("http://www.khanacademy.org/m"))
                .to.be.equal("http://www.khanacademy.org/m");
        }
    });

    runTest({
        title: "postProcessing",
        code: "<!DOCTYPE html><html><body><a href='http://www.g.com'>G</a></body></html>",
        test: function(output, errors, testResults) {
            expect(output.output.frameDoc.body.innerHTML).to.contain(
                "<a href=\"http://ka.org/r?url=http%3A%2F%2Fwww.g.com\" target=\"_blank\">G</a>");
        }
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

    test("parsing of form elements", [
        '<button type="button">Submit</button>',
        '<button type="submit">Submit</button>'
    ]);

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

    //Scripting
    test("Script element enabled",
        "<script>console.log('Scripting enabled')</script>"
    );

    failingTest("Infinite loop errors",
        "<script> while(true){} </script>", [
            // Infinite loops dont give a location for their error message
            {row: undefined, column: undefined, text: 
                '<span class="text">Your javascript is taking too long to run.' +
                ' Perhaps you have a mistake in your code?</span>'}
        ]
    );
});
