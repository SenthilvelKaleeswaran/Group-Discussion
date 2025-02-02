import React from "react";

export const Badge = ({ topic, value, valueColor }) => {
  return (
    <div className="space-x-0.5 w-fit p-1.5 rounded-full bg-gray-800 shadow-2xl">
      <span
        className={
          "text-xs font-semibold bg-gray-900 p-1 px-2 rounded-full text-gray-400"
        }
      >
        {topic}
      </span>
      <span className="w-0.5 h-full bg-black"></span>
      <span
        className={"text-xs font-semibold p-1 px-2 rounded-full text-gray-900"}
        style={{ backgroundColor: valueColor }}
      >
        {value}
      </span>
    </div>
  );
};
