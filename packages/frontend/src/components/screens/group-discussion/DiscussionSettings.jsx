import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "../../ui";
import { TabComposed } from "../../ui";
import ParticipantList from "./ParticipantList";

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
      component: <p>This is the Settings content.</p>,
    },
    {
      id: "settings",
    //   label: "Profile",
      icon: "Settings",
      component: <p>This is the Profile content.</p>,
    },
  ];
  return (
    <div>
      <TabComposed defaultTab='participants' list={DISCUSSION_TAB_LIST} />
    </div>
  );
}
