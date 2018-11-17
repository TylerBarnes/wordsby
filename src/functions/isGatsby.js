const fs = require("fs");

const isGatsby = () => {
  const currentDirFiles = fs.readdirSync(process.cwd()).filter(file => {
    return ["src", "gatsby-config.js"].includes(file);
  }).length;

  if (currentDirFiles !== 2) {
    console.log(
      "Looks like you ran this command in a non gatsby site directory."
    );
    return false;
  } else {
    return true;
  }
};

module.exports = isGatsby;
