import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";

export const useStreaming = ({ socket, sessionId, groupDiscussionId }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peersRef = useRef({});
  const userId = localStorage.getItem("userId");

  // ✅ Check for microphone and camera permissions
  const checkPermissions = async () => {
    try {
      const microphone = await navigator.permissions.query({ name: "microphone" });
      const camera = await navigator.permissions.query({ name: "camera" });

      console.log({microphone,camera})

      if (microphone.state === "denied") {
        throw new Error("Microphone access denied. Please allow microphone permissions.");
      }
      if (camera.state === "denied") {
        throw new Error("Camera access denied. Please allow camera permissions.");
      }
    } catch (error) {
      console.error("Permission error:", error);
    }
  };

  const stopPreviousStreams = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };
  

  // 🎥 Initialize local media (video & audio)
  const initMedia = async () => {
    try {
      await checkPermissions();
      stopPreviousStreams()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Local media stream initialized:", stream);
      setLocalStream(stream);

      // Emit join-room event to the server
      socket.emit("join-room", { sessionId, userId, groupDiscussionId });

      // Handle user list from the server
      socket.on("user-list", (users) => {
        console.log("Users in the room:", users);
        users.forEach(({ socketId, userId }) => createPeer({ socketId, userId, stream }));
      });

      // Handle incoming WebRTC signals
      socket.on("receive-signal", ({ socketId, userId, signal }) => {
        console.log("Received signal from:", socketId);
        if (!peersRef.current[socketId]) {
          handleIncomingPeer({ socketId, userId, incomingSignal: signal, stream });
        } else {
          peersRef.current[socketId].signal(signal);
        }
      });

      // Handle user disconnection
      socket.on("user-left", ({ socketId }) => {
        console.log("User left:", socketId);
        removePeer(socketId);
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // 📞 Create a new peer connection
  const createPeer = ({ socketId, userId, stream }) => {
    if (peersRef.current[socketId]) return;

    console.log("Creating new peer:", socketId);

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("Sending signal to:", socketId);
      socket.emit("send-signal", { signal, to: socketId });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received remote stream from:", socketId);
      setRemoteStreams((prev) => [
        ...prev.filter((p) => p.socketId !== socketId),
        { socketId, userId, stream: remoteStream },
      ]);
    });

    peer.on("error", (error) => console.error("Peer error:", error));

    peersRef.current[socketId] = peer;
  };

  // 📲 Handle incoming peer connection
  const handleIncomingPeer = ({ socketId, userId, incomingSignal, stream }) => {
    console.log("Handling incoming peer:", socketId);

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      console.log("Sending return signal to:", socketId);
      socket.emit("send-signal", { signal, to: socketId });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received remote stream from:", socketId);
      setRemoteStreams((prev) => [
        ...prev.filter((p) => p.socketId !== socketId),
        { socketId, userId, stream: remoteStream },
      ]);
    });

    peer.signal(incomingSignal);
    peer.on("error", (error) => console.error("Peer error:", error));

    peersRef.current[socketId] = peer;
  };

  // ❌ Remove a peer connection
  const removePeer = (socketId) => {
    console.log("Removing peer:", socketId);
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].destroy();
      delete peersRef.current[socketId];
    }
    setRemoteStreams((prev) => prev.filter((p) => p.socketId !== socketId));
  };

  // 🎤 Switch to the next speaker's microphone
  const switchToNextSpeakerMic = async () => {
    console.log("Switching to next speaker mic...",localStream);
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = false));
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      setLocalStream(stream);

      if (localStream) {
        localStream.getAudioTracks().forEach((track) => (track.enabled = true));
      }
    } catch (error) {
      console.error("Error switching microphone:", error);
    }
  };

  // 🧹 Cleanup on component unmount
  useEffect(() => {
    if (!socket || !sessionId) return;

    initMedia();

    // Handle window unload
    const handleBeforeUnload = () => {
      socket.emit("user-left", { userId, sessionId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      console.log("Cleaning up media and peer connections...");
      window.removeEventListener("beforeunload", handleBeforeUnload);

      socket.off("user-list");
      socket.off("receive-signal");
      socket.off("user-left");

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      peersRef.current = {};

      socket.emit("user-left", { userId, sessionId });
    };
  }, [socket, sessionId, groupDiscussionId]);

  // 🔄 Return local and remote streams
  return {
    localStream,
    remoteStreams,
    switchToNextSpeakerMic,
  };
};
