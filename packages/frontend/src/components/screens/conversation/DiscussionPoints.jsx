import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  RenderSpace,
  Loader,
  MessageBadges,
  SelectableContainer,
} from "../../shared";
import { useRecapDiscussion } from "../../../context";
import { NameCard } from "./ConversationComponent";
import { getConversationStyle } from "../../../utils";

const StatusCard = ({ title, message, additionalText }) => (
  <div className="relative flex items-center justify-center pb-8 pt-4">
    <div className="relative z-10 p-6 bg-gray-900 border border-gray-500 rounded-lg shadow-lg text-center space-y-2">
      <h3 className="text-lg font-bold text-blue-500">{title}</h3>
      <p className="text-base text-gray-300 ">{message}</p>
      {additionalText && (
        <p className="text-sm text-gray-300">{additionalText}</p>
      )}
    </div>
  </div>
);

const DiscussionPoints = ({ data, isLiveDiscussion = false, events }) => {
  const discussionLength = data?.discussionLength;
  const conclusionBy = data?.conclusionBy;
  const conclusionPoints = data?.conclusionPoints;
  const conversation =
    data?.discussion || data?.messages || data?.conversationId?.messages;
  const selectedPointRef = useRef(null);
  const containerRef = useRef(null);
  const [generatingMetrics, setGeneratingMetrics] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState(null);


  useEffect(() => {
    if (events && events.PERFORMANCE_METRICS) {
      const { isLoading, messageId } = events.PERFORMANCE_METRICS;
      setCurrentMessageId(messageId);
      setGeneratingMetrics(isLoading);
    }
  }, [events.PERFORMANCE_METRICS]);

  useEffect(() => {
    if (isLiveDiscussion && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [isLiveDiscussion, conversation]);

  const userId = localStorage.getItem("userId");

  const recapContext = !isLiveDiscussion
    ? useRecapDiscussion()
    : { currentSpeech: null };

  const countUserPoints = (array) => {
    const userPoints = {};
    const updatedArray = array?.map((item) => {
      const userName = item?.name;
      if (userName) {
        userPoints[userName] = (userPoints[userName] || 0) + 1;
      }
      return { ...item, point: userPoints[userName] };
    });

    if (isLiveDiscussion) {
      updatedArray.reverse();
    }

    return { discussion: updatedArray, userPoints };
  };

  const getConversationData = () => {
    if (!conversation?.length) return { updatedArray: [], userPoints: {} };

    const lastItem = conversation[conversation.length - 1];
    const array =
      lastItem?.userId ||
      lastItem?.status === "SPOKEN" ||
      data?.status === "COMPLETED"
        ? conversation
        : conversation.slice(0, -1);

    return countUserPoints(array);
  };

  const { discussion, userPoints } = useMemo(getConversationData, [
    conversation,
  ]);

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

  const renderStatusCard = ({ isDiscussionEnd, isDiscussionCompleted }) => {
    if (!isDiscussionCompleted && !isDiscussionEnd) {
      return null;
    }

    let title = "";
    let message = "";
    let additionalText = "";

    if (isDiscussionCompleted) {
      title = "📌 Discussion Completed 📌";
      message = "Hurray discussion was completed";
    } else if (isDiscussionEnd) {
      title = "📌 Ready for Conclusion ? 📌";
      message = "Discussion has wrapped up";
      additionalText = getConclusionText();
    }

    return (
      <StatusCard
        title={title}
        message={message}
        additionalText={additionalText}
      />
    );
  };

  const getValues = (index) => {
    const conversationLength = discussion?.length;

    if (!isLiveDiscussion) {
      const currentPointNumber = index + 1;
      const isConclusionStarted = currentPointNumber > discussionLength;
      const conclusionPointNumber = currentPointNumber - discussionLength;
      const isDiscussionCompleted =
        conversationLength === discussionLength + conclusionPoints &&
        index + 1 === conversationLength;

      const isDiscussionEnd =
        conversationLength >= discussionLength &&
        index === discussionLength - 1;

      return {
        currentPointNumber,
        conclusionPointNumber,
        isConclusionStarted,
        isDiscussionEnd,
        isDiscussionCompleted,
      };
    } else {
      const currentPointNumber = conversationLength - index;
      const conclusionPointNumber = currentPointNumber - discussionLength;
      const isConclusionStarted = currentPointNumber > discussionLength;
      const isDiscussionEnd =
        conversationLength >= discussionLength &&
        index === conversationLength - discussionLength;
      const isDiscussionCompleted =
        index === 0 &&
        conversationLength === discussionLength + conclusionPoints;

      return {
        currentPointNumber,
        conclusionPointNumber,
        isConclusionStarted,
        isDiscussionEnd,
        isDiscussionCompleted,
      };
    }
  };

  useEffect(() => {
    if (
      !isLiveDiscussion &&
      selectedPointRef.current &&
      recapContext?.currentSpeech
    ) {
      selectedPointRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [recapContext?.currentSpeech]);

  if (conversation?.length === 0) {
    let message = "";
    if (isLiveDiscussion) {
      message = "Be the first to Start your Discussion";
    } else {
      message = "No discussion points";
    }
    return (
      <div className="place-content-center h-full">
        <p className="text-gray-700">{message} </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-900 p-2 rounded-md"
      // ref={containerRef}
    >
      <div className="flex flex-col relative gap-2 bg-gray-900 h-full">
        {discussion?.map((item, index) => {
          const isUser = item?.userId === userId;
          const isAnotherUser = !!item?.userId && !isUser;
          const isCurrentSpeech =
            recapContext?.currentSpeech?._id === item?._id;

          const {
            currentPointNumber,
            conclusionPointNumber,
            isConclusionStarted,
            isDiscussionEnd,
            isDiscussionCompleted,
          } = getValues(index);

          const userName = item?.name;
          const userPointCount = userPoints[userName] || 0;
          const metadata = item?.metadata || {};

          const conversationStyle = getConversationStyle(
            isCurrentSpeech,
            isUser,
            isAnotherUser
          );

          return (
            <div
              key={item?.name + index + item?._id}
              className="space-y-4 p-2"
              ref={
                !isLiveDiscussion && isCurrentSpeech ? selectedPointRef : null
              }
            >
              <RenderSpace condition={isLiveDiscussion}>
                {renderStatusCard({ isDiscussionCompleted, isDiscussionEnd })}
              </RenderSpace>
              <SelectableContainer
                onClick={() => recapContext?.handlePlay({ id: item?._id })}
                condition={!isLiveDiscussion}
              >
                <div
                  className={`p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1 ${
                    isCurrentSpeech ? "ring-2 ring-purple-900" : ""
                  }`}
                >
                  <div className="flex gap-4 items-center justify-between w-full">
                    <NameCard
                      userDetails={item}
                      isCurrentSpeech={isCurrentSpeech}
                    />
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

                      <RenderSpace condition={item?.isConclusion}>
                        <p className="text-xs rounded-full bg-purple-500 px-1.5 py-0.5">
                          Conclusion
                        </p>
                      </RenderSpace>
                    </div>
                  </div>

                  <p className={`text-sm p-2 rounded-md ${conversationStyle}`}>
                    {item?.conversation || "No conversation available"}
                  </p>
                  {generatingMetrics && currentMessageId === item?._id ? (
                    <Loader text="Generating Metrics" />
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      <MessageBadges data={metadata} />
                    </div>
                  )}
                </div>
              </SelectableContainer>
              <RenderSpace
                condition={
                  !isLiveDiscussion && !recapContext?.isSpecificConversation
                }
              >
                {renderStatusCard({ isDiscussionCompleted, isDiscussionEnd })}
              </RenderSpace>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionPoints;
