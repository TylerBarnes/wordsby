const FormData = require("form-data");
const fetch = require("node-fetch");
const getConfig = require("./getConfig").default;

const isAuthorized = async () => {
  console.log("Authorizing..");

  const config = getConfig();

  const { wordpressconfig, private_key } = config;

  const wpUrl = `${wordpressconfig.protocol}://${wordpressconfig.baseUrl}`;

  const form = new FormData();
  form.append("apikey", private_key);
  form.append("gatsbypress_preview_keycheck", "true");

  let response = await fetch(wpUrl, { method: "POST", body: form });
  let data = await response.json();
  return data;
};

module.exports = isAuthorized;
