import React from "react";
import Img from "gatsby-image";

const Wimg = ({ field, ...props }) => {
  if (!field) {
    return null;
  }

  const { localFile: file } = field;

  const useStringUrl = typeof field === "string";
  const useNestedStringUrl = !!field.url && typeof field.url === "string";

  if (useStringUrl || useNestedStringUrl) {
    const stringUrl = useStringUrl ? field : field.url;
    return <img src={stringUrl} {...props} />;
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
