import "regenerator-runtime/runtime";

const crypto = require(`crypto`);
const _ = require(`lodash`);
const cheerio = require(`cheerio`);
const { fluid } = require(`gatsby-plugin-sharp`);
const path = require(`path`);

import removeImageSizes from "./utils/removeImageSizes";

const imageClass = `gatsby-resp-image-image`;
const imageWrapperClass = `gatsby-resp-image-wrapper`;
const imageBackgroundClass = `gatsby-resp-image-background-image`;

/**
 * Encrypts a String using md5 hash of hexadecimal digest.
 *
 * @param {any} str
 */
const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`);

const prepareACFChildNodes = (
  obj,
  parentId,
  entityId,
  topLevelIndex,
  type,
  children,
  childrenNodes
) => {
  // Replace any child arrays with pointers to nodes
  _.each(obj, (value, key) => {
    if (_.isArray(value) && value[0] && value[0].acf_fc_layout) {
      obj[`${key}___NODE`] = value.map(
        (v, indexItem) =>
          prepareACFChildNodes(
            v,
            `${entityId}_${indexItem}`,
            topLevelIndex,
            type + key,
            children,
            childrenNodes
          ).id
      );
      delete obj[key];
    }
  });

  const acfChildNode = {
    ...obj,
    id: entityId + topLevelIndex + type,
    parent: parentId,
    children: [],
    internal: { type, contentDigest: digest(JSON.stringify(obj)) }
  };

  children.push(acfChildNode.id);

  // We recursively handle children nodes first, so we need
  // to make sure parent nodes will be before their children.
  // So let's use unshift to put nodes in the beginning.
  childrenNodes.unshift(acfChildNode);

  return acfChildNode;
};

exports.createNodeFromEntity = async ({
  entity,
  id,
  type,
  createParentChildLink,
  createContentDigest,
  parentNode,
  createNode,
  getNodes,
  pluginOptions
}) => {
  // Create subnodes for ACF Flexible layouts
  // eslint-disable-line no-unused-vars
  let children = [];
  let childrenNodes = [];

  if (entity.acf) {
    _.each(entity.acf, (value, key) => {
      if (_.isArray(value) && value[0] && value[0].acf_fc_layout) {
        entity.acf[`${key}_${entity.type}___NODE`] = entity.acf[key].map(
          (f, i) => {
            const type = `WordPressAcf_${f.acf_fc_layout}`;
            delete f.acf_fc_layout;

            const acfChildNode = prepareACFChildNodes(
              f,
              id,
              id + i,
              key,
              type,
              children,
              childrenNodes
            );

            return acfChildNode.id;
          }
        );

        delete entity.acf[key];
      }
    });
  }

  let node = {
    ...entity,
    id,
    children,
    parent: parentNode.id,
    internal: {
      type,
      contentDigest: createContentDigest(entity)
    }
  };

  // normalizers:
  // replace wordpress images with gatsby images
  await replaceInlineImageTagsWithFluidImages(node, getNodes, pluginOptions);

  createNode(node);
  createParentChildLink({ parent: parentNode, child: node });
  childrenNodes.forEach(node => {
    createNode(node);
  });
};

const replaceInlineImageTagsWithFluidImages = async (
  node,
  getNodes,
  pluginOptions
) => {
  const defaults = {
    maxWidth: 650,
    wrapperStyle: ``,
    backgroundColor: `white`
    // linkImagesToOriginal: true,
    // showCaptions: false,
    // pathPrefix,
    // withWebp: false
  };

  const options = _.defaults(pluginOptions, defaults);

  const imageNodes = getNodes().filter(
    node =>
      !!node &&
      !!node.absolutePath &&
      node.absolutePath.includes("/wordsby/uploads/")
  );

  for (let key of Object.keys(node)) {
    const field = node[key];

    if (!!field && typeof field === "string") {
      if (!field.includes("<img")) continue;

      const $ = cheerio.load(field);

      if ($(`img`).length === 0) continue;

      let imageRefs = [];

      $(`img`).each(function() {
        imageRefs.push($(this));
      });

      await Promise.all(
        imageRefs.map(thisImg =>
          replaceImage({ thisImg, node, imageNodes, options, $ })
        )
      );

      node[key] = $.html();
    } else if (!!field && typeof field === "object") {
      // recurse into arrays
      await replaceInlineImageTagsWithFluidImages(field, getNodes);
    }
  }
};

const replaceImage = async ({ thisImg, node, imageNodes, options, $ }) => {
  let url = thisImg.attr("src");

  // skip images that aren't a relative path
  if (!url.startsWith("../uploads/")) return;

  url = url.replace("../", "wordsby/");
  const urlpath = path.resolve(url);
  const urlpath_remove_sizes = removeImageSizes(urlpath);
  const imageSizesPattern = new RegExp("(?:[-_][0-9]+x[0-9]+)");

  // find the full size image that matches, throw away WP resizes
  const imageNode = imageNodes.find(imageNode => {
    return (
      urlpath_remove_sizes === imageNode.absolutePath &&
      !imageSizesPattern.test(imageNode.absolutePath)
    );
  });

  if (!imageNode) return;

  let classes = thisImg.attr("class");
  let formattedImgTag = {};
  formattedImgTag.url = thisImg.attr(`src`);
  formattedImgTag.classList = classes ? classes.split(" ") : [];
  formattedImgTag.title = thisImg.attr(`title`);
  formattedImgTag.alt = thisImg.attr(`alt`);

  if (!formattedImgTag.url) return;

  const fileType = imageNode.ext;

  // Ignore gifs as we can't process them,
  // svgs as they are already responsive by definition
  if (fileType !== `gif` && fileType !== `svg`) {
    const rawHTML = await generateImagesAndUpdateNode({
      node,
      formattedImgTag,
      imageNode,
      options,
      $
    });

    // Replace the image string
    if (rawHTML) thisImg.replaceWith(rawHTML);
  }
};

// Takes a node and generates the needed images and then returns
// the needed HTML replacement for the image
const generateImagesAndUpdateNode = async function({
  node,
  formattedImgTag,
  imageNode,
  options,
  $
}) {
  if (!imageNode || !imageNode.absolutePath) return;

  let fluidResult = await fluid({
    file: imageNode,
    args: options
    // reporter,
    // cache
  });

  if (!fluidResult) return;

  const fallbackSrc = fluidResult.src;
  const srcSet = fluidResult.srcSet;
  const presentationWidth = fluidResult.presentationWidth;
  const fullsizeImgLink = fluidResult.originalImg;

  // replace WP image links
  $(`a`).each(function() {
    if (
      removeImageSizes($(this).attr("href")) ===
      removeImageSizes(formattedImgTag.url)
    ) {
      $(this).attr("href", fullsizeImgLink);
    }
  });

  // Generate default alt tag
  const srcSplit = fluidResult.src.split(`/`);
  const fileName = srcSplit[srcSplit.length - 1];
  const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``);
  const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `);

  const imageStyle = `
      width: 100%;
      height: 100%;
      margin: 0;
      vertical-align: middle;
      position: absolute;
      top: 0;
      left: 0;
      box-shadow: inset 0px 0px 0px 400px ${options.backgroundColor};`.replace(
    /\s*(\S+:)\s*/g,
    `$1`
  );

  // Create our base image tag
  let imageTag = `
      <img
        class="${imageClass} ${formattedImgTag.classList.join(" ")}"
        style="${imageStyle}"
        alt="${formattedImgTag.alt ? formattedImgTag.alt : defaultAlt}"
        title="${formattedImgTag.title ? formattedImgTag.title : ``}"
        src="${fallbackSrc}"
        srcset="${srcSet}"
        sizes="${fluidResult.sizes}"
      />
    `.trim();

  // // if options.withWebp is enabled, generate a webp version and change the image tag to a picture tag
  // if (options.withWebp) {
  //   const webpFluidResult = await fluid({
  //     file: imageNode,
  //     args: _.defaults(
  //       { toFormat: `WEBP` },
  //       // override options if it's an object, otherwise just pass through defaults
  //       options.withWebp === true ? {} : options.withWebp,
  //       pluginOptions,
  //       defaults
  //     ),
  //     reporter,
  //   })

  //   if (!webpFluidResult) {
  //     return false;
  //   }

  //   imageTag = `
  //   <picture>
  //     <source
  //       srcset="${webpFluidResult.srcSet}"
  //       sizes="${webpFluidResult.sizes}"
  //       type="${webpFluidResult.srcSetType}"
  //     />
  //     <source
  //       srcset="${srcSet}"
  //       sizes="${fluidResult.sizes}"
  //       type="${fluidResult.srcSetType}"
  //     />
  //     <img
  //       class="${imageClass}"
  //       style="${imageStyle}"
  //       src="${fallbackSrc}"
  //       alt="${node.alt ? node.alt : defaultAlt}"
  //       title="${node.title ? node.title : ``}"
  //     />
  //   </picture>
  //   `.trim()
  // }

  const ratio = `${(1 / fluidResult.aspectRatio) * 100}%`;

  // Construct new image node w/ aspect ratio placeholder
  // const showCaptions = options.showCaptions && node.title
  const showCaptions = false;

  let rawHTML = `
  <span
    class="${imageWrapperClass}"
    style="position: relative; display: block; ${
      showCaptions ? `` : options.wrapperStyle
    } max-width: ${presentationWidth}px; margin-left: auto; margin-right: auto;"
  >
    <span
      class="${imageBackgroundClass}"
      style="padding-bottom: ${ratio}; position: relative; bottom: 0; left: 0; background-image: url('${
    fluidResult.base64
  }'); background-size: cover; display: block;"
    ></span>
    ${imageTag}
  </span>
  `.trim();

  //   // Make linking to original image optional.
  //   if (!inLink && options.linkImagesToOriginal) {
  //     rawHTML = `
  // <a
  //   class="gatsby-resp-image-link"
  //   href="${originalImg}"
  //   style="display: block"
  //   target="_blank"
  //   rel="noopener"
  // >
  //   ${rawHTML}
  // </a>
  //   `.trim()
  //   }

  //   // Wrap in figure and use title as caption
  //   if (showCaptions) {
  //     rawHTML = `
  // <figure class="gatsby-resp-image-figure" style="${options.wrapperStyle}">
  //   ${rawHTML}
  //   <figcaption class="gatsby-resp-image-figcaption">${node.title}</figcaption>
  // </figure>
  //     `.trim()
  //   }
  return rawHTML;
};
