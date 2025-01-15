import React from "react";
import { useSelector } from "react-redux";

export default function ParticipantList() {
  const { participants, loading, error } = useSelector(
    (state) => state.participants
  );

  const participantList = Object?.values(
    participants?.participant?.participant || participants?.participant || {}
  );

  return (
    <div>
      <div className="space-y-2">
        {participantList
          ?.filter((item) => item?.isActive)
          ?.map((item, index) => (
            <div className="cursor-pointer hover:bg-gray-800 px-2 py-1 rounded-md">
              <p className="text-left">
                {index + 1}. {item?.name}
              </p>
              <div></div>
            </div>
          ))}
      </div>
    </div>
  );
}
