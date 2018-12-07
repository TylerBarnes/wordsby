const previewPrefix = (prefix = "/") => {
  const preview = process.env.WORDSBY_PREVIEW;

  return preview ? "/preview" : prefix;
};

module.exports = previewPrefix;
