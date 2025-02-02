import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateParticipants } from "../store";

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
      console.log({aaaaaa : conversation,userSpeak,cccc: events.CONVERSATION})

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
    if (events.PARTICIPANTS_UPDATED) {
      const participants = events.PARTICIPANTS_UPDATED
      dispatch(updateParticipants(participants));
    }
  }, [events.PARTICIPANTS_UPDATED]);
};
