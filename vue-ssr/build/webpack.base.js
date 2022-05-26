const path = require('path');
//使用vueloader需要引入vueloaderplugin
const { VueLoaderPlugin } = require('vue-loader');
module.exports = {
  mode: 'production',
  //不配置entry信息，entry信息在不同的配置文件中来加载
  // output: {
  //   filename: '[name].bundle.js',
  //   path: path.resolve(__dirname, '../dist'),
  // },

  //解析js和vue文件，安装vue-loader
  resolve: {
    extensions: ['.js', '.vue'],
  },
  //解析vue文件，配置loader
  module: {
    rules: [
      // ... 其它规则
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // 它会应用到普通的 `.js` 文件
      // 以及 `.vue` 文件中的 `<script>` 块
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
