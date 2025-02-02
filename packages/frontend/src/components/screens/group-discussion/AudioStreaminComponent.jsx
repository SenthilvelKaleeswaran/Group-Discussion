import React, { useRef, useEffect } from "react";
import { useStreaming } from "../../../hooks";

export const AudioStreamingComponent = ({socket,sessionId,groupDiscussionId}) => {
  const { localStream, remoteStreams } = useStreaming({
    socket,
    sessionId,
    groupDiscussionId,
  });

  const localVideoRef = useRef();

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="p-8">
      <h2>Video Conference</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: "300px", border: "2px solid black" }} />
      <div className="p-4">
        <h3>Remote Streams</h3>
        {remoteStreams.map(({ socketId, stream }) => (
          <>
          <RemoteVideo key={socketId} stream={stream} />
          <div>{socketId}</div>
          </>
        ))}
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream }) => {
  const ref = useRef();

  useEffect(() => {
    if (stream && ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline className="border w-40 h-20 border-red-500 rounded-md" />;
};
