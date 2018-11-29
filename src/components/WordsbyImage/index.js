import React from "react";
import Img from "gatsby-image";

const Wimg = ({ field, ...props }) => {
  if (!field) {
    return null;
  }

  const { localFile: file } = field;

  if (typeof field === "string") {
    return <img src={field} {...props} />;
  } else if (!!file && file.childImageSharp) {
    if (file.childImageSharp.fluid) {
      return <Img fluid={file.childImageSharp.fluid} {...props} />;
    } else if (file.childImageSharp.fixed) {
      return <Img fixed={file.childImageSharp.fixed} {...props} />;
    }
  } else {
    return null;
  }
};

export default Wimg;
