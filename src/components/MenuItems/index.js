import React from "react";
import { Link, StaticQuery, graphql } from "gatsby";

export default ({ slug: propSlug, children }) => {
  return propSlug ? (
    <StaticQuery
      query={graphql`
        {
          wordpressSiteMetadata {
            url
          }
          allWordpressWpApiMenusMenusItems {
            edges {
              node {
                slug
                items {
                  title
                  url
                  wordpress_id
                }
              }
            }
          }
        }
      `}
      render={({
        allWordpressWpApiMenusMenusItems: wpmenu,
        wordpressSiteMetadata: { url }
      }) => {
        const menu = wpmenu.edges.filter(({ node }) => node.slug === propSlug);

        const items = menu.length > 0 ? menu[0].node.items : false;

        // remove the WP site url from menu links.
        for (const item of items) {
          item.url = item.url.replace(url, "");
        }

        return items ? (
          children ? (
            children(items)
          ) : (
            <>
              {items.map(item => (
                <Link key={`menu-item-${item.wordpress_id}`} to={item.url}>
                  {item.title}
                </Link>
              ))}
            </>
          )
        ) : (
          <h2>
            slug="
            {propSlug}" doesn't return menu items.
            <br />
            Maybe you have a spelling error?
          </h2>
        );
      }}
    />
  ) : (
    <h2>Add a WP menu slug to return menu items.</h2>
  );
};
