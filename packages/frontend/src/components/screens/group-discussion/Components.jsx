import { useAudioControls } from "../../../hooks";
import Icon from "../../../icons";
import { IconWithLoader } from "../../shared";
import { DropdownMenu, DropdownSelect } from "../../ui";

export const PeopleList = ({ list, title, socket, sessionId }) => {
  const { mutedUsers, toggleMute, mutingList } = useAudioControls({
    socket,
    sessionId,
  });

  const hndleAddToQueue = (data) => {
    socket.emit("DISCUSSION_QUEUE", { action: "ADD",sessionId, ...data });
  };

  const options = [
    {
      label: "Add to Queue",
      onClick: hndleAddToQueue,
      icon: "Queue",
    },
  ];

  return (
    <div className="space-y-2">
      <p>{title}</p>
      {list
        ?.filter((item) => item?.isActive)
        ?.map((item, index) => (
          <div className="flex justify-between items-center cursor-pointer hover:bg-gray-800 px-2 py-1 rounded-md">
            <p className="text-left">
              {index + 1}. {item?.name}
            </p>
            <div className="flex gap-2 items-center">
              <div
                className=""
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute(item?.userId, !mutedUsers?.includes(item?.userId));
                }}
              >
                <IconWithLoader
                  name={
                    mutedUsers?.includes(item?.userId)
                      ? "MicrophoneOff"
                      : "MicrophoneOn"
                  }
                  className={
                    mutedUsers?.includes(item?.userId) ? "text-red-500" : ""
                  }
                  isLoading={mutingList?.includes(item?.userId)}
                />
              </div>
              <IconWithLoader name={"Block"} className={"text-red-500"} />
              <DropdownMenu
                trigger={<Icon name="VerticlDots" />}
                options={options}
                position="right"
                id={{ userId: item?.userId, name: item?.name }}
              />
            </div>
          </div>
        ))}
    </div>
  );
};
