const FormData = require("form-data");
const fetch = require("node-fetch");

const isAuthorized = async () => {
  console.log("Authorizing..");

  const form = new FormData();
  form.append(
    "apikey",
    "803eaf96984d2fbb793746a4ab8dffc15896cf46b4ffb424d733c8374e520c9c"
  );
  form.append("gatsbypress_preview_keycheck", "true");

  let response = await fetch("https://temperance.online", {
    method: "POST",
    body: form
  });
  let data = await response.json();
  return data;
};

module.exports = isAuthorized;
