import React, { useMemo, useEffect, useRef } from "react";
import MessageBadges from "../MessageBadges";
import RenderSpace from "./RenderSpace";
import SelectableContainer from "./SelectableContainer";
import { useRecapDiscussion } from "../../context/useRecapDiscussion";

const DiscussionPoints = ({
  data,
  isLiveDiscussion = false,
}) => {
  const discussionLength = data?.discussionLength;
  const conclusionBy = data?.conclusionBy;
  const conclusionPoints = data?.conclusionPoints;
  const conversation = data?.messages || data?.conversationId?.messages;
  const selectedPointRef = useRef(null); // Reference to the selected point


  const userId = localStorage.getItem("userId");

  const recapContext = !isLiveDiscussion
    ? useRecapDiscussion()
    : { currentSpeech: null };
  console.log({ recapContext });

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

    return { updatedArray, userPoints };
  };

  const getConversationData = () => {
    if (!conversation?.length) return { updatedArray: [], userPoints: {} };

    const lastItem = conversation[conversation.length - 1];
    const array =
      lastItem?.status === "SPOKEN" || data?.status === "COMPLETED"
        ? conversation
        : conversation.slice(0, -1);

    return countUserPoints(array);
  };

  const { updatedArray: discussion, userPoints } = useMemo(
    getConversationData,
    [conversation]
  );

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
    if (isDiscussionCompleted)
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

  const getValues = (item, index) => {
    const conversationLength = discussion?.length;

    if (!isLiveDiscussion) {
      const currentPointNumber = index + 1;
      const isConclusionStarted = currentPointNumber > discussionLength;
      const conclusionPointNumber = currentPointNumber - discussionLength;
      const isDiscussionCompleted =
        index + 1 === conversationLength && data?.status === "COMPLETED";

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
      const isDiscussionCompleted = index === 0 && data?.status === "COMPLETED";

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
    if (!isLiveDiscussion && selectedPointRef.current && recapContext?.currentSpeech) {
      selectedPointRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [recapContext?.currentSpeech]); // Removed unnecessary dependencies
  


  
  return (
    <div className="flex flex-col relative gap-4 bg-gray-900 h-[calc(100vh-100px)]">
      {discussion?.map((item, index) => {
        const isUser = item?.userId === userId;
        const isAnotherUser = !!item?.userId && !isUser;
        const isCurrentSpeech = recapContext?.currentSpeech?._id === item?._id;

        const {
          currentPointNumber,
          conclusionPointNumber,
          isConclusionStarted,
          isDiscussionEnd,
          isDiscussionCompleted,
        } = getValues(item, index);

        const userName = item?.name;
        const userPointCount = userPoints[userName] || 0;
        const metadata = item?.metadata || {};

        return (
          <div
            key={item?.name + index}
            className="space-y-4"
            ref={!isLiveDiscussion && isCurrentSpeech ? selectedPointRef : null}
          >
            <RenderSpace condition={isLiveDiscussion}>
              {renderStatusCard({ isDiscussionCompleted, isDiscussionEnd })}
            </RenderSpace>
            <SelectableContainer
              onClick={() => {}}
              condition={!isLiveDiscussion}
            >
              <div
                className={`p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1 ${
                  isCurrentSpeech
                    ? "ring-2 ring-purple-900"
                    : "ring-2 ring-gray-900"
                }`}
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
                      }  ${isCurrentSpeech ? "bg-purple-700" : ""}`}
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
                      }  ${isCurrentSpeech ? "text-purple-700" : ""}`}
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

                    <RenderSpace condition={item?.isConclusion}>
                      <p className="text-xs rounded-full bg-purple-500 px-1.5 py-0.5">
                        Conclusion
                      </p>
                    </RenderSpace>
                  </div>
                </div>

                <p
                  className={`text-sm p-2 rounded-md ${
                    isUser
                      ? "bg-blue-800 text-right"
                      : isAnotherUser
                      ? "bg-green-800 text-left"
                      : "bg-gray-800 text-left"
                  } ${isCurrentSpeech ? "bg-purple-950" : ""}`}
                >
                  {item?.conversation || "No conversation available"}
                </p>
                <div className="mt-2 space-y-1 text-sm text-gray-400">
                  <MessageBadges data={metadata} />
                </div>
              </div>
            </SelectableContainer>
            <RenderSpace condition={!isLiveDiscussion}>
              {renderStatusCard({ isDiscussionCompleted, isDiscussionEnd })}
            </RenderSpace>
          </div>
        );
      })}
    </div>
  );
};

export default DiscussionPoints;
