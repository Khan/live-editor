window.PythonOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;
        // TODO(hannah): Implement a tester.
        this.tester = null;
        this.render();
    },

    render: function render() {
        this.$el.empty();
        var canvas_style = "style='position: relative;width: 100%;height: 80%;margin: 0;'";
        var pre_style = "style='position: relative;width: 100%;height: 20%;margin: 0;" +
            "white-space: pre-wrap;white-space: -moz-pre-wrap;white-space: -pre-wrap;white-space: -o-pre-wrap;word-wrap: break-word;" +
            "overflow: auto;" +
            "background-color: black;" +
            "color: rgb(204, 204, 204);'";
        var pre_html = "<pre id='skulpt_pre'" + pre_style + "></pre>";
        var canvas_html = "<div id='skulpt_canvas_div'" + canvas_style + "></div>";
        var html = "<div id='output'>" + canvas_html + pre_html + "</div>";
        this.$frame = $(html).css({ width: "100%", height: "100%", border: "0", position: "absolute"}).appendTo(this.el).show()[0];
    },

    getScreenshot: function(screenshotSize, callback) {
        try {
        html2canvas(document.getElementById('skulpt_canvas_div'), {
            imagesDir: this.output.imagesDir,
            onrendered: function(canvas) {
                var width = screenshotSize;
                var height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(
                    canvas, 0, 0, width, height);

                // Send back the screenshot data
                callback(tmpCanvas.toDataURL("image/png"));
            }
        });
        } catch (err) {
            console.log(err);
        }
    },

    lint: function lint(userCode, skip) {
        console.log(userCode);
        this.slowparseResults = userCode;
        var deferred = $.Deferred();
        deferred.resolve([]);
        return deferred;
    },

    flattenError: function flattenError(plainError, error, base) {
        return "";
    },

    getLintMessage: function getLintMessage(plainError) {
        return "";
    },

    initTests: function initTests(validate) {
        return;
    },

    test: function test(userCode, tests, errors, callback) {},

    postProcessing: function postProcessing(oldPageTitle) {},

    runCode: function runCode(codeObj, callback) {
        function outf(text) { 
            if (text != '\n') {
                document.getElementById("skulpt_pre").style.color = "rgb(204, 204, 204)";
                document.getElementById("skulpt_pre").innerHTML += text + "\n";
            }
        } 
        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        }

        document.getElementById("skulpt_pre").innerHTML = "";
        document.getElementById("skulpt_canvas_div").innerHTML = "";

        var prog = this.slowparseResults;
        Sk.pre = "skulpt_pre";
        Sk.canvas = "skulpt_canvas_div";

        Sk.configure({output:outf, read:builtinRead}); 

        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "skulpt_canvas_div";
        var myPromise = Sk.misceval.asyncToPromise(function() {
           return Sk.importMainWithBody("<stdin>", false, prog, true);
        });

        myPromise.then(
            function(mod) {},
            function(err) {
                /*document.getElementById("skulpt_pre").style.color = "red";
                document.getElementById("skulpt_pre").innerHTML = err.toString();*/
            }
        );
        
        callback([]);
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("python", PythonOutput);