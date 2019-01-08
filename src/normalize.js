const crypto = require(`crypto`);
const _ = require(`lodash`);
const cheerio = require(`cheerio`);
// const createFilePath = require('gatsby-source-filesystem').;

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

exports.createNodeFromEntity = (
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

  updateJsonInlineImageTagsToStaticUrl(node, getNodes, getNode);

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
const updateJsonInlineImageTagsToStaticUrl = (node, getNodes, getNode) =>
  // pluginOptions
  {
    const imageNodes = getNodes().filter(
      node =>
        !!node &&
        !!node.absolutePath &&
        node.absolutePath.includes("/wordsby/uploads/")
    );

    _.each(node, field => {
      if (!!field && typeof field === "string") {
        // no img tags so skip.
        if (!field.includes("<img")) return true;

        const $ = cheerio.load(field);

        if ($(`img`).length === 0) return true;

        // console.log(field);
        let imageRefs = [];
        $(`img`).each(function() {
          // imageRefs.push($(this));
          const url = $(this).attr("src");

          // skip images that aren't a relative path
          if (!url.startsWith("../uploads/")) return true;

          const imageNode = imageNodes.find(imageNode => {
            if (!!imageNode.ext) {
              return url.includes(imageNode.relativePath);
            } else {
              return false;
            }
          });

          if (!!imageNode && !!imageNode.relativePath) {
            createFilePath({
              node: 
            });
          }
        });

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
      } else if (!!field && typeof field === "array") {
        // recurse into arrays
        updateJsonInlineImageTagsToStaticUrl(field);
      }
    });
    // const defaults = {};

    // const options = _.defaults(pluginOptions, defaults);

    // This will also allow the use of html image tags
    // const rawHtmlNodes = select(markdownAST, `html`);

    // new Promise(async (resolve, reject) => {
    //   if (!node.value) {
    //     return resolve();
    //   }
  };
