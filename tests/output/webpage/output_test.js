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
            var body = output.output.frameDoc.body;
            var a = body.querySelector('a');

            expect(a.getAttribute('target')).to.be.equal('_blank');
            expect(a.getAttribute('href')).to.be.equal(
                'http://ka.org/r?url=http%3A%2F%2Fwww.g.com');
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
        '<img src="https://www.google.com/images/srpr/logo11w.png">'
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

    test("links with valid protocols are not banned", [
      '<a href="http://google.com"></a>',
      '<a href="https://google.com"></a>',
      '<script src="//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js"></script>',
      '<a href="ftp://google.com"></a>',
      '<a href="mailto:khan@ka.com"></a>'
    ]);
    test("in-page links are not banned", '<a href="#foobar"></a>');
    test("javascript hrefs are not banned", '<a href="javascript:void(0)"></a>');
    test("regular scripts are not banned", '<script src="http://google.com"></script>');

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

    // Custom additions to Slowparse, to ban stuff

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

    failingTest("Malformed outward link href without protocol banned",
        "<a href='www.google.com'></a>", [
            {row: 0, column: 9, lint: {type: "INVALID_URL"}}
        ]
    );

    failingTest("Malformed outward link href without protocol banned",
        "<a href='google.com'></a>", [
            {row: 0, column: 9, lint: {type: "INVALID_URL"}}
        ]
    );

    failingTest("Malformed outward script without protocol banned",
        "<script src='www.google.com'></script>", [
            {row: 0, column: 13, lint: {type: "INVALID_URL"}}
        ]
    );

    if (!isFirefox()) {
        // An exception occurs in slowparse when parsing this HTML on
        // Chrome, Safari, and phantomjs.
        failingTest("Fatal slowparse error detected",
            "<li><a href='</li><img src='https://www.kasandbox.org'>", [
                {row: 0, column: 0, lint: {type: "UNKNOWN_SLOWPARSE_ERROR"}}
            ]
        );
    }

    if (isFirefox()) {
        // slowparse succeeds when parsing this HTML on Firefox.
        failingTest("Not so fatal slowparse error detected (Firefox)",
            "<li><a href='</li><img src='https://www.kasandbox.org'>", [
                {row: 0, column: 7, lint: {type: "INVALID_ATTR_NAME"}}
            ]
        );
    }

    //Scripting
    test("Script element enabled",
        "<script>console.log('Scripting enabled')</script>"
    );

    failingTest("Infinite loop errors",
        "<script> while(true){} </script>", [
            // Infinite loops dont give a location for their error message
            {row: undefined, column: undefined, text:
                '<span class="text">Your javascript is taking too long to run.' +
                ' Perhaps you have a mistake in your code?</span>'},
            {row: undefined, column: undefined, text:
                '<span class="text">Your javascript encountered a runtime error. ' +
                ' Check your console for more information.</span>'}
        ]
    );

    failingTest("Runtime errors",
        "<script> bla(x);</script>", [
            // Infinite loops dont give a location for their error message
            {row: undefined, column: undefined, text:
                'Your javascript encountered a runtime error. ' +
                'Check your console for more information.'}
        ]
    );
});
