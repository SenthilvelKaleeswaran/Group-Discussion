import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipants } from "../../../store";
import { RenderSpace } from "../../shared";
import { PeopleList } from "./Components";

export default function ParticipantList({socket, sessionId }) {
  const { participants, loading, error } = useSelector(
    (state) => state.participants
  );


  const participantList = Object?.values(
    participants?.participant?.participant || participants?.participant || {}
  );

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <RenderSpace condition={participantList.length}>
        
        <PeopleList list={participantList} title={'Participants List'} socket={socket} sessionId={sessionId} />
      </RenderSpace>
    </div>
  );
}
