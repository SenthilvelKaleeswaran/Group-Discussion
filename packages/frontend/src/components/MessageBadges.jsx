import React from "react";
import AttachedBadge from "./UI/Badge";
import { formatTopicName } from "../utils/string/capitalizedFormat";

const MessageBadges = ({ data }) => {
    const getBadgeColor = (value, type) => {
        // let bgColor = "#f0f0f0"; // Default light gray for background
        let bgColor = '#ffe5e0'
        let textColor = "#333333"; // Default dark gray for topic text
        let valueColor = "#808080"; // Default gray for value text
      
        if (type === "intensity" || type === "polarity") {
          switch (value) {
            case "High":
              bgColor = "#ffe5e0"; // Light red
              textColor = "#cc0000"; // Dark red
              valueColor = "#ff5733"; // Vibrant red for value
              break;
            case "Medium":
              bgColor = "#fff8e1"; // Light yellow
              textColor = "#cc8e00"; // Dark yellow
              valueColor = "#ffc300"; // Vibrant yellow for value
              break;
            case "Low":
              bgColor = "#e6f7e9"; // Light green
              textColor = "#006600"; // Dark green
              valueColor = "#28b463"; // Vibrant green for value
              break;
            case "Neutral":
              bgColor = "#f5f5f5"; // Light gray
              textColor = "#808080"; // Dark gray
              valueColor = "#666666"; // Medium gray for value
              break;
            default:
              bgColor = "#f5f5f5";
              textColor = "#808080";
              valueColor = "#666666";
          }
        } else if (type === "polarity") {
          switch (value) {
            case "Positive":
              bgColor = "#e6f7e9"; // Light green
              textColor = "#006600"; // Dark green
              valueColor = "#28b463"; // Vibrant green
              break;
            case "Neutral":
              bgColor = "#f5f5f5"; // Light gray
              textColor = "#808080"; // Dark gray
              valueColor = "#666666"; // Medium gray
              break;
            case "Negative":
              bgColor = "#ffe5e0"; // Light red
              textColor = "#cc0000"; // Dark red
              valueColor = "#ff5733"; // Vibrant red
              break;
            default:
              bgColor = "#f5f5f5";
              textColor = "#808080";
              valueColor = "#666666";
          }
        } else if (type === "topic") {
          switch (value) {
            case "Aligned":
              bgColor = "#e6f7e9"; // Light green
              textColor = "#006600"; // Dark green
              valueColor = "#28b463"; // Vibrant green
              break;
            case "Divergent":
              bgColor = "#fff8e1"; // Light yellow
              textColor = "#cc8e00"; // Dark yellow
              valueColor = "#ffc300"; // Vibrant yellow
              break;
            case "Detached":
              bgColor = "#ffe5e0"; // Light red
              textColor = "#cc0000"; // Dark red
              valueColor = "#ff5733"; // Vibrant red
              break;
            default:
              bgColor = "#f5f5f5";
              textColor = "#808080";
              valueColor = "#666666";
          }
        }
      
        return { bgColor, textColor, valueColor };
      };
      
  const getTypeForTopic = (topic, value) => {
    const topicTypes = {
      selfCorrectionRate: "percentage", // "percentage" handled as "percentage"
      constructiveness: "percentage",
      empathyDetection: "percentage",
      intensityOfEmotion: "intensity", // Low/Medium/High
      polarity: "polarity", // Positive/Neutral/Negative
      turnDominance: "percentage", // "N/A" handled as "n/a"
      topicRelevance: "topic", // Aligned/Divergent/Detached
    };
    return getBadgeColor(value, topicTypes[topic] || "percentage");
  };

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {Object.entries(data||{})?.map(([topic, value]) => {
        const colors = getTypeForTopic(topic, value);
        const formattedTopic = formatTopicName(topic);

        console.log({ colors});
        if (value !== "N/A")
          return (
            <AttachedBadge
              topic={formattedTopic}
              value={value}
              {...colors}
            />
          );
      })}
    </div>
  );
};

export default MessageBadges;
