// this function removes wordpress iamge sizes from a string
function removeImageSizes(urlpath) {
  const imageSizesPattern = new RegExp("(?:[-_][0-9]+x[0-9]+)");
  const urlpath_remove_sizes = urlpath.replace(imageSizesPattern, "");

  return urlpath_remove_sizes;
}

export default removeImageSizes;
