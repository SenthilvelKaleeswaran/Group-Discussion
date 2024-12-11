import { useState, useRef, useEffect } from "react";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const useSpeechRecognization = ({
  isSpeaking = false,
  selectMember,
  resetCurrentMember,
  grantPermission = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const timeoutRef = useRef(null);
  const recognition = useRef(new SpeechRecognition()).current;

  // Initialize SpeechRecognition settings
  useEffect(() => {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onstart = () => {
      selectMember();
    };
    console.log({ recognition });
    recognition.onend = () => {
      if (isListening && !isSpeaking) {
        console.log("Restarting recognition...");
        recognition.start();
        recognition.started = true;
      }
      if (transcript?.length === 0) {
        resetCurrentMember();
      }
    };

    return () => {
      recognition.abort();
    };
  }, [isListening, isSpeaking]);

  useEffect(() => {
    return () => {
      recognition.abort(); // Cleanup recognition instance
    };
  }, []);

  // Start listening
  const startListening = () => {
    if (!isListening && !isSpeaking) {
      setIsListening(true);
      resetTranscript(); // Reset transcript when starting
      recognition.start();
      resetAutoStopTimer();
      selectMember();
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    recognition.stop();
    clearTimeout(timeoutRef.current);
  };

  // Handle results
  const handleResult = (event) => {
    const result = Array.from(event.results)
      .map((res) => res[0].transcript)
      .join("");
    console.log({ transcript: result });
    setTranscript(result);

    resetAutoStopTimer(); // Reset the timer when speech is detected
  };

  // Handle errors
  const handleError = (event) => {
    console.error("Speech Recognition Error:", event.error);
    stopListening();
  };

  // Reset auto-stop timer
  const resetAutoStopTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isSpeaking && isListening) {
        console.log("No speech detected, stopping...");
        stopListening();
      }
    }, 2000);
  };

  // Detect double-tap on the space bar
  useEffect(() => {
    let lastPressTime = 0;

    const handleKeyDown = (event) => {
      if (event.code === "KeyS" && grantPermission) {
        // Check if grantPermission is false
        const now = Date.now();
        if (now - lastPressTime < 300 && !isSpeaking) {
          if (isListening) {
            stopListening();
          } else {
            startListening();
            selectMember();
          }
        }
        lastPressTime = now;
      }
    };

    if (grantPermission) window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, isSpeaking, grantPermission]); // Dependency added for grantPermission

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    transcript,
    isListening,
    setIsListening,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognization;
