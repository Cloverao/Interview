//引入webpack和配置信息
const webpack = require("webpack");
const config = require("./webpack.config");
//调用webpack方法，传入配置信息

const compiler = webpack(config);
//调用compiler.run方法
compiler.run((err, stats) => {
  console.log(11111);
});
