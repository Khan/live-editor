describe("Autosuggest Assertions", function() {

    function listenOnce(target, event, listener) {
        var wrapper = function (e) {
            listener(e);
            target.removeEventListener(event, wrapper);
        };
        target.addEventListener(event, wrapper);
    }

    var customCompleter = window.ScratchpadAutosuggest.customCompleter;
    var editor = window.ScratchpadAutosuggest.editor;
    var session = editor.session;
    var worker = ScratchpadAutosuggest.customCompleter.worker;

    it("should not include variables that haven't been declared yet", function (done) {
        listenOnce(worker, "message", function () {
            var position = { row: 1, column: 0 };
            var userVars = customCompleter.getUserVariables(session, position);
            expect(userVars.length).to.equal(1);

            done();
        });

        editor.setValue("var p = 5;\nvar q = 10;\n");
    });

    it("should return all user variables if the cursor is at the end", function (done) {
        listenOnce(worker, "message", function () {
            var position = { row: 2, column: 0 };
            var userVars = customCompleter.getUserVariables(session, position);
            expect(userVars.length).to.equal(2);

            done();
        });

        editor.setValue("var p = 5;\nvar q = 10;\n");
    });

    it("should handle changes to the content", function (done) {
        listenOnce(worker, "message", function () {
            var position = { row: 1, column: 0 };
            var userVars = customCompleter.getUserVariables(session, position);
            expect(userVars.length).to.equal(1);
            expect(userVars[0]).to.have.property("name", "p");

            listenOnce(worker, "message", function () {
                var position = { row: 1, column: 0 };
                var userVars = customCompleter.getUserVariables(session, position);
                expect(userVars.length).to.equal(1);
                expect(userVars[0]).to.have.property("name", "q");

                done();
            });

            editor.setValue("var q = 10;\n");
        });

        editor.setValue("var p = 5;\n");
    });

    it("shouldn't report variables declared inside comments", function (done) {
        listenOnce(worker, "message", function () {
            var position = { row: 1, column: 0 };
            var userVars = customCompleter.getUserVariables(session, position);
            expect(userVars.length).to.equal(0);

            done();
        });

        editor.setValue("//var p = 5;\n");
    });
});
