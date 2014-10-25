describe("Tidy", function () {
    var editor, session, $tidyButton;
    
    beforeEach(function () {
        editor = liveEditor.editor.editor;
        session = editor.getSession();
        session.setValue("");
        $tidyButton = $("#tidy-button");
    });

    it("should format code", function (done) {
        var code = "var foo = function () { rect(100, 100, 100, 100); };";
        var expectedCode = "var foo = function () {\n" +
            "    rect(100, 100, 100, 100);\n" +
            "};";
        
        session.setValue(code);

        $tidyButton.trigger("click");

        waitForTidy(function () {
            expect(session.getValue()).to.be(expectedCode);
        }, done);
    });

    it("should put the cursor in the right location", function (done) {
        var code = "var foo = function () { rect(100, 100, 100, 100); };";
        var position = {
            row: 0,
            column: 26
        };
        var expectedPosition = {
            row: 1,
            column: 6
        };

        session.setValue(code);
        editor.moveCursorToPosition(position);

        $tidyButton.trigger("click");

        waitForTidy(function () {
            var actualPosition = editor.getCursorPosition();
            expect(actualPosition.row).to.be(expectedPosition.row);
            expect(actualPosition.column).to.be(expectedPosition.column);
        }, done);
    });

    it("should preserve comments and spaces", function (done) {
        var code = "// comment 1\n" +
            "\n" +
            "// comment 2\n" +
            "var foo = function () {\n" +
            "    // comment 3\n" +
            "    rect(100, 100, 100, 100, 100);\n" +
            "};\n" +
            "\n" +
            "foo();";

        session.setValue(code);

        $tidyButton.trigger("click");

        waitForTidy(function () {
            expect(session.getValue()).to.be(code);
        }, done);
    });
    
    it("should disable the tidy button", function () {
        var code = "var foo = function () { rect(100, 100, 100, 100); };";
        session.setValue(code);
        
        $tidyButton.trigger("click");
        
        expect($tidyButton.prop("disabled")).to.be(true);
    });
});
