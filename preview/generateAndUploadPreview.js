const { spawn } = require("child_process");
const zipPreview = require("./zipPreview").default;
const uploadPreviews = require("./uploadPreviews").default;
const isAuthorized = require("./isAuthorized").default;
const readline = require("readline");

const generateAndUploadPreview = () => {
  if (!isAuthorized()) return false;

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

  gatsbyBuild.on("close", code => {
    console.log("Finished generating previews.");
    if (code !== 0) {
      console.log(`gatsbyBuild process exited with code ${code}`);
    }
    gatsbyBuild.stdin.end();

    zipPreview(() => uploadPreviews());
  });
};

exports.default = generateAndUploadPreview;
