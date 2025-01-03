import React, { useMemo, useEffect, useRef } from "react";
import StreamingConversation from "./StreamingConversation";
import Icon from "../../../icons";
import BlinkingIcon from "../../BlinkingIcon";
import DiscussionPoints from "./DiscussionPoints";
import CurrentMember from "./CurrentMember";
import RenderSpace from "../../shared/RenderSpace";
import MessageBadges from "../../MessageBadges";
import { NameCard } from "./ConversationComponent";
import Loader from "../../shared/Loader";
import { getNameCardStyle } from "../../../utils";

const Conversation = ({
  data,
  currentMember = {},
  isListening = false,
  isSpeaking = false,
  isLoading = false,
  transcript = "",
  currentWord = "",
  currentSpeech = "",
  isLiveDiscussion = false,
  events,
  processingPoint,


}) => {


  const renderIcon = () => {
    if (isListening && transcript?.length > 0)
      return (
        <BlinkingIcon
          icon={"MicrophoneOn"}
          iconColor={"blue"}
          pingColor="blue"
        />
      );
    if (isListening) return <Icon name="MicrophoneOn" />;
    if (isSpeaking)
      return (
        <BlinkingIcon icon={"Wave"} iconColor={"green"} pingColor="green" />
      );
    if (isLoading)
      return (
        <BlinkingIcon
          icon={"HorizontalDots"}
          iconColor={"yellow"}
          pingColor="yellow"
        />
      );
    return null;
  };

  const renderStatus = () => {
    if (isListening && transcript?.length > 0) return `🗣 You Speaking`;
    if (isListening) return `Start Speaking`;
    if (isSpeaking) return `🗣 ${currentMember?.name} Speaking`;
    if (isLoading) return "⏳ Processing";
    if (!isLiveDiscussion && !isSpeaking) return "";
    return `Need to Speak - Double tab 👉 S`;
  };

  const renderText = () => {
    if (!isLiveDiscussion) return ``;
    if (!currentMember && data?.discussion?.length === 0)
      return `🌟 Be the Pioneer! Start the discussion and set the tone for greatness! ✨`;
    if (!currentMember)
      return `🎙️ Ready to make your point? Double-tap 👉 S 👈 to take the stage! 🚀`;
    if (isListening)
      return `🗣️ You're on the mic! Share your thoughts confidently. 🎤`;

    if (isLoading)
      return `🤖 Selecting an AI member to share their thoughts 💭`;
    if (!isListening && !isSpeaking && currentSpeech?.length > 0)
      return `🤖 ${currentMember?.name} is ready to inspire with their thoughts! 💡`;
    if (isLoading && currentMember?.type === "User")
      return `⏳ Analyzing inputs... Hang tight, brilliance takes a moment! 🧠`;
    return `💡 Got another brilliant point? Hold the mic by tapping 👉 S 👈`;
  };

  return (
    <div className="flex flex-col relative gap-4 bg-gray-800 h-[calc(100vh-100px)] rounded-md">
      <RenderSpace condition={isLiveDiscussion}>
        <div className="bg-gray-900 w-full rounded-md p-2">
          <CurrentMember
            currentMember={currentMember}
            renderStatus={renderStatus}
            renderIcon={renderIcon}
          />

          <StreamingConversation
            data={transcript || currentWord}
            renderText={renderText}
          />
        </div>
      </RenderSpace>

      <RenderSpace condition={isLiveDiscussion && !!processingPoint }>
      <div className="space-y-4 p-2 bg-gray-900 rounded-md">
          <div
            className={`p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1`}
          >
            <div className="flex gap-4 items-center justify-between w-full">
              <NameCard userDetails={processingPoint?.currentMember} />
              <div className="flex gap-2 items-center">
              <Loader text='Processing' />
              </div>
            </div>

            <p className={`text-sm text-left p-2 rounded-md bg-blue-600`}>
              {processingPoint?.conversation || "No conversation available"}
            </p> 
            {/* {generatingMetrics ? (
              <p>Loading ....</p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                <MessageBadges data={metadata} />
              </div>
            )} */}
          </div>
         
        </div>

      </RenderSpace>

      <DiscussionPoints
        data={data}
        isLiveDiscussion={isLiveDiscussion}
        events={events}
      />
    </div>
  );
};

export default Conversation;
