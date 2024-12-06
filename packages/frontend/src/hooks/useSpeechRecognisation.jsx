import { useState, useRef, useEffect } from "react";
import { THREE_SECOND_TIME_INTERVAL, TIME_INTERVAL } from "../constants";
import { useMembers } from "../context/member";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const useSpeechRecognition = ({ isSpeaking = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const timeoutRef = useRef(null);
  const recognition = useRef(new SpeechRecognition()).current;
  const { members, selectMember } = useMembers();

  // Initialize SpeechRecognition settings
  useEffect(() => {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = () => {
      if (isListening && !isSpeaking) {
        console.log("Restarting recognition...");
        recognition.start();
        recognition.started = true;
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
      selectMember("User");
      setIsListening(true);
      resetTranscript(); // Reset transcript when starting
      recognition.start();
      resetAutoStopTimer();
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
      if (event.code === "KeyS") {
        const now = Date.now();
        if (now - lastPressTime < 300 && !isSpeaking) {
          if (!isSpeaking) {
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }
        }
        lastPressTime = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isListening, isSpeaking]);

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

export default useSpeechRecognition;
