import React, { useState, useEffect, useRef } from "react";
import { useMembers } from "../context/member";
import MemberCard from "./Memberscard";
import { useConversation } from "../context/conversation";
import useSpeechRecognization from "../hooks/useSpeechRecognisation";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import TimeProgressBar from "./TimeProgressBar";
import { useDiscussion } from "../context/details";
import Conversion from "./Conversation";

// Recording Button
const RecordingButton = ({ isListening, startListening, stopListening }) => (
  <button
    onClick={isListening ? stopListening : startListening}
    className={`px-6 py-3 ${
      isListening
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-500 hover:bg-green-600"
    } text-gray-100 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-${
      isListening ? "red" : "green"
    }-400`}
  >
    {isListening ? "Stop Recording" : "Start Recording"}
  </button>
);

const AudioRecorder = () => {
  const [currentSpeech, setCurrentSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    discussionDetails: { topic },
  } = useDiscussion();
  const { currentMember, selectRandomMember } = useMembers();
  const { conversation, updateConversation } = useConversation();
  const { isSpeaking } = useSpeechSynthesis({
    text: currentSpeech,
    voice: currentMember?.voice,
  });
  const [status, setStatus] = useState("");

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognization({ isSpeaking });

  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const handleGenerateConversation = async () => {
    setIsLoading(true);
    updateConversation({
      newConversation: transcript || currentSpeech,
      currentMember,
    });
    try {
      const response = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: JSON.stringify({
          conversation,
          user: currentMember.name,
          topic,
          transcript,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to get response from server.");

      const data = await response.json();
      if (data?.generatedText) {
        selectRandomMember();
        setCurrentSpeech(data?.generatedText.slice(0, 200));
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
      setStatus("");
    }
  };
  console.log({ currentMember });

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

  useEffect(() => {
    if (currentSpeech.length > 0 && !isSpeaking) {
      setCurrentSpeech("");
      setStatus("Your time to access the session");

      setTimeout(() => {
        console.log({
          isListening: isListeningRef.current,
          isSpeaking,
        });
        if (!isListeningRef.current) {
          handleGenerateConversation();
        } else {
          setStatus("");
          updateConversation({
            newConversation: currentSpeech,
            currentMember,
          });
        }
      }, THREE_SECOND_TIME_INTERVAL + 1000);
    }
  }, [isListening, isSpeaking]);

  const getStatus = () => {
    switch (true) {
      case isLoading:
        return "Generating Content";
      case isSpeaking:
        return `Please wait ${currentMember?.name} to complete`;
      case isListening:
        return "Listening";
      case status.length > 0:
        return status;
      case conversation?.length > 0:
        return `Please Wait ${currentMember?.name} to start`;
      case transcript.length === 0:
        return "Be the first one to access the session";
      default:
        return "Stopped";
    }
  };

  return (
    <div className="flex gap-4 min-h-screen w-full bg-green-500 text-gray-200 py-8 px-4">
      <div className="max-w-3xl w-full flex-2  bg-gray-800 shadow-lg rounded-lg p-8">
        {!isLoading && !isListening && status?.length > 0 ? (
          <TimeProgressBar duration={TIME_INTERVAL} />
        ) : null}

        <div className="text-blue-600">{getStatus()}</div>

        <p>{transcript}</p>

        {/* Group Members Section */}
        <div className="mb-8">
          {/* <h1 className="text-2xl font-bold mb-4">Group Members</h1> */}
          <MemberCard />
        </div>

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
        <Conversion />{" "}
      </div>
    </div>
  );
};

export default AudioRecorder;
