var runTest = function(options) {
    if (options.version === undefined) {
        options.version = ScratchpadConfig.prototype.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    // Assume the code is a string, by default
    var code = options.code;

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            el: $("#output-area")[0],
            outputType: "webpage",
            workersDir: "../../../build/workers/",
            externalsDir: "../../../build/external/",
            imagesDir: "../../../build/images/",
            jshintFile: "../../../build/external/jshint/jshint.js"
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code, function(errors) {
            if (options.expected) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.equal([]);
                // In some cases, we actually verify number and line # of errors
                if (options.errors) {
                    expect(errors.length).to.be.equal(options.errors.length);
                    expect(errors[0].row)
                        .to.be.equal(options.errors[0].row);
                    expect(errors[0].column)
                        .to.be.equal(options.errors[0].column);
                    expect(errors[0].lint.type)
                        .to.be.equal(options.errors[0].lint.type);
                }
            }

            if (options.test) {
                if (options.test.length === 2) {
                    options.test(output, done);
                } else {
                    options.test(output);
                    done();
                }
            } else {
                done();
            }
        });
    });
};

var test = function(title, code) {
    if (typeof code === "object") {
        code.forEach(function(userCode) {
            test(title, userCode);
        });
        return;
    }

    runTest({
        title: title,
        code: code,
        expected: true
    });
};

var failingTest = function(title, code, errors) {
    runTest({
        title: title,
        code: code,
        expected: false, 
        errors: errors
    });
};

describe("Output Methods", function() {
    runTest({
        title: "getScreenshot",
        code: "<!DOCTYPE html><html><body></body></html>",
        test: function(output, callback) {
            output.output.getScreenshot(200, function(data) {
                // Testing with a truncated base64 png
                expect(data).to.contain("data:image/png;base64,iVBOR");
                callback();
            });
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
});
