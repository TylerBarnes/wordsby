const FormData = require("form-data");
const fs = require("fs");
const { spawn } = require("child_process");
const ProgressBar = require("progress");

const getConfig = require("./getConfig");

const uploadPreviews = async () => {
  const config = await getConfig();

  if (!config) return false;

  const { wpUrl, private_key } = config;

  const uploader_url = `${wpUrl}`;

  var form = new FormData();
  console.log(`Uploading preview files to ${wpUrl}`);

  form.append("apikey", private_key);
  form.append("gatsbypress_previews", "gatsbypress_previews");
  form.append("previews", fs.createReadStream("./templates-previews.zip"));

  let bar;
  // get upload size
  form.getLength(function(err, size) {
    if (size > 2000) {
      bar = new ProgressBar("[:bar] :rate/bps :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 40,
        total: parseInt(size, 10)
      });
    } else {
      bar = false;
    }
  });

  // let uploaded = 0;
  form.on("data", function(data) {
    if (bar) {
      bar.tick(data.length);
    }
  });

  form.submit(uploader_url, function(err, res) {
    if (res.statusCode !== 200) {
      console.error(
        "Preview Files not uploaded. Check your settings and logs. You might need to increase the post_max_size and upload_max_filesize on your server. Check the messages above to find the size of your preview zip."
      );
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
