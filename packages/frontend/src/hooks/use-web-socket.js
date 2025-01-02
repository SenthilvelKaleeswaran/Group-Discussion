import { useEffect, useState, useCallback } from "react";

export const useWebSocket = (url,{disconnect  = false}) => {
  const [ws, setWs] = useState(null);
  const [events, setEvents] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [manualDisconnect, setManualDisconnect] = useState(disconnect); // New state to track manual disconnection

  const connect = useCallback(() => {
    if (manualDisconnect) return; // Don't reconnect if manually disconnected

    const token = localStorage.getItem("token");
    const socket = new WebSocket(url, [`auth-${token}`]);

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setWs(socket);
      setIsConnected(true);
      setRetryCount(0); // Reset retry count on successful connection
    };

    socket.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        console.log(`Event received: ${eventType}`, data);
        setEvents((prev) => ({ ...prev, [eventType]: data }));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
      setWs(null);
      setIsConnected(false);

      if (!manualDisconnect && retryCount < 3) {
        console.log(`Retrying connection (${retryCount + 1}/3)...`);
        setRetryCount((prev) => prev + 1);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return socket;
  }, [url, retryCount, manualDisconnect]);

  const closeSocket = useCallback(() => {
    if (ws) {
      console.log("Closing WebSocket connection...");
      ws.close();
      setWs(null);
      setIsConnected(false);
      setRetryCount(0); // Reset retry count
      setManualDisconnect(true); // Mark as manually disconnected
    }
  }, [ws]);

  useEffect(() => {
    const socket = connect();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up WebSocket connection...");
      socket?.close();
    };
  }, [connect]);

  useEffect(() => {
    let retryTimeout;
    if (!isConnected && retryCount > 0 && retryCount <= 3 && !manualDisconnect) {
      retryTimeout = setTimeout(() => {
        console.log("Attempting to reconnect...");
        connect();
      }, 2000); // Retry after 2 seconds
    }
    return () => clearTimeout(retryTimeout);
  }, [isConnected, retryCount, connect, manualDisconnect]);

  const sendMessage = useCallback(
    (action, payload) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action, payload }));
      } else {
        console.warn("WebSocket is not open. Unable to send message.");
      }
    },
    [ws]
  );

  return { sendMessage, events, closeSocket, isConnected };
};
