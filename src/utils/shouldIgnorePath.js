function shouldIgnorePath({ ignorePaths, pathname }) {
  if (!ignorePaths || !ignorePaths.length) return false;

  const shouldIgnore = ignorePaths.some(path => {
    const match = new RegExp(path);
    return match.test(pathname);
  });

  return shouldIgnore;
}

module.exports = shouldIgnorePath;
