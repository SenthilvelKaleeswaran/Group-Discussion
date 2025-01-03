import React from "react";

const StreamingConversation = ({ data, renderText }) => {
  return (
    <div className="flex flex-col p-2 text-center space-y-2 shadow-lg rounded-lg transition transform hover:-translate-y-1">
      {data ? (
        <p className={`text-sm bg-gray-800 text-left p-2 rounded-md`}>
          {data || `🗣️ You're on the mic! Share your thoughts confidently. 🎤`}
        </p>
      ) : (
        <p className="text-xs text-gray-500 bg-gray-800  text-center px-2 py-3 rounded-md">
          {renderText()}
        </p>
      )}
    </div>
  );
};

export default StreamingConversation;
