const React = require("react");
const Preview = require("./components/Preview").default;

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapPageElement = ({ element, props }) => {
  if (props.pageContext && props.pageContext.preview) {
    return <Preview {...props}>{element}</Preview>;
  } else {
    return element;
  }
};

exports.disableCorePrefetching = () =>
  process.env.WORDSBY_PREVIEW ? true : false;
