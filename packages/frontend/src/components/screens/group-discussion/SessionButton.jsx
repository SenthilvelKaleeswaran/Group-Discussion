import React from "react";
import { Button } from "../../ui";

export function SessionButton({ status, socket }) {
  const handleSessionUpdate = (type) => {
    socket.emit("UPDATE_SESSION_STATUS", { type });
  };

  const renderButton = () => {
    switch (status) {
      case "NOT_STARTED":
        return (
          <Button
            label="Start Discussion"
            onClick={() => handleSessionUpdate("START_SESSION")}
          />
        );
      case "IN_PROGRESS":
        return (
          <Button
            label="End Discussion"
            onClick={() => handleSessionUpdate("END_SESSION")}
          />
        );
      case "PAUSED":
        return (
          <Button
            label="Resume Discussion"
            onClick={() => handleSessionUpdate("RESUME_SESSION")}
          />
        );
      case "COMPLETED":
        return <Button label="Completed" variant="success" />;
      default:
        return (
          <Button
            label="Start Discussion"
            onClick={() => handleSessionUpdate("START_SESSION")}
          />
        );
    }
  };

  return <div>{renderButton()}</div>;
}
