var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
    entry: {
        editor_ace: [
            "./js/editors/ace/editor-ace.js"
        ],
        "editor_textarea": [
            "./js/editors/textarea/editor-textarea.js"
        ],
        core_deps: [
            "jquery",
            "underscore",
            "backbone",
            "jed",
            "./bower_components/jquery-ui/ui/jquery-ui.custom.js",
            "./external/handlebars/handlebars.runtime.js",
            "./bower_components/bootstrap/js/bootstrap-tab.js",
            "./js/shared/i18n.js",
        ],
        output_pjs: [
            "./js/output/pjs/babyhint.js",
            "./js/output/pjs/pjs-code-injector.js",
            "./js/output/pjs/pjs-resource-cache.js",
            "./js/output/pjs/pjs-output.js",
            "./js/output/pjs/pjs-ast-transforms.js",
            "./js/output/shared/ast-builder.js",
            "./js/output/shared/ast-walker.js",
            "./js/output/shared/loop-protect.js",
            "./js/output/pjs/pjs-tester.js",
        ],
        output_pjs_deps: [
            "esprima",
            "escodegen",
            "jshint",
            "processing",
            "structuredjs",
        ],
        output_sql_deps: [
            "html2canvas",
            "sql",
        ],
        output_sql: [
            "./build/tmpl/sql-results.js",
            "./js/output/sql/sql-tester.js",
            "./js/output/sql/sql-output.js",
        ],
        output_webpage: [
            "./js/output/webpage/webpage-tester.js",
            "./js/output/webpage/webpage-output.js",
            "./js/output/webpage/state-scrubber.js",
            "./js/output/shared/ast-builder.js",
            "./js/output/shared/ast-walker.js",
            "./js/output/shared/loop-protect.js",
            "./js/output/pjs/pjs-tester.js",
        ],
        output_webpage_deps: [
            "esprima",
            "escodegen",
            "html2canvas",
            "slowparse",
            "structuredjs",
        ],
        output: [
            "./js/output/shared/pooled-worker.js",
            "./js/output/shared/output-tester.js",
            "./js/output/shared/output.js"
        ],
        shared: [
            "visibly.js",
            "./js/shared/all-images.js",
            "./js/shared/images.js",
            "./js/shared/sounds.js",
            "./js/shared/record.js",
            "./js/shared/config.js",
            "./node_modules/babel-core/polyfill.js",
        ],
        tooltips: [
            "./build/tmpl/image-picker.js",
            "./build/tmpl/mediapicker-preview.js",
            "./build/tmpl/mediapicker-modal.js",
            "./external/colorpicker/colorpicker.js",
            "./js/ui/autosuggest.js",
            "./js/ui/autosuggest-data.js",
            "./js/ui/tooltip-engine.js",
            "./js/ui/tooltip-base.js",
            "./js/ui/tooltips/auto-suggest.js",
            "./js/ui/tooltips/color-picker.js",
            "./js/ui/tooltips/image-modal.js",
            "./js/ui/tooltips/image-picker.js",
            "./js/ui/tooltips/number-scrubber.js",
            "./js/ui/tooltips/number-scrubber-click.js",
            "./js/ui/tooltips/tooltip-utils.js",
            "./js/ui/structured-blocks-tooltips.js"
        ],
        ui: [
            "./build/tmpl/live-editor.js",
            "./build/tmpl/tipbar.js",
            "./js/ui/tipbar.js",
            "./js/ui/canvas.js",
            "./js/ui/record.js",
            "./js/live-editor.js",
        ]
    },
    output: {
        path: './build/js',
        filename: "live-editor.[name].js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: [/node_modules/, /external/, /bower_components/],
            loader: 'babel',
            query: {
                // e can't use strict mode for some files becuase it changes
                // JavaScript semantics and breaks code injection
                blacklist: ["strict"]
            }
        }, { 
            // appends `module.exports = window.Processing` to processing.js
            test: /[\/]processing\.js$/, 
            loader: "exports?window.Processing" 
        }, {
            // appends `module.exports = window.html2canvas` to html2canvas.js
            test: /[\/]html2canvas\.js$/,
            loader: "exports?window.html2canvas"
        }, {
            // appends `module.exports = window.visibly` to visibly.js
            test: /[\/]visibly\.js$/,
            loader: "exports?window.visibly"
        }, {
            // globalize _
            test: require.resolve("underscore"), 
            loader: "expose?_"
        }, {
            // globalize Backbone
            test: require.resolve("backbone"),
            loader: "expose?Backbone"
        }, {
            // globalize $ and jQuery
            test: require.resolve("jquery"), 
            loader: "expose?$!expose?jQuery"
        }, {
            // globalize Handlebars
            test: require.resolve("handlebars"),
            loader: "expose?Handlebars"
        }, {
            // when requiring any templates ensure that "this" is "window"
            test: /[\/]tmpl\//,
            loader: "imports?this=>window"
        }, {
            // the way Backbone 1.0.0 defines itself assumes that "this" is
            // "window"
            test: require.resolve("backbone"),
            loader: "imports?this=>window"
        }, {
            // sql.js requires "fs" and "ws" if it detects that "require" is a
            // function, the script loader hides "require" when loading the 
            // module
            test: /[\/]sql\.js$/,
            loader: "script"
        }]
    },
    resolve: {
        alias: {
            processing: path.join(__dirname, "external/processing-js/processing.js"),
            jshint:  path.join(__dirname, "external/jshint/jshint.js"),
            escodegen: path.join(__dirname, "external/structured-blocks/external/escodegen.browser.js"),
            structuredjs: path.join(__dirname, "external/structuredjs/structured.js"),
            html2canvas: path.join(__dirname, "external/html2canvas/html2canvas.js"),
            slowparse: path.join(__dirname, "external/slowparse/slowparse.js"),
            handlebars: path.join(__dirname, "external/handlebars/handlebars.runtime.js"),
            sql: path.join(__dirname, "external/sqlitejs/sql.js"),
        }  
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ 
            names: ['core_deps']
        })
    ]
};

module.exports = config;
