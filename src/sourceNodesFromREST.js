const axios = require(`axios`)

const transformEntities = require("./transformEntities")

const recursivePaginatedFetch = async ({
	url,
	page,
	activityReporter,
	activityLabel = "fetched",
	collector = [],
}) => {
	const pagedUrl = url.replace("{{page}}", page)
	const entities = await axios({
		method: "get",
		url: pagedUrl,
	})

	if (entities.data.status === "ERROR") {
		throw new Error(entities.data.message)
	}

	if (entities.data.payload && entities.data.payload.length) {
		collector = [...collector, ...entities.data.payload]

		activityReporter.setStatus(`${collector.length} ${activityLabel}`)
	}

	// for debugging
	// if (page > 1) {
	// return collector
	// }

	if (entities.data.status === "SUCCESS") {
		return recursivePaginatedFetch({
			url,
			page: page + 1,
			collector,
			activityReporter,
			activityLabel,
		})
	}

	return collector
}

const sourceNodesFromREST = async ({ apiHelpers, pluginOptions }) => {
	// const nodeTypes = ["collections", "attachments", "taxonomies", "terms"]
	const nodeTypes = ["collections"]

	const unpublishedIdsByType = await Promise.all(
		nodeTypes.map(async type =>
			sourceUnpublishedEntityIDs({
				type,
				apiHelpers,
				pluginOptions,
			}),
		),
	)

	await Promise.all(
		nodeTypes.map(async type =>
			sourceEntitiesFromRESTByType({
				type,
				apiHelpers,
				pluginOptions,
				unpublishedIdsByType,
			}),
		),
	)
}

/**
 * This is used to determine if any entity nodes have been deleted or made private.
 */
const sourceUnpublishedEntityIDs = async ({
	type,
	apiHelpers,
	pluginOptions,
}) => {
	const { cache, reporter, actions } = apiHelpers
	const { restUrl } = pluginOptions

	const lastCacheTime = await cache.get(`last-${type}-cache-time`)

	if (!lastCacheTime) {
		return {
			type,
			wordpress_ids: null,
		}
	}

	const url = `${restUrl}/wp-json/wordsby/v1/${type}___ids/{{page}}?since=${lastCacheTime}&get_unpublished=true`

	const activityReporter = reporter.activityTimer(
		`Determining which ${type} to update`,
	)

	activityReporter.start()

	let entities

	try {
		entities = await recursivePaginatedFetch({
			url,
			page: 1,
			activityReporter,
			activityLabel: "checked",
		})
	} catch (e) {
		throw new Error(`unable to connect to ${url}. Error: ${e}`)
	}

	activityReporter.end()

	return {
		type,
		wordpress_ids: entities,
	}
}

const filterUnPublishedEntities = async ({
	entities,
	type,
	unpublishedIdsByType,
	apiHelpers,
}) => {
	const unpublishedIds = unpublishedIdsByType.find(
		({ type: idType }) => type === idType,
	).wordpress_ids

	console.log("unpublishedIds", unpublishedIds)

	if (!unpublishedIds || !unpublishedIds.length) {
		return entities
	}

	const { actions, getNode, createNodeId, getNodesByType } = apiHelpers

	const existingPages = getNodesByType(`SitePage`)

	console.log(existingPages.length);

	await Promise.all(
		unpublishedIds.map(async id => {
			const nodeId = createNodeId(`Collections${id}`)
			console.log("​nodeId", nodeId)
			const nodeToDelete = getNode(nodeId)

			if (!nodeToDelete) {
				return
			}

			console.log("​nodeToDelete", nodeToDelete.pathname)

			// if (nodeToDelete.pathname) {
			// 	const page = existingPages.find(
			// 		({ path }) => path === nodeToDelete.pathname,
			// 	)

			// 	try {
			// 		actions.deletePage({
			// 			path: page.path,
			// 			component: page.component
			// 		})
			// 	} catch (e) {
			// 		console.warn(e)
			// 	}
			// }

			try {
				console.log("deleting node")
				actions.deleteNode(nodeToDelete)
			} catch (e) {
				console.warn(e)
			}
		}),
	)

	// console.log(entities.find(({ node: { ID } }) => ID == 501))

	const filteredEntities = entities.filter(
		({ node: { ID } }) => !unpublishedIds.includes(ID),
	)

	// console.log(filteredEntities.find(({ node: { ID } }) => ID == 501))
	// console.log(entities.length)
	// console.log(filteredEntities.length)
	// process.exit()

	return filteredEntities
}

const sourceEntitiesFromRESTByType = async ({
	type,
	apiHelpers,
	pluginOptions,
	unpublishedIdsByType,
}) => {
	const { cache, reporter, actions } = apiHelpers
	const { restUrl } = pluginOptions

	const lastCachedRestUrl = await cache.get(`last-cached-rest-url`)
	await cache.set(`last-cached-rest-url`, restUrl)

	const urlHasntChanged = lastCachedRestUrl === restUrl
	const urlHasChanged = !urlHasntChanged

	if (urlHasChanged) {
		await cache.set(`last-${type}-cache-time`, null)
		await cache.set(`cached-transformed-${type}`, null)
	}

	const lastCacheTime = await cache.get(`last-${type}-cache-time`)

	let transformedEntities = await cache.get(`cached-transformed-${type}`)
	if (!transformedEntities || !transformedEntities.length) {
		transformedEntities = []
	}

	// set the cache time for our next build to use
	const unixTime = new Date().getTime()
	await cache.set(`last-${type}-cache-time`, unixTime)

	const url = `${restUrl}/wp-json/wordsby/v1/${type}/{{page}}${
		lastCacheTime && urlHasntChanged // if the url changes, get everything again
			? `?since=${lastCacheTime}`
			: ""
	}`

	const activityReporter = reporter.activityTimer(
		`Fetching and cacheing ${type}`,
	)

	activityReporter.start()

	let entities

	try {
		entities = await recursivePaginatedFetch({
			url,
			page: 1,
			activityReporter,
		})
	} catch (e) {
		throw new Error(`unable to connect to ${url}. Error: ${e}`)
	}

	activityReporter.end()

	if (entities && entities.length) {
		// normalize nodes and create node relationships for new entities
		transformedEntities = await transformEntities({
			entities,
			type,
			apiHelpers,
			previouslyTransformedEntities: transformedEntities,
			pluginOptions,
		})
	}

	// remove all non-public nodes
	transformedEntities = await filterUnPublishedEntities({
		entities: transformedEntities,
		unpublishedIdsByType,
		apiHelpers,
		type,
	})

	// save the transformed entities for next build
	await cache.set(`cached-transformed-${type}`, transformedEntities)

	/**
	 * Create nodes from the transformed entities
	 */
	if (transformedEntities) {
		const { createNode } = actions

		const createdNodes = await Promise.all(
			transformedEntities.map(async ({ node, childrenNodes }) => {
				await createNode(node)
				childrenNodes.forEach(async node => {
					await createNode(node)
				})
			}),
		)
	}
}

module.exports = sourceNodesFromREST
