import React, { useState, useEffect, useRef, useMemo } from "react";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { useNavigate, useParams } from "react-router";
import {
  generateConversation,
  generateFeedback,
  getActiveSession,
  getSessionQueue,
} from "../utils/api-call";
import {
  useAudioPlayer,
  useDiscussionSocket,
  useMembers,
  useSpeechRecognization,
  useSpeechSynthesis,
  useWebSocket,
} from "../hooks";
import {
  AiParticipantPopup,
  Conversation,
  ConversationCountdown,
  DiscussionProgress,
  DiscussionSettings,
  FeedbackTable,
  MemberCard,
  QueuePopup,
  SessionButton,
} from "../components/screens";

import {
  DoubleTapPopup,
  IconContainer,
  InitialTimer,
  RenderSpace,
  TimeProgressBar,
} from "../components/shared";

import { AudioStreamingComponent } from "../components/screens/group-discussion/AudioStreaminComponent";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";
import { setDiscussionQueue } from "../store";
import DiscussionCompletion from "./DiscussionCompletion";

const signalingServer = "http://localhost:5000";

export const GroupDiscussion = () => {
  console.time("Time");
  console.time("TimePermission");
  const { id } = useParams();
  const [groupDiscussionId, sessionId] = id.split("-");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const queryClient = useQueryClient();

  const dispatch = useDispatch();

  const [conversation, setConversation] = useState([]);
  const [currentSpeech, setCurrentSpeech] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [processingPoint, setProcessingPoint] = useState(null);
  const [status, setStatus] = useState("");
  const [choosingRandomMember, setChoosingRandomMember] = useState(false);
  const [showFirst, setShowFirst] = useState(false);
  const [showSecond, setShowSecond] = useState(false);
  const [FirstComponent, setFirstComponent] = useState(null);
  const [SecondComponent, setSecondComponent] = useState(null);
  const [componentList, setComponentList] = useState([]);

  const {
    mutedParticipants = [],
    userStatus = "",
    userRole,
  } = useSelector((state) => state.controls);

  console.log({ userRole });
  const { currentConverstion: transcript = "" } = useSelector(
    (state) => state.conversation
  );

  const {
    data,
    error: groupDiscussionError,
    isLoading: issLoading,
    isPending,
    isFetched,
    isFetching,
    refetch,
  } = useQuery(
    [`group-discussion-${id}`, groupDiscussionId],
    () => getActiveSession(id),
    {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
        } else if (typeof data === "object") {
          if (!sessionId)
            navigate(`/gd/${data.groupDiscussionId}-${data._id}`, {
              replace: true,
            });
        }
        setConversation(data?.conversationId?.messages);
      },
    }
  );

  console.log({ updatedData: data });

  const { error: queueError, isLoading: isQueueLoading } = useQuery(
    [`queue-${sessionId}`, sessionId],
    () => getSessionQueue(sessionId),
    {
      onSuccess: (data) => {
        dispatch(setDiscussionQueue(data));
      },
    }
  );

  const { members, currentMember, selectMember, resetCurrentMember } =
    useMembers(data);

  // Hooks

  const { isSpeaking, currentWord } = useSpeechSynthesis({
    text: currentSpeech,
    voice: currentMember?.voice,
    startTime: startTime,
  });

  const strictPermission = () => {
    if (userStatus === "IN_PROGRESS") return true;
    if (mutedParticipants.includes(userId)) return true;

    const lastPoint = conversation?.length === data?.discussionLength - 1;
    const conclusionBy = data?.conclusionBy;

    if (lastPoint && conclusionBy === "AI")
      return (conversation || [])?.pop()?._id !== userId;

    if (data?.conclusionPoint === 1 && conclusionBy === "You") return true;

    return false;
  };

  const strictUserPermission = strictPermission();

  const checkPermission = () => {
    if (strictUserPermission) return true;
    if (conversation?.length === data?.discussionLength - 1) return false;

    return !isSpeaking || allowConclusion || !isCompleted;
  };

  const grantPermission = checkPermission();

  const { socket, sendMessage, events, isConnected, closeSocket } =
    useWebSocket(signalingServer, {
      disconnect: data?.status === "COMPLETED" || status === "Completed",
    });

  const { isListening, resetTranscript } = useSpeechRecognization({
    isSpeaking,
    grantPermission,
    selectMember,
    resetCurrentMember,
    sessionId,
    sendMessage,
    events,
  });

  const isListeningRef = useRef(isListening);

  const isCompleted = data?.status === "COMPLETED" || status === "Completed";
  const isDiscussionRunning =
    data?.status === "NOT_STARTED" || data?.status === "IN_PROGRESS";

  console.log({ data, aaa: !!data, issLoading, userRole, isDiscussionRunning });

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (
      !isCompleted &&
      transcript.length > 0 &&
      currentSpeech.length === 0 &&
      !isListening
    ) {
      handleGenerateConversation();
    }
  }, [isListening, transcript, currentSpeech, isCompleted]);

  useEffect(() => {
    if (currentSpeech?.length > 0 && isSpeaking) {
      resetTranscript();
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (!isCompleted && currentSpeech.length > 0 && !isSpeaking) {
      setCurrentSpeech("");
      setStatus("Your time to access the session");

      setTimeout(() => {
        if (!isListeningRef.current) {
          handleGenerateConversation();
        }
        setStatus("");
      }, THREE_SECOND_TIME_INTERVAL + 500);
    }
  }, [isListening, isSpeaking, isCompleted]);

  const player = useAudioPlayer(events);

  useEffect(() => {
    if (events.UPDATED_SESSION) {
      console.log({ UPDATED_SESSION: events.UPDATED_SESSION });
      queryClient.setQueryData([`group-discussion-${id}`, groupDiscussionId], {
        ...data,
        ...events.UPDATED_SESSION,
      });
    }
  }, [events.UPDATED_SESSION]);

  useDiscussionSocket({
    groupDiscussionId,
    sessionId,
    events,
    sendMessage,
    currentSpeech,
    conversation,
    closeSocket,
    setChoosingRandomMember,
    selectMember,
    setCurrentSpeech,
    setStartTime,
    setConversation,
    setProcessingPoint,
    setStatus,
    refetch,
  });

  const isConclusion = useMemo(() => {
    return conversation?.length > data?.discussionLength;
  }, [conversation]);

  const allowConclusion = useMemo(() => {
    return isConclusion && data?.conclusionBy !== "AI";
  }, []);

  const { mutate, isLoading } = useMutation(generateConversation, {
    onSuccess: (data) => {
      if (data?.generatedText)
        setCurrentSpeech(data?.generatedText.slice(0, 100));
      else setCurrentSpeech("");

      if (data?.randomMember) selectMember(data?.randomMember);

      if (data?.conversation) setConversation(data?.conversation);

      if (data?.completed) setStatus("Completed");
    },
    onError: (error) => {
      console.error("Error generating conversation:", error.message);
    },
  });

  const { mutate: handleFeedbackGeneration, isLoading: isFeedbackGenerating } =
    useMutation(generateFeedback, {
      onSuccess: (data) => {
        if (data?.message === "Success") {
          navigate(`/gd/feedback?id=${id}`);
        } else {
          console.error("Unexpected response:", data);
        }
      },
      onError: (error) => {
        console.error(
          "Error generating feedback:",
          error.response?.data?.error || error.message || error
        );
      },
    });

  const handleGenerateConversation = () => {
    // mutate({
    //   id,
    //   participant: currentMember,
    //   conversation: transcript || currentSpeech,
    // });

    if (!isCompleted && isConnected) {
      sendMessage("GENERATE_FEEDBACK", {
        id,
        participant: currentMember,
        conversation: transcript || currentSpeech,
      });

      setCurrentSpeech("");

      setProcessingPoint({
        currentMember,
        conversation: transcript || currentSpeech,
      });
    }
  };

  const getStatus = () => {
    switch (true) {
      case choosingRandomMember:
        return "Choosing Random Member";
      case strictUserPermission:
        return "You only need to speak";
      case issLoading:
        return "Fetching Data";
      case isLoading:
        return "Generating Content";
      case isSpeaking:
        return `Please wait ${currentMember?.name} to complete`;
      case isListening:
        return "Listening";
      case status?.length > 0:
        return status;
      case data?.conversation?.length > 0:
        return `Please Wait ${currentMember?.name} to start`;
      case transcript.length === 0:
        return "Be the first one to access the session";
      default:
        return "Stopped";
    }
  };

  const getConclusionBy = () => {
    const conclusionBy = data?.conclusionBy;

    switch (conclusionBy) {
      case "AI":
        return (
          <div>
            <p>🤖 The AI showdown begins now!</p>{" "}
            <button>⏭️ Skip discussion</button>
          </div>
        );
      case "User":
        return (
          <div>
            <p>👤 It's your moment to take the reins and conclude.</p>
          </div>
        );
      case "Random":
        return (
          <div>
            <p>🎲 The ultimate showdown starts here!</p>{" "}
            <p>🎯 Prepare to focus as the discussion intensifies.</p>
          </div>
        );
      case "You":
        return (
          <div>
            <p>👋 The final verdict rests in your hands.</p>
            <p>🖱️ Tap 'S' to bring the discussion to its conclusion.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (issLoading) {
    return (
      <div className="text-blue-500 w-full h-full place-content-center">
        Loading...
      </div>
    );
  }

  if (groupDiscussionError) {
    return <div>Error: {groupDiscussionError}</div>;
  }

  const sectionData = [
    {
      id: "Conversation",
      icon: "Discussion",
      color: "bg-green-700",
      condition: true,
      component: () => (
        <div className="w-full h-full overflow-y-auto bg-gray-900 shadow-lg rounded-lg">
          <Conversation
            currentWord={currentWord}
            transcript={transcript}
            currentMember={currentMember}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isLoading={isLoading}
            currentSpeech={currentSpeech}
            data={{ ...data, discussion: conversation }}
            discussionLength={data?.discussionLength}
            conclusionBy={data?.conclusionBy}
            conclusionPoints={data?.conclusionPoints}
            isLiveDiscussion
            events={events}
            processingPoint={processingPoint}
          />
        </div>
      ),
    },
    {
      id: "Settings",
      icon: "Participants",
      color: "bg-violet-800",
      condition: true,
      component: () => (
        <div className="w-full h-full overflow-y-auto bg-gray-900 shadow-lg rounded-lg">
          <DiscussionSettings sessionId={sessionId} socket={socket} />
        </div>
      ),
    },
  ];

  const handleSection = (id) => {
    const { component } = sectionData?.find((_) => _?.id === id);
    console.log({ component });
    setFirstComponent(() => SecondComponent);
    setSecondComponent(() => component);
    setComponentList((prev) => ({
      1: prev["2"],
      2: id,
    }));
  };

  console.log({ FirstComponent, SecondComponent, componentList });

  return (
    <div className="flex gap-4 h-screen w-full bg-gray-700 p-4 text-gray-200  relative overflow-hidden">
      <InitialTimer socket={socket} />
      <QueuePopup
        sessionId={sessionId}
        socket={socket}
        error={queueError}
        isLoading={isQueueLoading}
      />

      <AiParticipantPopup data={data} socket={socket} sessionId={sessionId} />
      <div className=" w-full flex-1.5 p-4 space-y-2 bg-gray-800 shadow-lg rounded-lg overflow-y-auto">
        <p className="font-bold">{data?.topic}</p>
        {/* <DiscussionProgress events={events} /> */}

        <ConversationCountdown />
        <AudioStreamingComponent
          socket={socket}
          sessionId={sessionId}
          groupDiscussionId={groupDiscussionId}
          isCompleted={!isDiscussionRunning}
        />

        <SessionButton
          status={data?.status}
          socket={socket}
          sessionId={sessionId}
        />

        {!!data && !issLoading && !isDiscussionRunning ? (
          <DiscussionCompletion data={data} socket={socket} events={events} />
        ) : (
          <div>
            <p>{transcript}</p>

            {/* <DiscussionIndicator
           data={data}
           conversation={conversation}
           currentMember={currentMember}
         /> */}
            {!isCompleted &&
            !isLoading &&
            !isListening &&
            status?.length > 0 ? (
              <TimeProgressBar duration={TIME_INTERVAL} />
            ) : null}

            <div className="text-blue-600">{getStatus()}</div>

            <p>{transcript || currentWord}</p>

            {/* Group Members Section */}
            <div className="mb-8">
              {/* <h1 className="text-2xl font-bold mb-4">Group Members</h1> */}
              <MemberCard data={members} currentMember={currentMember} />
            </div>

            {isCompleted ? (
              <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-center">
                <h2 className="text-2xl font-bold text-yellow-400">
                  🏆 Discussion Battle Finished!
                </h2>
                <p className="text-sm text-gray-300">
                  Your discussion journey has concluded. What’s next?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                  {data?.feedback?.length ? (
                    <button
                      onClick={() => handleFeedbackGeneration({ id })}
                      disabled={isFeedbackGenerating}
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
                    >
                      📊 View Feedback
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFeedbackGeneration({ id })}
                      disabled={isFeedbackGenerating}
                      className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
                    >
                      {isFeedbackGenerating
                        ? "✨ Generating...."
                        : "✨ Generate Feedback"}
                    </button>
                  )}
                  <button className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
                    🔄 Start New Discussion
                  </button>
                  <button className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
                    📖 View Past Discussions
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isConclusion ? <div>Conclusion Battle Starts</div> : null}
                {isConclusion && getConclusionBy()}
              </div>
            )}

            {/* Recording Section */}
            {/* <div className="text-center mb-8">
           <RecordingButton
             isListening={isListening}
             startListening={startListening}
             stopListening={stopListening}
           />
         </div> */}
          </div>
        )}
      </div>

      <RenderSpace
        condition={!!FirstComponent && typeof FirstComponent === "function"}
      >
        <FirstComponent />
      </RenderSpace>

      <RenderSpace
        condition={!!SecondComponent && typeof SecondComponent === "function"}
      >
        <SecondComponent />
      </RenderSpace>

      <div className="fixed bottom-8  right-8 space-y-4">
        {sectionData?.map((_) => (
          <RenderSpace condition={_?.condition}>
            <IconContainer
              name={_?.icon}
              containerClass={`w-10 h-10 place-items-center place-content-center rounded-full cursor-pointer ${
                _?.color
              } ${
                Object.values(componentList)?.includes(_?.id)
                  ? "border-blue-900 border-2"
                  : ""
              }`}
              onClick={() => handleSection(_?.id)}
              // disabled={Object.values(componentList)?.includes(_?.id)}
            />
          </RenderSpace>
        ))}
      </div>
    </div>
  );
};
