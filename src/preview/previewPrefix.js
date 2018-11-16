const previewPrefix = (prefix = "/") => {
  const preview = process.env.GATSBYPRESS_PREVIEW;

  return preview ? "/preview" : prefix;
};

module.exports = previewPrefix;
