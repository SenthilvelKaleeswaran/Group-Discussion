import React from "react";
import Icon from "../../icons";

export const IconWithLoader = ({ isLoading, ...rest }) => {
  return isLoading ? (
    <Icon name="Loader" className="animate-spin" />
  ) : (
    <Icon {...rest} />
  );
};

export const IconContainer = ({ containerClass = "", onClick, ...rest }) => {
  return (
    <div
      className={` rounded-full border p-1 ${containerClass} ${"cursor-pointer"} `}
      onClick={onClick}
      aria-disabled={rest?.isLoading ? "true" : "false"}
    >
      <IconWithLoader {...rest} />
    </div>
  );
};
