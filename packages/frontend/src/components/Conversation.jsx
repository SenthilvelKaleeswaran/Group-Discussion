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
  conclusionBy,
  isListening,
  isSpeaking,
  isLoading,
  transcript,
  currentWord,
  currentSpeech,
  conclusionPoints,
  discussionLength,
  conversation,
}) => {
  const containerRef = useRef(null); // Reference to the container

  const userId = localStorage.getItem("userId");

  console.log({ conversation });
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

  const getConclusionText = () => {
    switch (conclusionBy) {
      case "You":
        return "🎤 The stage is yours! The discussion has wrapped up, and now it's your moment to deliver the grand finale. Make it count! 🚀";
      case "User":
        return "✨ The discussion has reached its climax! One of the brilliant participants will now deliver the final word. Stay tuned for a powerful conclusion! 💡";
      case "AI":
        return "🤖 The discussion has ended, but the story isn’t over. Our AI mastermind is crafting a conclusion you won’t want to miss. Stand by for insights! 🔮";
      case "Random":
        return "🎲 The discussion is over, but the suspense isn’t! Anyone could step up to deliver the conclusion. Who will it be? Stay sharp! 🕵️‍♂️";
      default:
        return "🌟 The discussion has concluded, but the best is yet to come. The finale is on its way—get ready to be inspired! 🚀";
    }
  };

  const renderStatusCard = ({ index, isDiscussionEnd }) => {
    console.log({ index });
    if (index === 0 && data?.status === "COMPLETED")
      return (
        <div className="relative flex items-center justify-center pb-8 pt-4">
          <div className="relative z-10 p-6 bg-gray-900 border border-gray-500 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold text-blue-500">
              📌 Discussion Completed 📌
            </h3>
            <p className="text-sm text-gray-300 mt-2">
              Hurray discussion was completed
            </p>
          </div>
        </div>
      );
    if (isDiscussionEnd) {
      return (
        <div className="relative flex items-center justify-center py-8">
          <div className="relative z-10 p-6 bg-gray-900 border border-gray-500 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold text-blue-500">
              📌 Discussion Finished 📌
            </h3>
            <p className="text-sm text-gray-300 mt-2">{getConclusionText()}</p>
          </div>
        </div>
      );
    } else return null;
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
          const conversationLength = reversedConversation?.length;

          const totalPoints = conversationLength || 0;
          const currentPointNumber = conversationLength - index;
          const conclusionPointNumber = currentPointNumber - discussionLength;
          const isConclusionStarted = currentPointNumber > discussionLength;

          const userName = item?.name;
          const userPointCount = userPoints[userName] || 0;
          const metadata = item?.metadata || {};

          const isDiscussionEnd =
            conversationLength >= discussionLength &&
            index === conversationLength - discussionLength;

          return (
            <div key={item?.name + index} className="space-y-4">
              {renderStatusCard({ index, isDiscussionEnd })}
              <div className="p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1">
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
                    <p className="text-xs rounded-full bg-green-500 px-1.5 py-0.5">
                      {item?.point} / {userPointCount} Points
                    </p>
                    <p className="text-xs rounded-full bg-blue-500 px-1.5 py-0.5">
                      {isConclusionStarted
                        ? conclusionPointNumber
                        : currentPointNumber}
                      /
                      {isConclusionStarted
                        ? conclusionPoints
                        : discussionLength}
                    </p>

                    {item?.isConclusion ? (
                      <p className="text-xs rounded-full bg-purple-500 px-1.5 py-0.5">
                        Conclusion
                      </p>
                    ) : null}
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

              {/* Line indicating discussion end */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Conversion;
