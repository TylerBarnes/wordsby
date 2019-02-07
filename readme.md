![Wordsby logo](wordsby-logo.png?raw=true "Wordsby Admin logo")

# Wordsby (WIP)

The goal of this project is to make it as easy as possible for WP developers to switch to Gatsby development with absolutely no compromises.

Wordsby Admin commits data and files from your WP instance directly to your gatsby repo. This fixes a lot of the issues around `gatsby-source-wordpress` for large sites.

**NOTE:** I'm using Wordsby in production with no problems, even though it's a WIP. Currently wordsby just works with plain .js files. .jsx, .tsx and .ts files don't work yet.

## Sites built with Wordsby

- [TransitionLink](https://transitionlink.tylerbarnes.ca) [[source]](https://github.com/TylerBarnes/TransitionLinkDocs/)
- [Bare](https://bare.ca)

## Set up

1. Install [Wordsby Admin](https://github.com/TylerBarnes/wordsby-admin), the WordPress admin theme.
2. Install the [Wordsby Starter](https://github.com/TylerBarnes/wordsby-starter) with `gatsby new wordsby-starter https://github.com/TylerBarnes/wordsby-starter`.
3. [Connect your WP instance to your Gatsby repo](https://github.com/TylerBarnes/wordsby/wiki/Github---Gitlab-integration-setup).

Check [the wiki](https://github.com/TylerBarnes/wordsby/wiki) for more info.

## Feature list

- WordPress data and media files are commited directly to your git repo (like netlify cms).
- The admin preview button just works
- Use WP "microservices" with WordPress forms, comments, and any other frontend WP plugin.
- Page url structure is taked from WordPress permalinks
- WP menus work out of the box using `<MenuItems slug="menu-slug" />`
- No need to edit gatsby-node.js as the site structure is taken from WordPress
- WordPress page template picker is connected to Gatsby
- Basic template hierarchy with fallback template support so editors and admins can't break the build by selecting the wrong template
- Yoast SEO support using the `<Yoast />` component.
- Backend view page links point to your Gatsby frontend
- Any post or page can become an archive page with pagination via a checkbox on each post/page edit screen
- Taxonomy term and archive pages are built automatically if there is a template for them in gatsby
- Page context contains previous / next post names and links relative to the current page
- Schema builder post type to build out your graphql schema and prevent the missing data bug in gatsby that breaks your build when you're missing acf flexible content fields, one post of every post type, and one category.
- Ability to run your 5,000+ page WordPress site on $2/month shared hosting and get the performance of a finely tuned VPS

### Bonus features:

- Improved WP admin theme
- Automatically downloaded unsplash nature avatars for all users
- Faster `gatsby develop` for small to medium sized sites since images & data are always local
- ACF-to-REST and WP-API-Menus plugins are not needed as ACF/menu support is built in
