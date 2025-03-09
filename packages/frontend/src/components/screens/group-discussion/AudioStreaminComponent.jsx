import React, { useRef, useEffect, useMemo, useState } from "react";
import { useAudioControls, useStreaming } from "../../../hooks";
import { Button } from "../../ui";
import { IconContainer, RenderSpace } from "../../shared";

// Custom hook to handle video stream setup
const useVideoStream = (stream, ref) => {
  useEffect(() => {
    if (stream && ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
};

export const AudioStreamingComponent = ({
  socket,
  sessionId,
  groupDiscussionId,
  isCompleted,
}) => {
  const { localStream, remoteStreams, switchToNextSpeakerMic } = useStreaming({
    socket,
    sessionId,
    groupDiscussionId,
  });

  const { mutedUsers, toggleMute, isMuteLoading, muteInitialLoad, mutingList } =
    useAudioControls({
      localStream,
      socket,
      sessionId,
      switchToNextSpeakerMic,
    });

  const localVideoRef = useRef();
  const userId = localStorage.getItem("userId");

  useVideoStream(localStream, localVideoRef);

  const isMuted = useMemo(
    () => mutedUsers?.includes(userId),
    [mutedUsers, userId]
  );

  if (!isCompleted) {
    return (
      <div className="p-8 grid grid-cols-4">
        <RemoteVideo
          stream={localStream}
          userId={userId}
          toggleMute={toggleMute}
          muteInitialLoad={muteInitialLoad}
          mutingList={mutingList}
          mutedUsers={mutedUsers}
        />

        <RemoteStreams
          remoteStreams={remoteStreams}
          mutedUsers={mutedUsers}
          toggleMute={toggleMute}
          muteInitialLoad={muteInitialLoad}
          mutingList={mutingList}
        />
      </div>
    );
  }

  return null;
};

const RemoteStreams = React.memo(
  ({ remoteStreams, mutedUsers, toggleMute, muteInitialLoad, mutingList }) =>
    remoteStreams.map(({ socketId, stream, userId }) => (
      <RemoteVideo
        key={socketId}
        stream={stream}
        userId={userId}
        mutedUsers={mutedUsers}
        toggleMute={toggleMute}
        muteInitialLoad={muteInitialLoad}
        mutingList={mutingList}
      />
    ))
);

const RemoteVideo = React.memo(
  ({ stream, userId, mutedUsers, toggleMute, muteInitialLoad, mutingList }) => {
    const ref = useRef();
    useVideoStream(stream, ref);

    const isMuted = useMemo(
      () => mutedUsers?.includes(userId),
      [mutedUsers, userId]
    );

    return (
      <div className="flex flex-col w-[200px] gap-2 transition transform hover:-translate-y-1">
        <VideoComponent
          stream={stream}
          userId={userId}
          isMuted={isMuted || muteInitialLoad}
          isLoading={mutingList?.includes(userId)}
          toggleMute={toggleMute}
          disabled={mutingList?.includes(userId) || muteInitialLoad}
        />

        <div className="flex gap-2 ">
          <div className="rounded-full bg-gray-900 p-1 px-2 w-[90%] drop-shadow-xl">
            <p className="text-left text-xs truncate ">User: {userId}</p>
          </div>
          <div className="rounded-full bg-gray-900 px-1.5 drop-shadow-xl">
            <p className="text-left text-xs truncate ">...</p>
          </div>
        </div>
      </div>
    );
  }
);

const VideoComponent = ({
  stream,
  userId,
  isMuted,
  isLoading,
  toggleMute,
  disabled,
}) => {
  const videoRef = useRef();
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setVideoError(false);
    }
  }, [stream]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      ?.slice(0, 2)
      ?.map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="relative rounded-md  shadow-lg overflow-hidden">
      <div className="absolute top-2 right-2">
        <IconContainer
          name={isMuted ? "MicrophoneOff" : "MicrophoneOn"}
          className={
            isLoading
              ? "text-gray-900"
              : isMuted
              ? "text-red-500"
              : "text-gray-900"
          }
          containerClass={`w-[26px] rounded-full p-1 ${
            isLoading
              ? "border-gray-700"
              : isMuted
              ? "border-red-700 bg-red-200"
              : "border-gray-900 bg-gray-400"
          }`}
          isLoading={isLoading}
          onClick={() => toggleMute(userId, !isMuted)}
          disabled={disabled}
        />
      </div>

      {videoError ? (
        <div className="flex rounded-md w-[200px] h-[200px] items-center justify-center bg-gray-900">
          <div className="flex items-center justify-center bg-blue-900 text-white text-2xl font-bold rounded-full w-16 h-16 drop-shadow-2xl">
            {getInitials(userId)}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full rounded-md"
          onError={handleVideoError}
        />
      )}
    </div>
  );
};
