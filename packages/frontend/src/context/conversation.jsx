import React, { createContext, useState, useContext } from "react";

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [conversation, setConversation] = useState([]);

  const updateConversation = ({ currentMember, newConversation }) => {
    console.log({ currentMember, newConversation });
    if (!currentMember?.id) {
      console.error("Invalid currentMember provided.");
      return;
    }

    if (!newConversation) {
      console.error("Invalid conversation provided.");
      return;
    }

    setConversation([
      ...conversation,
      {
        name :  currentMember?.name,
       conversation : newConversation,
      },
    ]);
  };

  return (
    <ConversationContext.Provider value={{ conversation, updateConversation }}>
      {children}
    </ConversationContext.Provider>
  );
};

// Custom Hook for easy access
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
};
