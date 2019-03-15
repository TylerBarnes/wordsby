const PageElement = require("./components/PageElement").default;
const Preview = require("./components/Preview").default;
const React = require("react");

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapPageElement = ({ element, props }) => {
  if (props.pageContext && props.pageContext.preview) {
    return (
      <Preview {...props}>
        <PageElement>{element}</PageElement>
      </Preview>
    );
  } else {
    return <PageElement {...props}>{element}</PageElement>;
  }
};
