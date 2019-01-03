const path = require("path");

function getFirstExistingTemplate(desiredTemplates) {
  const existingTemplates = require("./existingTemplates");
  const templatesPath = path.resolve(`./src/templates`);

  const existingTemplateFiles = existingTemplates();

  let existingTemplate = desiredTemplates.find(template => {
    const templatePath = `${templatesPath}/${template}.js`;

    return existingTemplateFiles.includes(templatePath);
  });

  return `${templatesPath}/${existingTemplate}.js`;
}

module.exports = getFirstExistingTemplate;
