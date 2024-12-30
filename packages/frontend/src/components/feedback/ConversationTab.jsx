import React, { useState } from "react";
import FeedbackTab from "./FeedbackTab";
import CircularProgressBar from "../ui/CircularProgressBar";
import MessageBadges from "../MessageBadges";
import { useRecapDiscussion } from "../../context/useRecapDiscussion";
import RenderSpace from "./RenderSpace";
import NextConversationCard from "./NextConversationCard";

const ConversationTab = ({ data }) => {
  const {
    conversationTab,
    currentSpeech,
    isSpeaking,
    handlePause,
    handlePlay,
    handleConversationTab,
  } = useRecapDiscussion();

  const conversation = data?.conversation || [];

  const selectedConversation = conversation?.[conversationTab || 0] || {};

  console.log({ selectedConversation, conversation, data });

  if (conversation?.length === 0) {
    return (
      <div className="w-full height-40 rounded-md bg-gray-900 p-4">
        <p className="text-gray-500">Not contribution in the discussion</p>
      </div>
    );
  }

  const isPrevDisabled = conversationTab === 0;
  const isNextDisabled = conversationTab + 1 === conversation?.length;
  const isCurrentTab = selectedConversation?._id === currentSpeech?._id

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!isPrevDisabled) handleConversationTab({action : "prev"});
          }}
          disabled={isPrevDisabled}
          className={`bg-gray-900 rounded-md p-2 ${
            isPrevDisabled ? "opacity-50" : ""
          }`}
        >
          Prev
        </button>
        <div className="flex gap-2 bg-gray-700 p-1 rounded-md w-full ">
          {conversation?.map((item, index) => {
            return (
              <div
                onClick={() =>handleConversationTab({index})}
                className={` py-1 px-2 rounded-md cursor-pointer ${
                  conversationTab === index
                    ? "bg-white text-gray-900"
                    : "bg-gray-800"
                }`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => {
            if (!isNextDisabled) handleConversationTab({action : "next"});
          }}
          disabled={isNextDisabled}
          className={`bg-gray-900 rounded-md p-2 ${
            isNextDisabled ? "opacity-50" : ""
          }`}
        >
          Next
        </button>
      </div>

      <div className="flex gap-4 justify-between rounded-md p-4 bg-gray-700">
        <div className="flex gap-4 justify-between flex-1">
          <div>
            <p className="text-left font-semibold">Discussion Point </p>
            <p className="text-left">{selectedConversation?.conversation}</p>
          </div>

          <div className="space-y-4">
            <RenderSpace condition={!!data?.userId}>
              <CircularProgressBar
                progress={selectedConversation?.totalMetricsScore}
                size={70}
              />
            </RenderSpace>

            {isSpeaking && isCurrentTab ? (
              <div className="flex flex-col gap-2">
                <button
                  className="bg-red-900 rounded-md py-2 px-4"
                  onClick={handlePause}
                >
                  Stop
                </button>
              </div>
            ) : (
              <div>
                <button
                  className="bg-gray-900 rounded-md py-2 px-4"
                  onClick={() => handlePlay({ id: selectedConversation?._id })}
                >
                  Play
                </button>
              </div>
            )}
            {
              isCurrentTab ? <NextConversationCard /> : null
            }
                            

          </div>
        </div>
      </div>
      <MessageBadges data={selectedConversation?.metadata} />

      <RenderSpace condition={!!data?.userId}>
        <FeedbackTab
          feedback={selectedConversation?.feedback}
          metricsTotal={selectedConversation?.overAllMetricsTotalPoints}
        />
      </RenderSpace>
    </div>
  );
};

export default ConversationTab;
