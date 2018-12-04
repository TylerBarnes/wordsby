import React from "react";

class FlexibleContent extends React.Component {
  render() {
    const { rows, components } = this.props;
    if (!!rows || !!components) {
      return rows.map(({ __typename: typename, ...data }, index) => {
        const type = typename.replace("WordPressAcf_", "");
        const Component = components[type];
        return !!Component ? (
          <Component key={index} {...data} />
        ) : (
          console.warn(`No component found for ${type} type`)
        );
      });
    } else {
      return null;
    }
  }
}

export default FlexibleContent;

// import Img from "../WordsbyImg";
//
// const components = {
//   text: ({ text }) => <p dangerouslySetInnerHTML={{ __html: text }} />,
//   hero: ({ bg_image }) => <Img field={bg_image} />
// };
