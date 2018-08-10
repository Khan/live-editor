const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    performance: {hints: false},
    entry: {
        live_editor: ["./js/live-editor.js"],
        editor_textarea: ["./js/editors/textarea/editor-textarea.js"],
        editor_ace: ["./js/editors/ace/editor-ace.js"],
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
        output_with_pjs: ["./js/output/output-with-pjs.js"],
        output_pjs_deps: [
            "./external/processing-js/processing.js",
            "./external/jshint/jshint.js",
        ],
        output_webpage: ["./js/output/webpage/webpage-output.js"],
        output_webpage_deps: ["./external/html2canvas/html2canvas.js"],
        output_sql: ["./js/output/sql/sql-output.js"],
        sqljs_only: ["./node_modules/sql.js/js/sql.js"],
        output_sql_deps: ["./external/html2canvas/html2canvas.js"],
        test_worker: ["./js/workers/pjs/test-worker.js"],
        jshint_worker: ["./js/workers/pjs/jshint-worker.js"],
    },
    externals: [
        {
            // Needed for sql.js: emscripten uses the fs module
            //  in certain codepaths we don't use,
            //  so we fake its availability
            // See https://github.com/kripken/sql.js/issues/112
            fs: true,
            // All of these are provided by Khan's internal repo,
            // so we treat them as externals in this repo.
            lodash: "underscore",
            i18n: "i18n",
            react: "react",
            "react-dom": "react-dom",
            "aphrodite/no-important": "aphrodite",
            // Separated into their own build files (Subject to change!)
            "ace-builds": "ace",
            "sql.js": "SQL",
        },
    ],
    output: {
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, "build/js"),
        filename: "webapp.[name].js",
    },
    optimization: {
        minimize: false,
    },
    node: {process: false},
    mode: "production",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|external)/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};

module.exports = config;
