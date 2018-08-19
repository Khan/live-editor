const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    performance: {hints: false},
    entry: {
        i18n: ["./js/shared/i18n.js"],
        editor_ace_deps: [
            "./node_modules/ace-builds/src-noconflict/ace.js",
            "./node_modules/ace-builds/src-noconflict/mode-javascript.js",
            "./node_modules/ace-builds/src-noconflict/mode-html.js",
            "./node_modules/ace-builds/src-noconflict/ext-static_highlight.js",
            "./node_modules/ace-builds/src-noconflict/mode-sql.js",
            "./node_modules/ace-builds/src-noconflict/ext-searchbox.js",
            "./node_modules/ace-builds/src-noconflict/ext-language_tools.js",
        ],
        audio: ["./node_modules/soundmanager2/script/soundmanager2.js"],
        output_pjs_deps: [
            "./external/processing-js/processing.js",
            "./external/jshint/jshint.js",
        ],
        output_webpage_deps: ["./external/html2canvas/html2canvas.js"],
        output_sql_deps: ["./external/html2canvas/html2canvas.js"],
        test_worker: [
            "./js/workers/pjs/underscore-exposed.js",
            "./js/workers/pjs/test-worker.js",
        ],
        jshint_worker: ["./js/workers/pjs/jshint-worker.js"],
        // Used for demos
        demos_pjs: ["./demos/simple/pjs.js"],
        demos_pjs_output: ["./demos/simple/pjs_output.js"],
        demos_webpage: ["./demos/simple/webpage.js"],
        demos_webpage_output: ["./demos/simple/webpage_output.js"],
        demos_sql: ["./demos/simple/sql.js"],
        demos_sql_output: ["./demos/simple/sql_output.js"],
        demos_document: ["./demos/simple/document.js"],
        audio_demo: ["./demos/simple/audio.js"],
        // Used for testing:
        live_editor: ["./js/live-editor.global.js"],
        loop_protector: ["./js/output/shared/loop-protect.global.js"],
        tests_output_pjs_output: ["./tests/output/pjs/output_test.js"],
        tests_output_pjs_assert: ["./tests/output/pjs/assert_test.js"],
        tests_output_pjs_async: ["./tests/output/pjs/async_test.js"],
        tests_output_pjs_jshint: ["./tests/output/pjs/jshint_test.js"],
        tests_output_webpage_assert: ["./tests/output/webpage/assert_test.js"],
        tests_output_webpage_output: ["./tests/output/webpage/output_test.js"],
        tests_output_sql_assert: ["./tests/output/sql/assert_test.js"],
        tests_output_sql_output: ["./tests/output/sql/output_test.js"],
        tests_tooltips: [
            "./tests/tooltips/colorPicker_test.js",
            "./tests/tooltips/imagePicker_test.js",
            "./tests/tooltips/soundModal_test.js",
            "./tests/tooltips/tooltips_test.js",
        ],
        tests_modules: [
            "./js/shared/config.test.js",
            "./js/output/shared/loop-protect.test.js",
            "./js/output/pjs/pjs-code-injector.test.js",
            "./js/output/webpage/webpage-tester.test.js",
            "./js/ui/tooltips/color-picker.test.js",
            "./js/ui/tooltips/number-scrubber.test.js",
            "./js/ui/tooltips/image-picker.test.js",
            "./js/ui/tooltips/image-modal.test.js",
            "./js/ui/tooltips/sound-modal.test.js",
        ],
    },
    externals: [
        {
            // Needed for sql.js: emscripten uses the fs module
            //  in certain codepaths we don't use,
            //  so we fake its availability
            // See https://github.com/kripken/sql.js/issues/112
            fs: true,
            // Separated into their own build files (Subject to change!)
            i18n: "i18n",
            "ace-builds": "ace",
            // Bundling this results in an asm error
            "sql.js": "SQL",
        },
    ],
    output: {
        path: path.resolve(__dirname, "build/js"),
        filename: "live-editor.[name].js",
    },
    optimization: {
        minimize: false,
    },
    node: {process: true},
    mode: "development",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|external|tests|\.(test)\.(js|jsx)$)/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: require.resolve("underscore"),
                use: [
                    {
                        loader: "expose-loader",
                        options: "_",
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            // Copy worker files
            {
                from: "node_modules/ace-builds/src-noconflict/worker-html.js",
                to: path.resolve(__dirname, "build/workers/webpage"),
            },
            {
                from: "external/multirecorderjs/multirecorder-worker.js",
                to: path.resolve(__dirname, "build/workers/shared"),
            },
            {
                from: "external/jshint/jshint.js",
                to: path.resolve(__dirname, "build/external/jshint"),
            },
            {
                from: "external/structuredjs/structured.js",
                to: path.resolve(__dirname, "build/external/structuredjs"),
            },
            {
                from: "external/structuredjs/external/esprima.js",
                to: path.resolve(
                    __dirname,
                    "build/external/structuredjs/external",
                ),
            },
            {
                from: "js/output/shared/output-tester.js",
                to: path.resolve(__dirname, "build/workers/shared"),
            },
            {
                from: "js/output/pjs/pjs-tester.js",
                to: path.resolve(__dirname, "build/workers/shared"),
            },
            {
                from: "js/output/pjs/pjs-tester.js",
                to: path.resolve(__dirname, "build/workers/pjs"),
            },
            {
                from: "js/workers/pjs/jshint-worker.js",
                to: path.resolve(__dirname, "build/workers/pjs"),
            },
            {
                from: "js/workers/pjs/test-worker.js",
                to: path.resolve(__dirname, "build/workers/pjs"),
            },
            // Used by flash fallback (TODO: investigate if still needed)
            {
                from: "node_modules/soundmanager2/swf/",
                to: path.resolve(__dirname, "build/external/SoundManager2/swf"),
            },
            // Copy images and sounds
            {
                from: "images/",
                to: path.resolve(__dirname, "build/images"),
            },
            {
                from: "sounds/",
                to: path.resolve(__dirname, "build/sounds"),
            },
            // Copy CSS files which have url()s
            // (Other CSS files are included via imports via style-loader)
            // TODO: Move CSS into Aphrodite and/or import images better
            {
                from: "css/ui/style.css",
                to: path.resolve(__dirname, "build/css/live-editor.ui.css"),
            },
        ]),
    ],
};

module.exports = config;
