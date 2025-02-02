import { useEffect, useRef, useState, useCallback } from "react";

export const useAudioStreaming = ({ socket, sessionId, groupDiscussionId }) => {
  const localStream = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnections = useRef({});
  const userId = localStorage.getItem("userId");

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        localStream.current = stream;
      })
      .catch((err) => console.error("Error accessing local audio:", err));
  }, []); // Initialize once on mount

  useEffect(() => {
    // if (sessionId && socket) {
    // Join session
    socket.emit("JOIN_SESSION", { sessionId, groupDiscussionId, userId });

    // Handle incoming events

    socket.on("offer", async ({ senderId, sdp }) => {
      console.log("Received offer from:", senderId);
      await handleOffer(senderId, sdp);
    });

    socket.on("answer", async ({ senderId, sdp }) => {
      console.log("Received answer from:", senderId);
      await handleAnswer(senderId, sdp);
    });

    socket.on("candidate", async ({ senderId, candidate }) => {
      console.log("Received candidate from:", senderId);
      await handleCandidate(senderId, candidate);
    });

    socket.on("USER_JOINED", ({ userId }) => {
      callPeer(userId);
    });

    socket.on("USER_LEFT", ({ userId }) => {
      removePeerConnection(userId);
    });

    // Handle tab/browser close
    const handleBeforeUnload = () => {
      socket.emit("LEAVE_SESSION", { sessionId, groupDiscussionId, userId });
      socket.disconnect();
      cleanupConnections();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanupConnections();
    };
    // }
  }, [sessionId, userId, groupDiscussionId, socket]);

  const createPeerConnection = useCallback(
    (peerId) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      console.log({ localStream });

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          console.log({ aaaaa: track });
          // peerConnection.addTrack(track, localStream.current);
          peerConnection.addStream(localStream.current);
        });
      } else {
        console.error("No localStream available to add tracks.");
      }

      peerConnection.ontrack = (event) => {
        console.log(
          "ontrack event fired. Streams:",
          event.streams,
          peerId,
          remoteStreams
        );
        if (event.streams[0]) {
          setRemoteStreams((prev) => [
            ...prev.filter((stream) => stream.peerId !== peerId),
            { peerId, stream: event.streams[0] },
          ]);
        } else {
          console.error("No streams in ontrack event.");
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate:", event.candidate);
          socket.emit("candidate", {
            sessionId,
            groupDiscussionId,
            receiverId: peerId,
            candidate: event.candidate,
          });
        }
      };

      peerConnections.current[peerId] = peerConnection;
      return peerConnections.current[peerId];
    },
    [sessionId, socket]
  );

  const callPeer = async (peerId) => {
    const peerConnection = createPeerConnection(peerId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", {
      sessionId,
      receiverId: peerId,
      groupDiscussionId,
      sdp: offer,
    });
  };

  const handleOffer = async (peerId, offer) => {
    const peerConnection = createPeerConnection(peerId);

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("answer", {
      sessionId,
      receiverId: peerId,
      groupDiscussionId,
      sdp: answer,
    });
  };

  const handleAnswer = async (peerId, answer) => {
    const peerConnection = peerConnections.current[peerId];
    if (!peerConnection) {
      console.error(`Peer connection not found for ${peerId}`);
      return;
    }

    // Log the current signaling state
    console.log(
      `Signaling state for ${peerId}:`,
      peerConnection.signalingState,
      peerConnection.remoteDescription
    );

    // Ensure the remote description isn't already set
    if (peerConnection.remoteDescription) {
      console.warn(`Remote description already set for ${peerId}`);
      return;
    }

    try {
      // Set the remote description
      const a = await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      console.log(`Remote description set successfully for ${peerId}`, a);
    } catch (error) {
      console.error(`Error setting remote description for ${peerId}:`, error);
    }
  };

  const handleCandidate = async (peerId, candidate) => {
    const peerConnection = peerConnections.current[peerId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const removePeerConnection = (peerId) => {
    if (peerConnections.current[peerId]) {
      peerConnections.current[peerId].close();
      delete peerConnections.current[peerId];
      setRemoteStreams((prev) =>
        prev.filter((stream) => stream.peerId !== peerId)
      );
    }
  };

  const cleanupConnections = () => {
    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.close();
    });
    peerConnections.current = {};
    setRemoteStreams([]);
  };

  return {
    localStream: localStream.current,
    remoteStreams,
  };
};
