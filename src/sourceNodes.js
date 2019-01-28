// Add last build time
module.exports = (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createNode } = actions;

  if (!!pluginOptions && !pluginOptions.instantPublish) return;

  const nodeData = {
    timestamp: Math.round(new Date().getTime() / 1000)
  };

  const nodeContent = JSON.stringify(nodeData);

  const nodeMeta = {
    id: createNodeId(`last-build-timestamp`),
    parent: null,
    children: [],
    internal: {
      type: `wordsby_latest_build`,
      mediaType: `text/html`,
      content: nodeContent,
      contentDigest: createContentDigest(nodeData)
    }
  };

  const node = Object.assign({}, nodeData, nodeMeta);
  createNode(node);
};
