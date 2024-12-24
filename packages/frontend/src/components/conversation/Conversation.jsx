import React, { useMemo, useEffect, useRef } from "react";
import { useConversation } from "../../context/conversation";
import StreamingConversation from "../StreamingConversation";
import Icon from "../../icons";
import BlinkingIcon from "../BlinkingIcon";
import AttachedBadge from "../UI/Badge";
import MessageBadges from "../MessageBadges";
import DiscussionPoints from "../common/DiscussionPoints";

const Conversation = ({
  data,
  currentMember = {},
  isListening = false,
  isSpeaking = false,
  isLoading =false,
  transcript = '',
  currentWord = '',
  currentSpeech = '',
  isLiveDiscussion = false,
}) => {
  const conclusionBy = data?.conclusionBy;
  const conversation = data?.messages || data?.conversationId?.messages;
  const containerRef = useRef(null); // Reference to the container


  const countUserPoints = (array) => {
    const userPoints = {};
    const updatedArray = array?.map((item) => {
      const userName = item?.name;
      if (userName) {
        if (!userPoints[userName]) {
          userPoints[userName] = 0;
        }
        userPoints[userName] += 1;
      }
      return { ...item, point: userPoints[userName] };
    });

    if (isLiveDiscussion) {
      updatedArray.reverse();
    }

    return { updatedArray: updatedArray, userPoints };
  };

  const getConverstionData = () => {
    if (!conversation?.length) return { updatedArray: [], userPoints: {} };

    const lastItem = conversation[conversation.length - 1];
    const array =
      lastItem?.status === "SPOKEN" || data?.status === "COMPLETED"
        ? conversation
        : conversation.slice(0, -1);

    return countUserPoints(array);
  };

  const { updatedArray: reversedConversation, userPoints } = useMemo(
    getConverstionData,
    [conversation]
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [reversedConversation, transcript, currentWord, currentMember]);

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
    return `Need to Speak - Double tab 👉 S`;
  };

  const renderText = () => {

    if(!isLiveDiscussion)
      return `Tap play button to listen the conversation`
    if (!currentMember && conversation?.length === 0)
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
    <div className="flex flex-col relative gap-4 bg-gray-700 h-[calc(100vh-100px)] rounded-md">
       <div className="bg-gray-900 w-full rounded-md p-2">
          {currentMember && (
            <div className="flex justify-between items-center px-2">
              <div className="flex gap-2 items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner ${
                    currentMember?.type === "You"
                      ? "bg-blue-500"
                      : currentMember?.type === "User"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  <span className="font-bold">
                    {currentMember?.name?.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <span
                  className={`font-bold ${
                    currentMember?.type === "You"
                      ? "text-blue-500"
                      : currentMember?.type === "User"
                      ? "text-green-300"
                      : "text-gray-300"
                  }`}
                >
                  {currentMember?.name}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-xs text-gray-500">{renderStatus()}</p>
                {renderIcon()}
              </div>
            </div>
          )}

          
          
          <StreamingConversation
            data={transcript || currentWord}
            renderText={renderText}
          />
        </div>
      <div className="flex-1 overflow-y-auto bg-gray-900 px-2">
       

        <DiscussionPoints data={data} isLiveDiscussion={isLiveDiscussion} />
      </div>
    </div>
  );
};

export default Conversation;
