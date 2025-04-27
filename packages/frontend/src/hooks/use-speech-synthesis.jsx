import { useState, useEffect, useRef } from "react";

export const useSpeechSynthesis = ({
  text,
  voice,
  pitch = 1,
  rate = 1,
  volume = 1,
  startTime,
}) => {
  console.log({startTime})
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState(""); // Collect spoken words in real-time
  const synth = useRef(window.speechSynthesis);
  const speechUtterances = useRef([]);
  const syncIntervalRef = useRef(null);

  // Split text into chunks to ensure complete speech
  const getChunks = (text) => text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

  // Create speech utterances from text chunks
  const createUtterances = (chunks) => {
    return chunks.map((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.voice = voice;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;

      // Real-time spoken word tracking
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const currentWord = chunk.slice(
            event.charIndex,
            event.charIndex + event.charLength
          );
          setSpokenText((prev) => `${prev} ${currentWord}`.trim());
        }
      };

      return utterance;
    });
  };

  // Function to calculate position in audio based on startTime
  const getCurrentPositionInSeconds = () => {
    if (!startTime) return 0;
    const now = Date.now();
    return Math.max((now - startTime) / 1000, 0); // Prevent negative values
  };

  // Function to start playback from a specific position
  const playAudioFromPosition = (positionInSeconds) => {
    if (!text) return;

    // Cancel any current speech
    synth.current.cancel();

    // Create utterances if not already done
    if (speechUtterances.current.length === 0) {
      const chunks = getChunks(text);
      speechUtterances.current = createUtterances(chunks);
    }

    // Estimate words per second for seeking into the text
    const words = text.split(" ");
    const wordsPerSecond = 2.5; // Adjust based on TTS speed
    const startWordIndex = Math.floor(positionInSeconds * wordsPerSecond);

    // Slice the text to find the starting point for playback
    const textToSpeak = words.slice(startWordIndex).join(" ");

    if (textToSpeak) {
      console.log(
        `Seeking to position: ${positionInSeconds}s (word index: ${startWordIndex})`
      );
      console.log(`Text to speak from this point: "${textToSpeak}"`);

      // Create a new utterance starting from the calculated position
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.voice = voice;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpokenText(""); // Reset spoken text when new speech starts
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      // Start speaking from the correct position
      synth.current.speak(utterance);
    }
  };

  // Effect to start speech when text and start time are available
  useEffect(() => {
    if (text && startTime) {
      const positionInSeconds = getCurrentPositionInSeconds();
      playAudioFromPosition(positionInSeconds);

      // Set up sync interval every 2 seconds
      syncIntervalRef.current = setInterval(() => {
        const position = getCurrentPositionInSeconds();
        console.log(
          `Syncing playback... Current position: ${position} seconds`
        );
        playAudioFromPosition(position);
      }, 2000);
    }

    // Cleanup function
    return () => {
      synth.current.cancel();
      setIsSpeaking(false);
      setSpokenText("");
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [text, startTime, voice, pitch, rate, volume]);

  // Pause speech
  const handlePause = () => {
    synth.current.pause();
    setIsSpeaking(false);
  };

  // Resume speech
  const handleResume = () => {
    synth.current.resume();
    setIsSpeaking(true);
  };

  return {
    isSpeaking,
    currentWord: spokenText, // Real-time updates of spoken text
    handlePause,
    handleResume,
  };
};
