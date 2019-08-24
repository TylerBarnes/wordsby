const compose = require("compose-function")
const { normalizeAcfFields } = require("../../normalize")
const { createNodeLinks } = require("./createNodeLinks")
const startCase = require("lodash/startCase")
const pPipe = require("p-pipe")

exports.transformCollection = async ({
	entity,
	apiHelpers,
	type,
	availableCollectionsIds,
	pluginOptions,
}) => {
	const {
		createNodeId,
		createContentDigest,
		getNodesByType,
	} = apiHelpers

	const children = []
	const childrenNodes = []

	const attachmentNodes = getNodesByType(`WordsbyAttachments`)

	const id = createNodeId(`Collections${entity.ID}`)

	const transformers = [normalizeAcfFields, createNodeLinks]

	let transformedCollection = { ...entity }

	// "entity" is run through all the transformer functions and is mutated by each
	for (let transformer of transformers) {
		transformedCollection = await transformer({
			collection: transformedCollection,
			apiHelpers,
			id,
			children,
			childrenNodes,
			attachmentNodes,
			availableCollectionsIds,
			pluginOptions,
		})
	}

	let node = {
		...transformedCollection,
		id,
		children,
		internal: {
			type: startCase(`Wordsby ${type}`).replace(" ", ""),
			contentDigest: createContentDigest(transformedCollection),
		},
	}

	return { node, childrenNodes }
}
