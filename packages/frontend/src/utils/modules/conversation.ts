export const getNameCardStyle = (isCurrentSpeech, isUser, isAnotherUser) => {
    const stylesMap = {
      currentSpeech: {
        nameCard: "bg-purple-700",
        conversation: "bg-purple-950 text-left",
        name: "text-purple-500",
      },
      user: {
        nameCard: "bg-blue-700",
        conversation: "bg-blue-800 text-right",
        name: "text-blue-500",
      },
      anotherUser: {
        nameCard: "bg-green-700",
        conversation: "bg-green-800 text-left",
        name: "text-green-500",
      },
      default: {
        nameCard: "bg-gray-700",
        conversation: "bg-gray-800 text-left",
        name: "text-gray-300",
      },
    };
  
    if (isCurrentSpeech) return stylesMap.currentSpeech;
    if (isUser) return stylesMap.user;
    if (isAnotherUser) return stylesMap.anotherUser;
  
    return stylesMap.default;
  };
  