import React from "react";
import { Badge } from "../ui";
import { formatTopicName, getColors } from "../../utils";

export const MessageBadges = ({ data }) => {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {Object.entries(data || {})?.map(([topic, value]) => {
        const formattedValue = formatTopicName(value)
        const valueColor = getColors(formattedValue);
        const formattedTopic = formatTopicName(topic);

        if (value !== "N/A")
          return (
            <Badge
              key={topic + value}
              topic={formattedTopic}
              value={formattedValue}
              valueColor={valueColor}
            />
          );
      })}
    </div>
  );
};
