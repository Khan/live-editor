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
            expect(output.output.transformUrl("http://khanacademy.org.mn"))
                .to.be.equal(
                    "http://ka.org/r?url=http%3A%2F%2Fkhanacademy.org.mn");
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

    test("parsing of HTML comments", '<!DOCTYPE html><html>hi<!--testing-->there</html>');

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
        '<!DOCTYPE html><html><!-- allow\n--\nin comments plz --></html>');

    var text = "\nThis is CDATA with <p>, <i> and" +
        " <script> in it.\nThis should not trigger errors.";
    test("parsing of CDATA in <textarea> elements",
        "<textarea>" + text + "</textarea>");

    test("parsing of uppercase <TEXTAREA> tags should work", [
        '<TEXTAREA>hi</TEXTAREA>',
        '<TEXTAREA>hi</textarea>',
        '<textarea>hi</TEXTAREA>',
    ]);

    test("parsing of uppercase <SCRIPT> tags should work", [
        '<SCRIPT>var hi = "hi";</SCRIPT>',
        '<SCRIPT>var hi = "hi";</script>',
        '<script>var hi = "hi";</SCRIPT>',
    ]);

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

    failingTest("INVALID_CSS_PROPERTY_NAME in CSS style",
        '<style>p { background color: red;}</style>', [
            {row: 0, column: 11, lint: {type: "INVALID_CSS_PROPERTY_NAME"}}
        ]
    );

    warningTest('links with invalid protocols throw warnings', [
        "<!DOCTYPE html><html><a href='www.google.com'></a></html>",
        "<!DOCTYPE html><html><a href='google.com'></a></html>",
        "<!DOCTYPE html><html><script src='www.google.com'></script></html>"
    ], [
        ["The <a> tag's \"href\" attribute points to an invalid URL.  Did you include the protocol (http:// or https://)?"],
        ["The <a> tag's \"href\" attribute points to an invalid URL.  Did you include the protocol (http:// or https://)?"],
        ["The <script> tag's \"src\" attribute points to an invalid URL.  Did you include the protocol (http:// or https://)?"]
    ]);

    warningTest('links with valid protocols do not throw warnings', [
      '<!DOCTYPE html><html><a href="http://google.com"></a></html>',
      '<!DOCTYPE html><html><a href="https://google.com"></a></html>',
      '<!DOCTYPE html><html><script src="//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js"></script></html>',
      '<!DOCTYPE html><html><a href="ftp://google.com"></a></html>',
      '<!DOCTYPE html><html><a href="mailto:khan@ka.com"></a</html>>'
    ], [[], [], [], [], []]);

    warningTest("in-page links are not banned", '<!DOCTYPE html><html><a href="#foobar"></a></html>', []);
    warningTest("javascript hrefs are not banned", '<!DOCTYPE html><html><a href="javascript:void(0)"></a></html>', []);
    warningTest("regular scripts are not banned", '<!DOCTYPE html><html><script src="http://google.com"></script></html>', []);

    warningTest("missing DOCTYPE", "<html><body></body></html>",
      ["A DOCTYPE declaration should be the first item on the page."]
    );

    warningTest("forgetting CSS values in a <style> block throw a warning",
      '<!DOCTYPE html><html><style>.photo {\nborder: 2px, double, red;\nmargin-left:5px;\nwidth: 200px;\ncolor: blue\n}</style></html>',
      ['The CSS value \"blue\" still needs to be finalized with \";\"']
    );

    warningTest("color values with a space throw a warning",
      '<!DOCTYPE html><html><style>\n.photo {\ncolor: rgb (255, 255, 255);\n}\n</style></html>',
      ['The CSS value \"rgb (255, 255, 255)\" is malformed.']
    );

    warningTest("non-standard CSS properties throw a warning",
      '<!DOCTYPE html><html><style>\n.photo {\nbackground-blend-mode: screen;\n}\n</style></html>',
      ['The CSS property "background-blend-mode" is non-standard or non-existent. Check spelling and browser compatibility.']
    );

    warningTest("obsolete HTML elements warned against", [
        "<!DOCTYPE html><html><marquee></marquee></html>",
        "<!DOCTYPE html><html><marquee>Some clever message</marquee></html>",
        "<!DOCTYPE html><html><acronym title=\"World Wide Web\">WWW</acronym></html>"
    ], [
        ["The \"marquee\" tag is obsolete and may not function properly in modern browsers."],
        ["The \"marquee\" tag is obsolete and may not function properly in modern browsers."],
        ["The \"acronym\" tag is obsolete and may not function properly in modern browsers."]
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

    failingTest("Frameset element banned",
        "<frameset></frameset>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Frame element banned",
        "<frame></frame>", [
            {row: 0, column: 0, lint: {type: "ELEMENT_NOT_ALLOWED"}}
        ]
    );

    failingTest("Slowparse error detected",
        "<li><a href='</li><img src='https://www.kasandbox.org'>", [
            {row: 0, column: 7, lint: {type: "INVALID_ATTR_NAME"}}
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
                'Your javascript is taking too long to run.' +
                ' Perhaps you have a mistake in your code?'},
            {row: undefined, column: undefined, text:
                'Your javascript encountered a runtime error. ' +
                ' Check your console for more information.'}
        ]
    );

    failingTest("Runtime errors",
        "<script> testingRuntimeErrors(x);</script>", [
            // Runtime errors dont give a location for their error message
            {row: undefined, column: undefined, text:
                'Your javascript encountered a runtime error. ' +
                'Check your console for more information.'}
        ]
    );
});
