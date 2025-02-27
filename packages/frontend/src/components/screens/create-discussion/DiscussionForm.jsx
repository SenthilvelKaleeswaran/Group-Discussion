
import { FORM_METADATA } from "../../../constants";
import { AiModelCard } from "../../shared";
import { TextInput, DropdownSelect, Checkbox } from "../../ui";
import { Section } from "./Section";

export const DiscussionForm = ({
  form,
  discussionDetails,
  aiParticipants,
  aiModelData,
  handleChange,
  getConditions,
  handleModelsChange,
}) => {

  console.log({aiModelData,aiParticipants})
  return (
    <div className="flex h-full overflow-y-scroll bg-gray-800 p-8  shadow-lg w-full space-y-8">
      <form className="space-y-6">
          {form === "details" ? (
            FORM_METADATA?.map((section, index) => (
              <Section
                key={index}
                title={section.title}
                description={section.description}
              >
                <div className="grid grid-cols-4 gap-4">
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
        </form>
    </div>
  );
};
