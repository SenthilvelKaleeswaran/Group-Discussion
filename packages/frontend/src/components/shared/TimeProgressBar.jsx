import React, { useState, useEffect } from "react";

export const TimeProgressBar = ({ duration }) => {
  const [progress, setProgress] = useState(100);

  // Function to calculate the color from green to red
  const calculateColor = (percentage) => {
    const red = Math.min(255, Math.floor((100 - percentage) * 2.55)); // Increase red as progress decreases
    const green = Math.min(255, Math.floor(percentage * 2.55)); // Decrease green as progress decreases
    return `rgb(${red}, ${green}, 0)`; // Combine red and green for the color
  };

  useEffect(() => {
    const interval = duration / 100; // Calculate the time for each decrement
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer); // Stop the interval when progress reaches 0
          return 0;
        }
        return prev - 1; // Decrease progress by 1%
      });
    }, interval);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [duration]);

  return (
    <div className="relative w-full h-4 bg-gray-300 rounded">
      <div
        className="absolute h-4 rounded"
        style={{
          width: `${progress}%`,
          backgroundColor: calculateColor(progress), // Dynamic color
          transition: "width 0.1s linear, background-color 0.1s linear", // Smooth transition
        }}
      />
    </div>
  );
};
