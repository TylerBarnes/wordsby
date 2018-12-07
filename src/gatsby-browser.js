const React = require("react");
const Preview = require("./components/Preview").default;

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapPageElement = ({ element, props }) => {
  return props.pageContext && props.pageContext.preview ? (
    <Preview {...props}>{element}</Preview>
  ) : (
    element
  );
};

exports.disableCorePrefetching = () =>
  process.env.WORDSBY_PREVIEW ? true : false;
