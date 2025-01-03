import React from "react";
import AttachedBadge from "./UI/Badge";
import { formatTopicName } from "../utils/string/capitalizedFormat";
import { getColors } from "../utils";

const MessageBadges = ({ data }) => {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {Object.entries(data || {})?.map(([topic, value]) => {
        const valueColor = getColors(value);
        const formattedTopic = formatTopicName(topic);

        if (value !== "N/A")
          return (
            <AttachedBadge
              key={topic + value}
              topic={formattedTopic}
              value={value}
              valueColor={valueColor}
            />
          );
      })}
    </div>
  );
};

export default MessageBadges;
