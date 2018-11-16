const { spawn } = require("child_process");
const zipPreview = require("./zipPreview").default;
const uploadPreviews = require("./uploadPreviews").default;
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

  gatsbyBuild.on("close", async code => {
    console.log("Finished generating previews.");
    if (code !== 0) {
      console.log(`gatsbyBuild process exited with code ${code}`);
    } else {
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

exports.default = generateAndUploadPreview;
