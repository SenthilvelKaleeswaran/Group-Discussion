import { useMutation, useQuery } from "react-query";
import { createDiscussion, getAiModels } from "../utils/api-call";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Section } from "../components/screens";
import { TextInput, DropdownSelect, Checkbox, Button } from "../components/ui";
import { FORM_METADATA } from "../constants";
import { AiModelCard, RenderSpace } from "../components/shared";

export const CreateDiscussion = () => {
  const [form, setForm] = useState("details");
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "Online Class vs Offline Class",
    topicSetting: "manual",
    aiParticipants: [],
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
  });
  const [aiParticipants, setAiParticipants] = useState([]);

  const navigate = useNavigate();

  const { data: aiModelData, isLoading: isAiModelLoading } = useQuery(
    [`ai-model`],
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
    mutate({ ...discussionDetails, aiParticipants });
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
    console.log({ typeee: type });
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

  const handleModelsChange = (id) => {
    setAiParticipants((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      return updated;
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-4">
            <h1 className="text-4xl font-semibold text-center text-gray-800">
              Start Your Group Discussion
            </h1>
            <div className="flex gap-4">
              <RenderSpace condition={form !== "details"}>
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setForm("details")}
                />
              </RenderSpace>

              <RenderSpace condition={form !== "members"}>
                <Button
                  label="Next"
                  variant="primary"
                  onClick={() => setForm("members")}
                />
              </RenderSpace>
              <RenderSpace condition={form === "members"}>
                <Button
                  label={isLoading ? "Creating..." : "Create"}
                  variant="success"
                  type="submit"
                />
              </RenderSpace>
            </div>
          </div>
          {form === "details" ? (
            FORM_METADATA?.map((section, index) => (
              <Section
                key={index}
                title={section.title}
                description={section.description}
              >
                <div className="grid grid-cols-2 gap-4">
                  {section.fields.map((field, idx) => {
                    if (field.component === "TextInput") {
                      return (
                        <TextInput
                          key={idx}
                          value={discussionDetails[field.id]}
                          {...getConditions(field)}
                          {...field}
                          onChange={handleChange}
                        />
                      );
                    } else if (field.component === "DropdownSelect") {
                      return (
                        <DropdownSelect
                          key={idx}
                          value={discussionDetails[field.id]}
                          {...getConditions({ ...field, type: "select" })}
                          {...field}
                          onChange={handleChange}
                        />
                      );
                    } else if (field.component === "Checkbox") {
                      return (
                        <Checkbox
                          key={idx}
                          {...getConditions(field)}
                          {...field}
                          onChange={handleChange}
                        />
                      );
                    }
                    return null; // Fallback for any unhandled field types
                  })}
                </div>
              </Section>
            ))
          ) : (
            <div className="space-y-4">
              <p className="text-xl text-gray-900">
                Select The AI Participants
              </p>
              <AiModelCard
                models={aiModelData}
                selectedModels={aiParticipants}
                handleChange={handleModelsChange}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            disabled={isLoading}
            label={isLoading ? "Creating Discussion..." : "Start Discussion"}
          />

          <RenderSpace condition={isError}>
            <p className="text-red-500">{error?.message}</p>
          </RenderSpace>
        </form>
      </div>
    </div>
  );
};
