import React from "react";

const RenderSpace = ({ children,condition }) => {
    if (condition) {
      return children;
    }
    return null;
  };


export default RenderSpace;
