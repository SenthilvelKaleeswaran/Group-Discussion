import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

export const useWebSocket = (url, { disconnect = false }) => {
  const [socket, setSocket] = useState(null);
  const [events, setEvents] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [manualDisconnect, setManualDisconnect] = useState(disconnect);

  const connect = useCallback(() => {
    if (manualDisconnect) return;

    const token = localStorage.getItem("token");
    const newSocket = io(url, {
      auth: { token },
      reconnectionAttempts: 3,
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setSocket(null);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Dynamically handle incoming events
    newSocket.onAny((eventType, data) => {
      console.log(`Event received: ${eventType}`, data);
      setEvents((prev) => ({ ...prev, [eventType]: data }));
    });

    return newSocket;
  }, [url, manualDisconnect]);

  const closeSocket = useCallback(() => {
    if (socket) {
      console.log("Closing Socket.IO connection...");
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setManualDisconnect(true);
    }
  }, [socket]);

  const sendMessage = useCallback(
    (event, payload) => {
      if (socket && socket.connected) {
        socket.emit(event, payload);
      } else {
        console.warn("Socket.IO is not connected. Unable to send message.");
      }
    },
    [socket]
  );

  useEffect(() => {
    const newSocket = connect();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up Socket.IO connection...");
      newSocket?.disconnect();
    };
  }, [connect]);

  return { socket, sendMessage, events, closeSocket, isConnected };
};
