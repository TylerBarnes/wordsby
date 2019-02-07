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

- Wordsby Admin commits JSON and media files directly to your git repo (like netlify cms).
- Instant admin editor previews from WP admin for all post types using regular WP preview button
- WP "microservices" using WordPress forms, comments, and any other frontend WP plugin in your gatsby site.
- WP permalink structure is used for Gatsby pathnames & links
- WP menus just work
- No need to edit gatsby-node.js
- Select your gatsby template from within WP
- Basic template hierarchy with default template support so editors and admins can't break the build
- Backend permalinks point to your Gatsby frontend
- Any post or page can become an archive page with pagination via a checkbox on each post/page edit screen
- Taxonomy term and archive pages are built automatically if there is a template for them in gatsby
- Page context contains previous / next post names and links relative to the current page
- Schema builder post type to build out your graphql schema and prevent the missing data bug in gatsby that breaks your build when you're missing acf flexible content fields, one post of every post type, and one category.

### Bonus features:

- Improved WP admin theme
- Automatic unsplash nature avatars for all users
- Faster `gatsby develop` for small to medium sized sites
- ACF-to-REST plugin is not needed as ACF support is built in
