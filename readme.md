![Wordsby logo](wordsby-logo.png?raw=true "Wordsby Admin logo")

# Wordsby (WIP)

The goal of this project is to make it as easy as possible for WP developers to switch to Gatsby development with absolutely no compromises.

Wordsby Admin commits data and files from your WP instance directly to your gatsby repo. This fixes a lot of the issues around `gatsby-source-wordpress` for large sites.

**NOTE:** I'm using Wordsby in production with no problems, even though it's a WIP. Currently wordsby just works with plain .js files. .jsx, .tsx and .ts files don't work yet.

## Sites built with Wordsby

- [TransitionLink](https://transitionlink.tylerbarnes.ca) [[source]](https://github.com/TylerBarnes/TransitionLinkDocs/)
- [Bare](https://bare.ca)

## Set up

1. Install [Wordsby Admin](https://github.com/TylerBarnes/wordsby-admin), the WordPress admin theme (This is required to use Wordsby).
2. Install the [Wordsby Starter](https://github.com/TylerBarnes/wordsby-starter) (Not 100% required but highly recommended, alternatively fork it and make your own starter).
3. [Connect your WP instance to your Gatsby repo](https://github.com/TylerBarnes/wordsby/wiki/Github---Gitlab-integration-setup)

Check [the wiki](https://github.com/TylerBarnes/wordsby/wiki) for more info.
