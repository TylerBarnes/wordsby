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
	previouslyTransformedEntities = [],
	apiHelpers,
	pluginOptions,
}) => {
	const { createNodeId, createContentDigest } = apiHelpers

	const availableCollectionsIds = [
		...entities.map(({ ID }) => ID),
		...previouslyTransformedEntities.map(({ node }) => node.ID),
	]

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
		transformedEntities.forEach(entity => {
			const previousIndex = previouslyTransformedEntities.findIndex(
				prevEnt => prevEnt.ID === entity.ID,
			)
			if (previousIndex) {
				// overwrite the old post with the updated post
				previouslyTransformedEntities[previousIndex] = entity
			} else {
				// add the new post to the end of the array
				previouslyTransformedEntities.push(entity)
			}
		})

		return previouslyTransformedEntities
	} else {
		return transformedEntities
	}
}

module.exports = transformEntities
