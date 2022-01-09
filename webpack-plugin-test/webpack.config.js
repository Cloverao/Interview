const HtmlWebpackPlugin = require("html-webpack-plugin");

const MyPlugin = require("./plugin");
var path = require("path");

module.exports = {
  entry: "./main.js",
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "bundle.js",
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: "./index.html",
    //   filename: "index.html",
    //   minify: false,
    // }),
    new MyPlugin({
      path: path.resolve(__dirname, "../../../"),
    }),
  ],
};
