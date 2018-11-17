#!/usr/bin/env node
require("@babel/polyfill");
const program = require("commander");
const isGatsby = require("./functions/isGatsby");
const generateAndUploadPreview = require("./preview/generateAndUploadPreview");

const wordsby = () => {
  if (!isGatsby()) return;

  program
    .option("preview", "Generate a preview and upload it to WP")
    .parse(process.argv);

  return program.preview ? generateAndUploadPreview() : program.help();
};

wordsby();
