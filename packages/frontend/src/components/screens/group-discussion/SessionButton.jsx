import React from "react";
import { LoaderButton } from "../../shared/LoaderButton";
import { Button } from "../../ui";

export function SessionButton({ status, socket }) {
  const handleSessionUpdate = (type) => {
    socket.emit("UPDATE_SESSION_STATUS", { type });
  };

  const renderButton = () => {
    switch (status) {
      case "NOT_STARTED":
        return (
          <LoaderButton
            id="START_SESSION"
            condition={status === "IN_PROGRESS"}
            onClick={() => handleSessionUpdate("START_SESSION")}
            buttonProps={{ label: "Start Discussion" }}
          />
        );

      case "IN_PROGRESS":
        return (
          <div className="flex gap-2">
            <LoaderButton
              id="PAUSE_SESSION"
              condition={status === "PAUSED"}
              onClick={() => handleSessionUpdate("PAUSE_SESSION")}
              buttonProps={{ label: "Pause" }}
            />
            <LoaderButton
              id="END_SESSION"
              condition={status === "COMPLETED"}
              onClick={() => handleSessionUpdate("END_SESSION")}
              buttonProps={{ label: "End Discussion" }}
            />
          </div>
        );

      case "PAUSED":
        return (
          <LoaderButton
            id="RESUME_SESSION"
            condition={status === "IN_PROGRESS"}
            onClick={() => handleSessionUpdate("RESUME_SESSION")}
            buttonProps={{ label: "Resume Discussion" }}
          />
        );

      case "COMPLETED":
        return <Button label="Completed" variant="success" disabled />;

      default:
        return null;
    }
  };

  return <div>{renderButton()}</div>;
}
