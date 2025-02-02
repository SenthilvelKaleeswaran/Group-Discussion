import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../ui";
import { TabComposed } from "../../ui";
import ParticipantList from "./ParticipantList";
import ModeratorsList from "./ModeratorsList";

export function DiscussionSettings() {
  const DISCUSSION_TAB_LIST = [
    {
      id: "participants",
      //   label: "Participants",
      icon: "Users",
      component: <ParticipantList />,
    },
    {
      id: "admin-controls",
      //   label: "Settings",
      icon: "Admin",
      component: <ModeratorsList />,
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
