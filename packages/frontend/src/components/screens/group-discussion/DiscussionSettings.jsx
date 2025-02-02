import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../ui";
import { TabComposed } from "../../ui";
import ParticipantList from "./ParticipantList";
import ModeratorsList from "./ModeratorsList";

export function DiscussionSettings({socket,sessionId}) {
  const DISCUSSION_TAB_LIST = [
    {
      id: "participants",
      //   label: "Participants",
      icon: "Users",
      component: <ParticipantList  sessionId={sessionId} socket={socket}  />,
    },
    {
      id: "admin-controls",
      //   label: "Settings",
      icon: "Admin",
      component: <ModeratorsList sessionId={sessionId} socket={socket} />,
    },
    {
      id: "settings",
      //   label: "Profile",
      icon: "Settings",
      component: <p>This is the Profile content.</p>,
    },
    {
      id: "blocked",
      icon: "Block",
      component: <p>Blocked</p>,
    },
  ];
  return (
    <div>
      <TabComposed defaultTab="participants" list={DISCUSSION_TAB_LIST} />
    </div>
  );
}
