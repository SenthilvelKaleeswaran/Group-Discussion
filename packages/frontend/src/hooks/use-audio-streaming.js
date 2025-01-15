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
 if (sessionId && socket) {
      // Join session
      socket.emit("JOIN_SESSION", { sessionId, groupDiscussionId, userId });

      // Get local audio stream
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          localStream.current = stream;
        })
        .catch((err) => console.error("Error accessing local audio:", err));

      // Handle incoming socket events
      socket.on("USER_JOINED", ({ userId }) => {
        callPeer(userId);
      });

      socket.on("OFFER", async ({ senderId, sdp }) => {
        await handleOffer(senderId, sdp);
      });

      socket.on("ANSWER", async ({ senderId, sdp }) => {
        await handleAnswer(senderId, sdp);
      });

      socket.on("CANDIDATE", async ({ senderId, candidate }) => {
        await handleCandidate(senderId, candidate);
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
      };
    }
  }, [sessionId, userId, socket]);

  const createPeerConnection = useCallback(
    (peerId) => {
      const peerConnection = new RTCPeerConnection(iceServers);

 localStream.current?.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream.current);
      });

      peerConnection.ontrack = (event) => {
        setRemoteStreams((prev) => [
          ...prev.filter((stream) => stream.peerId !== peerId),
          { peerId, stream: event.streams[0] },
        ]);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
 socket.emit("CANDIDATE", {
            sessionId,
            receiverId: peerId,
            candidate: event.candidate,
          });
        }
      };

      peerConnections.current[peerId] = peerConnection;
 return peerConnection;
    },
    [sessionId]
  );

  const callPeer = async (peerId) => {
    const peerConnection = createPeerConnection(peerId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

socket.emit("OFFER", {
      sessionId,
      receiverId: peerId,
      sdp: offer,
    });
  };

  const handleOffer = async (peerId, offer) => {
    const peerConnection = createPeerConnection(peerId);

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

 socket.emit("ANSWER", {
      sessionId,
      receiverId: peerId,
      sdp: answer,
    });
  };

  const handleAnswer = async (peerId, answer) => {
    const peerConnection = peerConnections.current[peerId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
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
