const React = require("react");
const Preview = require("./components/Preview").default;
const InternalProvider = require("./context/InternalProvider").default;
const Consumer = require("./context/createWordsbyContext").Consumer;

// eslint-disable-next-line react/prop-types,react/display-name
exports.wrapPageElement = ({ element, props }) => {
  return (
    <InternalProvider>
      <Consumer>
        {context => {
          return props.pageContext && props.pageContext.preview ? (
            <Preview {...props}>{element}</Preview>
          ) : (
            element
          );
        }}
      </Consumer>
    </InternalProvider>
  );
};

exports.disableCorePrefetching = () =>
  process.env.WORDSBY_PREVIEW ? true : false;
