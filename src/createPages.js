const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const createTemplatesJson = require("./createTemplatesJson");
const paginate = require("gatsby-awesome-pagination").paginate;

const componentFileType = "js";
const templatesPath = path.resolve(`./src/templates/`);
const defaultTemplate = `${templatesPath}/index.js`;
const createPreviewPages = require("./createPreviewPages");

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
    graphql
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
      posts.forEach((post, index) => {
        const template = `${templatesPath}/${
          post.node.template_slug
        }.${componentFileType}`;

        const acf = post.node.acf;

        const archivePostType = acf ? post.node.acf.post_type : false;

        if (acf && acf.is_archive) {
          const archivePosts = posts.filter(
            ({ node }) => node.post_type === archivePostType
          );

          const itemsPerPage = parseInt(acf.posts_per_page);
          const defaultArchiveTemplate = `${templatesPath}/archive/index.${componentFileType}`;
          const postTypeArchiveTemplate = `${templatesPath}/archive/${archivePostType}.${componentFileType}`;

          let usedTemplate;

          if (existingTemplateFiles.includes(postTypeArchiveTemplate)) {
            usedTemplate = postTypeArchiveTemplate;
          } else {
            usedTemplate = defaultArchiveTemplate;
          }

          if (existingTemplateFiles.includes(usedTemplate)) {
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
          } else {
            console.warn(
              `No template found at ${usedTemplate} but page ${
                post.node.pathname
              } tried to use it.`
            );
          }
        } else {
          let usedTemplate;

          if (existingTemplateFiles.includes(template)) {
            usedTemplate = template;
          } else {
            usedTemplate = defaultTemplate;
          }

          let shouldIgnorePath = false;

          if (!!ignorePaths && ignorePaths.length) {
            ignorePaths.forEach(path => {
              const match = new RegExp(path);
              if (match.test(post.node.pathname)) {
                shouldIgnorePath = true;
              }
            });
          }

          if (
            existingTemplateFiles.includes(usedTemplate) &&
            !shouldIgnorePath
          ) {
            createPage({
              path: post.node.pathname,
              component: usedTemplate,
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
          } else if (!existingTemplateFiles.includes(usedTemplate)) {
            console.warn(
              `No template found at ${usedTemplate} but page ${
                post.node.pathname
              } tried to use it.`
            );
          }
        }
      });

      const weShouldGenerateTaxonomyPages = existingTemplateFiles.some(item =>
        item.includes("/taxonomy/")
      );

      if (weShouldGenerateTaxonomyPages) {
        const taxonomies = result.data.allWordsbyTaxTerms.edges;

        taxonomies.map(({ node: taxonomy }) => {
          const { name, pathname, terms, label } = taxonomy;
          const template = `${templatesPath}/taxonomy/archive/${name}.${componentFileType}`;

          let usedTemplate;

          if (existingTemplateFiles.includes(template)) {
            usedTemplate = template;
          } else {
            usedTemplate = `${templatesPath}/taxonomy/archive/index.${componentFileType}`;
          }

          let shouldIgnorePath = false;

          if (!!ignorePaths && ignorePaths.length) {
            ignorePaths.forEach(path => {
              const match = new RegExp(path);
              if (match.test(pathname)) {
                shouldIgnorePath = true;
              }
            });
          }

          if (
            existingTemplateFiles.includes(usedTemplate) &&
            terms.length > 0 &&
            !shouldIgnorePath
          ) {
            // create taxonomy archives
            createPage({
              path: pathname,
              component: usedTemplate,
              context: {
                taxonomy_slug: name,
                taxonomy_name: label,
                terms: terms
              }
            });
          }

          terms &&
            terms.map(term => {
              const { pathname, taxonomy, slug, name, ID } = term;

              const template = `${templatesPath}/taxonomy/single/${taxonomy}.${componentFileType}`;

              let usedTemplate;

              if (existingTemplateFiles.includes(template)) {
                usedTemplate = template;
              } else {
                usedTemplate = `${templatesPath}/taxonomy/single/index.${componentFileType}`;
              }

              let shouldIgnorePath = false;

              if (!!ignorePaths && ignorePaths.length) {
                ignorePaths.forEach(path => {
                  const match = new RegExp(path);
                  if (match.test(pathname)) {
                    shouldIgnorePath = true;
                  }
                });
              }

              if (
                existingTemplateFiles.includes(usedTemplate) &&
                !shouldIgnorePath
              ) {
                // create term pages
                createPage({
                  path: pathname,
                  component: usedTemplate,
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
