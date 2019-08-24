const axios = require(`axios`)

const transformEntities = require("./transformEntities")

const recursivePaginatedFetch = async ({
	url,
	page,
	activityReporter,
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

		activityReporter.setStatus(`${collector.length} fetched`)
	}

	// for debugging
	// if (page > 1) {
	// 	return collector
	// }

	if (entities.data.status === "SUCCESS") {
		return recursivePaginatedFetch({
			url,
			page: page + 1,
			collector,
			activityReporter,
		})
	}

	return collector
}

const sourceNodesFromREST = async (apiHelpers, pluginOptions) => {
	// const nodeTypes = ["collections", "attachments", "taxonomies", "terms"]
	const nodeTypes = ["collections"]

	await Promise.all(
		nodeTypes.map(async type =>
			sourceEntitiesFromRESTByType({
				type,
				apiHelpers,
				pluginOptions,
			}),
		),
	)
}

const sourceEntitiesFromRESTByType = async ({
	type,
	apiHelpers,
	pluginOptions,
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
		transformedEntities = await transformEntities({
			entities,
			type,
			apiHelpers,
			previouslyTransformedEntities: transformedEntities,
			pluginOptions,
		})

		await cache.set(`cached-transformed-${type}`, transformedEntities)
	}

	/**
	 * Create nodes from the transformed entities
	 */
	if (transformedEntities) {
		const { createNode } = actions

		const createdEntities = await Promise.all(
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
