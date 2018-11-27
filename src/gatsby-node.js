const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const createTemplatesJson = require("./preview/createTemplatesJson");
const deepmerge = require("deepmerge");
const paginate = require("gatsby-awesome-pagination").paginate;

const componentFileType = "js";
const templatesPath = path.resolve(`./src/templates/`);
const defaultTemplate = `${templatesPath}/index.js`;

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
      allWordpressWpCollections(filter: { post_status: { eq: "publish" } }) {
        edges {
          node {
            wordpress_id
            pathname
            post_type
            template_slug
            acf {
              is_archive
              posts_per_page
              post_type
            }
          }
        }
      }

      allWordpressWpTaxTerms {
        edges {
          node {
            name
            pathname
            terms {
              slug
              name
              taxonomy
              wordpress_id
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

      const posts = result.data.allWordpressWpCollections.edges.filter(
        ({ node: post }) => post.post_type !== "dummy"
      );

      // create post type pages
      _.each(posts, post => {
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
                id: post.node.wordpress_id,
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

          if (existingTemplateFiles.includes(usedTemplate)) {
            createPage({
              path: post.node.pathname,
              component: usedTemplate,
              context: {
                id: post.node.wordpress_id
              }
            });
          } else {
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
        const taxonomies = result.data.allWordpressWpTaxTerms.edges;

        taxonomies.map(({ node: taxonomy }) => {
          const { name, pathname, terms } = taxonomy;
          const template = `${templatesPath}/taxonomy/archive/${name}.${componentFileType}`;

          let usedTemplate;

          if (existingTemplateFiles.includes(template)) {
            usedTemplate = template;
          } else {
            usedTemplate = `${templatesPath}/taxonomy/archive/index.${componentFileType}`;
          }

          if (
            existingTemplateFiles.includes(usedTemplate) &&
            terms.length > 0
          ) {
            // create taxonomy archives
            createPage({
              path: pathname,
              component: usedTemplate,
              context: {
                taxonomy_slug: name,
                terms: terms
              }
            });
          }

          terms &&
            terms.map(term => {
              const { pathname, taxonomy, slug, wordpress_id } = term;

              const template = `${templatesPath}/taxonomy/single/${taxonomy}.${componentFileType}`;

              let usedTemplate;

              if (existingTemplateFiles.includes(template)) {
                usedTemplate = template;
              } else {
                usedTemplate = `${templatesPath}/taxonomy/single/index.${componentFileType}`;
              }

              if (existingTemplateFiles.includes(usedTemplate)) {
                // create term pages
                createPage({
                  path: pathname,
                  component: usedTemplate,
                  context: { slug: slug, wordpress_id: wordpress_id }
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
