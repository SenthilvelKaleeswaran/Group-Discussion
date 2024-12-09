import React, { useState, useEffect, useRef, useMemo } from "react";
import MemberCard from "../components/Memberscard";
import { useConversation } from "../context/conversation";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import TimeProgressBar from "../components/TimeProgressBar";
import Conversion from "../components/Conversation";
import { useMutation, useQuery } from "react-query";

import { useParams } from "react-router";
import { generateConversation, getGroupDiscussion } from "../utils/api-call";
import {
  useMembers,
  useSpeechRecognization,
  useSpeechSynthesis,
} from "../hooks";



const DiscussionSpace = () => {
  const { id } = useParams();
  

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

  // Hooks
  const { members, currentMember, selectMember,resetCurrentMember } = useMembers(data);

  const { mutate, isLoading } = useMutation(generateConversation, {
    onSuccess: (data) => {
      if (data?.generatedText) {
        setCurrentSpeech(data?.generatedText.slice(0, 200));
      }
      if (data?.randomMember) {
        selectMember(data?.randomMember);
      }
      if (data?.conversation) {
        setConversation(data?.conversation);
      }
    },
    onError: (error) => {
      console.error("Error generating conversation:", error.message);
    },
  });

  const [currentSpeech, setCurrentSpeech] = useState("");

  // const { conversation, updateConversation } = useConversation();
  const { isSpeaking, currentWord } = useSpeechSynthesis({
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
  } = useSpeechRecognization({ isSpeaking, selectMember,resetCurrentMember });

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


  console.log({transcript})

  const getStatus = () => {
    switch (true) {
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

  return (
    <div className="flex  gap-4 min-h-screen w-full bg-green-500 text-gray-200 p-4">
      <div className="max-w-3xl w-full flex-1.5  bg-gray-800 shadow-lg rounded-lg p-8">
        <p className="font-bold">{data?.topic}</p>
        {!isLoading && !isListening && status?.length > 0 ? (
          <TimeProgressBar duration={TIME_INTERVAL} />
        ) : null}

        <div className="text-blue-600">{getStatus()}</div>

        <p>{transcript || currentWord}</p>

        {/* Group Members Section */}
        <div className="mb-8">
          {/* <h1 className="text-2xl font-bold mb-4">Group Members</h1> */}
          <MemberCard data={members} currentMember={currentMember} />
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
        <Conversion
          data={conversation}
          currentWord={currentWord}
          transcript={transcript}
          streamData={transcript || currentWord}
          currentMember={currentMember}
          isSpeaking={isSpeaking}
          isListening={isListening}
          isLoading={isLoading}
          currentSpeech={currentSpeech}
        />{" "}
      </div>
    </div>
  );
};

export default DiscussionSpace;
