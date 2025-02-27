import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTrigger,
  ModalFooter,
  Button,
} from "../../ui";
import { CreateDiscussion } from "../../../screens";
import { useDiscussionForm } from "../../../hooks";
import { DiscussionForm } from "../create-discussion/DiscussionForm";
import { RenderSpace } from "../../shared";
import { formatCapitializedText, formatTopicName } from "../../../utils";

export const NewDiscussionMoadal = ({
  participant,
  participantStatus,
  handleStatusChange,
}) => {
  const order = ["details", "members", "participants"];

  const {
    form,
    setForm,
    discussionDetails,
    aiParticipants,
    aiModelData,
    mutate,
    isLoading,
    isError,
    error,
    handleSubmit,
    handleChange,
    getConditions,
    handleModelsChange,
  } = useDiscussionForm({ order });

  const getIndex = (item) => {
    return order.indexOf(item);
  };

  const handleBack = () => {
    const index = order.indexOf(form);

    setForm(order[index - 1]);
  };

  const handleNext = () => {
    const index = order.indexOf(form);

    setForm(order[index + 1]);
  };

  function groupParticipants() {
    const grouped = {
      SELECTED: [],
      REJECTED: [],
      WAITING_LIST: [],
      NOT_SELECTED: [],
    };

    participant?.map((item) => {
      const status = participantStatus[item?.userId];
      if (status) {
        grouped[status].push(item);
      } else {
        grouped["NOT_SELECTED"].push(item);
      }
    });

    return grouped;
  }

  const statusStyle = {
    SELECTED: "text-green-500",
    REJECTED: "text-red-500",
    WAITING_LIST: "text-yellow-500",
  };

  const statusOptions = {
    SELECTED: [
      { status: "REJECTED", label: "🔴 Reject" },
      { status: "WAITING_LIST", label: "🟡 Wait List" },
    ],
    REJECTED: [
      { status: "SELECTED", label: "🟢 Select" },
      { status: "WAITING_LIST", label: "🟡 Wait List" },
    ],
    WAITING_LIST: [
      { status: "SELECTED", label: "🟢 Select" },
      { status: "REJECTED", label: "🔴 Reject" },
    ],
    NOT_SELECTED: [
      { status: "SELECTED", label: "🟢 Select" },
      { status: "REJECTED", label: "🔴 Reject" },
      { status: "WAITING_LIST", label: "🟡 Wait" },
    ],
  };

  // Example usage:
  const groupedParticipants = groupParticipants();
  console.log({ groupedParticipants, form });

  console.log({ participant, form, participantStatus });

  const renderActionButtons = (userId, key) => {
    return (
      <div className="flex gap-2 w-full">
        {statusOptions[key]?.map(({ status, label }) => (
          <Button
            key={status}
            label={label}
            variant="ghost"
            className={statusStyle[status]}
            onClick={() => handleStatusChange(userId, status)}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal>
      <ModalTrigger>Open Modal</ModalTrigger>
      <ModalContent className="w-full mx-4">
        <ModalHeader>
          <div className="flex gap-4 justify-between items-center w-full">
            <p>Preview for Session</p>
            <div className="flex gap-4">
              <RenderSpace condition={form !== "details"}>
                <Button label="Back" variant="secondary" onClick={handleBack} />
              </RenderSpace>

              <RenderSpace condition={true}>
                <Button label="Next" variant="primary" onClick={handleNext} />
              </RenderSpace>

              <RenderSpace condition={form === "participants"}>
                <Button
                  label={isLoading ? "Creating..." : "Create"}
                  variant="success"
                  type="submit"
                />
              </RenderSpace>
            </div>{" "}
          </div>
        </ModalHeader>
        <ModalBody className="h-[calc(100vh-150px)] w-full rounded-full">
          {form === "details" || form === "members" ? (
            <DiscussionForm
              form={form}
              discussionDetails={discussionDetails}
              aiParticipants={aiParticipants}
              aiModelData={aiModelData}
              handleChange={handleChange}
              getConditions={getConditions}
              handleModelsChange={handleModelsChange}
            />
          ) : (
            <div className="flex gap-4 w-full  justify-between">
              {Object.entries(groupedParticipants).map(([key, value]) => (
                <div className="space-y-4 w-full">
                  <p className={statusStyle[key]}>{formatCapitializedText(key)}</p>
                  <div className="space-y-4 w-full">
                    {value?.map((item, index) => (
                      <div className="gap-2 border border-gray-700 w-full px-4 py-2 rounded-md hover:bg-gray-800">
                        <div className="flex gap-2">
                          <p>{index + 1} .</p>
                          <p className="text-left">{item?.name}</p>
                        </div>
                        {renderActionButtons(item?.userId, key)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Confirm
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100"></div>
  );
}
