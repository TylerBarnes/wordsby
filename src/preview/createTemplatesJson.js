const fs = require("fs");
const path = require("path");

const createTemplatesJson = ({ existingTemplateFiles, templatesPath }) => {
  const trimmedPaths = existingTemplateFiles.map(fullPath =>
    fullPath.replace(templatesPath + "/", "").replace(/\.js|\.jsx/gi, "")
  );

  const templateJsonString = JSON.stringify(trimmedPaths);
  const filepath = path.resolve(`./public/templates.json`);
  const dir = "./public";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Save templates array to the public folder. to be consumed by WP for template switching and preview urls
  fs.writeFile(filepath, new Buffer(templateJsonString, "utf8"), err => {
    if (err) throw err;
  });
};

module.exports = createTemplatesJson;
