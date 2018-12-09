# Wordsby (ALPHA)

The goal of this project is to make it as easy as possible for WP web shops to switch from WordPress development to Gatsby development with absolutely no compromises. I built this so I could migrate the WP webshop I work at to full Gatsby/React as there were originally too many compromises for us to use Gatsby.

## Main Features

- Instant previews from WP admin for all post types
- Easy integration with WordPress forms, comments, and any other WP plugin.
- WP menus just work
- WP permalink structure is used for Gatsby pathnames & links
- WP post/page template dropdown is connected to Gatsby (and vice versa)
- Gatsby template hierarchy with default template support so editors and admins can't break the build
- Edit page permalinks point to your actual Gatsby frontend
- Any post or page can become an archive page with pagination via a checkbox on each post/page edit screen
- Taxonomy term and archive pages are built automatically if there is a template for them in gatsby
- Access to previous / next post names and links via page context for every gatsby page (respects ascending WP menu order, then date order)
- Schema builder to build out your graphql schema and prevent the missing data bug in gatsby that breaks your build when you're missing acf flexible content fields, one post of every post type, and one category.

### Bonus features:

- Improved WP admin theme (no more super long WP admin left menu)
- Automatic unsplash nature avatars for all users
- Faster `gatsby develop` (about 30s faster for me)
- ACF-to-REST plugin is not needed as ACF support is built in

## Sites built with Wordsby

- https://bare.ca
- https://transitionlink.tylerbarnes.ca

## Set up

1. Install wordsby cli with `npm i -g wordsby` or `yarn global add wordsby`
2. Install Wordsby Admin, the WordPress admin theme (This is required to use Wordsby).
3. Download Wordsby Frontend, the Gatsby Wordsby starter (Not 100% required but highly recommended, alternatively make your own starter).

## WordPress admin template dropdown

## Template Hierarchy

## Templates

## Permalink / Path structure

## Menus

## CLI Commands

- `wordsby preview`
  - This generates a preview build of your site and sends it to your WP install
- `wordsby test`
  - This generates a preview build of your site locally for debugging
- `wordsby templates`
  - This generates a list of templates and sends it to your WP install

## Previews

### Wordsby Img (WImg?)

## Debugging previews

1. Add `define('DANGEROUS__WORDSBY_PUBLIC_PREVIEWS', true);` to your wp config.
2. Run `wordsby test` in your project.
3. Open your WordPress site and click preview from the post you want to debug
4. Backspace everything in the url from the forward slash after "/preview/" and replace it with `localhost:8000/`
5. Check your console for debugging info

## Acf options

## Archives & pagination

## Next / Prev posts

## Taxonomies

## Schema Builder

## WordPress forms integration (PHP in JS??)

Psychic Window

## Endpoints

## graphql

## WP Tweaks

### BetterAdmin

### AlwaysAvatars

## Testing / Rough benchmarks

The reason for this section is that we're combining all our posts onto a single massive endpoint called "collections". I thought this might cause problems but it seems to not be an issue.

For the two server environments below, each of the posts contain a hi-res unsplash image (randomly between 1500px to 2560px wide), a few categories, and 10 - 15 paragraphs of content.

My avg download speed is 19mbps using a macbook pro.

### Shared hosting

Bluehost shared hosting seems to work fine up to 7000 posts and no images. It takes about 20 seconds to download all the wordsby endpoint data before getting to the media file download step.

Currently `gatsby-source-wordpress` seems to be set up to be hardcoded at 200 concurrent connections for media files.
Most shared hosting only allows between 20 - 80 concurrent connections which means large sites can't currently use gatsby/WP. Shared hosting works great if you have a smaller number of images.

### VPS

With a mediatemple VPS I was able to run gatsby develop with 9300 posts.
it took about 6mins to run gatsby develop with no cache and download a hires image for each post.
Potentially more posts would be fine but I didn't feel the need to continue making dummy posts beyond 9k.

## Future plans

- ☐ create wordpress plugin that saves endpoints as json and commits them to the gatsby repo on post publish (basically the WP version of netlify cms)
- ☐ make menu, flexible content, and image components importable from wordsby
