import { useSelector } from "react-redux";
import { AnimatingTimer } from "../../shared";
import { useState } from "react";

export const ConversationCountdown = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const { conversationTimer: timer = "" } = useSelector(
    (state) => state.conversation
  );
  return (
    <div>
      <AnimatingTimer
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        timer={timer}
      />
    </div>
  );
};
