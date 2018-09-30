const path = require("path");

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = {
    entry: {
        test_worker: ["./js/workers/pjs/test-worker.js"],
        jshint_worker: ["./js/workers/pjs/jshint-worker.js"],
    },
    output: {
        path: path.resolve(__dirname, "build/workers/"),
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
                exclude: /(node_modules|external|tests|\.(test)\.(js|jsx)$)/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
};

module.exports = config;