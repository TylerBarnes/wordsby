
exports.sourceNodes = require("./sourceNodes");
exports.createPages = require("./createPages");

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-transform-regenerator`
  });
};