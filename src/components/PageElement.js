import React from "react";
import Yoast from "./Yoast";

const PageElement = ({ children, pageContext, data }) => (
  <>
    <Yoast {...pageContext} />
    {React.cloneElement(children, { data })}
  </>
);

export default PageElement;
