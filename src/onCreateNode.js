// This code was borrowed from gatsby-transformer-json.
// The plan is to integrate some of the normalizers from gatsby-source-wordpress here.

const _ = require(`lodash`);
const path = require(`path`);
const { createNodeFromEntity } = require(`./normalize`);

async function onCreateNode(
  {
    node,
    actions,
    loadNodeContent,
    createNodeId,
    createContentDigest,
    getNodes,
    getNode
  },
  pluginOptions
) {
  function getType({ node, object, isArray }) {
    if (pluginOptions && _.isFunction(pluginOptions.typeName)) {
      return pluginOptions.typeName({ node, object, isArray });
    } else if (pluginOptions && _.isString(pluginOptions.typeName)) {
      return pluginOptions.typeName;
    } else if (node.internal.type !== `File`) {
      return _.upperFirst(_.camelCase(`Wordsby ${node.internal.type}`));
    } else if (isArray) {
      return _.upperFirst(_.camelCase(`Wordsby ${node.name}`));
    } else {
      return _.upperFirst(_.camelCase(`Wordsby ${path.basename(node.dir)}`));
    }
  }

  const { deleteNode, deletePage, createNode, createParentChildLink } = actions;

  function transformObject(obj, id, type) {
    return createNodeFromEntity(
      obj,
      id,
      type,
      createParentChildLink,
      createContentDigest,
      node,
      createNode,
      getNodes,
      getNode
    );
  }

  if (node.internal.type === "SitePage") {
    if (node.path.startsWith("/preview/")) {
      // remove preview template pages from the sitemap
      return deleteNode({ node: node });
    } else if (
      node.path.includes("/psychic-window/") ||
      node.path.includes("/schema_builder/")
    ) {
      // delete schema builder and psychic window pages and nodes.
      deletePage({ path: node.path, component: node.component });
      deleteNode({ node: node });
      return;
    }
  }

  if (node.internal.mediaType !== `application/json`) {
    // We only care about JSON content.
    return;
  }

  const content = await loadNodeContent(node);
  const parsedContent = JSON.parse(content);

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> JSON`),
        getType({ node, object: obj, isArray: true })
      );
    });
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      parsedContent.id ? parsedContent.id : createNodeId(`${node.id} >>> JSON`),
      getType({ node, object: parsedContent, isArray: false })
    );
  }
}

module.exports = onCreateNode;
