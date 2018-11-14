#!/usr/bin/env node
const fs = require("fs");
const program = require("commander");
const { spawn } = require("child_process");
const zipPreview = require("./preview/zipPreview").default;
const uploadPreviews = require("./preview/uploadPreviews").default;
const importCwd = require("import-cwd");

const currentDirFiles = fs.readdirSync(process.cwd()).filter(file => {
  return ["src", "gatsby-config.js"].includes(file);
}).length;

if (currentDirFiles !== 2) {
  console.log(
    "Looks like you ran this command in a non gatsby site directory."
  );
  return;
}

program
  .option("-p, --preview", "Generate a preview and upload it to WP")
  .option("-t, --test", "Just testing!")
  .parse(process.argv);

if (!program.preview && !program.test) return program.help();

if (program.preview) {
  console.log("Generating preview site");

  const generateAndUploadPreview = async () => {
    process.env["GATSBYPRESS_PREVIEW"] = true;
    const gatsbyBuild = spawn("gatsby", ["build", "--prefix-paths"]);

    gatsbyBuild.stdout.on("data", chunk => {
      console.log(chunk.toString());
    });

    gatsbyBuild.on("close", code => {
      console.log("Finished generating previews.");
      if (code !== 0) {
        console.log(`gatsbyBuild process exited with code ${code}`);
      }
      gatsbyBuild.stdin.end();

      zipPreview(() => uploadPreviews());
    });
  };

  generateAndUploadPreview();
}

if (program.test) {
  console.log(importCwd("./gatsby-config.js"));
}
