import React from "react";
import { NameCard } from "../common/ConversationComponent";
import { getNameCardStyle } from "../../utils";

const CurrentMember = ({ currentMember, renderStatus, renderIcon }) => {
  if (!currentMember) return null;

  const userId = localStorage.getItem("userId");

  const colors = getNameCardStyle(
    false,
    currentMember.type === "You" || currentMember?.userId === userId,
    currentMember.type === "User" || !!currentMember?.userId
  );

  return (
    <div className="flex justify-between items-center px-2">
      <NameCard userDetails={currentMember} {...colors} />
      <div className="flex gap-2 items-center">
        <p className="text-xs text-gray-500">{renderStatus()}</p>
        {renderIcon()}
      </div>
    </div>
  );
};

export default CurrentMember;
