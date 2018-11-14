const FormData = require("form-data");
const fs = require("fs");
const importCwd = require("import-cwd");
const generatePassword = require("password-generator");
const { spawn } = require("child_process");
const ProgressBar = require("progress");

const uploadPreviews = () => {
  const config = importCwd("./gatsby-config");
  const wordpressconfig = config.plugins.filter(
    plugin => plugin.resolve === "gatsby-source-wordpress"
  )[0].options;
  const gatsbypressconfig = config.plugins.filter(
    plugin => plugin.resolve === "wordsby"
  )[0].options;

  if (!wordpressconfig) {
    throw Error(
      `It looks like gatsby-source-wordpress is not installed or configured properly. This starter requires it to be added to gatsby-config.js before gatsby-transformer-gatsbypress.`
    );
  }

  const private_key = gatsbypressconfig.previewToken;

  if (!gatsbypressconfig || !private_key) {
    throw Error(`You need to add a previewToken to your gatsby-transformer-gatsbypress options. Try this:
      {
        resolve: "gatsby-transformer-gatsbypress",
        options: {
          previewToken: "${generatePassword(56, false)}"
        }
      }
    `);
  }

  const wpUrl = `${wordpressconfig.protocol}://${wordpressconfig.baseUrl}`;

  const uploader_url = `${wpUrl}`;

  var form = new FormData();
  console.log(`Uploading preview files to ${wpUrl}`);

  form.append("apikey", private_key);
  form.append("gatsbypress_previews", "gatsbypress_previews");
  form.append("previews", fs.createReadStream("./templates-previews.zip"));

  let uploadSize = 0;
  let bar;
  // get upload size
  form.getLength(function(err, size) {
    uploadSize = parseInt(size, 10);
    bar = new ProgressBar("[:bar] :rate/bps :percent :etas", {
      complete: "=",
      incomplete: " ",
      width: 40,
      total: uploadSize
    });
  });

  // let uploaded = 0;
  form.on("data", function(data) {
    // uploaded += data.length;
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

exports.default = uploadPreviews;
