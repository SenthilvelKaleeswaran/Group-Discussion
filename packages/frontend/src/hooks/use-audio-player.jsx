// useAudioPlayer.js
import { useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCurrentConverstion } from "../store";

export const useAudioPlayer = (events) => {
  const dispatch = useDispatch();
  const audioElementRef = useRef(null);

  // Memoize the host URL to avoid unnecessary recalculations
  const host = useMemo(() => {
    return `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PORT}`;
  }, []);

  // Play audio function
  const playAudio = (audioUrl, elapsedTime) => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.type = "audio/mpeg";

      audioElementRef.current.onerror = (error) => {
        console.error("Error playing audio:", error);
      };

      audioElementRef.current.onloadedmetadata = () => {
        // Seek to the correct position based on elapsed time
        if (elapsedTime && elapsedTime > 0) {
          audioElementRef.current.currentTime = elapsedTime;
        }
        audioElementRef.current.play().catch((error) => {
          console.error("Audio play error:", error);
        });
      };
    }

    audioElementRef.current.src = audioUrl;
    audioElementRef.current.load();
  };

  // Effect to handle audio playback when GENERATED_TEXT_AUDIO event occurs
  useEffect(() => {
    if (events.GENERATED_TEXT_AUDIO) {
      const { audioUrl, discussion, startTime, elapsedTime } =
        events.GENERATED_TEXT_AUDIO;

      // Dispatch Redux action to set the current conversation
      dispatch(setCurrentConverstion(discussion));

      // Play audio with provided URL and elapsed time
      playAudio(`${host}/${audioUrl}`, elapsedTime);
    }
  }, [events.GENERATED_TEXT_AUDIO, dispatch, host]);

  // Optional: Return methods to control audio playback externally
  return {
    play: (audioUrl, elapsedTime = 0) => playAudio(audioUrl, elapsedTime),
    pause: () => audioElementRef.current?.pause(),
    resume: () => audioElementRef.current?.play(),
    stop: () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
    },
  };
};
