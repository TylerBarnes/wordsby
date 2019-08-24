const {
	linkIdsToNodes,
	linkAttachmentsToNodes,
} = require("../../normalize")

exports.createNodeLinks = async ({
	collection,
	apiHelpers,
	availableCollectionsIds,
	attachmentNodes,
	pluginOptions,
}) => {
	const { createNodeId } = apiHelpers

	await linkAttachmentsToNodes({
		node: collection,
		attachmentNodes,
		pluginOptions,
	})

	await linkIdsToNodes({
		node: collection,
		createNodeId,
		availableCollectionsIds,
	})

	return collection
}
