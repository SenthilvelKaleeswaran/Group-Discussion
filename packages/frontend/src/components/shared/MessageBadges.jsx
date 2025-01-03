import React from "react";
import { Badge } from "../ui";
import { formatTopicName, getColors } from "../../utils";

export const MessageBadges = ({ data }) => {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {Object.entries(data || {})?.map(([topic, value]) => {
        const valueColor = getColors(value);
        const formattedTopic = formatTopicName(topic);

        if (value !== "N/A")
          return (
            <Badge
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
