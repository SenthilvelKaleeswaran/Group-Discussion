import React from "react";
import Icon from "../../icons";

export const IconWithLoader = ({ isLoading, ...rest }) => {
  return isLoading ? (
    <Icon name="Loader" className="animate-spin" />
  ) : (
    <Icon {...rest} />
  );
};

export const IconContainer = ({ containerClass = "",disabled, onClick, ...rest }) => {
  return (
    <div
      className={` rounded-full border p-1 ${containerClass} ${"cursor-pointer"} ${disabled ? 'opacity-70' : ''} `}
      onClick={disabled ? null : ()=>onClick()}
      aria-disabled={rest?.isLoading || disabled ? "true" : "false"}
    >
      <IconWithLoader {...rest} />
    </div>
  );
};
