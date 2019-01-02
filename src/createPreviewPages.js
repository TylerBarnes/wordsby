function createPreviewPages({ existingTemplateFiles, createPage, graphql }) {
  // remove taxonomies from previews
  existingTemplateFiles = existingTemplateFiles.filter(
    template => !template.includes("/taxonomy/")
  );

  return graphql(`
    {
      wordsbyCollections {
        wordpress_id: ID
      }
    }
  `)
    .then(result => {
      if (result.errors) {
        result.errors.forEach(e => console.error(e.toString()));
        return Promise.reject(result.errors);
      }

      const {
        data: {
          site: {
            siteMetadata: { siteUrl }
          }
        }
      } = result;

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
            id: result.data.wordsbyCollections.wordpress_id,
            preview: true,
            env: process.env.NODE_ENV,
            siteUrl: siteUrl
          }
        });
      });
    })
    .catch(err => {
      throw "There was a problem building the WP preview templates";
    });
}

export default createPreviewPages;