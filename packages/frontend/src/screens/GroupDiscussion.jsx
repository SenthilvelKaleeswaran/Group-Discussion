import React, { useState, useEffect, useRef, useMemo } from "react";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import { useMutation, useQuery } from "react-query";

import { useNavigate, useParams } from "react-router";
import {
  generateConversation,
  generateFeedback,
  getActiveSession,
  getGroupDiscussion,
} from "../utils/api-call";
import {
  useDiscussionSocket,
  useMembers,
  useSpeechRecognization,
  useSpeechSynthesis,
  useWebSocket,
} from "../hooks";
import {
  Conversation,
  DiscussionIndicator,
  DiscussionSettings,
  MemberCard,
} from "../components/screens";
import { TimeProgressBar } from "../components/shared";

import { io } from "socket.io-client";

import { useDispatch, useSelector } from "react-redux";
import { fetchGroupDiscussion } from "../store";
import { AudioStreamingComponent } from "../components/screens/group-discussion/AudioStreaminComponent";

const signalingServer = "http://localhost:5000";

export const GroupDiscussion = () => {
  const { id } = useParams();
  const [groupDiscussionId, sessionId] = id.split("-");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const {
  //   discussion : data,
  //   loading : issLoading,
  //   error: groupDiscussionError,
  // } = useSelector((state) => state.groupDiscussion);

  // useEffect(() => {
  //   if (id) {
  //     dispatch(fetchGroupDiscussion(id)); // Dispatch the thunk
  //   }
  // }, [dispatch, id]);

  const [conversation, setConversation] = useState([]);
  const [processingPoint, setProcessingPoint] = useState(null);
  const [status, setStatus] = useState("");

  const {
    data,
    error: groupDiscussionError,
    isLoading: issLoading,
  } = useQuery(
    [`group-discussion-${groupDiscussionId}`, groupDiscussionId],
    () => getActiveSession(id),
    {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
        } else if (typeof data === "object") {
          if (!sessionId) {
            navigate(`/gd/${data.groupDiscussionId}-${data._id}`, {
              replace: true,
            });
          }
        }
        setConversation(data?.conversationId?.messages);
      },
    }
  );

  const { socket, sendMessage, events, isConnected, closeSocket } =
    useWebSocket(signalingServer, {
      disconnect: data?.status === "COMPLETED" || status === "Completed",
    });

  console.log({ socket, sessionId: data?._id });

  // const { localStream, remoteStreams, callPeer } = useAudioStreaming({
  //   socket,
  //   sendMessage,
  //   sessionId,
  //   groupDiscussionId,
  // });
  // console.log({ socket, localStream, remoteStreams, callPeer });

  const isConclusion = useMemo(() => {
    return conversation?.length > data?.discussionLength;
  }, [conversation]);

  const allowConclusion = useMemo(() => {
    return isConclusion && data?.conclusionBy !== "AI";
  }, []);

  // Hooks
  const { members, currentMember, selectMember, resetCurrentMember } =
    useMembers(data);

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

  const [currentSpeech, setCurrentSpeech] = useState("");

  const { isSpeaking, currentWord } = useSpeechSynthesis({
    text: currentSpeech,
    voice: currentMember?.voice,
  });

  const userId = localStorage.getItem("userId");

  const strictPermission = () => {
    const lastPoint = conversation?.length === data?.discussionLength - 1;
    const conclusionBy = data?.conclusionBy;

    // Last point should speaken by user
    if (lastPoint && conclusionBy === "AI")
      return (conversation || [])?.pop()?._id !== userId;

    // You need to conclude and only one conclusion point
    if (data?.conclusionPoint === 1 && conclusionBy === "You") return true;

    return false;
  };

  const strictUserPermission = strictPermission();
  const isCompleted = data?.status === "COMPLETED" || status === "Completed";

  const checkPermission = () => {
    if (strictUserPermission) return true;
    if (conversation?.length === data?.discussionLength - 1) {
      return false;
    }
    return !isSpeaking || allowConclusion || !isCompleted;
  };

  const grantPermission = checkPermission();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognization({
    isSpeaking,
    grantPermission,
    selectMember,
    resetCurrentMember,
  });

  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const [choosingRandomMember, setChoosingRandomMember] = useState(false);

  useDiscussionSocket({
    events,
    currentSpeech,
    conversation,
    closeSocket,
    setChoosingRandomMember,
    selectMember,
    setCurrentSpeech,
    setConversation,
    setProcessingPoint,
    setStatus,
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

  const handleCallPeer = () => {
    const targetPeerId = "peer-id-to-call"; // Replace with the actual peer ID
    callPeer(targetPeerId);
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

  return (
    <div className="flex gap-4 min-h-screen w-full bg-gray-700 text-gray-200 p-4">
      <div className="max-w-3xl w-full flex-1.5  bg-gray-800 shadow-lg rounded-lg p-8">
        <p className="font-bold">{data?.topic}</p>
        <AudioStreamingComponent
          socket={socket}
          sessionId={sessionId}
          groupDiscussionId={groupDiscussionId}
        />
        {/* {remoteStreams.map(({ peerId, stream }) => (
          <audio key={peerId} srcObject={stream} autoPlay />
        ))} */}

        {/* <DiscussionIndicator
          data={data}
          conversation={conversation}
          currentMember={currentMember}
        /> */}

        {!isCompleted && !isLoading && !isListening && status?.length > 0 ? (
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
      <div className="w-full min-h-screen h-full overflow-scroll bg-gray-900 shadow-lg rounded-lg">
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
        />{" "}
      </div>
      <div className="w-full min-h-screen h-full overflow-scroll bg-gray-900 shadow-lg rounded-lg">
        <DiscussionSettings sessionId={sessionId} socket={socket} />
      </div>
    </div>
  );
};
