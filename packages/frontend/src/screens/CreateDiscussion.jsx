import { useMutation } from "react-query";
import { createDiscussion } from "../utils/api-call";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Section } from "../components/screens";
import {
  Group,
  Options,
  Option,
  Select,
  TextInput,
  Trigger,
  DropdownSelect,
  Checkbox,
  Button,
} from "../components/ui";
import { AI_MEMBERS_FORM_DATA, FORM_METADATA } from "../constants";
import { RenderSpace } from "../components/shared";

export const CreateDiscussion = () => {
  const [form, setForm] = useState("details");
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "Online Class vs Offline Class",
    topicSetting: "admin",
    aiParticipants: [],
    participants: [],
    otherParticipants: [],
    discussionMode: "selection",
    discussionLength: 5,
    discussionLengthSetting: "fixed",
    pointsSetting: "noLimit",
    minPoints: 0,
    maxPoints: 0,
    pointsPerParticipant: 0,
    conclusionBy: "both",
    conclusionMode: "selection",
    conclusionLength: 0,
    conclusionLengthSetting: "fixed",
    aiSpeechMode: "selection",
    aiSpeaksAtFrequency: 0,
    accessConversation: false,
    accessOthersConversation: false,
    accessFeedback: false,
    accessOthersFeedback: false,
    accessParticipantConversation: false,
    accessParticipantFeedback: false,
    micAccessWaitTime: 2,
    createdBy: "",
    rounds: "single",
    status: "notStarted",
    sessionStartTime: null,
    sessionEndTime: null,
  });

  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation(createDiscussion, {
    onSuccess: (data) => {
      if (data?.result) navigate(`/gd/${data?.result}`);
    },
    onError: (error) => {
      console.error("Error creating discussion:", error);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

  const handleDropdownChange = (name, value) => {
    setDiscussionDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(discussionDetails);
  };

  const isDisabled = (field) => {
    const { id, disableCondition } = field;

    if (disableCondition && Array.isArray(disableCondition)) {
      return disableCondition.every((item) => {
        const { value } = item;
        if (Array.isArray(value)) {
          return value.includes(discussionDetails[item.id]);
        }
        return discussionDetails[item.id] === value;
      });
    }
    return false;
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
                <Button label={isLoading ? "Creating..." : "Create"} variant="success" />
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
                    console.log({ aaa: isDisabled(field), field: field?.id });
                    if (field.component === "TextInput") {
                      return (
                        <TextInput
                          key={idx}
                          value={discussionDetails[field.id]}
                          {...field}
                          onChange={handleChange}
                          disabled={isDisabled(field)}
                        />
                      );
                    } else if (field.component === "DropdownSelect") {
                      return (
                        <DropdownSelect
                          key={idx}
                          value={discussionDetails[field.id]}
                          {...field}
                          onChange={handleDropdownChange}
                          disabled={isDisabled(field)}
                        />
                      );
                    } else if (field.component === "Checkbox") {
                      return (
                        <Checkbox
                          key={idx}
                          {...field}
                          onChange={handleChange}
                          disabled={isDisabled(field)}
                        />
                      );
                    }
                    return null; // Fallback for any unhandled field types
                  })}
                </div>
              </Section>
            ))
          ) : (
            <div>
              {AI_MEMBERS_FORM_DATA?.map((section, index) => (
                <Section
                  key={index}
                  title={section.title}
                  description={section.description}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map((field, idx) => {
                      console.log({ aaa: isDisabled(field), field: field?.id });
                      if (field.component === "TextInput") {
                        return (
                          <TextInput
                            key={idx}
                            value={discussionDetails[field.id]}
                            {...field}
                            onChange={handleChange}
                            disabled={isDisabled(field)}
                          />
                        );
                      } else if (field.component === "DropdownSelect") {
                        return (
                          <DropdownSelect
                            key={idx}
                            value={discussionDetails[field.id]}
                            {...field}
                            onChange={handleDropdownChange}
                            disabled={isDisabled(field)}
                          />
                        );
                      } else if (field.component === "Checkbox") {
                        return (
                          <Checkbox
                            key={idx}
                            {...field}
                            onChange={handleChange}
                            disabled={isDisabled(field)}
                          />
                        );
                      }
                      return null; // Fallback for any unhandled field types
                    })}
                  </div>
                </Section>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Creating Discussion..." : "Start Discussion"}
          </button>
          {isError && <p className="text-red-500">{error?.message}</p>}
        </form>
      </div>
    </div>
  );
};
