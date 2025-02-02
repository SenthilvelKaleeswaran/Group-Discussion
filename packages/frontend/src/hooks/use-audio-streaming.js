import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";

export const useStreaming = ({ socket, sessionId, groupDiscussionId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peersRef = useRef({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!socket || !sessionId) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        socket.emit("join-room", { sessionId, userId, groupDiscussionId });

        socket.on("user-list", (users) => {
          users.forEach(({ socketId }) => createPeer(socketId, stream));
        });

        socket.on("receive-signal", ({ socketId, signal }) => {
          if (!peersRef.current[socketId]) {
            handleIncomingPeer(socketId, signal, stream);
          } else {
            peersRef.current[socketId].signal(signal);
          }
        });

        socket.on("user-left", ({socketId}) => {
          console.log("User left:", socketId);  // Log user leaving
          removePeer(socketId);
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initMedia();

    // Handle tab close/refresh or browser navigation events
    const handleBeforeUnload = () => {
      socket.emit("user-left", {  userId, sessionId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up listeners and stop local stream
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      socket.off("user-list");
      socket.off("receive-signal");

      if (localStream) localStream.getTracks().forEach((track) => track.stop());

      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      peersRef.current = {};

      // Emit 'user-left' when the user disconnects or leaves
      socket.emit("user-left", {  userId, sessionId });
    };
  }, [socket, sessionId, groupDiscussionId]);

  const createPeer = (socketId, stream) => {
    if (peersRef.current[socketId]) return;

    const peer = new SimplePeer({ initiator: true, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("send-signal", { signal, to: socketId });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => [
        ...prev.filter((p) => p.socketId !== socketId),
        { socketId, stream: remoteStream },
      ]);
    });

    peer.on("error", (error) => console.error("Peer error:", error));

    peersRef.current[socketId] = peer;
  };

  const handleIncomingPeer = (socketId, incomingSignal, stream) => {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signal) => {
      socket.emit("send-signal", { signal, to: socketId });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => [
        ...prev.filter((p) => p.socketId !== socketId),
        { socketId, stream: remoteStream },
      ]);
    });

    peer.signal(incomingSignal);
    peer.on("error", (error) => console.error("Peer error:", error));

    peersRef.current[socketId] = peer;
  };

  const removePeer = (socketId) => {
    console.log({peersRef,remoteStreams})
    if (peersRef.current[socketId]) {
      console.log({ removePeer: socketId });
      peersRef.current[socketId].destroy();
      delete peersRef.current[socketId];
    }
    setRemoteStreams((prev) => prev.filter((p) => p.socketId !== socketId));
  };

  return { localStream, remoteStreams };
};
