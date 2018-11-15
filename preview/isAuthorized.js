const FormData = require("form-data");

const isAuthorized = () => {
  console.log("Authorizing..");
  return true;
};

exports.default = isAuthorized;
