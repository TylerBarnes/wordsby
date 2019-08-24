const {
	createNodeLinks,
} = require("./dataTypes/collections/createNodeLinks")
const {
	transformCollection,
} = require("./dataTypes/collections/transformCollection")

const transformerMap = {
	collections: transformCollection,
}

const transformEntities = async ({
	entities,
	type,
	previouslyTransformedEntities,
	apiHelpers,
	pluginOptions,
}) => {
	const { createNodeId, createContentDigest } = apiHelpers

	const availableCollectionsIds = entities.map(({ ID }) => ID)

	const transformedEntities = await Promise.all(
		entities.map(async entity =>
			transformerMap[type]
				? transformerMap[type]({
						entity,
						apiHelpers,
						availableCollectionsIds,
						type,
						pluginOptions,
				  })
				: entity,
		),
	)

	if (
		previouslyTransformedEntities &&
		previouslyTransformedEntities.length
	) {
		return [...transformedEntities, ...previouslyTransformedEntities]
	} else {
		return transformedEntities
	}
}

module.exports = transformEntities
