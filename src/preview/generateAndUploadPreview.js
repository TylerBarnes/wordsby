const { spawn, exec } = require("child_process");
const zipPreview = require("./zipPreview");
const uploadPreviews = require("./uploadPreviews");
const isAuthorized = require("./isAuthorized");
const readline = require("readline");

const generateAndUploadPreview = async ({ skipUpload = false }) => {
  if (!skipUpload) {
    let authorized = false;
    try {
      authorized = await isAuthorized();
    } catch (e) {
      throw e;
    }
    if (authorized !== "success") return;
  }

  const publicPath = `${process.cwd()}/public`;
  // const cachePath = `${process.cwd()}/.cache`;
  const rm = exec(`rm -r ${publicPath}`, (err, stdout, stderr) => {
    if (!!err) {
      throw `rimraf process exited with error ${err}`;
    } else {
      console.log("Deleted public/ directory to build preview");
    }
    rm.stdin.end();
  });

  console.log("Generating preview build");
  process.env["WORDSBY_PREVIEW"] = true;
  const gatsbyBuild = spawn("gatsby", ["build", "--prefix-paths"]);

  readline
    .createInterface({
      input: gatsbyBuild.stdout,
      terminal: false
    })
    .on("line", function(line) {
      console.log(line);
    });

  readline
    .createInterface({
      input: gatsbyBuild.stderr,
      terminal: false
    })
    .on("line", function(line) {
      console.log(line);
    });

  gatsbyBuild.on("error", function(err) {
    console.log(err);
  });

  gatsbyBuild.on("close", async code => {
    if (code !== 0) {
      console.log(
        `gatsbyBuild process exited with code ${code}. There will be additional information above.`
      );
    } else {
      console.log("Finished generating previews.");

      try {
        await zipPreview();
      } catch (error) {
        throw error;
      }

      if (!skipUpload) {
        uploadPreviews();
      } else {
        console.log("Preview zip generated");
      }
    }
    gatsbyBuild.stdin.end();
  });
};

module.exports = generateAndUploadPreview;
