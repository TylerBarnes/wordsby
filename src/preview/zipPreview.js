var file_system = require("fs");
var archiver = require("archiver");
const pretty = require("prettysize");

const zipPreview = cb => {
  return new Promise((resolve, reject) => {
    console.log("zip started");
    var output = file_system.createWriteStream(`templates-previews.zip`);
    var archive = archiver("zip");

    output.on("close", function() {
      console.log(`preview zip is ${pretty(archive.pointer())}`);
      console.log("preview.zip created and ready to send to the wp install.");
      resolve();
    });

    archive.on("error", function(err) {
      reject(err);
    });

    archive.pipe(output);
    archive.directory("public/", false);
    archive.finalize();
  });
};

module.exports = zipPreview;
