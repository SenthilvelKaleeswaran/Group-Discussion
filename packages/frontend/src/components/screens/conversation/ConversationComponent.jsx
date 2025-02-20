import Icon from "../../../icons";
import { getNameCardStyle } from "../../../utils";

export const NameCard = ({ userDetails, isCurrentSpeech = false }) => {
  const userId = localStorage.getItem("userId");

  const { name, nameCard } = getNameCardStyle(
    isCurrentSpeech,
    userDetails?.type === "You" ||
      userDetails?.userId?._id === userId ||
      userDetails?.id === userId,
    userDetails.type === "User" || !!userDetails?.userId
  );

  const userName= userDetails?.userId?.name || userDetails?.userId?.email ||  userDetails?.aiId?.name

  return (
    <div className="flex gap-2 items-center">
      {(userDetails?.type && userDetails?.type !== "AI") ||
      (!userDetails?.type && userDetails?.userId?._id) ? (
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner font-bold ${nameCard}`}
        >
          {userName?.slice(0, 1).toUpperCase()}
        </div>
      ) : (
        <div className="rounded-lg p-1.5 border-2 border-violet-400 text-violet-700">
          <Icon name="Robot" />
        </div>
      )}
      {/* <RenderSpace condition={!userDetails?.userId}>
          <div className="rounded-full p-1.5 border border-violet-400 text-violet-700">
            <Icon name="Robot" />
          </div>
        </RenderSpace>
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full shadow-inner font-bold ${nameCard}`}
        >
          {userDetails?.name.slice(0, 1).toUpperCase()}
        </div> */}
      <span className={`font-bold ${name}`}>{userName}</span>
      {/* <RenderSpace condition={!userDetails?.userId}>
          <div className="rounded-md p-1 border border-violet-400 text-violet-700">
            <Icon name="Robot" />
          </div>
        </RenderSpace> */}
    </div>
  );
};
