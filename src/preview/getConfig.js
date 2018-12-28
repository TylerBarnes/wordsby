const importCwd = require("import-cwd");
const generatePassword = require("password-generator");
const passwordValidator = require("password-validator");

const generatePreviewTokenConfig = () => `
      {
        resolve: "gatsby-plugin-wordsby",
        options: {
          previewToken: "${generatePassword(56, false)}"
        }
      }`;

const getConfig = () => {
  return new Promise((resolve, reject) => {
    const config = importCwd("./gatsby-config");
    if (!config) return false;

    const gatsbypressconfig = config.plugins.filter(
      plugin => plugin.resolve === "gatsby-plugin-wordsby"
    )[0];

    let wpUrl = false;
    if (gatsbypressconfig.options && gatsbypressconfig.options.siteUrl) {
      wpUrl = gatsbypressconfig.options.siteUrl;
    }

    if (!wpUrl) {
      throw Error(
        `You'll need to add a siteUrl option to your wordsby options. 
        {
          resolve: 'gatsby-plugin-wordsby',
          options: {
            siteUrl: [enter your WP url here],
          },
        },
        `
      );
    }

    const private_key = gatsbypressconfig.options.previewToken;

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

    if (wpUrl && gatsbypressconfig && private_key) {
      resolve({
        wpUrl,
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
