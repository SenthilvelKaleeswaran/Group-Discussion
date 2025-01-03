import React from "react";

const SelectableContainer = ({ children, condition, onClick ,disabled=false}) => {
  if (condition) {
    return <div onClick={onClick} className="cursor-pointer" disabled={disabled}>{children} </div>;
  }
  return children;
};

export default SelectableContainer;
