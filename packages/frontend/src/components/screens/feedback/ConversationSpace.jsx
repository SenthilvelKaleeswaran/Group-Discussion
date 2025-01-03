import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  useMembers,
  useSpeechRecognization,
  useSpeechSynthesis,
} from "../../../hooks";
import Conversation from "../conversation/Conversation";
import Icon from "../../../icons";
import { useRecapDiscussion } from "../../../context/useRecapDiscussion";
import CurrentMember from "../conversation/CurrentMember";
import BlinkingIcon from "../BlinkingIcon";
import RenderSpace from "../common/RenderSpace";

const ConversationSpace = ({ data }) => {
  const {
    conversation,
    currentSpeech,
    isSpeaking,
    isSpecificConversation,
    isTrackConversation,
    handleNextPrev,
    handlePause,
    handlePlay,
    handleSpecificMemberDiscussion,
    handleShowSpecificConversation,
    handleTrackChange,
    specificMember,
  } = useRecapDiscussion();
  console.log({ specific: conversation });

  const isButtonDisable = conversation?.length === 0;

  const renderStatus = () => {
    if (isSpeaking) return `🗣 ${currentSpeech?.name} Speaking`;

    return ``;
  };

  const renderIcon = () => {
    if (isSpeaking)
      return (
        <BlinkingIcon icon={"Wave"} iconColor={"green"} pingColor="green" />
      );

    return null;
  };

  return (
    <div className="space-y-2 p-4 rounded-md">
      <RenderSpace condition={isSpeaking}>
        <div className="bg-gray-900 w-full rounded-md p-2">
          <CurrentMember
            currentMember={currentSpeech}
            renderStatus={renderStatus}
            renderIcon={renderIcon}
          />
        </div>
      </RenderSpace>

      <div className="bg-gray-900 flex justify-between gap-4 items-center p-4 rounded-md shadow-orange-950">
        <div className="space-y-2 w-full">
          <div className="flex gap-2 justify-between">
            <div
              onClick={isButtonDisable ? null : () => handleNextPrev("prev")}
              className={`rounded-full bg-gray-800 p-3 shadow-2xl ${
                isButtonDisable ? "opacity-50" : "cursor-pointer"
              }`}
            >
              <Icon name="Backward" />
            </div>
            <div
              onClick={isSpeaking ? handlePause : handlePlay}
              className="rounded-full bg-gray-800 p-3 shadow-2xl cursor-pointer"
            >
              {isSpeaking ? <Icon name="Pause" /> : <Icon name="Play" />}
            </div>
            <div
              onClick={isButtonDisable ? null : () => handleNextPrev("next")}
              className={`rounded-full bg-gray-800 p-3 shadow-2xl ${
                isButtonDisable ? "opacity-50" : "cursor-pointer"
              }`}
            >
              <Icon name="Forward" />
            </div>
          </div>
          <div className="space-x-2 flex flex-start ">
            <input
              type="checkbox"
              onChange={handleTrackChange}
              checked={isTrackConversation}
              value={isTrackConversation}
            />
            <label className="text-left text-gray-500 text-xs">
              Track the conversation
            </label>
          </div>
        </div>

        <div className="w-full space-y-2">
          <select
            value={specificMember || "all"}
            onChange={handleSpecificMemberDiscussion}
            className="p-2 w-full bg-gray-800 rounded-md"
          >
            <option value="all">All</option>
            <optgroup label="Members">
              {data?.participants.map((participant) => (
                <option key={participant._id} value={participant._id}>
                  {participant.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="AI Participants">
              {data?.aiParticipants?.map((participant) => (
                <option key={participant.name} value={participant.name}>
                  {participant.name}
                </option>
              ))}
            </optgroup>
          </select>
          <div className={`space-x-2 flex flex-start   ${specificMember === "all" ? 'opacity-50' : ''}`}>
            <input
              type="checkbox"
              onChange={handleShowSpecificConversation}
              checked={isSpecificConversation}
              disabled={specificMember === "all"}
              value={isSpecificConversation}
            />
            <label className={`text-left text-gray-500 text-xs`}>
              {" "}
              Filter Conversation
            </label>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-800 shadow-lg rounded-md ">
        <Conversation
          isSpeaking={isSpeaking}
          currentMember={currentSpeech}
          data={{ ...data, discussion: conversation }}
        />
      </div>
    </div>
  );
};

export default ConversationSpace;
