const FormData = require("form-data");
const fetch = require("node-fetch");
const getConfig = require("./getConfig");

const isAuthorized = async () => {
  console.log("Authorizing..");

  const config = await getConfig();
  const { wordpressconfig, private_key } = config;

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
    console.log("Success");
    return data;
  } catch (e) {
    throw e;
  }
};

module.exports = isAuthorized;
