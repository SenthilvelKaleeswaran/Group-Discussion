import { useSelector } from "react-redux";
import { DoubleTapPopup, IconContainer, RenderSpace } from "../../shared";
import Icon from "../../../icons";
import { TabComposed } from "../../ui";

const AICard = ({ item, handleAddToQueue }) => {
  return (
    <div className="flex gap-2 justify-between items-center p-4 bg-gray-800 rounded-md">
      <RenderSpace condition={item.avatar}>
        <img
          className="cursor-pointer place-content-center h-12 w-12 rounded-full border border-black/50"
          src={item.avatar}
          alt={item.name}
        />
      </RenderSpace>
      <div>
        <p className="text-left text-sm">{item?.name}</p>
        <p className="text-left text-gray-600 text-xs">{item?.description}</p>
      </div>

      <div>
        <IconContainer
          name="Queue"
          className="text-xs"
          containerClass="hover:bg-gray-700 bg-gray-800 border-gray-900"
          onClick={() => handleAddToQueue(item)}
        />
      </div>
    </div>
  );
};

const renderList = ({ list, type, handleAddToQueue }) => {
  if (list?.length === 0) {
    if (type === "your-ai")
      return (
        <div className="h-full flex items-center justify-center rounded-md text-gray-500">
          You have not created AI for this session
        </div>
      );
    return (
      <div className="h-full flex items-center justify-center rounded-md text-gray-500">
        No AI Partitcipants
      </div>
    );
  }

  return (
    <div className="bg-gray-900 h-full rounded-md space-y-4">
      {list?.map((item) => (
        <AICard item={item} handleAddToQueue={handleAddToQueue} />
      ))}
    </div>
  );
};

export function AiParticipantPopup({ data, socket, sessionId }) {
  const { aiParticipants } = data;
  console.log({ aiParticipants });

  const handleAddToQueue = (data) => {
    console.log({ itemmmmmm: data });
    socket.emit("DISCUSSION_QUEUE", {
      action: "ADD",
      sessionId,
      aiId: data?._id,
      ...data,
    });
  };

  const TAB_LIST = [
    {
      id: "all",
      label: "AI Participants",
      icon: "Robot",
      iconStyle: "text-purple-500",
      component: renderList({
        list: aiParticipants,
        type: "all",
        handleAddToQueue,
      }),
    },
    {
      id: "your-ai",
      label: "Your AI",
      icon: "Correct",
      iconStyle: "text-green-500",
      component: renderList({ list: [], type: "your-ai", handleAddToQueue }),
    },
  ];

  return (
    <div className="relative drop-shadow-2xl z-50">
      <DoubleTapPopup
        onKey="w"
        draggable
        iconName="Robot"
        title="AI Participants"
      >
        <TabComposed defaultTab="all" list={TAB_LIST} />
      </DoubleTapPopup>
    </div>
  );
}
