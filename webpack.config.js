const path = require('path');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    performance: { hints: false },
    entry: {
        core_deps: [
            "./node_modules/jed/jed.js",
            "./js/shared/i18n.js"
        ],
        editor_ace_deps: [
            "./node_modules/ace-builds/src-noconflict/ace.js",
            "./node_modules/ace-builds/src-noconflict/mode-javascript.js",
            "./node_modules/ace-builds/src-noconflict/mode-html.js",
            "./node_modules/ace-builds/src-noconflict/ext-static_highlight.js",
            "./node_modules/ace-builds/src-noconflict/mode-sql.js",
            "./node_modules/ace-builds/src-noconflict/ext-searchbox.js",
            "./node_modules/ace-builds/src-noconflict/ext-language_tools.js"
        ],
        editor_ace: [
            "./external/colorpicker/colorpicker.js",
            "./js/ui/autosuggest.js",
            "./js/ui/autosuggest-data.js",
            "./js/ui/tooltip-engine.js",
            "./js/ui/tooltips/auto-suggest.js",
            "./js/ui/tooltips/color-picker.js",
            "./js/ui/tooltips/image-modal.js",
            "./js/ui/tooltips/image-picker.js",
            "./js/ui/tooltips/number-scrubber-click.js",
            "./js/ui/tooltips/number-scrubber.js",
            "./js/editors/ace/editor-ace.js"
        ],
        editor_textarea: [
            "./js/editors/textarea/editor-textarea.js"
        ],
        audio: [
            "./node_modules/soundmanager2/script/soundmanager2.js",
        ],
        debugger: [
            "./node_modules/iframe-overlay/dist/iframe-overlay.js",
            "./js/ui/debugger.js"
        ],
        shared: [
            "./js/shared/all-images.js",
            "./js/shared/images.js",
            "./js/shared/sounds.js",
            "./js/shared/config.js"
        ],
        output_debugger_deps: [
            "./node_modules/iframe-overlay/dist/iframe-overlay.js",
            "./external/debugger/build/debugger.js",
            "./external/debugger/build/processing-debugger.js",
            "./js/output/pjs/pjs-debugger.js"
        ],
        output_pjs: [
            "./external/processing-js/processing.js",
            "./external/jshint/jshint.js",
            "esprima",
            "escodegen",
            "./external/structuredjs/",
            "./js/output/pjs/pjs-output.js"
        ],
        output_webpage: [
            "./external/html2canvas/html2canvas.js",
            "./external/structuredjs/structured.js",
            "./js/output/webpage/webpage-output.js"
        ],
        output_sql: [
            "./external/html2canvas/html2canvas.js",
            "./js/output/sql/sql-output.js"
        ],
        output: [
            "./js/output/shared/pooled-worker.js",
            "./js/output/shared/output-tester.js",
            "./js/output/shared/output.js"
        ],
        ui: [
            "./js/live-editor.js"
        ]
    },
    externals: [
        {
            // Needed for sql.js: emscripten uses the fs module
            //  in certain codepaths we don't use,
            //  so we fake its availability
            // See https://github.com/kripken/sql.js/issues/112
            fs: true,
            jquery: "jQuery",
            $: "jQuery",
            underscore: "_",
            "ace-builds": "ace",
            i18n: "i18n"
        }
    ],
    output: {
        path: path.resolve(__dirname, 'build/js'),
        filename: "live-editor.[name].js"
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|external)/,
            use: {
                loader: "babel-loader"
            }
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
         }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            Jed: "jed"
        }),
        new webpack.ProvidePlugin({
            Backbone: "backbone"
        }),
        new webpack.ProvidePlugin({
            _: "underscore"
        }),
        new CopyWebpackPlugin([
            // Copy worker files
            {from: 'js/workers/pjs/',
             to: path.resolve(__dirname, 'build/workers/pjs')},
            {from: 'js/output/pjs/pjs-tester.js',
             to: path.resolve(__dirname, 'build/workers/pjs')},
            {from: 'node_modules/ace-builds/src-noconflict/worker-html.js',
             to: path.resolve(__dirname, 'build/workers/webpage')},
            {from: 'js/output/shared/output-tester.js',
             to: path.resolve(__dirname, 'build/workers/shared')},
            {from: 'external/multirecorderjs/multirecorder-worker.js',
             to: path.resolve(__dirname, 'build/workers/shared')},
            // Copy images and sounds
            {from: 'images/',
             to: path.resolve(__dirname, 'build/images')},
            {from: 'sounds/',
             to: path.resolve(__dirname, 'build/sounds')}
        ])
    ]
};


module.exports = config;