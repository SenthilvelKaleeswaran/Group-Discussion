import React, { useEffect } from "react";
import { useAudioStreaming } from "../../../hooks";
import { RenderSpace } from "../../shared";

export const AudioStreamingComponent = ({
  socket,
  sessionId,
  groupDiscussionId,
}) => {
  const { localStream, remoteStreams } = useAudioStreaming({
    socket,
    sessionId,
    groupDiscussionId,
  });
  console.log({ localStream, remoteStreams });

  useEffect(() => {
    remoteStreams.forEach(({ peerId, stream }) => {
      const audioElement = document.getElementById(`audio-${peerId}`);
      if (audioElement && stream) {
        audioElement.srcObject = stream;
        audioElement.play().catch((err) => console.error("Error playing audio:", err));
      }
    });
  }, [remoteStreams]);

  return (
    <div>
      <h1>Audio Streaming</h1>
      {/* <RenderSpace condition={localStream}>
        <div>
          <h2>Your Audio</h2>
          <audio
            autoPlay
            ref={(audio) => {
              if (audio) audio.srcObject = localStream;
            }}
          />
        </div>
      </RenderSpace> */}

      <RenderSpace condition={remoteStreams?.length > 0}>
        <div>
          <h2>Remote Audio Streams</h2>
          {/* {remoteStreams.map(({ peerId, stream }) => (
  <audio key={peerId} id={`audio-${peerId}`} srcObject={stream} autoPlay />
))} */}
          {remoteStreams.map(({ peerId, stream }) => (
            <div key={peerId}>
              <h3>Peer {peerId}</h3>
              <audio
                autoPlay
                ref={(audio) => {
                  if (audio) audio.srcObject = stream;
                }}
                key={peerId}
                id={`audio-${peerId}`}
              />
            </div>
          ))}
        </div>
      </RenderSpace>
    </div>
  );
};
