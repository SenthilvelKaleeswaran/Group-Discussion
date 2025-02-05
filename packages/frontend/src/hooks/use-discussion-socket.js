import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMuteInitialLoad,
  updateMutedParticipants,
  updateParticipants,
  setUserRole,
} from "../store";
import toast from "react-hot-toast";
import { displayToast } from "../components/shared";

export const useDiscussionSocket = ({
  events,
  sendMessage,
  currentSpeech,
  conversation,
  setChoosingRandomMember,
  selectMember,
  setCurrentSpeech,
  setConversation,
  setProcessingPoint,
  setStatus,
  closeSocket,
  refetch,
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
      dispatch(setUserRole(role));
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

  // session
  useEffect(() => {
    if (events.START_SESSION_LOADING) {
      displayToast({
        id: "START_SESSION_LOADING",
        data: events.START_SESSION_LOADING,
      });
    }
  }, [events.START_SESSION_LOADING]);

  useEffect(() => {
    if (events.START_SESSION_LOADED) {
      displayToast({
        id: "START_SESSION_LOADED",
        remove: ["START_SESSION_LOADING"],
        data: events.START_SESSION_LOADED,
      });
      localStorage.removeItem("START_SESSION");

      refetch()
        .then(() => {
          console.log("i came");
          sendMessage("START_TIMER", { duration: 10 });
        })
        .catch((error) => {
          console.error("Error in refetch:", error);
          displayToast({
            id: "REFETCH_ERROR",
            type: "error",
            message: "Failed to update session. Please try again.",
          });
        });
    }
  }, [events.START_SESSION_LOADED]);

  useEffect(() => {
    if (events.PAUSE_SESSION_LOADING) {
      displayToast({
        id: "PAUSE_SESSION_LOADING",
        data: events.PAUSE_SESSION_LOADING,
        remove: ["START_SESSION_LOADED"],
      });
    }
  }, [events.PAUSE_SESSION_LOADING]);

  useEffect(() => {
    if (events.PAUSE_SESSION_LOADED) {
      displayToast({
        id: "PAUSE_SESSION_LOADED",
        remove: ["PAUSE_SESSION_LOADING"],
        data: events.PAUSE_SESSION_LOADED,
      });
      localStorage.removeItem("PAUSE_SESSION");
      refetch();
    }
  }, [events.PAUSE_SESSION_LOADED]);

  useEffect(() => {
    if (events.RESUME_SESSION_LOADING) {
      displayToast({
        id: "RESUME_SESSION_LOADING",
        data: events.RESUME_SESSION_LOADING,
        remove: ["PAUSE_SESSION_LOADED"],
      });
    }
  }, [events.RESUME_SESSION_LOADING]);

  useEffect(() => {
    if (events.RESUME_SESSION_LOADED) {
      displayToast({
        id: "RESUME_SESSION_LOADED",
        remove: ["RESUME_SESSION_LOADING"],
        data: events.RESUME_SESSION_LOADED,
      });
      localStorage.removeItem("RESUME_SESSION");
      refetch();
    }
  }, [events.RESUME_SESSION_LOADED]);

  useEffect(() => {
    if (events.END_SESSION_LOADING) {
      displayToast({
        id: "END_SESSION_LOADING",
        data: events.END_SESSION_LOADING,
        remove: ["RESUME_SESSION_LOADED"],
      });
    }
  }, [events.END_SESSION_LOADING]);

  useEffect(() => {
    if (events.END_SESSION_LOADED) {
      displayToast({
        id: "END_SESSION_LOADED",
        remove: ["END_SESSION_LOADING"],
        data: events.END_SESSION_LOADED,
      });
      localStorage.removeItem("END_SESSION");
      refetch();
    }
  }, [events.END_SESSION_LOADED]);

 

  // discussion queue
  useEffect(() => {
    if (events.DISCUSSION_QUEUE_LOADING) {
      displayToast({
        id: "DISCUSSION_QUEUE_LOADING",
        data: events.DISCUSSION_QUEUE_LOADING,
      });
    }
  }, [events.DISCUSSION_QUEUE_LOADING]);

  useEffect(() => {
    if (events.DISCUSSION_QUEUE_UPDATED) {
      const { queue = [], notify } = events.DISCUSSION_QUEUE_UPDATED;
      displayToast({
        id: "DISCUSSION_QUEUE_UPDATED",
        remove: ["DISCUSSION_QUEUE_LOADING"],
        data: notify,
      });

      if (queue) {
        //update Queue
      }
    }
  }, [events.DISCUSSION_QUEUE_UPDATED]);

  useEffect(() => {
    if (events.DISCUSSION_QUEUE_ERROR) {
      displayToast({
        id: "DISCUSSION_QUEUE_ERROR",
        data: events.DISCUSSION_QUEUE_ERROR,
        remove: ["DISCUSSION_QUEUE_LOADING"],
      });
    }
  }, [events.DISCUSSION_QUEUE_ERROR]);

  useEffect(() => {
    if (events.DISCUSSION_QUEUE_NO_PARTICIPANT) {
      displayToast({
        id: "DISCUSSION_QUEUE_NO_PARTICIPANT",
        data: events.DISCUSSION_QUEUE_NO_PARTICIPANT,
      });
    }
  }, [events.DISCUSSION_QUEUE_NO_PARTICIPANT]);

  useEffect(() => {
    if (events.DISCUSSION_QUEUE_COMPLETED) {
      displayToast({
        id: "DISCUSSION_QUEUE_COMPLETED",
        data: events.DISCUSSION_QUEUE_COMPLETED,
      });
    }
  }, [events.DISCUSSION_QUEUE_COMPLETED]);

  // turn to

  useEffect(() => {
    if (events.TURN_TO_SPEAK) {

      const { type , message} = events.TURN_TO_SPEAK

      displayToast({
        id: "TURN_TO_SPEAK",
        data: { notification : !type ? 'Your turn to speak !' : 'Quick important updation'},
      });

      if(message){
        // upadte
      }
    }
  }, [events.TURN_TO_SPEAK]);


  useEffect(() => {
    if (events.TURN_TO_SPEAK_NOTIFY_OTHERS) {
      displayToast({
        id: "TURN_TO_SPEAK_NOTIFY_OTHERS",
        data: events.TURN_TO_SPEAK_NOTIFY_OTHERS,
      });
    }
  }, [events.TURN_TO_SPEAK_NOTIFY_OTHERS]);

 
  useEffect(() => {
    if (events.TURN_TO_SPEAK_INACTIVE) {
      displayToast({
        id: "TURN_TO_SPEAK_INACTIVE",
        data: events.TURN_TO_SPEAK_INACTIVE,
      });
    }
  }, [events.TURN_TO_SPEAK_INACTIVE]);

  

  //  next participant

  useEffect(() => {
    if (events.NEXT_PARTICIPANT_LOADING) {
      displayToast({
        id: "NEXT_PARTICIPANT_LOADING",
        data: events.NEXT_PARTICIPANT_LOADING,
      });
    }
  }, [events.NEXT_PARTICIPANT_LOADING]);

  useEffect(() => {
    if (events.NEXT_PARTICIPANT_ERROR) {
      displayToast({
        id: "NEXT_PARTICIPANT_ERROR",
        data: events.NEXT_PARTICIPANT_ERROR,
      });
    }
  }, [events.NEXT_PARTICIPANT_ERROR]);
};
