/* Provides pretty-printing functionality */
window.ScratchpadTidy = {

    init: function (options) {
        var liveEditor = options.liveEditor;
        var editor = options.editor;
        var worker = new Worker(options.workersDir + "tidy/tidy-worker.js");
        var idle = true;
        var $tidyButton = liveEditor.$el.find("#tidy-button");
        var rowsFromTop;

        worker.addEventListener("message", function (e) {
            if (e.data.type === "tidy") {
                editor.session.doc.setValue(e.data.code);
                var position = e.data.cursorPosition;
                position.row--;
                
                var topRow = position.row - rowsFromTop;
                
                editor.clearSelection();
                editor.moveCursorToPosition(position);
                editor.scrollToLine(topRow, false, true);
                editor.focus();
                
                liveEditor.enable(true);
                $tidyButton.prop("disabled", false);
            }
            idle = true;
        });

        $tidyButton.click(function () {
            var position = editor.getCursorPosition();
            rowsFromTop = position.row - editor.getFirstVisibleRow();
            position.row++;

            if (idle) {
                idle = false;
                worker.postMessage({
                    externalsDir: options.externalsDir,
                    code: editor.session.doc.getValue(),
                    cursorPosition: position
                });
                liveEditor.disable(true);
                $tidyButton.prop("disabled", true);
            }
        });
    }
};
