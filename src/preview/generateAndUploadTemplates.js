const createTemplatesJson = require("./createTemplatesJson");
const path = require("path");
const glob = require("glob");
const zipPreview = require("./zipPreview");
const uploadPreviews = require("./uploadPreviews");
const exec = require("child_process").exec;
const isAuthorized = require("./isAuthorized");

const generateAndUploadTemplates = async () => {
  let authorized = false;
  try {
    authorized = await isAuthorized();
  } catch (e) {
    throw e;
  }

  if (authorized !== "success") return;

  try {
    await new Promise((resolve, reject) => {
      exec("rm -rf " + path.resolve(`./public`), function(err) {
        // deleted public folder.
        if (err) reject(err);
        resolve("deleted public folder");
      });
    });
  } catch (err) {
    throw err;
  }
  const templatesPath = path.resolve(`./src/templates/`);
  let existingTemplateFiles = glob.sync(`${templatesPath}/**/*.js`, {
    dot: true
  });
  await createTemplatesJson({ existingTemplateFiles, templatesPath });
  try {
    await zipPreview();
  } catch (error) {
    throw error;
  }
  uploadPreviews();
};

module.exports = generateAndUploadTemplates;
