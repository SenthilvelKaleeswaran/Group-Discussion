import { useAudioControls } from "../../../hooks";
import { IconWithLoader } from "../../shared";

export const PeopleList = ({ list, title, socket, sessionId }) => {
  const { mutedUsers, toggleMute, mutingList } = useAudioControls({
    socket,
    sessionId,
  });

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
            <div className="flex gap-2">
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
            </div>
          </div>
        ))}
    </div>
  );
};
