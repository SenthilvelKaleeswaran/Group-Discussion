import { useState, useEffect } from "react";
import { Button } from "../ui";

export const InitialTimer = ({ socket }) => {
  const [timer, setTimer] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    socket.on("TIMER_UPDATE", ({ remainingTime }) => {
      setIsAnimating(true);
      setTimer(remainingTime);
    });

    socket.on("TIMER_ENDED", () => {
      console.log("Timer ended");
    });

    return () => {
      socket.off("TIMER_UPDATE");
      socket.off("TIMER_ENDED");
    };
  }, [socket]);

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 500); 
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  const handleSessionUpdate = () => {
    socket.emit("UPDATE_SESSION_STATUS", { type: "PAUSE_SESSION" });
  };

  if (timer !== -1)
    return (
      <div className="h-full bg-black bg-opacity-70 rounded-lg absolute z-50 inset-4 flex items-center justify-center">
        <div className="flex flex-col items-center bg-green-600 p-6 rounded-lg shadow-lg">
          <div className="relative overflow-hidden h-12 w-20 flex items-center justify-center">
            <p
              className={`text-4xl font-bold text-white ${
                isAnimating ? "animate-drop" : ""
              }`}
            >
              {timer}
            </p>
          </div>
          <p className="text-white mt-2">Discussion Starts in</p>
          <Button
            label="Stop Discussion"
            className="mt-4"
            variant="destructive"
            disabled={timer <= 3}
            onClick={handleSessionUpdate}
          />
        </div>
      </div>
    );
};
