import React from "react";
import { useSelector } from "react-redux";
import { PeopleList } from "./Components";
import { RenderSpace } from "../../shared";

export default function ModeratorsList() {
  const { participants, loading, error } = useSelector(
    (state) => state.participants
  );

  const adminList = Object?.values(participants?.admin || {});
  const listenerList = Object?.values(
    participants?.participant?.listener || {}
  );
  const hostList = Object?.values(participants?.moderator || {});

  return (
    <div>
      <RenderSpace condition={adminList.length}>
        <PeopleList list={adminList} title={"Admin List"} />
      </RenderSpace>
      <RenderSpace condition={hostList.length}>
        <PeopleList list={hostList} title={"Moderators List"} />
      </RenderSpace>
      <RenderSpace condition={listenerList.length}>
        <PeopleList list={listenerList} title={"Listeners List"} />
      </RenderSpace>
    </div>
  );
}
