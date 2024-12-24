import React from "react";

const RenderSpace = ({ children,data }) => {
    if (data?.userId) {
      return children;
    }
    return null;
  };


export default RenderSpace;
