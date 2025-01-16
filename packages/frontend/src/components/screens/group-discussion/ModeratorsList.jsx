import React from "react";
import { useSelector } from "react-redux";
import { PeopleList } from "./Components";
import { RenderSpace } from "../../shared";

export default function ModeratorsList() {
  const { participants, loading, error } = useSelector(
    (state) => state.participants
  );

  const adminList = Object?.values(participants?.participant?.admin || {});
  const listenerList = Object?.values(
    participants?.participant?.listener || {}
  );
  const hostList = Object?.values(participants?.participant?.host || {});

  console.log({ participants });

  return (
    <div>
      <RenderSpace condition={adminList.length}>
        <p>Admin List </p>
        <PeopleList list={adminList} />
      </RenderSpace>
      <RenderSpace condition={hostList.length}>
        <p>Host List</p>
        <PeopleList list={hostList} />
      </RenderSpace>
      <RenderSpace condition={listenerList.length}>
        <p>Listeners List</p>
        <PeopleList list={listenerList} />
      </RenderSpace>
    </div>
  );
}
