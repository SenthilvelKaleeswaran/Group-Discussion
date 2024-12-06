import { useState, useEffect } from "react";

const useSpeechSynthesis = ({ text, voice, pitch = 1, rate = 1, volume = 1 }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWord, setCurrentWord] = useState("");

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

        // Track the currently spoken word
        utterance.onboundary = (event) => {
          const spokenText = chunk.slice(event.charIndex, event.charIndex + event.charLength);
          setCurrentWord(spokenText);
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
          setCurrentWord(""); // Clear current word after speech ends
        }
      };

      // Set up event handlers for the first utterance
      utterances[0].onstart = () => setIsSpeaking(true);
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
      setCurrentWord("");
    };
  }, [text, voice, pitch, rate, volume]);

  return {
    isSpeaking,
    currentWord,
  };
};

export default useSpeechSynthesis;
