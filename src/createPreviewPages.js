const _ = require("lodash");
const shouldIgnorePath = require("./utils/shouldIgnorePath");

function createPreviewPages({
  existingTemplateFiles,
  createPage,
  graphql,
  ignorePaths
}) {
  // remove taxonomies from previews
  existingTemplateFiles = existingTemplateFiles.filter(
    template => !template.includes("/taxonomy/")
  );

  return graphql(`
    {
      wpUrl: wordsbySiteMeta(key: { eq: "url" }) {
        value
      }

      wordsbyCollections(post_status: { eq: "publish" }) {
        wordpress_id: ID
      }

      allWordsbyCollections(filter: { post_status: { eq: "publish" } }) {
        edges {
          node {
            wordpress_id: ID
            template_slug
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

        const pathname = `/preview${
          folderName !== "/templates" ? folderName : ""
        }/${fileName}`;

        if (shouldIgnorePath({ ignorePaths, pathname })) return true;

        createPage({
          path: pathname,
          component: template,
          context: {
            id: result.data.wordsbyCollections.wordpress_id,
            preview: true,
            env: process.env.NODE_ENV,
            siteUrl: result.data.wpUrl.value
          }
        });
      });
    })
    .catch(err => {
      console.log(err);
      throw "There was a problem building the WP preview templates";
    });
}

module.exports = createPreviewPages;
