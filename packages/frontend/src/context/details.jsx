import React, { createContext, useState, useContext } from "react";

// Create Context
const DiscussionContext = createContext();

// Provider Component
export const DiscussionProvider = ({ children }) => {
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "",
    numMembers: 0,
  });

  const updateDiscussionDetails = (details) => {
    setDiscussionDetails((prev) => ({ ...prev, ...details }));
  };

  return (
    <DiscussionContext.Provider value={{ discussionDetails, updateDiscussionDetails }}>
      {children}
    </DiscussionContext.Provider>
  );
};

// Custom Hook for easy access
export const useDiscussion = () => useContext(DiscussionContext);



