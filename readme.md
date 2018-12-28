
![Wordsby logo](wordsby-logo.png?raw=true "Wordsby Admin logo")

# Wordsby (WIP)
The goal of this project is to make it as easy as possible for WP web shops to switch from WordPress development to Gatsby development with absolutely no compromises. I built this so I could migrate the WP webshop I work at to full Gatsby/React as there were originally too many compromises and too much friction for us to use Gatsby.

**NOTE:** I'm using Wordsby in production with no problems, even though it's a WIP. Currently wordsby just works with plain .js files. .jsx, .tsx and .ts files don't work yet.

## Sites built with Wordsby

- [TransitionLink](https://transitionlink.tylerbarnes.ca)
- [Bare](https://bare.ca)

## Set up

1. Install Wordsby cli with `npm i -g wordsby` or `yarn global add wordsby`
2. Install [Wordsby Admin](https://github.com/TylerBarnes/wordsby-admin), the WordPress admin theme (This is required to use Wordsby).
3. Install the [Wordsby Starter](https://github.com/TylerBarnes/wordsby-starter) (Not 100% required but highly recommended, alternatively fork it and make your own starter).
4. Run `wordsby templates` to generate a json file of templates to upload to your WP install. The command will walk you through the setup for that (for now, run it a few times and fix the errors it brings up until it's setup fully).

Check [the wiki](https://github.com/TylerBarnes/wordsby/wiki) for usage info.
