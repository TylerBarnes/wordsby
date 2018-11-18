import React from "react";
import { Link, StaticQuery, graphql } from "gatsby";

export default ({ slug: propSlug, children }) => {
  return (
    <>
      {propSlug ? (
        <StaticQuery
          query={graphql`
            {
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
          render={({ allWordpressWpApiMenusMenusItems: wpmenu }) => {
            const menu = wpmenu.edges.filter(
              ({ node }) => node.slug === propSlug
            );

            const items = menu.length > 0 ? menu[0].node.items : false;

            if (children) {
              return children(items);
            }

            return items ? (
              <div className="">
                {items.map(item => (
                  <Link key={`menu-item-${item.wordpress_id}`} to={item.url}>
                    {item.title}
                  </Link>
                ))}
              </div>
            ) : (
              <h2>
                {propSlug} doesn't return anything. Maybe you have a spelling
                error?
              </h2>
            );
          }}
        />
      ) : (
        <h2>Add a WP menu slug to return menu items.</h2>
      )}
    </>
  );
};
