import React, { useMemo, useEffect, useRef } from "react";
import StreamingConversation from "../StreamingConversation";
import Icon from "../../icons";
import BlinkingIcon from "../BlinkingIcon";
import DiscussionPoints from "../common/DiscussionPoints";
import CurrentMember from "./CurrentMember";
import RenderSpace from "../common/RenderSpace";

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

      <DiscussionPoints data={data} isLiveDiscussion={isLiveDiscussion} />
    </div>
  );
};

export default Conversation;
