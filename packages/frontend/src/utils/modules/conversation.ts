export const getNameCardStyle = (isCurrentSpeech, isUser, isAnotherUser) => {
  const stylesMap = {
    currentSpeech: {
      nameCard: "bg-purple-700",
      name: "text-purple-500",
    },
    user: {
      nameCard: "bg-blue-700",
      name: "text-blue-500",
    },
    anotherUser: {
      nameCard: "bg-green-700",
      name: "text-green-500",
    },
    default: {
      nameCard: "bg-gray-700",
      name: "text-gray-300",
    },
  };

  if (isCurrentSpeech) return stylesMap.currentSpeech;
  if (isUser) return stylesMap.user;
  if (isAnotherUser) return stylesMap.anotherUser;

  return stylesMap.default;
};

export const getConversationStyle = (
  isCurrentSpeech,
  isUser,
  isAnotherUser
) => {
  const stylesMap = {
    currentSpeech: "bg-purple-950 text-left",
    user: "bg-blue-800 text-right",
    anotherUser: "bg-green-800 text-left",
    default: "bg-gray-800 text-left",
  };

  if (isCurrentSpeech) return stylesMap.currentSpeech;
  if (isUser) return stylesMap.user;
  if (isAnotherUser) return stylesMap.anotherUser;

  return stylesMap.default;
};
