const { transformSync } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const path = require("path");
// console.log(path.join(__dirname));

//parseSync第一个参数code，类型必须为string类型
let code = `
let a = 1;
debugger;
//这些代码可以删除
function hello(v) {
  console.log("hello " + v + " !");
  return "hello" + v;
}
let hell = hello("piao.huang");
`;

//babel-config
const babelConfig = {
  plugins: ["./plugins/babel-plugin-myPlugin"],
};
const ast = transformSync(code, babelConfig);
//打印出使用插件转换完的代码
console.log(ast.code);

// let depth = 0;
// traverse(ast, {
//   enter(path) {
//     //在这里卖弄可以处理无用信息
//     depth++;
//   },
//   exit(path) {
//     depth--;
//   },
// });
// console.log(ast.program);
