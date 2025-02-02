import React from "react";
import Icon from "../../icons";
import { RenderSpace } from ".";

export const Loader = ({ text = "Loading", showText = true }) => {
  return (
    <div className="flex gap-2 items-center">
      <Icon name="Loader" className="animate-spin" />
      <RenderSpace condition={showText}>
        <p className="text-gray-500">{text}</p>
      </RenderSpace>
    </div>
  );
};
