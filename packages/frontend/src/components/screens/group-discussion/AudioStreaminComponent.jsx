import React, { useRef, useEffect, useState } from "react";
import { useAudioControls, useStreaming } from "../../../hooks";
import { Button } from "../../ui";
import { RenderSpace } from "../../shared";

export const AudioStreamingComponent = ({
  socket,
  sessionId,
  groupDiscussionId,
}) => {
  const { localStream, remoteStreams } = useStreaming({
    socket,
    sessionId,
    groupDiscussionId,
  });

  const { mutedUsers, toggleMute, isMuteLoading, muteInitialLoad, mutingList } =
    useAudioControls({
      localStream,
      socket,
      sessionId,
    });

  const localVideoRef = useRef();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const isMuted = mutedUsers?.includes(userId);

  return (
    <div className="p-8">
      <h2>Video Conference</h2>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted={isMuted || muteInitialLoad}
        style={{ width: "100px", border: "2px solid black" }}
      />
      <p>User: {userId}</p>

      <RenderSpace condition={!muteInitialLoad}>
        <Button
          onClick={() => toggleMute(userId, !isMuted)}
          label={
            mutingList?.includes(userId)
              ? "Loading..."
              : isMuted
              ? "Unmute Myself"
              : "Mute Myself"
          }
          disabled={mutingList?.includes(userId) || muteInitialLoad}
        />
      </RenderSpace>

      <div className="p-4">
        <h3>Remote Streams</h3>
        {remoteStreams.map(({ socketId, stream, userId }) => (
          <RemoteVideo
            key={socketId}
            stream={stream}
            userId={userId}
            mutedUsers={mutedUsers}
            toggleMute={toggleMute}
            muteInitialLoad={muteInitialLoad}
            mutingList={mutingList}
          />
        ))}
      </div>
    </div>
  );
};

const RemoteVideo = ({
  stream,
  userId,
  mutedUsers,
  toggleMute,
  muteInitialLoad,
  mutingList,
}) => {
  const ref = useRef();

  useEffect(() => {
    if (stream && ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  const isMuted = mutedUsers?.includes(userId);

  return (
    <div>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={isMuted || muteInitialLoad}
      />
      <p>User: {userId}</p>

      <Button
        onClick={() => toggleMute(userId, !isMuted)}
        label={
          mutingList?.includes(userId)
            ? "Loading..."
            : isMuted
            ? "Unmute"
            : "Mute"
        }
        disabled={mutingList?.includes(userId) || muteInitialLoad}
      />
    </div>
  );
};
