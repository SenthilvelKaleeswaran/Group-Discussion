import React, { useMemo, useEffect, useRef } from "react";
import { useConversation } from "../context/conversation";
import StreamingConversation from "./StreamingConversation";
import Icon from "../icons";
import BlinkingIcon from "./BlinkingIcon";
import AttachedBadge from "./UI/Badge";
import MessageBadges from "./MessageBadges";

const Conversion = ({
  data,
  streamData,
  currentMember,
  isListening,
  isSpeaking,
  isLoading,
  transcript,
  currentWord,
  currentSpeech,
}) => {
  const containerRef = useRef(null); // Reference to the container

  const userId = localStorage.getItem("userId");

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

    return { updatedArray: updatedArray.reverse(), userPoints };
  };

  const getConverstionData = () => {
    if (!data?.length) return { updatedArray: [], userPoints: {} };

    const lastItem = data[data.length - 1];
    const array = lastItem?.status === "SPOKEN" ? data : data.slice(0, -1);

    return countUserPoints(array);
  };

  const { updatedArray: reversedConversation, userPoints } = useMemo(
    getConverstionData,
    [data]
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
    if (!currentMember && data?.length === 0)
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
    <div className="flex flex-col relative gap-4 bg-gray-900 h-[calc(100vh-100px)]">
      {/* Message Conversation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-900 w-full mb-4">
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
                    {currentMember?.name.slice(0, 1).toUpperCase()}
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

        {reversedConversation?.map((item, index) => {
          const isUser = item?._id === userId;
          const isAnotherUser = !!item?._id && !isUser;

          const totalPoints = reversedConversation?.length || 0;
          const currentPointNumber = reversedConversation?.length - index;
          const userName = item?.name;
          const userPointCount = userPoints[userName] || 0;
          const metadata = item?.metadata || {};

          return (
            <div
              key={item?.name + index}
              className="p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1"
            >
              <div className="flex gap-4 items-center justify-between w-full">
                <div className="flex gap-2 items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner ${
                      isUser
                        ? "bg-blue-500"
                        : isAnotherUser
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  >
                    <span className="font-bold">
                      {item?.name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${
                      isUser
                        ? "text-blue-500"
                        : isAnotherUser
                        ? "text-green-300"
                        : "text-gray-300"
                    }`}
                  >
                    {item?.name}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="text-xs rounded-full bg-blue-500 px-1.5 py-0.5">
                    {currentPointNumber}/{totalPoints}
                  </p>
                  <p className="text-xs rounded-full bg-green-500 px-1.5 py-0.5">
                    {item?.point} / {userPointCount} Points
                  </p>
                </div>
              </div>

              <p
                className={`text-sm p-2 rounded-md ${
                  isUser
                    ? "bg-blue-800 text-right"
                    : isAnotherUser
                    ? "bg-green-800 text-left"
                    : "bg-gray-800 text-left"
                }`}
              >
                {item?.conversation || "No conversation available"}
              </p>
              <div className="mt-2 space-y-1 text-sm text-gray-400">
              
               <MessageBadges data={metadata} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Conversion;
