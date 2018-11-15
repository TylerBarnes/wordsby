#!/usr/bin/env node
const program = require("commander");
const isGatsby = require("./functions/isGatsby").default;
const generateAndUploadPreview = require("./preview/generateAndUploadPreview")
  .default;

if (!isGatsby()) return;

program
  .option("-p, --preview", "Generate a preview and upload it to WP")
  .parse(process.argv);

return !program.preview ? program.help() : generateAndUploadPreview();
// if (!program.preview) {
//   return program.help();
// } else {
//   return generateAndUploadPreview();
// }
