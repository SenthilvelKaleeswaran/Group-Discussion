import clsx from "clsx";
import React from "react";

const AttachedBadge = ({ topic, value, bgColor, textColor, valueColor }) => {
  return (
    <div
      className={clsx("space-x-1 w-fit rounded-full px-4 pb-1")}
      style={{
        backgroundColor: bgColor, // Optional background for visibility
      }}
    >
      <span
        className={clsx("text-xs font-semibold")}
        style={{
          color: textColor, // Topic text color
        }}
      >
        {topic}
      </span>
      <span className="w-0.5 h-full bg-black"></span>
      <span
        className={clsx("text-xs font-semibold")}
        style={{
          color: valueColor, // Value text color
        }}
      >
        {value}
      </span>
    </div>
  );
};

export default AttachedBadge;
