import { useState, useEffect, useRef } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { TIME_INTERVAL } from "../constants"; // Define TIME_INTERVAL in seconds
import { useSelector, useDispatch } from "react-redux";
import { setConverstionTimer, setCurrentConverstion } from "../store";

export const useSpeechRecognization = ({
  isSpeaking = false,
  selectMember,
  resetCurrentMember,
  grantPermission = true,
  sendMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const timeoutRef = useRef(null);
  const countdownRef = useRef(null);
  
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const dispatch = useDispatch();
  const { userSession } = useSelector((state) => state.session);
  const userStatus = userSession?.userStatus;

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }
  }, []);

  useEffect(() => {
    if (!isListening && transcript.length === 0) {
      resetCurrentMember();
    }
  }, [isListening, transcript]);

  useEffect(() => {
    if (transcript.length > 0) {
      sendMessage("TRANSCRIPT", {transcript});
      dispatch(setCurrentConverstion(transcript));
      resetAutoStopTimer(); 
    }
  }, [transcript]);

  useEffect(() => {
    if (userStatus === "IN_PROGRESS" && !isListening && !isSpeaking) {
      startListening();
    } else if (userStatus !== "IN_PROGRESS" && isListening) {
      stopListening();
    }
  }, [userStatus, isListening, isSpeaking]);

  const startListening = () => {
    if (!isListening && !isSpeaking) {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      selectMember();
      resetAutoStopTimer();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current);
    clearInterval(countdownRef.current);
    dispatch(setConverstionTimer(null))
  };

  const resetAutoStopTimer = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(countdownRef.current);
    dispatch(setConverstionTimer(null))


    timeoutRef.current = setTimeout(() => {
      startCountdown();
    }, 4000); 
  };

  const userId = localStorage.getItem("userId")

  const startCountdown = () => {
    let count = 3;
    
    countdownRef.current = setInterval(() => {
      if (count >= 0) {
        dispatch(setConverstionTimer(count))
        count--;
      } else {
        clearInterval(countdownRef.current);
        sendMessage("NEXT_PARTICIPANT",{previousId : userId,discussion : transcript}); 
      }
    }, 1000);
  };

  useEffect(() => {
    let lastPressTime = 0;

    const handleKeyDown = (event) => {
      if (event.code === "KeyS" && grantPermission) {
        const now = Date.now();
        if (now - lastPressTime < 300 && !isSpeaking) {
          isListening ? stopListening() : startListening();
        }
        lastPressTime = now;
      }
    };

    if (grantPermission) window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, isSpeaking, grantPermission]);

  return {
    transcript,
    isListening: listening,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognization;
