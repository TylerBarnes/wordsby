import React from "react";
import Yoast from "./Yoast";

const PageElement = ({ children, pageContext, data, ...props }) => (
  <>
    <Yoast {...pageContext} />
    {React.cloneElement(children, { data, pageContext, ...props })}
  </>
);

export default PageElement;
