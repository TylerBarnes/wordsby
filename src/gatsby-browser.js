const React = require("react");
const Preview = require("./components/Preview").default;
const InstantPublish = require("./components/InstantPublish").default;
const PageElement = require("./components/PageElement").default;

exports.wrapPageElement = ({ element, props }, pluginOptions) => {
  if (props.pageContext && props.pageContext.preview) {
    return (
      <Preview {...props}>
        <PageElement {...props}>{element}</PageElement>
      </Preview>
    );
  } else if (
    !!pluginOptions &&
    (pluginOptions.instantPublish !== false ||
      typeof pluginOptions.instantPublish === "undefined") &&
    (process.env.NODE_ENV !== "development" ||
      pluginOptions.instantPublish === "debug")
  ) {
    return (
      <InstantPublish
        debug={
          pluginOptions.instantPublish === "debug" &&
          process.env.NODE_ENV === "development"
        }
        {...props}
      >
        <PageElement {...props}>{element}</PageElement>
      </InstantPublish>
    );
  } else {
    return <PageElement {...props}>{element}</PageElement>;
  }
};

const {
  imageClass,
  imageBackgroundClass,
  imageWrapperClass
} = require(`./constants`);

// This is for inline WP images
exports.onRouteUpdate = () => {
  const imageWrappers = document.querySelectorAll(`.${imageWrapperClass}`);

  // https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/
  // for cross-browser looping through NodeList without polyfills
  for (let i = 0; i < imageWrappers.length; i++) {
    const imageWrapper = imageWrappers[i];

    const backgroundElement = imageWrapper.querySelector(
      `.${imageBackgroundClass}`
    );
    const imageElement = imageWrapper.querySelector(`.${imageClass}`);

    const onImageLoad = () => {
      backgroundElement.style.transition = `opacity 0.5s 0.5s`;
      backgroundElement.style.opacity = 0;
      imageElement.style.transition = `opacity 0.5s`;
      imageElement.style.opacity = 1;
      imageElement.removeEventListener(`load`, onImageLoad);
    };

    if (imageElement.complete) {
      backgroundElement.style.opacity = 0;
    } else {
      imageElement.style.opacity = 0;
      imageElement.addEventListener(`load`, onImageLoad);
    }
  }
};

exports.onClientEntry = () => import("isomorphic-fetch");
