![Wordsby logo](wordsby-logo.png?raw=true "Wordsby Admin logo")

# Wordsby (WIP)

The goal of this project is to make it as easy as possible for WP developers to switch to Gatsby development with absolutely no compromises.

Wordsby Admin commits data and files from your WP instance directly to your gatsby repo. This fixes a lot of the issues around `gatsby-source-wordpress` for large sites.

**NOTE:** I'm using Wordsby in production with no problems, even though it's a WIP. Currently wordsby just works with plain .js files. .jsx, .tsx and .ts files don't work yet.

## Sites built with Wordsby

- [TransitionLink](https://transitionlink.tylerbarnes.ca) [[source]](https://github.com/TylerBarnes/TransitionLinkDocs/)
- [Bare](https://bare.ca)

## Set up

1. Install Wordsby cli with `npm i -g wordsby` or `yarn global add wordsby`
2. Install [Wordsby Admin](https://github.com/TylerBarnes/wordsby-admin), the WordPress admin theme (This is required to use Wordsby).
3. Install the [Wordsby Starter](https://github.com/TylerBarnes/wordsby-starter) (Not 100% required but highly recommended, alternatively fork it and make your own starter).
4. Run `wordsby templates` to generate a json file of templates to upload to your WP install. The command will walk you through the setup for that (for now, run it a few times and fix the errors it brings up until it's setup fully).
5. [Connect your WP instance to your Gatsby repo](https://github.com/TylerBarnes/wordsby/wiki/Github---Gitlab-integration-setup)

Check [the wiki](https://github.com/TylerBarnes/wordsby/wiki) for more info.

## TODO

- Remove need for wordsby-cli
  - get templates via github/gitlab api
  - create reusable circleci config for automatic preview template builds/deploys in WP instead of POSTing a zip
  - consider using post-robot to send preview data to the actual front end in an iframe instead of making a preview build
- Add simple oauth2 connection to github/gitlab api instead of API tokens
- Create better documentation
- Refactor and add automated tests
- Add support for template file extensions other than .js
- Add yarn script to generate generic templates based on user input
- Use gatsby themes for fallback templates using component shadowing?
- Transition starter to gatsby theme?
