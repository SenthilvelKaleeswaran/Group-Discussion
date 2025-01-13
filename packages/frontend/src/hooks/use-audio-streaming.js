import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

export const useAudioStreaming = ({
  socket,
  sendMessage,
  groupDiscussionId,
}) => {
  // const socket = useRef(null);
  const localStream = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnections = useRef({});
  const userId = localStorage.getItem("userId");

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    // socket.current = io(SERVER_URL);

    socket.current.emit("JOIN_SESSION", { groupDiscussionId, userId });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        localStream.current = stream;
      })
      .catch((err) => console.error("Error accessing local audio:", err));

    socket.current.on("USER_JOINED", ({ socketId }) => {
      callPeer(socketId);
    });

    socket.current.on("OFFER", async ({ senderId, sdp }) => {
      await handleOffer(senderId, sdp);
    });

    socket.current.on("ANSWER", async ({ senderId, sdp }) => {
      await handleAnswer(senderId, sdp);
    });

    socket.current.on("CANDIDATE", async ({ senderId, candidate }) => {
      await handleCandidate(senderId, candidate);
    });

    socket.current.on("USER_LEFT", ({ socketId }) => {
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
        setRemoteStreams((prev) =>
          prev.filter((stream) => stream.peerId !== socketId)
        );
      }
    });

    return () => {
      socket.current.emit("LEAVE_SESSION", { groupDiscussionId });
      socket.current.disconnect();
    };
  }, [groupDiscussionId, userId]);

  const createPeerConnection = useCallback(
    (peerId) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      localStream.current.getTracks().forEach((track) => {
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
          socket.current.emit("CANDIDATE", {
            groupDiscussionId,
            receiverId: peerId,
            candidate: event.candidate,
          });
        }
      };

      peerConnections.current[peerId] = peerConnection;

      return peerConnection;
    },
    [groupDiscussionId]
  );

  const callPeer = async (peerId) => {
    const peerConnection = createPeerConnection(peerId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.current.emit("OFFER", {
      groupDiscussionId,
      receiverId: peerId,
      sdp: offer,
    });
  };

  const handleOffer = async (peerId, offer) => {
    const peerConnection = createPeerConnection(peerId);

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.current.emit("ANSWER", {
      groupDiscussionId,
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

  return {
    localStream: localStream.current,
    remoteStreams,
  };
};
