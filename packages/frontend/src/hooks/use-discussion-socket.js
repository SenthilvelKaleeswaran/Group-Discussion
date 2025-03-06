import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMuteInitialLoad,
  updateMutedParticipants,
  updateParticipants,
  setUserRole,
  setDiscussionQueue,
  setUserStatus,
  setUserSession,
  setCurrentConverstion,
  setDiscussion,
  setAddDiscussion,
  setUpdateDiscussion,
  setPermissions,
  updateSession,
} from "../store";
import toast from "react-hot-toast";
import { displayToast } from "../components/shared";
import { useNavigate } from "react-router-dom";

export const useDiscussionSocket = ({
  groupDiscussionId,
  sessionId,
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
  const navigate = useNavigate();

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
      const { participant } = events.PARTICIPANT_LIST;
      console.log({ PARTICIPANT_LIST: participant });
      dispatch(updateParticipants(participant));
    }
  }, [events.PARTICIPANT_LIST]);

  useEffect(() => {
    if (events.USER_SESSION) {
      const { userSession, role } = events.USER_SESSION;
      if (userSession) dispatch(setUserSession(userSession));
      if (role) {
        dispatch(setUserRole(role));
        console.timeEnd("Time");
      }
    }
  }, [events.USER_SESSION]);

  useEffect(() => {
    if (events.PARTICIPANT_LIST) {
      const { participant } = events.PARTICIPANT_LIST;
      console.log({ PARTICIPANT_LIST: events.PARTICIPANT_LIST });

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
      displayToast({
        id: "PAUSE_SESSION_LOADED",
        remove: ["NEXT_PARTICIPANT_LOADING"],
        data: events.MUTE_ERROR,
      });
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
          sendMessage("START_TIMER", { duration: 5 });
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
      const {
        queue = [],
        notify,
        id = "",
        action = "",
        globalOrder,
      } = events.DISCUSSION_QUEUE_UPDATED;
      if (notify) {
        displayToast({
          id: "DISCUSSION_QUEUE_UPDATED",
          remove: ["DISCUSSION_QUEUE_LOADING"],
          data: notify,
        });
      }

      if (queue) {
        dispatch(setDiscussionQueue({ queue, globalOrder }));
      }

      if (action === "DELETE") {
        const data = JSON.parse(localStorage.getItem("QUEUE_DELETE"));

        const filter = data?.filter((_) => _ !== id);
        if (filter?.length)
          localStorage.setItem("QUEUE_DELETE", JSON.stringify(filter));
        else localStorage.removeItem("QUEUE_DELETE");
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
        remove: ["NEXT_PARTICIPANT_LOADING"],
      });
    }
  }, [events.DISCUSSION_QUEUE_NO_PARTICIPANT]);

  useEffect(() => {
    if (events.DISCUSSION_QUEUE_COMPLETED) {
      displayToast({
        id: "DISCUSSION_QUEUE_COMPLETED",
        data: events.DISCUSSION_QUEUE_COMPLETED,
        remove: ["NEXT_PARTICIPANT_LOADING"],
      });
    }
  }, [events.DISCUSSION_QUEUE_COMPLETED]);

  // turn to

  useEffect(() => {
    if (events.TURN_TO_SPEAK) {
      const { type, message, userStatus } = events.TURN_TO_SPEAK;

      displayToast({
        id: "TURN_TO_SPEAK",
        data: {
          notification:
            type === "YOUR_TURN"
              ? "Your turn to speak !"
              : "Quick important updation",
        },
        remove: ["NEXT_PARTICIPANT_LOADING"],
      });

      console.log({ userStatus });

      if (type === "YOUR_TURN" && userStatus) {
        console.log({ userStatus });

        dispatch(setUserStatus(userStatus));
        dispatch(setUserSession({ userStatus }));
      }

      if (message) {
        // upadte
      }
    }
  }, [events.TURN_TO_SPEAK]);

  useEffect(() => {
    if (events.TURN_TO_SPEAK_NOTIFY_OTHERS) {
      displayToast({
        id: "TURN_TO_SPEAK_NOTIFY_OTHERS",
        data: events.TURN_TO_SPEAK_NOTIFY_OTHERS,
        remove: ["NEXT_PARTICIPANT_LOADING"],
      });
    }
  }, [events.TURN_TO_SPEAK_NOTIFY_OTHERS]);

  useEffect(() => {
    if (events.TURN_TO_SPEAK_INACTIVE) {
      displayToast({
        id: "TURN_TO_SPEAK_INACTIVE",
        data: events.TURN_TO_SPEAK_INACTIVE,
        remove: ["NEXT_PARTICIPANT_LOADING"],
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
        remove: ["NEXT_PARTICIPANT_LOADING"],
      });
    }
  }, [events.NEXT_PARTICIPANT_ERROR]);

  // conversation

  useEffect(() => {
    if (events.TRANSCRIPT) {
      const { transcript } = events.TRANSCRIPT;
      dispatch(setCurrentConverstion(transcript));
    }
  }, [events.TRANSCRIPT]);

  useEffect(() => {
    if (events.AUDIO_ERROR) {
      displayToast({
        id: "AUDIO_ERROR",
        data: events.AUDIO_ERROR,
      });
    }
  }, [events.AUDIO_ERROR]);

  useEffect(() => {
    if (events.AUDIO_FINISHED) {
      displayToast({
        id: "AUDIO_FINISHED",
        data: events.AUDIO_FINISHED,
      });
      sendMessage("NEXT_PARTICIPANT", {});
    }
  }, [events.AUDIO_FINISHED]);

  // conversation

  useEffect(() => {
    if (events.CONVERSATION) {
      const { conversation = [] } = events.CONVERSATION;
      dispatch(setDiscussion(conversation));
    }
  }, [events.CONVERSATION]);

  useEffect(() => {
    if (events.CONVERSATION_ADD) {
      const { newConversation } = events.CONVERSATION_ADD;
      dispatch(setAddDiscussion({ newConversation }));
    }
  }, [events.CONVERSATION_ADD]);

  useEffect(() => {
    if (events.CONVERSATION_UPDATE) {
      const { updatedConversation } = events.CONVERSATION_UPDATE;
      dispatch(setUpdateDiscussion({ updatedConversation }));
    }
  }, [events.CONVERSATION_UPDATE]);

  //next round

  useEffect(() => {
    if (events.NEXT_ROUND_LOADING) {
      displayToast({
        id: "NEXT_ROUND_LOADING",
        data: events.NEXT_ROUND_LOADING,
      });
    }
  }, [events.NEXT_ROUND_LOADING]);

  useEffect(() => {
    if (events.NEXT_ROUND_SWITCH) {
      const { newSession } = events.NEXT_ROUND_SWITCH;

      if (newSession) {
        navigate(`/gd/${groupDiscussionId}-${newSession}`, {
          replace: true,
        });

        displayToast({
          id: "NEXT_ROUND_SWITCH",
          data: { message: "Switched to the next round successfully!" },
          remove: ["NEXT_ROUND_LOADING"],
        });
      }
    }
  }, [events.NEXT_ROUND_SWITCH]);

  useEffect(() => {
    if (events.NEXT_ROUND_STAY) {
      const { displayResult } = events.NEXT_ROUND_STAY;

      
    }
  }, [events.NEXT_ROUND_STAY]);

  useEffect(() => {
    if (events.NEXT_ROUND_ERROR) {
      const { error } = events.NEXT_ROUND_ERROR;
      displayToast({
        id: "NEXT_ROUND_ERROR",
        data: { message: `Error creating next round: ${error}` },
        remove: ["NEXT_ROUND_LOADING"],
      });
    }
  }, [events.NEXT_ROUND_ERROR]);

  // permission

  useEffect(() => {
    if (events.PERMISSION_CONTROLS) {
      console.log({ PERMISSION_CONTROLS: events.PERMISSION_CONTROLS });
      dispatch(setPermissions(events.PERMISSION_CONTROLS));
      console.timeEnd("TimePermission");
    }
  }, [events.PERMISSION_CONTROLS]);
};
