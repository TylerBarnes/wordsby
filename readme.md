# Wordsby (WIP)
The goal of this project is to make it as easy as possible for WP web shops to switch from WordPress development to Gatsby development with absolutely no compromises. I built this so I could migrate the WP webshop I work at to full Gatsby/React as there were originally too many compromises and too much friction for us to use Gatsby.

**NOTE:** I'm using Wordsby in production with no problems, even though it's a WIP. Currently wordsby just works with plain .js files. .jsx, .tsx and .ts files don't work yet.

![Wordsby logo](wordsby-logo.png?raw=true "Wordsby Admin logo")

## Sites built with Wordsby

- [TransitionLink](https://transitionlink.tylerbarnes.ca)
- [Bare](https://bare.ca)

## Main Features

- Instant previews from WP admin for all post types
- Easy integration with WordPress forms, comments, and any other WP plugin.
- WP permalink structure is used for Gatsby pathnames & links
- WP menus work
- WP post/page template dropdown is connected to Gatsby
- Basic template hierarchy with default template support so editors and admins can't break the build
- Edit page permalinks point to your actual Gatsby frontend
- Any post or page can become an archive page with pagination via a checkbox on each post/page edit screen
- Taxonomy term and archive pages are built automatically if there is a template for them in gatsby
- Page context contains previous / next post names and links relative to the current page
- Schema builder to build out your graphql schema and prevent the missing data bug in gatsby that breaks your build when you're missing acf flexible content fields, one post of every post type, and one category.

### Bonus features:

- Improved WP admin theme
- Automatic unsplash nature avatars for all users
- Faster `gatsby develop` for small to medium sized sites
- ACF-to-REST plugin is not needed as ACF support is built in

### Future plans:

- WP endpoints and media files will be commited directly to your Gatsby repo like netlify CMS.

## Sites built with Wordsby

- https://transitionlink.tylerbarnes.ca
- https://bare.ca

## Set up

1. Install Wordsby cli with `npm i -g wordsby` or `yarn global add wordsby`
2. Install [Wordsby Admin](https://github.com/TylerBarnes/wordsby-admin), the WordPress admin theme (This is required to use Wordsby).
3. Install the [Wordsby Starter](https://github.com/TylerBarnes/wordsby-starter) (Not 100% required but highly recommended, alternatively fork it and make your own starter).
4. Run `wordsby templates` to generate a json file of templates to upload to your WP install. The command will walk you through the setup for that (for now, run it a few times and fix the errors it brings up until it's setup fully).

## CLI Commands

- `wordsby templates` generates a list of templates and sends it to your WP install template dropdown. Note that running this command will delete any previews currently uploaded to your WP install. This command is useful for first time setup.
- `wordsby preview` generates a preview build of your site and POSTS's it to your WP install. It also sends template data to your WP install.
- `wordsby preview-local` generates a preview build and saves it as a zip locally for manual upload to your WP install (at public_html/preview) in case you can't increase the `max_post_size` on your server
- `wordsby test` generates a preview build of your site locally for debugging preview templates

## Permalink / Path Structure

Wordsby uses the WP permalink structure you've set up in your WP install. The base url is stripped from all links and the leftover pathname is used to create Gatsby pages. This means any regular WP internal links or menus will just work out of the box.

## One "collections" endpoint for all Pages, posts, and custom post types
Instead of an endpoint for each post type, Wordsby puts all post types and pages onto a single endpoint.
It's available at `wp-json/wp/v1/collections`.

Query it like so:

```graphql
query HomeTemplate($id: Int!) {
  wordpressWpCollections(wordpress_id: { eq: $id }) {
    post_title
  }
}
```

or

```graphql
query BlogTemplate($post_type: String!) {
  allWordpressWpCollections(filter: { post_type: { eq: $post_type } }) {
    edges {
      node {
        post_title
      }
    }
  }
}
```

## Templates

Templates are named in WP by replacing underscores and dashes from the filename with spaces.
`template-name.js` in gatsby becomes `Template name` in WP.

## Template Hierarchy

For the most part the WP template hierarchy is overkill. Wordsby just includes a few parts of a hierarchy to make dev easier. This will likely be expanded a bit as the project evolves.

### Pages, posts, and custom post types template hierarchy

Using the default template in WP admin will cause wordsby to grab the `src/templates/index.js` file.

Setting another template from the dropdown will make wordsby check for `src/templates/[template-name].js` and fallback to `src/templates/index.js`.

Make sure you create a basic index.js to prevent your site from being broken by admins.

### Single Page and Post type template hierarchy

To create a template for a post type, add it to `src/templates/single/[post_type].js` and set the post to use the default template.
If there is nothing found there, Wordsby will use the default Gatsby template at `src/templates/index.js`.
If you set your post to a template besides "Default Template" in wp admin, the hierarchy in the last section applies.

### Archive page template hierarchy

To set up an archive page:

- Go to the page/post that you want to make an archive
- Check the archive metabox on the page or post you want to be an archive page
- Set the posts per page, and post type in the same metabox.

Wordsby will look for `src/templates/archive/[post_type_slug].js`. If it isn't found, it will grab `src/templates/archive/index.js`.

### Taxonomy archive template hierarchy

If you don't have a `src/templates/taxonomy` directory, Wordsby will not generate taxonomy archives or term pages.

If you have a taxonomy folder, Wordsby will look for `src/templates/taxonomy/archive/[taxonomy_name].js`. If it isn't found it'll grab `src/templates/taxonomy/archive/index.js`

If you're creating taxonomy archive or term pages, be sure to include an index.js to prevent your site from being breakable by admins.

### Taxonomy term template hierarchy

The rules surrounding the taxonomy directory are the same as above.

If you have a taxonomy folder, Wordsby will look for `src/templates/taxonomy/single/[taxonomy_name].js`. If it isn't found it'll grab `src/templates/taxonomy/single/index.js`

### Here's a directory overview of what you just read

```bash
├──src/
│   ├── templates/
│   │   ├── index.js
│   │   ├── home.js
│   │   ├── archive/
│   │   │   ├── index.js
│   │   │   ├── post.js
│   │   ├── single/
│   │   │   ├── page.js
│   │   │   ├── custom_post_type.js
│   │   ├── taxonomy/
│   │   │   ├── archive/
│   │   │   │   ├── index.js
│   │   │   │   ├── taxonomy_name.js
│   │   │   ├── single/
│   │   │   │   ├── index.js
│   │   │   │   ├── taxonomy_name.js
└────────────────────────────────
```

## WordPress admin template dropdown

The dropdown here is populated from a json file that's sent to your WP install by running `wordsby templates` or `wordsby preview`.

## Menus

The plugin `WP API Menus` is force installed with TGM plugin activator.
You can call menus by their slug using the Wordsby component `<MenuItems />`

```jsx
import MenuItems from "../wordsby/MenuItems";
```

For simplicity you can use `<MenuItems slug="slug-name" />` to return a group of gatsby links wrapped in `<li>` tags.

For more control use children as a function to get the menu items:

```jsx
<MenuItems slug="main-menu">
  {items => {
    return items.map(({ url, active, activeParent, title }) => (
      <Link
        key={url}
        to={url}
        className={active || activeParent ? "active" : ""}
      >
        {title}
      </Link>
    ));
  }}
</MenuItems>
```

## Previews

Previews are generated and POST'd to your WP install by using wordsby cli.
Run `wordsby preview` in your project to send up your preview build.

Wordsby builds a separate version of your site to make previews possible.
It loops through all your templates and builds a page for each, then zips the public folder and POST's it to your WP install. Each template is wrapped in a preview component which feeds live REST api data to your templates. Click "Preview" in WP admin to get a live preview.

Note that each template will just use the first page or post Wordsby finds during `gatsby build`. This means you have to be sure that missing data wont break your build but it will be obvious if it does.

### Wordsby Img

You need to use Wordsby Img to make images show up in previews. Because the previews use live REST api data, they wont have any graphql magic. Wordsby Img checks the field you've passed in to see if it has a fluid or fixed gatsby-image query. If it does it adds the Gatsby Img component. If it doesn't, it passes through the field image URL of the hi-res image to an img tag wrapped in some markup/styles that emulate Gatsby Img.

```jsx
import { Img } from "wordsby-components";
```

Query as if you were using the regular Gatsby Img component but pass in the entire field structure instead of passing fluid or fixed.

```graphql
query {
...
image {
        localFile {
        childImageSharp {
            fixed(width: 136, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
        }
    }
}
...
}
```

```jsx
<Img field={image} />
```

## Debugging previews

If you're having issues with your previews you can debug with the following steps.

1. Add `define('DANGEROUS__WORDSBY_PUBLIC_PREVIEWS', true);` to your wp-config.php.
2. Run `wordsby test` in your project.
3. Open your WordPress site and click preview from the post you want to debug
4. Backspace everything in the url from the forward slash after "/preview/" and replace it with `localhost:8000/`
5. Check your console for debugging info
6. Once you're finished, remove `define('DANGEROUS__WORDSBY_PUBLIC_PREVIEWS', true);` from your wp-config.php.

## Acf options

Wordsby has built in ACF options page support at the endpoint `/wp-json/wp/v1/all-options`.

In graphql, all options will be accessible at the root level, not grouped by options page.

## Next / Prev posts

All single pages receive pageContext containing the next / previous post. The data contains post type, pathname, page title, and wordpress ID.

For next / prev posts links in a blog you can access this data and just check if the links are of the same post type of the current page to only show next / prev links within a post type.

```jsx
{
  !!nextPost && nextPost.post_type === "case_study" && (
    <Link to={nextPost.pathname}>{nextPost.post_title}</Link>
  );
}
```

## Taxonomies

Check the template hierarchy info above for more information on templating.
All posts / pages will have a list of taxonomies and terms attached to them along with a pathname / term title for linking.

## Schema Builder

Removing all posts or querying ACF flexible content that isn't set on one post will usually break a Gatsby site's build. Schema builder is a post type where you can fill all the fields you want to be part of your schema wether they exist yet or not. This post type is filtered out and pages aren't created for it. If you query for all post types at once, you'll need to filter it out yourself.

You can build your schema from the WP backend by going to `Development->Schema Builder`

## WordPress plugins integration

Because transitioning from WP to Gatsby means you lose out on the good / easy parts of WP, Wordsby includes a component (PsychicWindow) for displaying iframes of WP content using [`post-robot`](https://github.com/krakenjs/post-robot) by PayPal.

Our `<PyschicWindow />` component sends CSS to the iframe via `post-robot` and it receives the full height of the iframe contents back. Because we have the exact height of the iframe, there are no scrollbars and the form, comments section, or other plugin bit blends seamlessly with your Gatsby site.
Children of this component are for displaying a placeholder while the iframe loads.

1. Go to `Development->Psychic Window` in the WP admin area.
2. Create a post using some kind of form or other shortcode
3. Copy the url to your PsychicWindow and use it in your Gatsby project

```jsx
import { PsychicWindow } from "wordsby-components";
```

```jsx
<PsychicWindow url="http://wordsby.test/psychic-window/contact-form-7-example/">
  <PlaceholderComponent />
</PsychicWindow>
```

Pass CSS to your iframe

```jsx
<PsychicWindow
  url="http://wordsby.test/psychic-window/contact-form-7-example/"
  windowCSS={`
        html {
          background: rebeccapurple;
        }
        `}
>
  <PlaceholderComponent />
</PsychicWindow>
```

## Endpoints

...to be written.

## graphql

...to be written.

## WP Tweaks

...to be written.

### BetterAdmin

...to be written.

### AlwaysAvatars

...to be written.

## Testing / Rough benchmarks

The reason for this section is that we're combining all our posts onto a single massive endpoint called "collections". I thought this might cause problems but it seems to not be an issue.

For the two server environments below, each of the posts contain a hi-res unsplash image (randomly between 1500px to 2560px wide), a few categories, and 10 - 15 paragraphs of content.

My avg download speed is 19mbps using a macbook pro.

### Shared hosting

Bluehost shared hosting seems to work fine up to 7000 posts and no images. It takes about 20 seconds to download all the wordsby endpoint data before getting to the media file download step.

Currently `gatsby-source-wordpress` seems to be set up to be hardcoded at 200 concurrent connections for media files.
Most shared hosting only allows between 20 - 80 concurrent connections which means large sites can't currently use gatsby/WP on shared hosting. Shared hosting works great if you have a smaller number of images.

### VPS

With a mediatemple VPS I was able to run gatsby develop with 9300 posts.
it took about 6mins to run gatsby develop with no cache and download a hires image for each post.
Potentially more posts would be fine but I didn't feel the need to continue making dummy posts beyond 9k.
