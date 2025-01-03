import React from "react";
import { useRecapDiscussion } from "../../../context/useRecapDiscussion";

const NextConversationCard = ({ currentData, expectedPoints }) => {
  const { fullDiscussion, index, handleNextPrev } = useRecapDiscussion();

  console.log("fullDiscussion:", fullDiscussion); // Debug log
  console.log("index:", index); // Debug log

  const nextDiscussion =
    index + 1 === fullDiscussion?.length
      ? { isLast: true }
      : fullDiscussion[index + 1];

  const currentDiscussion = fullDiscussion[index]

  console.log("nextDiscussion:", nextDiscussion); // Debug log

  if(currentDiscussion?._id)

  return (
    <div className="space-y-2 p-2 bg-gray-800 rounded-lg shadow-lg">
      {nextDiscussion?.isLast ? (
        <span className="text-white text-xs">
         Last In Discussion 
        </span>
      ) : (
        <>
          <span className="text-white text-xs">Next Discussion By </span>
          <span className="font-semibold text-white text-xs">
            {nextDiscussion?.name}
          </span>
          <div className="space-x-2">
            <button
              className="rounded-md bg-gray-500 py-1 px-2 text-xs"
              onClick={() => handleNextPrev("prev")}
            >
              View Prev
            </button>
            <button
              className="rounded-md bg-gray-500 py-1 px-2 text-xs"
              onClick={() => handleNextPrev("next")}
            >
              Move there
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NextConversationCard;
