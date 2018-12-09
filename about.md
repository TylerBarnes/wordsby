# Wordsby

## Overview

## Sites built with Wordsby

- https://bare.ca
- https://transitionlink.tylerbarnes.ca

## cli

- `wordsby preview`
- `wordsby test`
- `wordsby templates`

## Set up

## Previews

### Wordsby Img (WImg?)

## Debugging previews

1. Add `define('DANGEROUS__WORDSBY_PUBLIC_PREVIEWS', true);` to your wp config.
2. Run `wordsby test` in your project.
3. Open your WordPress site and click preview from the post you want to debug
4. Backspace everything in the url from the forward slash after "/preview/" and replace it with `localhost:8000/`
5. Check your console for debugging info

## Template Hierarchy

## Templates

## Permalink / Path structure

## Menus

## Acf options

## Archives & pagination

## Next / Prev posts

## Taxonomies

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
