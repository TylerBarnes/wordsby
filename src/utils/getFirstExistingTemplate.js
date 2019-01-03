const path = require("path");
const existingTemplates = require("./existingTemplates");
const templatesPath = path.resolve(`./src/templates`);
const existingTemplateFiles = existingTemplates();

function getFirstExistingTemplate(desiredTemplates) {
  let existingTemplate = desiredTemplates.find(template => {
    return existingTemplateFiles.includes(`${templatesPath}/${template}.js`);
  });

  return existingTemplate ? `${templatesPath}/${existingTemplate}.js` : false;
}

module.exports = getFirstExistingTemplate;
