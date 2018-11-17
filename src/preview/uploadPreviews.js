const FormData = require("form-data");
const fs = require("fs");
const { spawn } = require("child_process");
const ProgressBar = require("progress");

const getConfig = require("./getConfig");

const uploadPreviews = async () => {
  const config = await getConfig();

  if (!config) return false;

  const { wordpressconfig, private_key } = config;

  const wpUrl = `${wordpressconfig.protocol}://${wordpressconfig.baseUrl}`;

  const uploader_url = `${wpUrl}`;

  var form = new FormData();
  console.log(`Uploading preview files to ${wpUrl}`);

  form.append("apikey", private_key);
  form.append("gatsbypress_previews", "gatsbypress_previews");
  form.append("previews", fs.createReadStream("./templates-previews.zip"));

  let bar;
  // get upload size
  form.getLength(function(err, size) {
    bar = new ProgressBar("[:bar] :rate/bps :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 40,
      total: parseInt(size, 10)
    });
  });

  // let uploaded = 0;
  form.on("data", function(data) {
    bar.tick(data.length);
  });

  form.submit(uploader_url, function(err, res) {
    if (res.statusCode !== 200) {
      console.error("Preview Files not uploaded. Check your settings.");
      console.error(res.statusCode);
      console.error(res.statusMessage);
    } else {
      console.log("Preview files uploaded successfully");
    }

    res.resume();

    const previewZipPath = `${process.cwd()}/templates-previews.zip`;
    const rm = spawn("rm", [previewZipPath]);
    console.log("Cleaning up.");

    rm.on("close", code => {
      console.log("All done!");
      if (code !== 0) {
        console.log(`rimraf process exited with code ${code}`);
      }
      rm.stdin.end();
    });
  });
};

module.exports = uploadPreviews;
