import React, { useEffect, useState } from "react";

const CircularProgressBar = ({
  progress,
  strokeWidth = 10,
  size = 100,
  outOff = 100,
  showOutOff = false,
}) => {
  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    setOffset(circumference - (progress / outOff) * circumference);
  }, [progress, circumference]);

  const point = outOff / 10;

  const getColor = (progress) => {
    if (progress < point * 1) return "#8B0000"; // Dark Red
    if (progress < point * 2) return "#FF0000"; // Red
    if (progress < point * 3) return "#FF4500"; // Orange Red
    if (progress < point * 4) return "#FFA500"; // Orange
    if (progress < point * 5) return "#FFFF00"; // Yellow
    if (progress < point * 6) return "#ADFF2F"; // Green Yellow
    if (progress < point * 7) return "#7CFC00"; // Lawn Green
    if (progress < point * 8) return "#008000"; // Green
    if (progress < point * 9) return "#00FF00"; // Lime
    return "#008000"; // Green
  };

  const color = getColor(progress);

  return (
    <div
      className="flex items-center justify-center relative"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        color={"red"}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          strokeWidth={strokeWidth}
          stroke="#6a6e6a"
          fill="none"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="none"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <div className="absolute  font-bold">
        {showOutOff ? (
          <div>
            <p className="text-sm">{progress}</p>

            <p className="text-xs flex items-center gap-1">
              {" "}
              <span className="text-normal">/</span> {outOff}
            </p>
          </div>
        ) : (
          progress
        )}
      </div>
    </div>
  );
};

export default CircularProgressBar;
