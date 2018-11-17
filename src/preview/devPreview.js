const { spawn } = require("child_process");
const readline = require("readline");

const devPreview = async () => {
  process.env["GATSBYPRESS_PREVIEW"] = true;
  const gatsbyDevelop = spawn("gatsby", ["develop"]);

  readline
    .createInterface({
      input: gatsbyDevelop.stdout,
      terminal: false
    })
    .on("line", function(line) {
      console.log(line);
    });

  readline
    .createInterface({
      input: gatsbyDevelop.stderr,
      terminal: false
    })
    .on("line", function(line) {
      console.log(line);
    });

  gatsbyDevelop.on("error", function(err) {
    console.log(err);
  });

  gatsbyDevelop.on("close", async code => {
    if (code !== 0) {
      console.log(
        `gatsbyDevelop process exited with code ${code}. There will be additional information above.`
      );
    }
    gatsbyDevelop.stdin.end();
  });
};

module.exports = devPreview;
