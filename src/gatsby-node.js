
exports.sourceNodes = require("./sourceNodes");
exports.createPagesStatefully = require("./createPages");

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: `@babel/plugin-transform-regenerator`
  });
};