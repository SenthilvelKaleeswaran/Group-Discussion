import { useState, useEffect } from "react";

const useSpeechSynthesis = ({ text, voice, pitch = 1, rate = 1, volume = 1 }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState(""); // Collect spoken words in real-time

  useEffect(() => {
    const synth = window.speechSynthesis;

    const speakFullText = () => {
      // Split text into chunks to ensure complete speech
      const chunks = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

      // Create a queue of utterances
      const utterances = chunks.map((chunk) => {
        const utterance = new SpeechSynthesisUtterance(chunk.trim());
        utterance.voice = voice;
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;

        // Update spoken text in real-time
        utterance.onboundary = (event) => {
          if (event.name === "word") {
            const currentWord = chunk.slice(event.charIndex, event.charIndex + event.charLength);
            setSpokenText((prev) => `${prev} ${currentWord}`.trim()); // Append spoken words
          }
        };

        return utterance;
      });

      // Track speaking state
      let currentUtteranceIndex = 0;

      const handleEnd = () => {
        currentUtteranceIndex++;

        // If there are more chunks, speak the next one
        if (currentUtteranceIndex < utterances.length) {
          synth.speak(utterances[currentUtteranceIndex]);
        } else {
          // All chunks spoken
          setIsSpeaking(false);
        }
      };

      // Set up event handlers for the first utterance
      utterances[0].onstart = () => {
        setIsSpeaking(true);
        setSpokenText(""); // Reset spoken text when new speech starts
      };
      utterances[0].onend = handleEnd;

      // Add end handler to subsequent utterances
      utterances.slice(1).forEach((utterance) => {
        utterance.onend = handleEnd;
      });

      // Start speaking the first chunk
      synth.speak(utterances[0]);
    };

    // Trigger speech when text is available
    if (text) {
      speakFullText();
    }

    // Cleanup function
    return () => {
      synth.cancel();
      setIsSpeaking(false);
      setSpokenText("");
    };
  }, [text, voice, pitch, rate, volume]);

  return {
    isSpeaking,
    currentWord : spokenText, // Real-time updates of spoken text
  };
};

export default useSpeechSynthesis;
