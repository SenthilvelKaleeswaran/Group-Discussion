import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipants } from "../../../store";

export default function ParticipantList({ sessionId }) {
  const dispatch = useDispatch();
  const { participants, loading, error } = useSelector(
    (state) => state.participants
  );

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchParticipants(sessionId));
    }
  }, [dispatch, sessionId]);


  const participantList = Object?.values(
    participants?.participant?.participant || participants?.participant || {}
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div className="space-y-2">
        {participantList
          ?.filter((item) => item?.isActive)
          ?.map((item, index) => (
            <div
              className="cursor-pointer hover:bg-gray-800 px-2 py-1 rounded-md"
              key={index}
            >
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
