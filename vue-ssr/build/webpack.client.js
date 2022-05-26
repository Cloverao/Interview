const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base');

module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-client.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'client.bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.ssr.html',
      template: path.resolve(__dirname, '../dist/index.ssr.html'),
      excludeChunks: ['server'],
      minify: {
        removeComments: false,
      },
    }),
  ],
});
