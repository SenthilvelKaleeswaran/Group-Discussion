import React, { useEffect, useState } from "react";

export function AnimatingTimer({
  timer,
  className,
  isAnimating,
  setIsAnimating,
}) {
  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);
  return (
    <p
      className={`text-4xl font-bold text-white ${
        isAnimating ? "animate-drop" : ""
      } ${className}`}
    >
      {timer}
    </p>
  );
}
