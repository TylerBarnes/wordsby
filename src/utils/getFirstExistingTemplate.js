const path = require("path");
const existingTemplates = require("./existingTemplates");
const templatesPath = path.resolve(`./src/templates`).replace(/\\/g, '/');
const existingTemplateFiles = existingTemplates();

function getFirstExistingTemplate(desiredTemplates) {
  let existingTemplate = desiredTemplates.find(template => {
    // console.log(`${templatesPath}/${template}.js`);
    return existingTemplateFiles.includes(`${templatesPath}/${template}.js`);
  });

  // console.log(`desired templates ${desiredTemplates}`)
  // console.log(`existing template ${existingTemplate}`)

  return existingTemplate ? `${templatesPath}/${existingTemplate}.js` : false;
}

module.exports = getFirstExistingTemplate;
