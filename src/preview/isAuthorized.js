const FormData = require("form-data");
const fetch = require("node-fetch");
const getConfig = require("./getConfig");

const responseLogger = (response, localPreviewToken) => {
  if (response === "Wrong key..") {
    console.error(`${response}. 
Update your local previewToken in gatsby-config.js to match your WP install.
Or add this to your wp-config.php:
      define('WORDSBY_PRIVATE_KEY', '${localPreviewToken}');
    `);
  } else if (response === "WORDSBY_PRIVATE_KEY not defined") {
    console.error(`${response}. 
Add this to your wp-config.php:
      define('WORDSBY_PRIVATE_KEY', '${localPreviewToken}');
    `);
  } else {
    console.log(response);
  }
};

const isAuthorized = async () => {
  let config = false;
  try {
    config = await getConfig();
  } catch (e) {
    throw e;
  }

  if (!config) return;

  const { wordpressconfig, private_key } = config;

  console.log("Authorizing..");

  const wpUrl = `${wordpressconfig.protocol}://${wordpressconfig.baseUrl}`;

  const form = new FormData();
  form.append("gatsbypress_preview_keycheck", "true");
  form.append("apikey", private_key);

  try {
    let response = await fetch(wpUrl, {
      method: "POST",
      body: form
    });
    let data = await response.json();
    responseLogger(data, private_key);
    return data;
  } catch (e) {
    throw e;
  }
};

module.exports = isAuthorized;
