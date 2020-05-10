const path = require("path");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = {
    entry: "./src/js/app.js",
    output: {
        path: path.resolve(__dirname, "static"),
        filename: "bundle.js",
        publicPath: "/static",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: {
                                        esmodules: true,
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].css",
                        },
                    },
                    {
                        loader: "sass-loader", // compiles Sass to CSS
                    },
                ],
            },
        ],
    },

    plugins: [
        new FileManagerPlugin({
            onEnd: [
                {
                    move: [
                        {
                            source: "./static/bundle.js",
                            destination: "./static/js/bundle.js",
                        },
                        {
                            source: "./static/main.css",
                            destination: "./static/css/main.css",
                        },
                    ],
                },
            ],
        }),
    ],
};
