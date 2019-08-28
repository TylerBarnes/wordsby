const _ = require("lodash")
const path = require("path")
const fs = require("fs")
const glob = require("glob")
const createTemplatesJson = require("./createTemplatesJson")
const paginate = require("gatsby-awesome-pagination").paginate

const createPageDependency = require("gatsby/dist/redux/actions/add-page-dependency")

// const componentFileType = "js";
const templatesPath = path.resolve(`./src/templates/`).replace(/\\/g, "/")
const defaultTemplate = `${templatesPath}/index.js`
const createPreviewPages = require("./createPreviewPages")
const getFirstExistingTemplate = require("./utils/getFirstExistingTemplate")
const shouldIgnorePath = require("./utils/shouldIgnorePath")

const timestamp = Math.round(new Date().getTime() / 1000)

let existingTemplateFiles = glob.sync(`${templatesPath}/**/*.js`, {
	dot: true,
})

// console.log(templatesPath)
// console.log(existingTemplateFiles)

createTemplatesJson({ existingTemplateFiles, templatesPath })

module.exports = async (
	{ actions, graphql, createNodeId, getNode },
	pluginOptions,
) => {
	const { ignorePaths, context: userContext = {} } = pluginOptions
	const { createPage } = actions

	let normalizedUserContextData = {}

	if (userContext && userContext.query && userContext.normalizer) {
		// console.log('user context query')
		const rawContextQueryData = await graphql(userContext.query)
		normalizedUserContextData = userContext.normalizer(
			rawContextQueryData,
		)
	} else {
		// console.log('no user context query')
	}

	if (!fs.existsSync(defaultTemplate)) {
		throw `default template doesn't exist at ${defaultTemplate}`
	}

	createPreviewPages({
		existingTemplateFiles,
		createPage,
		graphql,
		ignorePaths,
	})

	const {
		data: {
			allWordsbyActivePlugins: { edges: activePlugins },
		},
	} = await graphql(`
		{
			allWordsbyActivePlugins {
				edges {
					node {
						Name
					}
				}
			}
		}
	`)

	const yoastActive = activePlugins.find(
		({ node }) => node.Name === "Yoast SEO",
	)
	const yoastFragment = yoastActive
		? `
    yoast {
          seo_title
          seo_metadesc
          og_title
          og_description
          og_image {
            publicURL
          }
          og_image_id
          content_score
          canonical_url
        }
  `
		: ``

	return graphql(`
    {
      allWordsbyCollections(filter: { post_status: { eq: "publish" } }) {
        edges {
          node {
            ID
            pathname
            post_type
            post_title
            template_slug
            ${yoastFragment}
            #acf {
            #  is_archive
            #  posts_per_page
            #  post_type
            #}
          }
        }
      }

      allWordsbyTaxTerms {
        edges {
          node {
            name
            label
            pathname
            terms {
              slug
              name
              taxonomy
              ID: wordpress_id
              pathname
            }
          }
        }
      }

      # wordsbyData {
      #   build_site_url
      # }

      wpUrl: wordsbySiteMeta(key: { eq: "url" }) {
        value
      }
    }
  `)
		.then(async result => {
			if (result.errors) {
				result.errors.forEach(e => console.error(e.toString()))
				return Promise.reject(result.errors)
			}

			const posts = result.data.allWordsbyCollections.edges.filter(
				({ node: post }) => post.post_type !== "schema_builder",
			)

			// const {
			//   wordsbyData: { build_site_url: buildUrl }
			// } = result.data;
			const buildUrl = null

			// create post type pages
			_.each(posts, async (post, index) => {
				if (post.node.pathname === "/our-locations/atlanta/") {
					console.log("creating atlanta")
				}

				let {
					node: { template_slug, pathname, yoast },
				} = post

				if (shouldIgnorePath({ ignorePaths, pathname })) {
					return true
				}

				if (pathname.length > 1000) {
					console.log(
						`pathname is too long, trimmed to 1000 chars: ${pathname}`,
					)
					pathname = pathname.substring(0, 1000)
					console.log(pathname)
				}

				const acf = post.node.acf
				const archivePostType =
					acf && acf.post_type ? acf.post_type : false
				const isArchive = !!acf && !!acf.is_archive

				if (!isArchive) {
					const template = getFirstExistingTemplate([
						template_slug,
						`index`,
					])
					if (template) {
						createPage({
							path: post.node.pathname,
							component: template,
							context: {
								latestBuild: timestamp,
								wpUrl: result.data.wpUrl.value,
								id: post.node.ID,
								pagePath: post.node.pathname,
								buildUrl,
								yoast,
								previousPost:
									typeof posts[index - 1] !== "undefined"
										? posts[index - 1].node
										: {},
								nextPost:
									typeof posts[index + 1] !== "undefined"
										? posts[index + 1].node
										: {},
								...normalizedUserContextData,
							},
						})
					} else {
						console.log(
							`no template for ${template_slug}, ${pathname}`,
						)
					}
				}

				if (isArchive) {
					const archivePosts = posts.filter(
						({ node }) => node.post_type === archivePostType,
					)

					const itemsPerPage = parseInt(acf.posts_per_page)

					let template = getFirstExistingTemplate([
						`archive/${archivePostType}`,
						"archive/index",
					])

					if (template) {
						paginate({
							createPage: createPage,
							component: template,
							items: archivePosts,
							itemsPerPage: itemsPerPage,
							pathPrefix: post.node.pathname.replace(
								/\/$/,
								"",
							),
							context: {
								latestBuild: timestamp,
								wpUrl: result.data.wpUrl.value,
								archive: true,
								id: post.node.ID,
								post_type: post.node.acf.post_type,
								...normalizedUserContextData,
							},
						})
					}
				}
			})

			const weShouldGenerateTaxonomyPages = existingTemplateFiles.some(
				item => item.includes("/taxonomy/"),
			)

			if (weShouldGenerateTaxonomyPages) {
				const taxonomies = result.data.allWordsbyTaxTerms.edges

				_.each(taxonomies, ({ node: taxonomy }) => {
					const { name, pathname, terms, label } = taxonomy

					if (shouldIgnorePath({ ignorePaths, pathname }))
						return true

					const template = getFirstExistingTemplate([
						`taxonomy/archive/${name}`,
						`taxonomy/archive/index`,
					])

					if (template && terms.length > 0) {
						// create taxonomy archives
						createPage({
							path: pathname,
							component: template,
							context: {
								latestBuild: timestamp,
								wpUrl: result.data.wpUrl.value,
								taxonomy_slug: name,
								taxonomy_name: label,
								terms: terms,
								...normalizedUserContextData,
							},
						})
					}

					terms &&
						_.each(terms, term => {
							const {
								pathname,
								taxonomy,
								slug,
								name,
								ID,
							} = term

							if (
								shouldIgnorePath({ ignorePaths, pathname })
							)
								return true

							const template = getFirstExistingTemplate([
								`taxonomy/single/${taxonomy}`,
								`taxonomy/single/index`,
							])

							if (template) {
								// create term pages
								createPage({
									path: pathname,
									component: template,
									context: {
										latestBuild: timestamp,
										wpUrl: result.data.wpUrl.value,
										label: name,
										slug: slug,
										wordpress_id: ID,
										...normalizedUserContextData,
									},
								})
							}
						})
				})
			}

			await Promise.all(
				posts.map(async post => {
					createPageDependency({
						path: post.pathname,
						connection: `WordsbyCollections`,
					})
				}),
			)
		})
		.catch(err => {
			throw err
		})
}
