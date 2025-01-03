import React from "react";

export const RenderSpace = ({ children, condition }) => {
  if (condition) {
    return children;
  }
  return null;
};
