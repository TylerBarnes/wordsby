exports.onCreateNode = require("./onCreateNode");
exports.createPages = require("./createPages");

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-transform-regenerator`
  });
};
