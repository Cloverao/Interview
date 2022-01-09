// const HtmlWebpackPlugin = require("html-webpack-plugin");
//引入node-fs模块
const fs = require("fs");
const path = require("path");
const filePath = path.resolve("./dist");
// const writePath = path.join(path.resolve(__dirname, "../../../", "dist"));
// path.resolve("../dist-" + new Date().getTime());

const pluginName = "MyPlugin";

class MyPlugin {
  //获取配置项-因为plugin是new出来的，可以直接在构造函数中获取
  constructor(options) {
    this.options = options;
    this.writePath = path.join(options.path, "dist");
  }
  apply(compiler) {
    compiler.hooks.compile.tap(pluginName, (params) => {
      console.log(this.options);
    });
    //在assets被输出时执行
    compiler.hooks.afterEmit.tap(pluginName, (compilation) => {
      // console.log(config);
      fs.readdir(filePath, (err, files) => {
        if (err) {
          return new Error("cannot resolve this path" + filePath);
        } else {
          fs.mkdir(this.writePath, {}, (err, directory) => {
            files.forEach((file) => {
              var filedir = path.join(filePath, file);
              fs.stat(filedir, (err, stats) => {
                if (!err) {
                  var isFile = stats.isFile();
                  let isFolder = stats.isDirectory();
                  if (isFile) {
                    fs.readFile(filedir, (err, fileData) => {
                      if (err) throw err;
                      // console.log(`${writePath}/${file}`);
                      fs.writeFile(
                        `${this.writePath}/${file}`,
                        fileData,
                        (err) => {
                          console.log("The file has been saved!");
                        }
                      );
                    });
                  }
                  if (isFolder) {
                    fs.mkdir(`${this.writePath}/${file}`, (err, directory) => {
                      console.log("The directory has been created!");
                    });
                  }
                }
              });
            });
          });
        }
      });
    });
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // console.log(compilation);
      //写一个插件-将打包输出的内容也同时输出到本地某个地方一份
      /**
       * 1.查看当前目录下是否有dist模块，有：遍历文件
       * 2.查看如果有删掉重新输出
       * 2.
       */
      debugger;
      // fs.readdirSync(filePath, (err, files) => {
      //   // console.log(err);
      //   if (err) {
      //     new Error("cannot resolve this path" + filePath);
      //   }
      // });
      // console.log(filePath);
      // HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
      //   pluginName,
      //   (data, cb) => {
      //     console.log(data);
      //     //具体处理
      //     data.html += "=_=";
      //     cb(null, data);
      //   }
      // );
    });
  }
}

module.exports = MyPlugin;
