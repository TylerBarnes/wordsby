// This code was borrowed from gatsby-transformer-json.
// The plan is to integrate some of the normalizers from gatsby-source-wordpress here.

const _ = require(`lodash`);
const path = require(`path`);
const { createNodeFromEntity } = require(`./normalize`);
const asyncForEach = require("async-foreach").forEach;

function onCreateNode(
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
  return new Promise(async resolve => {
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

    const {
      deleteNode,
      deletePage,
      createNode,
      createParentChildLink
    } = actions;

    async function transformObject(obj, id, type) {
      await createNodeFromEntity(
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
        deleteNode({ node: node });
        // console.log("preview");
        resolve();
        return;
      } else if (
        node.path.includes("/psychic-window/") ||
        node.path.includes("/schema_builder/")
      ) {
        // delete schema builder and psychic window pages and nodes.
        deletePage({ path: node.path, component: node.component });
        deleteNode({ node: node });
        // console.log("deleting psych and schema");
        resolve();
        return;
      }
    }

    if (node.internal.mediaType !== `application/json`) {
      // We only care about JSON content.
      // console.log("not json");
      resolve();
      return;
    }

    const content = await loadNodeContent(node);
    const parsedContent = JSON.parse(content);

    // console.log("parse content");
    if (_.isArray(parsedContent)) {
      // parsedContent.forEach((obj, i) => {
      //   transformObject(
      //     obj,
      //     obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> JSON`),
      //     getType({ node, object: obj, isArray: true })
      //   );
      // });

      await asyncForEach(parsedContent, async (obj, i) => {
        // console.log(`please wait ${i}`);
        await transformObject(
          obj,
          obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> JSON`),
          getType({ node, object: obj, isArray: true })
        );

        if (i === parsedContent.length - 1) {
          // resolve();
          // return;
        }
      });

      // console.log("i waited!");
    } else if (_.isPlainObject(parsedContent)) {
      await transformObject(
        parsedContent,
        parsedContent.id
          ? parsedContent.id
          : createNodeId(`${node.id} >>> JSON`),
        getType({ node, object: parsedContent, isArray: false })
      );

      // resolve();
      // return;
    } else {
      // resolve();
      // return;
    }
  });
}

module.exports = onCreateNode;
