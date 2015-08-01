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
        var pre_html = "<pre id='skulpt_pre' class='ui-widget-content'" + pre_style + "></pre>";
        var canvas_html = "<div id='skulpt_canvas_div'" + canvas_style + "></div>";
        var html = "<div id='output'>" + canvas_html + pre_html + "</div>";
        this.$frame = $(html).css({ width: "100%", height: "100%", border: "0", position: "absolute"}).appendTo(this.el).show()[0];
        //$("#skulpt_pre").resizable;
    },

    getScreenshot: function(screenshotSize, callback) {
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
    },

    lint: function lint(userCode, skip) {
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
        // PyGal Integration -----------------------------------------------------------------
        
        // the domOutput is called whenever the chart is rendered
        // and is expected to append the provided html to the DOM
        // and return the resulting jquery element
        /*Sk.domOutput = function(html) {
            console.log("oh hai!");
            return $('#skulpt_canvas_div');
            //return $('body').append(html).children().last();
        };

        // tell Skulpt where to find pygal.js and its dependencies are
        // '../../bower_components/pygal.js/__init__.js'
        Sk.externalLibraries = {
            pygal : {
                path : 'external/pygal.js/__init__.js',
                dependencies : []
            }
        };*/

        // optionally configure the size (in pixels) at which the charts should render
        //Sk.availableWidth = 600;
        //Sk.availableHeight = 400;
        // -----------------------------------------------------------------------------------

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
                console.log(err.toString());
            }
        );
        
        callback([]);
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("python", PythonOutput);