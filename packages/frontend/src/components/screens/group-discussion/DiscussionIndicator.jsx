import React from "react";

export const DiscussionIndicator = ({ data, conversation,isSpeaking }) => {
  const conversationLength = conversation?.length || 0;
  const discussionLength = data?.discussionLength || 0;
  const conclusionLength = data?.conclusionPoints || 0;
  const discussionPointsLeft = discussionLength - conversationLength || 0;
  const conclusionPointsLeft =
    conversationLength - discussionLength - conclusionLength || 0;
  const conclusionBy = data?.conclusionBy;
 
  const getValues = () => {
    let count = discussionPointsLeft;
    let message = "";
    const total = discussionLength + conclusionLength

    if (discussionPointsLeft < 0) {
      count = conclusionPointsLeft;

      if (conclusionPointsLeft === 1) {
        if (conclusionBy === "User" || conclusionBy === "Random")
          message =
            "🎯 Seize your final chance! Deliver the conclusion with impact.";
        if (conclusionBy === "You")
          message =
            "✨ It's time to wrap up! Deliver the ultimate conclusion to the discussion.";
      } else if (conclusionPointsLeft > 1) {
        if (conclusionBy === "User" || conclusionBy === "Random")
          message =
            "🌟 A golden opportunity! Contribute to the discussion's conclusion.";
      } else if (conclusionBy === "AI")
        message = "🤖 The AI is crafting the conclusion. Stay tuned!";
    } else if (conversationLength === discussionLength - 1) {
      count = discussionPointsLeft;

      if (conclusionBy === "You" || conclusionBy === "User") {
        message =
          "⏳ One more point! Let the AI finalize the discussion before concluding.";
      } else if (conclusionBy === "AI") {
        message =
          "🗣️ Your last chance to contribute! Share your final thoughts.";
      } else {
        message =
          "🔄 It's a toss-up! Will you take the last word, or will someone else?";
      }
    } else if (discussionPointsLeft > 0) {
      count = discussionPointsLeft;
      message = `📊 ${discussionPointsLeft} discussion points remaining. Keep contributing!`;
    } else if (total === conversationLength) {
      message = "Discussion completed";
    }
    if(isSpeaking){
      count -= 1

    }

    return { count, message };
  };

  const { count, message } = getValues();
 

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full bg-gradient-to-b from-gray-800 to-gray-900 text-gray-200 p-8 shadow-lg rounded-lg">
      <p className="text-xs font-bold text-blue-400 animate-pulse">
        🔔 Discussion Progress
      </p>
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-medium text-gray-100">{message}</p>
        {count >= 0 && (
          <div className="text-xs font-bold text-yellow-400 bg-gray-700 px-4 py-2 rounded-full shadow-md">
            {count} Points Left
          </div>
        )}
      </div>
    </div>
  );
};
