import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateMutedParticipants,
  setMuteLoading,
  setMutingList,
} from "../store";

export const useAudioControls = ({ localStream, socket, sessionId }) => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");

  const {
    mutedParticipants = [],
    isMuteLoading,
    muteInitialLoad,
    mutingList,
  } = useSelector((state) => state.controls);

  console.log({ mutedParticipants, mutingList });

  useEffect(() => {
    const handleMuteStatusChange = ({
      targetUserId,
      userId: actionDoneBy,
      isMuted,
    }) => {
      console.log({ targetUserId, userId, actionDoneBy, mutedParticipants });
      dispatch(
        updateMutedParticipants({
          mutedParticipants: !mutedParticipants?.includes(targetUserId)
            ? [...mutedParticipants, targetUserId]
            : mutedParticipants?.filter((id) => id !== targetUserId),
          mutedMember: actionDoneBy === userId ? targetUserId : null,
        })
      );
    };

    if (socket) socket.on("mute-status-changed", handleMuteStatusChange);

    return () => {
      if (socket) socket.off("mute-status-changed", handleMuteStatusChange);
    };
  }, [socket, mutedParticipants, dispatch]);

  const toggleMute = (targetUserId, isMuted) => {
    dispatch(setMutingList([...mutingList, targetUserId]));

    if (localStream && targetUserId === userId) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isMuted));
    }

    if (socket)
      socket.emit("toggle-mute", { sessionId, userId, targetUserId, isMuted });
  };

  return {
    mutedUsers: mutedParticipants,
    toggleMute,
    isMuteLoading,
    muteInitialLoad,
    mutingList,
  };
};
