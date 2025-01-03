import React from "react";

import { RenderSpace } from "../../shared";
import { CircularProgressBar } from "../../ui";
import { ConversationTab } from "./ConversationTab";

export const ConversationSection = ({ currentData, expectedPoints }) => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-6 space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Conversation Feedback
          </h2>
          <p className="text-left">
            Expected Number of Points : {expectedPoints}
          </p>
          <p className="text-left">
            Total Number of Points Spoken:{" "}
            {currentData?.conversation?.length || 0}
          </p>
        </div>
        <RenderSpace condition={!!currentData?.userId}>
          <CircularProgressBar
            progress={currentData?.totalConversationScore}
            outOff={20}
            showOutOff
          />
        </RenderSpace>
      </div>
      <div>
        <ConversationTab data={currentData} />
      </div>
    </div>
  );
};
