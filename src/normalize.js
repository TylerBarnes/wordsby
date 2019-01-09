const crypto = require(`crypto`);
const _ = require(`lodash`);
const cheerio = require(`cheerio`);
const slash = require(`slash`);
const { fluid } = require(`gatsby-plugin-sharp`);
const path = require(`path`);

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

exports.createNodeFromEntity = async (
  entity,
  id,
  type,
  createParentChildLink,
  createContentDigest,
  parentNode,
  createNode,
  getNodes,
  getNode
) => {
  // Create subnodes for ACF Flexible layouts
  //   let { __type, ...entity } = e; // eslint-disable-line no-unused-vars
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
      //   type: entity.type,
      type,
      contentDigest: createContentDigest(entity)
      //   contentDigest: digest(JSON.stringify(entity))
    }
  };

  await updateJsonInlineImageTagsToStaticUrl(node, getNodes);

  createNode(node);
  createParentChildLink({ parent: parentNode, child: node });
  childrenNodes.forEach(node => {
    createNode(node);
  });
};

// If the image is relative (not hosted elsewhere)
// 1. Find the image file
// 2. Convert the image src to be relative to its parent node
// This will allow gatsby-remark-images to resolve the image correctly
const updateJsonInlineImageTagsToStaticUrl = async (node, getNodes) =>
  // pluginOptions
  {
    const defaults = {
      maxWidth: 650,
      wrapperStyle: ``,
      backgroundColor: `white`,
      linkImagesToOriginal: true,
      showCaptions: false,
      // pathPrefix,
      withWebp: false
    };

    const options = defaults;
    // const options = _.defaults(pluginOptions, defaults)

    const imageNodes = getNodes().filter(
      node =>
        !!node &&
        !!node.absolutePath &&
        node.absolutePath.includes("/wordsby/uploads/")
    );

    // console.log(imageNodes);

    // const defaults = {};

    // const options = _.defaults(pluginOptions, defaults);

    // This will also allow the use of html image tags
    // const rawHtmlNodes = select(markdownAST, `html`);

    await new Promise(async (resolve, reject) => {
      for (let key in node) {
        const field = node[key];
        // console.log(field);
        if (!!field && typeof field === "string") {
          // no img tags so skip.
          if (!field.includes("<img")) continue;

          const $ = cheerio.load(field);

          if ($(`img`).length === 0) continue;

          let imageRefs = [];

          $(`img`).each(function() {
            imageRefs.push($(this));
          });

          for (let thisImg of imageRefs) {
            let url = thisImg.attr("src");

            // skip images that aren't a relative path
            if (!url.startsWith("../uploads/")) continue;

            url = url.replace("../", "wordsby/");
            const urlpath = path.resolve(url);
            const imageSizesPattern = new RegExp("(?:[-_][0-9]+x[0-9]+)");
            const urlpath_remove_sizes = urlpath.replace(imageSizesPattern, "");

            const imageNode = imageNodes.find(imageNode => {
              return (
                urlpath_remove_sizes === imageNode.absolutePath &&
                !imageSizesPattern.test(imageNode.absolutePath)
              );
            });

            // console.log(imageNode);

            if (!imageNode) {
              // console.log(`no image node to use. dead end for ${urlpath}`);
              continue;
            }
            // console.log(`image node found for ${urlpath}`);

            let formattedImgTag = {};
            formattedImgTag.url = thisImg.attr(`src`);
            formattedImgTag.title = thisImg.attr(`title`);
            formattedImgTag.alt = thisImg.attr(`alt`);

            if (!formattedImgTag.url) {
              continue;
            }

            const fileType = imageNode.ext;

            // Ignore gifs as we can't process them,
            // svgs as they are already responsive by definition
            if (fileType !== `gif` && fileType !== `svg`) {
              const rawHTML = await generateImagesAndUpdateNode(
                formattedImgTag,
                node,
                imageNode,
                options
              );

              // console.log(rawHTML);

              if (rawHTML) {
                // Replace the image string
                thisImg.replaceWith(rawHTML);
                // console.log(thisImg.attr("src"));
                // thisImg.after(rawHTML).remove();
              } else {
                continue;
              }
            }
          }

          // replace field with $.html()
          node[key] = $.html();

          // console.log("html updated");

          // console.log(field);

          // console.log($.html());
          // console.log(imageRefs);

          // for (let thisImg of imageRefs) {
          // Get the details we need.
          // let formattedImgTag = {};
          // formattedImgTag.url = thisImg.attr(`src`);
          // if (!formattedImgTag.url) {
          //   return true;
          // }
          // // Only handle relative (local) urls
          // if (!isRelativeUrl(formattedImgTag.url)) {
          //   return resolve();
          // }
          // let imagePath;
          // const imageNode = _.find(files, file => {
          //   if (file.sourceInstanceName === options.name) {
          //     imagePath = slash(
          //       path.join(file.dir, path.basename(formattedImgTag.url))
          //     );
          //     return path.normalize(file.absolutePath) === imagePath;
          //   }
          // });
          // if (!imageNode) return resolve();
          // const parentNode = getNode(markdownNode.parent);
          // // Make the image src relative to its parent node
          // thisImg.attr('src', path.relative(parentNode.dir, imagePath));
          // node.value = $(`body`).html(); // fix for cheerio v1
          // }
          // return resolve(node);
        } else if (!!field && typeof field === "object") {
          // recurse into arrays
          // console.log("no html to update, recursing!");
          await updateJsonInlineImageTagsToStaticUrl(field, getNodes);
        }
      }
      // _.each(node, async (field, key) => {

      // });
      // console.log("resolve");
      resolve();
    });
  };

// Takes a node and generates the needed images and then returns
// the needed HTML replacement for the image
// const generateImagesAndUpdateNode = async function(node, resolve, inLink) {
const generateImagesAndUpdateNode = async function(
  formattedImgTag,
  node,
  imageNode,
  options
) {
  // Check if this markdownNode has a File parent. This plugin
  // won't work if the image isn't hosted locally.

  // console.log(imageNode);
  if (!imageNode || !imageNode.absolutePath) {
    return false;
  }

  let fluidResult = await fluid({
    file: imageNode,
    args: options
    // reporter,
    // cache
  });

  if (!fluidResult) {
    return false;
  }

  // const originalImg = fluidResult.originalImg;
  const fallbackSrc = fluidResult.src;
  const srcSet = fluidResult.srcSet;
  const presentationWidth = fluidResult.presentationWidth;

  // Generate default alt tag
  // const srcSplit = node.url.split(`/`);
  // const fileName = srcSplit[srcSplit.length - 1];
  // const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``);
  // const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `);
  const defaultAlt = "";

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
        class="${imageClass}"
        style="${imageStyle}"
        alt="${node.alt ? node.alt : defaultAlt}"
        title="${node.title ? node.title : ``}"
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
