import React, { useState, useEffect, useRef, useMemo } from "react";
import MemberCard from "../components/Memberscard";
import { useConversation } from "../context/conversation";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import TimeProgressBar from "../components/TimeProgressBar";
import Conversion from "../components/Conversation";
import { useMutation, useQuery } from "react-query";

import { useNavigate, useParams } from "react-router";
import {
  generateConversation,
  generateFeedback,
  getGroupDiscussion,
} from "../utils/api-call";
import {
  useMembers,
  useSpeechRecognization,
  useSpeechSynthesis,
} from "../hooks";
import DiscussionIndicator from "./DiscussionIndicator";

const DiscussionSpace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState([]);

  const {
    data,
    error,
    isLoading: issLoading,
  } = useQuery([`group-discussion-${id}`, id], () => getGroupDiscussion(id), {
    onSuccess: (data) => {
      setConversation(data?.conversationId?.messages);
    },
  });

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
      console.log({ dataaaaa: data });
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
        console.log({ dataaaaa: data });
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
  console.log({ dataaaa: conversation });

  const [currentSpeech, setCurrentSpeech] = useState("");

  // const { conversation, updateConversation } = useConversation();
  const { isSpeaking, currentWord } = useSpeechSynthesis({
    text: currentSpeech,
    voice: currentMember?.voice,
  });
  const [status, setStatus] = useState("");

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
  const isCompleted = data?.status === "COMPLETED";

  const checkPermission = () => {
    if (strictUserPermission) return true;
    if (conversation?.length === data?.discussionLength - 1) {
      return false;
    }
    return !isSpeaking || allowConclusion || !isCompleted;
  };

  const grantPermission = checkPermission();
  console.log({ grantPermission, strictUserPermission });

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

  const handleGenerateConversation = () =>
    mutate({
      id,
      participant: currentMember,
      conversation: transcript || currentSpeech,
    });

  useEffect(() => {
    if (transcript.length > 0 && currentSpeech.length === 0 && !isListening) {
      handleGenerateConversation();
    }
  }, [isListening, transcript, currentSpeech]);

  useEffect(() => {
    if (currentSpeech?.length > 0 && isSpeaking) {
      resetTranscript();
    }
  }, [isSpeaking]);
  // const isReadyToConclude =
  //   conversation?.length > 0 &&
  //   conversation?.length === data?.discussionLength &&
  //   (transcript?.length > 0 || currentSpeech?.length > 0) &&
  //   !isLoading &&
  //   !isSpeaking &&
  //   !isListening;

  // const [isConclusionStarted, setIsConclusionStarted] =
  //   useState(isReadyToConclude);

  useEffect(() => {
    if (currentSpeech.length > 0 && !isSpeaking) {
      setCurrentSpeech("");
      setStatus("Your time to access the session");

      setTimeout(() => {
        if (!isListeningRef.current) {
          handleGenerateConversation();
        }
        setStatus("");
      }, THREE_SECOND_TIME_INTERVAL + 500);
    }
  }, [isListening, isSpeaking]);

  // useEffect(() => {
  //   if (
  //     conversation?.length &&
  //     conversation?.length === data?.discussionLength &&
  //     !isLoading &&
  //     !isSpeaking &&
  //     !isListening
  //   ) {
  //     console.log("status i came da check");
  //     setIsConclusionStarted(true);
  //     setTimeout(() => {
  //       setIsConclusionStarted(false);
  //     }, TIME_INTERVAL);
  //   }
  // }, [conversation, isSpeaking, isListening, isLoading]);

  console.log({ data });

  const getStatus = () => {
    switch (true) {
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
      case status.length > 0:
        return status;
      case data?.conversation?.length > 0:
        return `Please Wait ${currentMember?.name} to start`;
      case transcript.length === 0:
        return "Be the first one to access the session";
      default:
        return "Stopped";
    }
  };
  console.log({ currentWord });

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
  console.log({
    // isConclusionStarted,
    a: !isCompleted && !isLoading && !isListening && status?.length > 0,
    status,
  });

  return (
    <div className="flex  gap-4 min-h-screen w-full bg-green-500 text-gray-200 p-4">
      <div className="max-w-3xl w-full flex-1.5  bg-gray-800 shadow-lg rounded-lg p-8">
        <p className="font-bold">{data?.topic}</p>

        <DiscussionIndicator
          data={data}
          conversation={conversation}
          currentMember={currentMember}
        />

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
      <div className="max-w-3xl w-full flex-1 min-h-screen h-full overflow-scroll bg-gray-800 shadow-lg rounded-lg p-8">
        <Conversion
          conversation={conversation}
          currentWord={currentWord}
          transcript={transcript}
          currentMember={currentMember}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isLoading={isLoading}
          currentSpeech={currentSpeech}
          data={data}
          discussionLength={data?.discussionLength}
          conclusionBy={data?.conclusionBy}
          conclusionPoints={data?.conclusionPoints}
        />{" "}
      </div>
    </div>
  );
};

export default DiscussionSpace;
