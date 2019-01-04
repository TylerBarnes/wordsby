const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const createTemplatesJson = require("./createTemplatesJson");
const paginate = require("gatsby-awesome-pagination").paginate;

// const componentFileType = "js";
const templatesPath = path.resolve(`./src/templates/`);
const defaultTemplate = `${templatesPath}/index.js`;
const createPreviewPages = require("./createPreviewPages");
const getFirstExistingTemplate = require("./utils/getFirstExistingTemplate");
const shouldIgnorePath = require("./utils/shouldIgnorePath");

let existingTemplateFiles = glob.sync(`${templatesPath}/**/*.js`, {
  dot: true
});

createTemplatesJson({ existingTemplateFiles, templatesPath });

module.exports = ({ actions, graphql }, { ignorePaths }) => {
  const { createPage } = actions;

  if (!fs.existsSync(defaultTemplate)) {
    throw `default template doesn't exist at ${defaultTemplate}`;
  }

  createPreviewPages({
    existingTemplateFiles,
    createPage,
    graphql,
    ignorePaths
  });

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
            acf {
              is_archive
              posts_per_page
              post_type
            }
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
    }
  `)
    .then(result => {
      if (result.errors) {
        result.errors.forEach(e => console.error(e.toString()));
        return Promise.reject(result.errors);
      }

      const posts = result.data.allWordsbyCollections.edges.filter(
        ({ node: post }) => post.post_type !== "schema_builder"
      );

      // create post type pages
      _.each(posts, (post, index) => {
        const {
          node: { template_slug, pathname }
        } = post;

        if (shouldIgnorePath({ ignorePaths, pathname })) return true;

        const acf = post.node.acf;
        const archivePostType = acf && acf.post_type ? acf.post_type : false;
        const isArchive = !!acf && !!acf.is_archive;

        if (!isArchive) {
          const template = getFirstExistingTemplate([template_slug, `index`]);
          if (template) {
            createPage({
              path: post.node.pathname,
              component: template,
              context: {
                id: post.node.ID,
                previousPost:
                  typeof posts[index - 1] !== "undefined"
                    ? posts[index - 1].node
                    : {},
                nextPost:
                  typeof posts[index + 1] !== "undefined"
                    ? posts[index + 1].node
                    : {}
              }
            });
          }
        }

        if (isArchive) {
          const archivePosts = posts.filter(
            ({ node }) => node.post_type === archivePostType
          );

          const itemsPerPage = parseInt(acf.posts_per_page);

          let template = getFirstExistingTemplate([
            `archive/${archivePostType}`,
            "archive/index"
          ]);

          if (template) {
            paginate({
              createPage: createPage,
              component: usedTemplate,
              items: archivePosts,
              itemsPerPage: itemsPerPage,
              pathPrefix: post.node.pathname.replace(/\/$/, ""),
              context: {
                archive: true,
                id: post.node.ID,
                post_type: post.node.acf.post_type
              }
            });
          }
        }
      });

      const weShouldGenerateTaxonomyPages = existingTemplateFiles.some(item =>
        item.includes("/taxonomy/")
      );

      if (weShouldGenerateTaxonomyPages) {
        const taxonomies = result.data.allWordsbyTaxTerms.edges;

        _.each(taxonomies, ({ node: taxonomy }) => {
          const { name, pathname, terms, label } = taxonomy;

          if (shouldIgnorePath({ ignorePaths, pathname })) return true;

          const template = getFirstExistingTemplate([
            `taxonomy/archive/${name}`,
            `taxonomy/archive/index`
          ]);

          if (template && terms.length > 0) {
            // create taxonomy archives
            createPage({
              path: pathname,
              component: template,
              context: {
                taxonomy_slug: name,
                taxonomy_name: label,
                terms: terms
              }
            });
          }

          terms &&
            _.each(terms, term => {
              const { pathname, taxonomy, slug, name, ID } = term;

              if (shouldIgnorePath({ ignorePaths, pathname })) return true;

              const template = getFirstExistingTemplate([
                `taxonomy/single/${taxonomy}`,
                `taxonomy/single/index`
              ]);

              if (template) {
                // create term pages
                createPage({
                  path: pathname,
                  component: template,
                  context: {
                    label: name,
                    slug: slug,
                    wordpress_id: ID
                  }
                });
              }
            });
        });
      }
    })
    .catch(err => {
      throw `
            ${err}
            If the error above isn't descriptive enough maybe your WP site is down, your WP connection details are wrong or Wordsby Admin isn't active on your WP install. Download the admin theme at https://github.com/TylerBarnes/GatsbyPress-Admin
          `;
    });
};
