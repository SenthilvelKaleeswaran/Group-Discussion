import React from "react";
import { useSelector } from "react-redux";
import { PeopleList } from "./Components";
import { RenderSpace } from "../../shared";

export default function ModeratorsList({ sessionId, socket }) {
  const { participants } = useSelector((state) => state.participants);

  const listData = [
    { title: "Admin List", list: Object.values(participants?.admin || {}) },
    { title: "Moderators List", list: Object.values(participants?.moderator || {}) },
    { title: "Listeners List", list: Object.values(participants?.participant?.listener || {}) },
  ];

  return (
    <div>
      {listData.map(({ title, list }) => (
        <RenderSpace key={title} condition={list.length}>
          <PeopleList list={list} title={title} socket={socket} sessionId={sessionId} />
        </RenderSpace>
      ))}
    </div>
  );
}
