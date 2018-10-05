const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    entry: {
        output_pjs_deps: [
            "./external/processing-js/processing.js",
            "./external/jshint/jshint.js",
        ],
        output_webpage_deps: ["./external/html2canvas/html2canvas.js"],
        output_sql_deps: ["./external/html2canvas/html2canvas.js"],
        // Used for demos
        demos_pjs_output: ["./demos/simple/output_pjs.js"],
        demos_webpage_output: ["./demos/simple/output_webpage.js"],
        demos_sql_output: ["./demos/simple/output_sql.js"],
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
    },
    externals: [
        {
            // Needed for sql.js: emscripten uses the fs module
            //  in certain codepaths we don't use,
            //  so we fake its availability
            // See https://github.com/kripken/sql.js/issues/112
            fs: true,
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
                exclude: /(node_modules|external|ast_transform_test\.js$)/,
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
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            // Copy images and sounds
            {
                from: "images/",
                to: path.resolve(__dirname, "build/images"),
            },
            {
                from: "sounds/",
                to: path.resolve(__dirname, "build/sounds"),
            }
        ]),
    ],
};

module.exports = config;