const importCwd = require("import-cwd");
const generatePassword = require("password-generator");
const passwordValidator = require("password-validator");

const generatePreviewTokenConfig = () => `
      {
        resolve: "wordsby",
        options: {
          previewToken: "${generatePassword(56, false)}"
        }
      }`;
const getConfig = () => {
  return new Promise((resolve, reject) => {
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
        `It looks like gatsby-source-wordpress is not installed or configured properly. This starter requires it to be added to gatsby-config.js before wordsby.`
      );
    }

    const private_key = gatsbypressconfig.previewToken;

    if (!gatsbypressconfig || !private_key) {
      throw Error(`You need to add a previewToken to your wordsby options. Try this:
      ${generatePreviewTokenConfig()}
    `);
    } else if (private_key) {
      const schema = new passwordValidator();
      schema
        .is()
        .min(15) // Minimum length 8
        .has()
        .uppercase() // Must have uppercase letters
        .has()
        .lowercase() // Must have lowercase letters
        .has()
        .digits() // Must have digits
        .has()
        .not()
        .spaces(); // Should not have spaces

      const validate_key = schema.validate(private_key);

      if (!validate_key) {
        reject(`Your previewToken is too weak. Try this:
          ${generatePreviewTokenConfig()}
        `);
      }
    }

    if (wordpressconfig && gatsbypressconfig && private_key) {
      resolve({
        wordpressconfig,
        private_key
      });
    } else {
      reject(`Your configuration is incorrect.`);
    }
  }).catch(e => {
    console.error(e);
  });
};

module.exports = getConfig;
