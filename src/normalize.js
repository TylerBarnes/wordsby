const crypto = require(`crypto`);
const _ = require(`lodash`);

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
    parent: entityId.toString(),
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
  createNode
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
              entity.ID + i,
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
      //   type: e.__type,
      type,
      contentDigest: createContentDigest(entity)
      //   contentDigest: digest(JSON.stringify(entity))
    }
  };
  createNode(node);
  createParentChildLink({ parent: parentNode, child: node });
  childrenNodes.forEach(node => {
    createNode(node);
  });
};
