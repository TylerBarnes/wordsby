import React from "react";
import Img from "../WordsbyImg";

class FlexibleContent extends React.Component {
  render() {
    const { rows } = this.props;
    if (!!rows) {
      return rows.map(({ __typename: typename, ...data }, index) => {
        const type = typename.replace("WordPressAcf_", "");
        const Component = Components[type];
        return Component ? (
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

const Components = {
  text: ({ text }) => <p dangerouslySetInnerHTML={{ __html: text }} />,
  hero: ({ bg_image }) => <Img field={bg_image} />
};
