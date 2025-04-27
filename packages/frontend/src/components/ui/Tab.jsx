"use client";

import { createContext, useContext, useState } from "react";
import Icon from "../../icons";
import { RenderSpace } from "../shared";

const TabsContext = createContext();

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

function Tabs({ children, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleSetActiveTab = (id) => {
    setActiveTab(id);
    if (onChange) {
      onChange(id);
    }
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleSetActiveTab }}
    >
      <div className="w-full bg-gray-900 border border-gray-700 rounded-lg shadow-sm">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabList({ children, className }) {
  return (
    <div
      className={`flex border-b border-gray-700 bg-gray-900 rounded-t-lg ${className}`}
    >
      {children}
    </div>
  );
}

function Tab({ children, id, icon, iconStyle }) {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 text-sm font-medium transition-colors 
        ${
          activeTab === id
            ? "text-gray-900 bg-gray-200 border-b-2 border-gray-400"
            : "text-gray-500 hover:text-gray-700"
        } flex items-center gap-2`}
    >
      <RenderSpace condition={icon}>
        <Icon name={icon} className={`w-4 h-4 text-gray-400 ${iconStyle}`} />
      </RenderSpace>

      <span>{children}</span>
    </button>
  );
}

function TabPanels({ children }) {
  return <div className="p-4 bg-gray-900 rounded-b-lg">{children}</div>;
}

function TabPanel({ children, id }) {
  const { activeTab } = useTabs();

  if (activeTab !== id) return null;

  return <div>{children}</div>;
}

const TabComposed = ({
  defaultTab,
  tabListStyle = "",
  list = [],
  onChange,
}) => {
  return (
    <Tabs defaultTab={defaultTab}>
      <TabList className={` flex justify-between gap-1 ${tabListStyle}`}>
        {list?.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            icon={tab.icon}
            iconStyle={tab.iconStyle}
            onChange={onChange}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        {list?.map((tab) => (
          <TabPanel key={tab.id} id={tab.id} icon={tab.icon}>
            {tab.component}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};

export { Tabs, TabList, Tab, TabPanels, TabPanel, TabComposed };
