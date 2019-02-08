import React from "react";
import Yoast from "./Yoast";

const PageElement = ({ children, pageContext }) => (
  <>
    <Yoast {...pageContext} />
    {children}
  </>
);

export default PageElement;
