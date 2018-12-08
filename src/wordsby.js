#!/usr/bin/env node
require("@babel/polyfill");
const program = require("commander");
const isGatsby = require("./functions/isGatsby");
const generateAndUploadPreview = require("./preview/generateAndUploadPreview");
const devPreview = require("./preview/devPreview");
const createTemplatesJson = require("./preview/createTemplatesJson");
const path = require("path");
const glob = require("glob");
const zipPreview = require("./preview/zipPreview");
const uploadPreviews = require("./preview/uploadPreviews");
const exec = require("child_process").exec;

const wordsby = async () => {
  if (!isGatsby()) return;

  program
    .option("preview", "Generate a preview and upload it to WP")
    .option("test", "Start gatsby develop in preview mode.")
    .option("templates", "Send templates to the WP template picker.")
    .parse(process.argv);

  if (program.test) {
    return devPreview();
  } else if (program.preview) {
    return generateAndUploadPreview();
  } else if (program.templates) {
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
  } else {
    return program.help();
  }
};

wordsby();
