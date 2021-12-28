// const t = require("");
const fs = require("fs");
const types = require("@babel/types");
module.exports = () => {
  return {
    visitor: {
      // Identifier(path) {
      //   fs.writeFileSync("context.json", JSON.stringify(path.node));
      //   console.log(path.node);
      //   hasLeadingComments(path.node);
      // },

      //通过visitor设计模式来实现的
      //访问标识符遍历树，本质是修改ast树
      CallExpression(path) {
        // fs.writeFileSync("context.json", JSON.stringify(context));
        const { callee } = path.node;
        const isConsoleLog =
          types.isMemberExpression(callee) &&
          callee.object.name === "console" &&
          callee.property.name === "log";
        if (isConsoleLog) {
          path.remove();
        }
      },
      //表达式
      MemberExpression(path, state) {},

      Statement(path) {
        const type = path.node.type;

        //直接删除的是一个声明语句
        if (type === "DebuggerStatement") {
          path.remove();
        }
      },
      FunctionDeclaration(path) {
        // console.log(path.node.leadingComments);
        // console.log(path.node);
        // path.node.leadingComments.value = ""

        // path.replaceWith(
        types.removeComments(path.node);
        //   types.removeComments.binaryExpression("**", path.node.left, t.numberLiteral(2))
        // );
      },
      // LeadingComments(path) {
      //   console.log(path);
      // },
      // CommentLine(path) {
      //   console.log(path);
      // },
    },
  };
};
