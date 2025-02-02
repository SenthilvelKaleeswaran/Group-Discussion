import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMuteInitialLoad,
  updateGroupDiscussion,
  updateMutedParticipants,
  updateParticipants,
  updateUserRole,
} from "../store";
import toast from "react-hot-toast";

export const useDiscussionSocket = ({
  events,
  currentSpeech,
  conversation,
  setChoosingRandomMember,
  selectMember,
  setCurrentSpeech,
  setConversation,
  setProcessingPoint,
  setStatus,
  closeSocket,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (events.RANDOM_MEMBER) {
      const { isLoading, randomMember } = events.RANDOM_MEMBER;
      setChoosingRandomMember(isLoading);
      if (randomMember) {
        selectMember(randomMember);
      }
    }
  }, [events.RANDOM_MEMBER]);

  useEffect(() => {
    if (events.GENERATED_TEXT) {
      const { aiGeneratedText, conversation } = events.GENERATED_TEXT;

      if (aiGeneratedText && aiGeneratedText !== currentSpeech) {
        setCurrentSpeech(aiGeneratedText.slice(0, 100));
      } else if (!aiGeneratedText) {
        setCurrentSpeech("");
      }

      if (conversation) {
        setConversation(conversation);
        setProcessingPoint(null);
      }
    }
  }, [events.GENERATED_TEXT]);

  useEffect(() => {
    if (events.PERFORMANCE_METRICS) {
      const { messageId, metadata } = events.PERFORMANCE_METRICS;

      if (metadata) {
        let updatedConversation = [...conversation];
        for (let i = updatedConversation.length - 1; i >= 0; i--) {
          if (updatedConversation[i]._id === messageId) {
            updatedConversation[i] = { ...updatedConversation[i], metadata };
            break;
          }
        }
        setConversation(updatedConversation);
      }
    }
  }, [events.PERFORMANCE_METRICS, conversation]);

  useEffect(() => {
    if (events.CONVERSATION) {
      const { conversation, userSpeak } = events.CONVERSATION;
      console.log({
        aaaaaa: conversation,
        userSpeak,
        cccc: events.CONVERSATION,
      });

      if (conversation) setConversation(conversation);

      if (userSpeak) {
        setProcessingPoint(null);
        setCurrentSpeech("");
      }
    }
  }, [events.CONVERSATION]);

  useEffect(() => {
    if (events.COMPLETED) {
      const { completed, conversation } = events.COMPLETED;
      setConversation(conversation);

      if (completed) {
        setStatus("Completed");
        setProcessingPoint(null);
        setCurrentSpeech("");
        closeSocket();
      }
    }
  }, [events.COMPLETED]);

  useEffect(() => {
    if (events.PARTICIPANT_LIST) {
      const { participant, role } = events.PARTICIPANT_LIST;
      console.log({ PARTICIPANT_LIST: participant, role });
      dispatch(updateParticipants(participant));
      dispatch(updateUserRole(role));
    }
  }, [events.PARTICIPANT_LIST]);

  useEffect(() => {
    if (events.PARTICIPANT_LIST) {
      const { participant } = events.PARTICIPANT_LIST;

      const list = [
        ...participant?.participant,
        ...participant?.listener,
        ...participant?.admin,
        ...participant?.moderator,
      ];
      const mutedParticipants = list
        .filter((value) => value.isActive && value.muteStatus)
        .map((_) => _.userId);

      dispatch(updateMutedParticipants({ mutedParticipants }));
      dispatch(setMuteInitialLoad(false));
    }
  }, [events.PARTICIPANT_LIST]);

  useEffect(() => {
    if (events.UPDATED_CONTROLS) {
    }
  }, [events.UPDATED_CONTROLS]);
  console.log({ events });

  useEffect(() => {
    if (events.MUTE_SUCCESS) {
      const { message } = events.MUTE_SUCCESS;
      toast.success(message);
    }
  }, [events.MUTE_SUCCESS]);

  useEffect(() => {
    if (events.USER_MUTED) {
      const { message } = events.USER_MUTED;
      toast.success(message);
    }
  }, [events.USER_MUTED]);

  useEffect(() => {
    if (events.MUTE_ERROR) {
      const { message } = events.MUTE_ERROR;
      toast.error(message);
    }
  }, [events.MUTE_ERROR]);

};
