import { useMutation, useQuery } from "react-query";
import { createDiscussion, getAiModels } from "../utils/api-call";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useDiscussionForm = ({ data }) => {
  const [form, setForm] = useState("details");

  const getAiParticipants = () => {
    return data?.aiParticipants?.map((_) => _?._id) || [];
  };
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "Online Class vs Offline Class",
    topicSetting: "manual",
    participants: [],
    otherParticipants: [],
    discussionMode: "selection",
    discussionLength: 5,
    discussionLengthSetting: "limit",
    pointsSetting: "noLimit",
    minPoints: 0,
    maxPoints: 0,
    pointsPerParticipant: 0,
    conclusionBy: "both",
    conclusionMode: "selection",
    conclusionLength: 0,
    conclusionLengthSetting: "limit",
    aiSpeechMode: "selection",
    aiSpeaksAtFrequency: 0,
    accessConversation: false,
    accessOthersConversation: false,
    accessFeedback: false,
    accessOthersFeedback: false,
    accessParticipantConversation: false,
    accessParticipantFeedback: false,
    micAccessWaitTime: 2,
    rounds: "single",
    // sessionStartTime: null,
    // sessionEndTime: null,
    displayResult : [],
    ...data,
    aiParticipants: getAiParticipants(),

  });

  const navigate = useNavigate();

  const { data: aiModelData, isLoading: isAiModelLoading } = useQuery(
    ["ai-model"],
    getAiModels
  );

  const { mutate, isLoading, isError, error } = useMutation(createDiscussion, {
    onSuccess: (data) => {
      if (data?.result) navigate(`/gd/${data?.result}`);
    },
    onError: (error) => {
      console.error("Error creating discussion:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(discussionDetails);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target || e;
    setDiscussionDetails((prev) => {
      if (type === "checkbox") {
        return {
          ...prev,
          [name]: checked,
        };
      }
      if (name === "isTopicAiGenerated") {
        return {
          ...prev,
          isTopicAiGenerated: checked,
          topic: checked ? "" : "Online vs Offline Class",
        };
      }
      return {
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value,
      };
    });
  };

  const getConditions = (field) => {
    const { conditions = {}, type } = field;
    const {
      disabledCondition = [],
      requiredCondition = [],
      validation = [],
    } = conditions;

    const evaluateConditions = (conditionsArray) =>
      conditionsArray?.length > 0
        ? conditionsArray.every(({ id, value }) => {
            return Array.isArray(value)
              ? value.includes(discussionDetails[id])
              : discussionDetails[id] === value;
          })
        : false;

    const disabled = evaluateConditions(disabledCondition);

    return {
      disabled,
      required: evaluateConditions(requiredCondition),
      hideCorrection:
        type === "select" || (disabledCondition?.length > 0 && !disabled),
    };
  };

  const handleModelsChange = useCallback((id) => {
    setDiscussionDetails((prev) => {

      const updated = {...prev}
      const {aiParticipants} = updated

      updated.aiParticipants = aiParticipants?.includes(id)
        ? aiParticipants?.filter((item) => item !== id)
        : [...aiParticipants, id];

      return updated;
    });
  }, []);

  return {
    form,
    setForm,
    discussionDetails,
    setDiscussionDetails,
    aiModelData,
    mutate,
    isLoading,
    isError,
    error,
    handleSubmit,
    handleChange,
    getConditions,
    handleModelsChange,
  };
};
