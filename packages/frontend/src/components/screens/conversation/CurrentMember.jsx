import React from "react";
import { NameCard } from "./ConversationComponent";

export const CurrentMember = ({ currentMember, renderStatus, renderIcon }) => {
  if (!currentMember) return null;
  return (
    <div className="flex justify-between items-center px-2">
      <NameCard userDetails={currentMember} />
      <div className="flex gap-2 items-center">
        <p className="text-xs text-gray-500">{renderStatus()}</p>
        {renderIcon()}
      </div>
    </div>
  );
};
