function shouldIgnorePath({ ignorePaths, pathname }) {
  if (!ignorePaths || !ignorePaths.length) return false;

  let match; 

  const shouldIgnore = ignorePaths.some(path => {
    match = new RegExp(path);
    return match.test(pathname);
  });

  return shouldIgnore;
}

module.exports = shouldIgnorePath;
