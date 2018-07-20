const path = require('path');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
    performance: { hints: false },
    entry: {
        core_deps: [
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
        shared: [
            "./js/shared/all-images.js",
            "./js/shared/images.js",
            "./js/shared/sounds.js",
            "./js/shared/config.js"
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
        // Debugger related: not currently enabled
        debugger: [
            "./node_modules/iframe-overlay/dist/iframe-overlay.js",
            "./js/ui/debugger.js"
        ],
        output_debugger: [
            "./node_modules/iframe-overlay/dist/iframe-overlay.js",
            "./external/debugger/build/debugger.js",
            "./external/debugger/build/processing-debugger.js",
            "./js/output/pjs/pjs-debugger.js"
        ],
        test_worker: [
            "./js/workers/pjs/test-worker.js"
        ],
        jshint_worker: [
            "./js/workers/pjs/jshint-worker.js"
        ],
        // Used for testing:
        loop_protector: [
            "./js/output/shared/loop-protect.global.js"
        ],
        mocha: [
            "./external/processing-js/processing.js",
            "./js/shared/config.test.js",
            "./js/output/shared/loop-protect.test.js",
            "./js/output/pjs/pjs-code-injector.test.js"
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
            lodash: "_",
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
         },
         {
            test: /test\.js$/,
            use: 'mocha-loader',
            exclude: /node_modules/,
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
            // Copy worker files (TODO: investigate if still needed)
            {from: 'node_modules/ace-builds/src-noconflict/worker-html.js',
             to: path.resolve(__dirname, 'build/workers/webpage')},
            {from: 'external/multirecorderjs/multirecorder-worker.js',
             to: path.resolve(__dirname, 'build/workers/shared')},
            // Used by flash fallback (TODO: investigate if still needed)
            {from: 'nnode_modules/soundmanager/swf/**',
             to: path.resolve(__dirname, 'build/external/SoundManager2')},
            // Copy images and sounds
            {from: 'images/',
             to: path.resolve(__dirname, 'build/images')},
            {from: 'sounds/',
             to: path.resolve(__dirname, 'build/sounds')},
            // Copy CSS files which have url()s
            // (Other CSS files are included via imports via style-loader)
            // TODO: Move CSS into Aphrodite and/or import images better
            {from: 'css/ui/tooltips.css',
            to: path.resolve(__dirname, 'build/css/live-editor.tooltips.css')},
            {from: 'css/ui/style.css',
            to: path.resolve(__dirname, 'build/css/live-editor.ui.css')}
        ])
    ]
};


module.exports = config;