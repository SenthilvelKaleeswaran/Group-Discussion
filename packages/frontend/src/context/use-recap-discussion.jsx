import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";

const RecapDiscussionContext = createContext();

export const useRecapDiscussion = () => {
  return useContext(RecapDiscussionContext);
};

export const RecapDiscussionProvider = ({
  children,
  data,
  grouppedData,
  selectedParticipant,
  setSelectedOption,
  setSelectedParticipant,
}) => {
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [conversationTab, setConversationTab] = useState(0);
  const [specificMember, setSpecificMember] = useState("all");
  const [isTrack, setIsTrack] = useState(false);
  const [isSpecificConversation, setIsSpecificConversation] = useState(false);
  const [index, setIndex] = useState(0);
  const messages = data?.conversationId?.messages;
  const [conversation, setConversation] = useState(messages);

  useEffect(() => {
    if (!isTrack) setConversationTab(0);
  }, [selectedParticipant]);

  const specificData = useMemo(() => {
    return grouppedData?.[specificMember]?.conversation || [];
  }, [specificMember]);

  const { participants } = data;
  console.log({ messages });

  const setSpeech = ({ index, id }) => {
    const data = messages[index];

    if (isTrack) {
      const { userId, name, _id } = data;
      const participant = userId ?? name;

      console.log({ data, participant, currentIndex: "fff" });

      const particpantDiscussions = grouppedData?.[
        participant
      ]?.conversation?.findIndex((item) => item?._id === _id);
      console.log({ particpantDiscussions, currentIndex: "fff" });

      setSelectedOption("conversation");
      setSelectedParticipant(participant);
      setConversationTab(particpantDiscussions || 0);
    }

    setIndex(index);
    setCurrentSpeech(data);
  };

  const setSpeechNull = () => setCurrentSpeech(null);

  const { isSpeaking, handlePause, handleResume } = useSpeechSynthesis({
    text: currentSpeech?.conversation,
    // onEnd: handleNextMessage,
  });

  const handleNextPrev = (action) => {
    let currentIndex = index;
    const length =
      specificMember !== "all" ? specificData?.length : messages?.length;

    if (!length) {
      setSpeechNull();
      return;
    }

    if (specificMember !== "all") {
      const findIndex = specificData?.findIndex((item) => {
        return item?.index === index;
      });

      let nextIndex = action === "next" ? findIndex + 1 : findIndex - 1;

      if (nextIndex < 0) nextIndex = length - 1;
      else if (nextIndex >= length) nextIndex = 0;

      currentIndex = specificData[nextIndex]?.index;
    } else {
      if (action === "next") currentIndex += 1;
      else if (action === "prev") currentIndex -= 1;

      if (length < currentIndex) currentIndex = length - 1;
      else if (length <= currentIndex) currentIndex = 0;
    }

    console.log({
      currentIndex,
      msg: "check",
      length,
      aaa: length >= currentIndex,
    });

    setSpeech({ index: currentIndex });
  };

  console.log({ currentIndex: currentSpeech });

  const handlePlay = ({ index, id }) => {
    if (index) {
    } else if (id) {
      const findIndex = messages?.find((item) => item?._id === id);
      setSpeech({ index: findIndex?.index, id });
    } else {
      setSpeech({ index: 0 });
    }
  };

  const handleTrackChange = (event) => {
    const { value } = event?.target;
    setIsTrack(event.target.value);
    if (value) {
      setSelectedOption("conversation");
      setSelectedParticipant(participants[0]?._id);
    }
  };

  const handleSpecificMemberDiscussion = (e) => {
    const { value } = e.target;

    setSpecificMember(value);
    if (value === "all" || !isSpecificConversation) setConversation(messages);
    else if (isSpecificConversation)
      setConversation(grouppedData[value]?.conversation || []);
  };

  const handleShowSpecificConversation = (event) => {
    setIsSpecificConversation(!isSpecificConversation);
    if (isSpecificConversation) setConversation(messages);
    else setConversation(grouppedData?.[specificMember]?.conversation || []);
  };

  const handleConversationTab = ({ action, index }) => {
    let nextIndex = 0;
    if (index >= 0) nextIndex = index;
    else
      nextIndex = action === "next" ? conversationTab + 1 : conversationTab - 1;
    setConversationTab(nextIndex);
  };

  const value = {
    conversation,
    conversationTab,
    currentSpeech,
    index,
    isSpeaking,
    isTrackConversation: isTrack,
    isSpecificConversation,
    handleConversationTab,
    handleNextPrev,
    handlePause,
    handleResume,
    handlePlay,
    handleShowSpecificConversation,
    handleSpecificMemberDiscussion,
    handleTrackChange,
    specificMember,
    setSpecificMember,
    fullDiscussion: messages,
  };

  return (
    <RecapDiscussionContext.Provider value={value}>
      {children}
    </RecapDiscussionContext.Provider>
  );
};
