const path = require('path');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-server.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'server.bundle.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [],
});
