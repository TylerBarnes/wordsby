const importCwd = require("import-cwd");
const generatePassword = require("password-generator");

const getConfig = () => {
  const config = importCwd("./gatsby-config");
  if (!config) return false;

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

  if (wordpressconfig && gatsbypressconfig && private_key) {
    return {
      wordpressconfig,
      private_key
    };
  } else {
    return false;
  }
};

module.exports = getConfig;
