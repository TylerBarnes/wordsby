const onCreateNode = require("./onCreateNode")
const sourceNodesFromREST = require("./sourceNodesFromREST")

const { dump } = require(`dumper.js`)

const sourceNodes = async (apiHelpers, pluginOptions) => {
	const {
		getNodesByType,
		getNodes,
		reporter,
		loadNodeContent,
		cache,
	} = apiHelpers

	const wordsbyFileNodes = getNodesByType(`File`).filter(
		({ sourceInstanceName }) =>
			sourceInstanceName.includes(`wordsby`) ||
			sourceInstanceName.includes(`Wordsby`),
	)

	/**
	 *
	 *
	 * Create nodes for all non-PostType JSON files
	 *
	 */

	const wpDataActivity = reporter.activityTimer(
		`create Wordsby node types from ./wordsby/data`,
	)

	wpDataActivity.start()

	const wordsbyData = wordsbyFileNodes.filter(
		({ internal }) =>
			!internal.description.includes(
				`File "wordsby/data/collections`,
			) && internal.description.includes(`File "wordsby/data`),
	)

	await Promise.all(
		wordsbyData.map(async (node, index) => {
			wpDataActivity.setStatus(
				`[ ${index + 1} / ${wordsbyData.length} ]`,
			)
			await onCreateNode({ node, ...apiHelpers }, pluginOptions)
		}),
	)

	wpDataActivity.end()

	/**
	 *
	 *
	 * Create nodes for all PostType JSON files (WordsbyCollections)
	 *
	 */

	const wpRelationalDataActivity = reporter.activityTimer(
		`create WordsbyCollections nodes from posts in ./wordsby/data/collections`,
	)

	wpRelationalDataActivity.start()

	const wordsbyRelationalData = wordsbyFileNodes.filter(({ internal }) =>
		internal.description.includes(`File "wordsby/data/collections`),
	)

	const availableCollectionsIds = await Promise.all(
		wordsbyRelationalData
			.map(async node => {
				const contentJSON = await loadNodeContent(node)
				const content = contentJSON ? JSON.parse(contentJSON) : {}
				return content.ID
			})
			.filter(node => !!node),
	)

	await Promise.all(
		wordsbyRelationalData.map(async (node, index) => {
			wpRelationalDataActivity.setStatus(
				`[ ${index + 1} / ${wordsbyRelationalData.length} ]`,
			)
			await onCreateNode(
				{
					node,
					availableCollectionsIds,
					apiHelpers,
					...apiHelpers,
				},
				pluginOptions,
			)
		}),
	)

	wpRelationalDataActivity.end()

	if (pluginOptions.restUrl) {
		await sourceNodesFromREST({ apiHelpers, pluginOptions })
	}
}

module.exports = sourceNodes
