const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const createTemplatesJson = require("./preview/createTemplatesJson");
const deepmerge = require("deepmerge");

const componentFileType = "js";
const templatesPath = path.resolve(`./src/templates/`);
const defaultTemplate = `${templatesPath}/single/index.js`;

let existingTemplateFiles = glob.sync(`${templatesPath}/**/*.js`, {
  dot: true
});

createTemplatesJson({ existingTemplateFiles, templatesPath });

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  if (!fs.existsSync(defaultTemplate)) {
    throw `default template doesn't exist at ${defaultTemplate}`;
  }

  const preview = process.env.GATSBYPRESS_PREVIEW;

  if (preview) {
    // remove taxonomies from previews
    existingTemplateFiles = existingTemplateFiles.filter(
      template => !template.includes("/taxonomy/")
    );

    return graphql(`
      {
        wordpressWpCollections {
          wordpress_id
        }
      }
    `)
      .then(result => {
        if (result.errors) {
          result.errors.forEach(e => console.error(e.toString()));
          return Promise.reject(result.errors);
        }

        _.each(existingTemplateFiles, template => {
          const indexOfFilename = template.lastIndexOf("/");
          const indexOfExtension = template.lastIndexOf(".js");
          const fileName = template.substring(
            indexOfFilename + 1,
            indexOfExtension
          );
          const indexOfFolderName = template.lastIndexOf(
            "/",
            indexOfFilename - 1
          );
          const folderName =
            "/" + template.substring(indexOfFolderName + 1, indexOfFilename);

          const pathname = `${
            folderName !== "/templates" ? folderName : ""
          }/${fileName}`;

          createPage({
            path: pathname,
            component: template,
            context: {
              id: result.data.wordpressWpCollections.wordpress_id,
              preview: true
            }
          });
        });
      })
      .catch(err => {
        throw "There was a problem building the WP preview templates";
      });
  }

  return graphql(`
    {
      allWordpressWpTaxonomies {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
    .then(result => {
      if (result.errors) {
        result.errors.forEach(e => console.error(e.toString()));
        return Promise.reject(result.errors);
      }

      const taxonomy_slugs = result.data.allWordpressWpTaxonomies.edges
        .map(({ node }) => node.slug)
        .filter(slug => slug !== "post_tag");

      return graphql(`
        {
          allWordpressWpCollections(
            filter: { post_status: { eq: "publish" } }
          ) {
            edges {
              node {
                wordpress_id
                pathname
                post_type
                template_slug
                taxonomies {
                  ${taxonomy_slugs.map(slug => {
                    return `${slug} {
                              pathname
                              terms {
                                name
                                slug
                                taxonomy
                                pathname
                              }
                            }`;
                  })}
                }
              }
            }
          }
        }
      `)
        .then(result => {
          if (result.errors) {
            result.errors.forEach(e => console.error(e.toString()));
            return Promise.reject(result.errors);
          }

          const posts = result.data.allWordpressWpCollections.edges;

          const weShouldGenerateTaxonomyPages = existingTemplateFiles.some(
            item => item.includes("/taxonomy/")
          );

          if (weShouldGenerateTaxonomyPages) {
            const postTaxonomiesGroups = posts.map(post => {
              return post.node.taxonomies;
            });

            let allTaxonomies = {};
            for (const postTaxonomies of postTaxonomiesGroups) {
              for (const key of Object.keys(postTaxonomies)) {
                const value = postTaxonomies[key];

                if (!!value) {
                  if (allTaxonomies[key]) {
                    allTaxonomies[key] = deepmerge(allTaxonomies[key], value);
                  } else {
                    allTaxonomies[key] = value;
                  }
                }
              }
            }

            let allTaxonomiesFlat = [];

            for (const key of Object.keys(allTaxonomies)) {
              const uniqTerms = _.uniqBy(
                allTaxonomies[key].terms,
                tax => tax.slug
              );
              allTaxonomies[key].terms = uniqTerms;
              allTaxonomiesFlat.push(...uniqTerms);
            }

            // create taxonomy pages and pass terms
            _.forOwn(allTaxonomies, function(value, key) {
              const template = `${templatesPath}/taxonomy/archive/${key}.${componentFileType}`;

              let usedTemplate;

              if (existingTemplateFiles.includes(template)) {
                usedTemplate = template;
              } else {
                usedTemplate = `${templatesPath}/taxonomy/archive/index.${componentFileType}`;
              }

              if (existingTemplateFiles.includes(usedTemplate)) {
                createPage({
                  path: value.pathname,
                  component: usedTemplate,
                  context: {
                    taxonomy_slug: key,
                    terms: value.terms
                  }
                });
              }
            });

            // create term pages
            _.each(allTaxonomiesFlat, term => {
              const template = `${templatesPath}/taxonomy/single/${
                term.taxonomy
              }.${componentFileType}`;

              let usedTemplate;

              if (existingTemplateFiles.includes(template)) {
                usedTemplate = template;
              } else {
                usedTemplate = `${templatesPath}/taxonomy/single/index.${componentFileType}`;
              }

              if (existingTemplateFiles.includes(usedTemplate)) {
                createPage({
                  path: term.pathname,
                  component: usedTemplate,
                  context: { slug: term.slug }
                });
              }
            });
          }

          // create post type pages
          _.each(posts, post => {
            const template = `${templatesPath}/${
              post.node.template_slug
            }.${componentFileType}`;

            let usedTemplate;

            if (existingTemplateFiles.includes(template)) {
              usedTemplate = template;
            } else {
              usedTemplate = defaultTemplate;
            }

            if (existingTemplateFiles.includes(usedTemplate)) {
              createPage({
                path: post.node.pathname,
                component: usedTemplate,
                context: {
                  id: post.node.wordpress_id
                }
              });
            } else {
              throw `No default template found at ${usedTemplate} but page ${
                post.node.pathname
              } tried to use it.`;
            }
          });
        })
        .catch(err => {
          throw `
            ${err}
            Either your WP site is down, your WP connection details are wrong or GatsbyPress Admin isn't active on the WP install. This starter will not work properly without fixing those three things. Download the admin theme at https://github.com/TylerBarnes/GatsbyPress-Admin
          `;
        });
    })
    .catch(err => {
      throw `
        ${err}
        Either your WP site is down, your WP connection details are wrong or GatsbyPress Admin isn't active on the WP install. This starter will not work properly without fixing those three things. Download the admin theme at https://github.com/TylerBarnes/GatsbyPress-Admin
      `;
    });
};
