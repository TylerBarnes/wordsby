#!/usr/bin/env node
require("@babel/polyfill");
const program = require("commander");
const isGatsby = require("./functions/isGatsby");
const generateAndUploadPreview = require("./preview/generateAndUploadPreview");
const generateAndUploadTemplates = require("./preview/generateAndUploadTemplates");
const devPreview = require("./preview/devPreview");

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
    return generateAndUploadTemplates();
  } else {
    return program.help();
  }
};

wordsby();
