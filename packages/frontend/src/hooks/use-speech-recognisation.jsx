import { useState, useEffect, useRef } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { TIME_INTERVAL } from "../constants"; // Define TIME_INTERVAL in seconds


export const useSpeechRecognization = ({
  isSpeaking = false,
  selectMember,
  resetCurrentMember,
  grantPermission = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const timeoutRef = useRef(null);

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

  // Reset the timeout when user is speaking
  useEffect(() => {
    if (isListening) {
      resetAutoStopTimer();
    }
  }, [transcript]);

  // Start listening
  const startListening = () => {
    if (!isListening && !isSpeaking) {
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      selectMember();
      resetAutoStopTimer();
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current);
  };

  // Reset auto-stop timer when speech is detected
  const resetAutoStopTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isListening) {
        console.log("No speech detected, stopping...");
        stopListening();
      }
    }, TIME_INTERVAL * 1000);
  };

  // Detect double-tap on the space bar
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
