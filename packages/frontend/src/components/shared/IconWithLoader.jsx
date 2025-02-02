import React from "react";
import Icon from "../../icons";

export const IconWithLoader = ({ isLoading, ...rest }) => {
  return isLoading ? (
    <Icon name="Loader" className="animate-spin" />
  ) : (
    <Icon {...rest} />
  );
};
