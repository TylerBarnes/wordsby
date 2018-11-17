const { spawn } = require("child_process");
const zipPreview = require("./zipPreview");
const uploadPreviews = require("./uploadPreviews");
const isAuthorized = require("./isAuthorized");
const readline = require("readline");

const generateAndUploadPreview = async () => {
  const authorized = await isAuthorized();
  console.log(authorized);
  if (authorized !== "success") return;

  console.log("Generating preview site");
  process.env["GATSBYPRESS_PREVIEW"] = true;
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
      uploadPreviews();
    }
    gatsbyBuild.stdin.end();
  });
};

module.exports = generateAndUploadPreview;
