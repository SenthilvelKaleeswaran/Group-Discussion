import React, { useEffect, useState } from "react";

export function DiscussionProgress({ events }) {
  const [notification, setNotification] = useState({ message: "", type: "" });
  useEffect(() => {
    if (events.NOTIFICATION) {
      setNotification(events.NOTIFICATION);
    }
  }, [events.NOTIFICATION]);
  return (
    <div className="border drop-shadow-2xl rounded-md py-8 px-2">
      <p>{notification?.message}</p>
    </div>
  );
}
