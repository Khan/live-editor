const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    entry: {
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
        // Used for demos
        demos_pjs: ["./demos/simple/pjs.js"],
        demos_pjs_output: ["./demos/simple/output_pjs.js"],
        demos_webpage: ["./demos/simple/webpage.js"],
        demos_webpage_output: ["./demos/simple/output_webpage.js"],
        demos_sql: ["./demos/simple/sql.js"],
        demos_sql_output: ["./demos/simple/output_sql.js"],
        demos_document: ["./demos/simple/document.js"],
        demos_audio: ["./demos/simple/audio.js"],
        // Used for testing:
        tests_output_pjs_assert: ["./tests/output/pjs/assert_test.js"],
        tests_output_pjs_async: ["./tests/output/pjs/async_test.js"],
        tests_output_pjs_jshint: ["./tests/output/pjs/jshint_test.js"],
        tests_output_pjs_output: ["./tests/output/pjs/output_test.js"],
        tests_output_pjs_ast_transform: ["./tests/output/pjs/ast_transform_test.js"],
        tests_output_webpage_assert: ["./tests/output/webpage/assert_test.js"],
        tests_output_webpage_output: ["./tests/output/webpage/output_test.js"],
        tests_output_webpage_transform: ["./tests/output/webpage/transform_test.js"],
        tests_output_sql_assert: ["./tests/output/sql/assert_test.js"],
        tests_output_sql_output: ["./tests/output/sql/output_test.js"],
        tests_tooltips: [
            "./tests/tooltips/numberScrubber_test.js",
            "./tests/tooltips/colorPicker_test.js",
            "./tests/tooltips/imagePicker_test.js",
            "./tests/tooltips/imageModal_test.js",
            "./tests/tooltips/soundModal_test.js",
            "./tests/tooltips/tooltips_test.js",
        ]
    },
    externals: [
        {
            // Needed for sql.js: emscripten uses the fs module
            //  in certain codepaths we don't use,
            //  so we fake its availability
            // See https://github.com/kripken/sql.js/issues/112
            fs: true,
            // Separated into its own build file
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
                test: /\.js$/,
                // Don't transform tests that rely on exact JS syntax
                exclude: /(node_modules|external|async_test\.js$|ast_transform_test\.js$|output_test\.js$)/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.handlebars$/,
                loader: "handlebars-loader",
                options: {
                    helperDirs: [
                        path.resolve(__dirname, "tmpl/helpers")
                    ]
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            // Needed for loading CSS files with url()s
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader:"file-loader",
                options:{
                  name:'[name].[ext]',
                  outputPath:'../../build/images/css/'
                }
            },
            // Needed for loading the Bootstrap font file with WOFF/SVGs
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery'",
            "window.$": "jquery"
        }),
        new CopyWebpackPlugin([
            // Copy images and sounds
            {
                from: "images/",
                to: path.resolve(__dirname, "build/images"),
            },
            {
                from: "sounds/",
                to: path.resolve(__dirname, "build/sounds"),
            },
        ]),
    ],
};

module.exports = config;