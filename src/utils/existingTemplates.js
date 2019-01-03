const path = require("path");
const glob = require("glob");

function existingTemplates() {
  const templatesPath = path.resolve(`./src/templates`);
  return glob.sync(`${templatesPath}/**/*.js`, {
    dot: true
  });
}

module.exports = existingTemplates;
