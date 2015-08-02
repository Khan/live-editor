window.PythonOutput = Backbone.View.extend({
    initialize: function initialize(options) {
        this.config = options.config;
        this.output = options.output;
        // TODO(hannah): Implement a tester.
        this.tester = null;
        this.error = null;
        this.render();

        // Register a helper to tell the difference between null and 0
        Handlebars.registerHelper("isNull", function (variable, options) {
            if (variable === null) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });
    },

    render: function render() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
        /*this.$el.empty();
        var canvas_style = "style='position: relative;width: 100%;height: 80%;margin: 0;'";
        var pre_style = "style='position: relative;width: 100%;height: 20%;margin: 0;" +
            "white-space: pre-wrap;white-space: -moz-pre-wrap;white-space: -pre-wrap;white-space: -o-pre-wrap;word-wrap: break-word;" +
            "overflow: auto;" +
            "background-color: black;" +
            "color: rgb(204, 204, 204);'";
        var resize_html = "<div style='height: 5px; cursor: n-resize; background-color: rgb(169, 169, 169);'></div>";
        var pre_html = "<pre id='skulpt_pre' class='ui-widget-content' " + pre_style + "></pre>";
        var canvas_html = "<div id='skulpt_canvas_div'" + canvas_style + "></div>";
        var html = "<div id='output'>" + canvas_html + resize_html + pre_html + "</div>";
        this.$frame = $(html).css({ width: "100%", height: "100%", border: "0", position: "absolute"}).appendTo(this.el).show()[0];*/

    },

    getScreenshot: function(screenshotSize, callback) {
        var nodesToRecover = [];
        var nodesToRemove = [];

        var svgElem = $('#output').find('svg');

        svgElem.each(function(index, node) {
            var parentNode = node.parentNode;
            var svg = parentNode.innerHTML;

            var canvas = document.createElement('canvas');

            canvg(canvas, svg);

            nodesToRecover.push({
                parent: parentNode,
                child: node
            });
            parentNode.removeChild(node);

            nodesToRemove.push({
                parent: parentNode,
                child: canvas
            });

            parentNode.appendChild(canvas);
        });

        html2canvas(document.getElementById('output'), {
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

    getDocument: function () {
        return this.$frame[0].contentWindow.document;
    },

    lint: function lint(userCode, skip) {
        this.slowparseResults = userCode;
        var prog = this.slowparseResults;
        var error = null;
         
        var deferred = $.Deferred();
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "skulpt_canvas_div";

        Sk.read = function (x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        };
        
        
        var myPromise = Sk.misceval.asyncToPromise(function() {
            console.log(Sk.importMainWithBody("<stdin>", false, prog, true));
           return Sk.importMainWithBody("<stdin>", false, prog, true);
        });

        myPromise.then(
            function(mod) {
                deferred.resolve([]);
            },
            function(err) {
                if ("lineno" in err.traceback[0]) {
                    row = err.traceback[0].lineno;    
                }
                else {
                    row = 0;
                }

                if ("colno" in err.traceback[0]) {
                    column = err.traceback[0].colno;    
                }
                else {
                    column = 0;
                }

                error = err.toString;
                console.log(deferred);
                deferred.resolve([{
                    row: row,
                    column: column,
                    text: err.toString(),
                    type: "error",
                    source: "slowparse"
                }]);
            }
        );
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
        Sk.domOutput = function(html) {
            return $('#skulpt_canvas_div');
        };

        // tell Skulpt where to find pygal.js and its dependencies are
        // '../../bower_components/pygal.js/__init__.js'
        this.externalsDir = this.output.externalsDir;
        Sk.externalLibraries = {
            pygal : {
                path : this.externalsDir + 'bower_components/pygal.js/__init__.js',
                dependencies : [
                    this.externalsDir + 'bower_components/highcharts/highcharts.js',
                    this.externalsDir + 'bower_components/highcharts/highcharts-more.js'
                ]
            }
        };

        // optionally configure the size (in pixels) at which the charts should render
        Sk.availableWidth = $('#skulpt_canvas_div').width();
        Sk.availableHeight = $('#skulpt_canvas_div').height();
        // -----------------------------------------------------------------------------------
        var deferred = $.Deferred();
        var results = [];
        var errors = [];
        var prog = this.slowparseResults;
        Sk.pre = "skulpt_pre";
        Sk.canvas = "skulpt_canvas_div";
        Sk.configure({output:outf, read:builtinRead}); 
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "skulpt_canvas_div";

        function outf(text) { 
            if (text != '\n') {
                results.push(text);
            }
        } 
        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
                throw "File not found: '" + x + "'";
            }
            return Sk.builtinFiles["files"][x];
        }
        
        
        var myPromise = Sk.misceval.asyncToPromise(function() {
           return Sk.importMainWithBody("<stdin>", false, codeObj, true);
        });

        myPromise.then(
            function(mod) {},
            function(err) {
                if ("lineno" in err.traceback[0]) {
                    row = err.traceback[0].lineno;    
                }
                else {
                    row = 0;
                }

                if ("colno" in err.traceback[0]) {
                    column = err.traceback[0].colno;    
                }
                else {
                    column = 0;
                }

                error = err.toString;

                callback([error], userCode);                
            }
        );

        var output = Handlebars.templates["python-results"]({results: results, errors:errors});
        var doc = this.getDocument();
        doc.open();
        doc.write(output);
        doc.close();

        callback([]);
    },

    clear: function clear() {},

    kill: function kill() {}
});

LiveEditorOutput.registerOutput("python", PythonOutput);