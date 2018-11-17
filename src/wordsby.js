#!/usr/bin/env node
require("@babel/polyfill");
const program = require("commander");
const isGatsby = require("./functions/isGatsby");
const generateAndUploadPreview = require("./preview/generateAndUploadPreview");
const devPreview = require("./preview/devPreview");

const wordsby = () => {
  if (!isGatsby()) return;

  program
    .option("preview", "Generate a preview and upload it to WP")
    .option("test", "Start gatsby develop in preview mode.")
    .parse(process.argv);

  if (program.test) {
    return devPreview();
  } else if (program.preview) {
    return generateAndUploadPreview();
  } else {
    return program.help();
  }
};

wordsby();
