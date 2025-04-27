import React, { useMemo } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTrigger,
  ModalFooter,
  Button,
  Checkbox,
} from "../../ui";
import { useDiscussionForm } from "../../../hooks";
import { DiscussionForm } from "../create-discussion/DiscussionForm";
import { displayToast, RenderSpace } from "../../shared";
import { formatCapitializedText } from "../../../utils";
import Icon from "../../../icons";
import { useSelector } from "react-redux";

// Constants
const PARTICIPANT_CATEGORIES = [
  { id: "SELECTED", label: "Selected Participants", color: "text-green-500" },
  { id: "REJECTED", label: "Rejected Participants", color: "text-red-500" },
  {
    id: "WAITING_LIST",
    label: "Waitlisted Participants",
    color: "text-yellow-500",
  },
  {
    id: "NOT_SELECTED",
    label: "Not Selected Participants",
    color: "text-gray-500",
  },
];

const STATUS_OPTIONS = {
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

const order = ["details", "members", "participants", "session"];

const previewDetails = {
  details: {
    name: "Session Details",
    icon: "List",
  },
  members: {
    name: "AI Participants",
    icon: "Robot",
  },
  participants: {
    name: "Participants",
    icon: "Users",
  },
  session: {
    name: "Settings",
    icon: "SettingsSession",
  },
};

// Session Settings Component
const SessionSettings = ({
  groupedParticipants,
  setDiscussionDetails,
  handleMakeAnotherRound,
  displayResult,
}) => {
  const handleChange = (id) => {
    setDiscussionDetails((prev) => ({
      ...prev,
      displayResult: prev.displayResult.includes(id)
        ? prev.displayResult.filter((item) => item !== id)
        : [...prev.displayResult, id],
    }));
  };

  const isAnySelected =
    groupedParticipants["SELECTED"]?.length ||
    groupedParticipants["REJECTED"]?.length ||
    groupedParticipants["WAITING_LIST"]?.length;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 rounded-lg">
      <h2 className="mb-4 text-xl font-semibold text-left text-gray-500">
        Show result to
      </h2>
      <div className="flex flex-col gap-3 mb-4 mx-4">
        {PARTICIPANT_CATEGORIES.map(({ id, label }) => (
          <RenderSpace condition={groupedParticipants[id]?.length > 0}>
            <Checkbox
              key={id}
              label={label}
              onChange={() => handleChange(id)}
              checked={displayResult?.includes(id)}
            />
          </RenderSpace>
        ))}
      </div>
      <Button
        label="Create"
        variant="success"
        onClick={handleMakeAnotherRound}
      />
    </div>
  );
};

// Main Component
export const NewDiscussionModal = ({
  participant,
  participantStatus,
  handleStatusChange,
  session,
  socket,
  disabled,
}) => {
  console.log("render");
  const {
    form,
    setForm,
    discussionDetails,
    setDiscussionDetails,
    aiModelData,
    handleChange,
    getConditions,
    handleModelsChange,
  } = useDiscussionForm({ data: session });

  console.log({ form, discussionDetails });

  const groupedParticipants = useMemo(() => {
    const grouped = Object.fromEntries(
      PARTICIPANT_CATEGORIES.map(({ id }) => [id, []])
    );

    participant?.forEach((item) => {
      const status = participantStatus[item?.userId] || "NOT_SELECTED";
      grouped[status].push(item);
    });

    return grouped;
  }, [participant, participantStatus]);

  const handleMakeAnotherRound = () => {
    // if (selectedIds.length === 0) {
    //   displayToast({
    //     data: { error: "Select participants for the next round." },
    //   });
    //   return;
    // }

    const { _id, ...rest } = discussionDetails;

    rest?.displayResult?.filter((_) => {
      if (groupedParticipants[_]?.length) {
        return _;
      }
    });

    socket.emit("NEXT_ROUND", {
      selectedParticipants: participantStatus,
      switchNow : true,
      discussionDetails: rest,
      sessionId: session?._id,
      type: "ANOTHER",
    });
  };

  const handleNavigation = (direction) => {
    const currentIndex = order.indexOf(form);
    setForm(order[currentIndex + direction]);
  };

  const renderActionButtons = (userId, status) => (
    <div className="flex gap-2">
      {STATUS_OPTIONS[status]?.map(({ status: newStatus, label }) => (
        <Button
          key={newStatus}
          label={label}
          variant="ghost"
          className={
            PARTICIPANT_CATEGORIES.find((c) => c.id === newStatus)?.color
          }
          onClick={() => handleStatusChange(userId, newStatus)}
        />
      ))}
    </div>
  );

  const renderBody = () => {
    switch (form) {
      case "details":
      case "members":
        return (
          <DiscussionForm
            form={form}
            discussionDetails={discussionDetails}
            aiModelData={aiModelData}
            handleChange={handleChange}
            getConditions={getConditions}
            handleModelsChange={handleModelsChange}
          />
        );
      case "participants":
        return (
          <div className="flex gap-4 w-full h-full">
            {PARTICIPANT_CATEGORIES.map(({ id, color }) => (
              <div
                key={id}
                className="w-full h-full border rounded-md space-y-4"
              >
                <p className={`${color} mt-4`}>{formatCapitializedText(id)}</p>
                <div className="overflow-y-auto rounded-md">
                  {groupedParticipants[id].map((item, index) => (
                    <div
                      key={item?.userId || index}
                      className="border border-gray-700 p-4 rounded-md hover:bg-gray-800 space-y-2"
                    >
                      <div className="flex gap-2">
                        <span>{index + 1}.</span>
                        <span>{item?.name}</span>
                      </div>
                      {renderActionButtons(item?.userId, id)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <SessionSettings
            groupedParticipants={groupedParticipants}
            setDiscussionDetails={setDiscussionDetails}
            handleMakeAnotherRound={handleMakeAnotherRound}
            displayResult={discussionDetails?.displayResult}
          />
        );
    }
  };

  console.log({ discussionDetails });

  return (
    <Modal disabled={disabled}>
      <ModalTrigger>Make Another Round</ModalTrigger>
      <ModalContent className="w-full mx-4 items-center">
        <ModalHeader>
          <div className="flex items-center  justify-between w-full gap-4">
            <div className="flex gap-2 items-center">
              <Icon name={previewDetails[form]?.icon} className={`text-xl`} />
              <p className="text-lg">{previewDetails[form]?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {Object.entries(previewDetails).map(([key, value]) => (
                  <div
                    className={`${
                      key === form ? "bg-gray-800 shadow-2xl rounded-md" : ""
                    } p-3 cursor-pointer`}
                    onClick={() => setForm(key)}
                  >
                    <Icon
                      name={value?.icon}
                      className={`${
                        key === form ? "text-purple-500" : ""
                      } text-xl`}
                    />
                  </div>
                ))}
              </div>

              <Button
                label="Back"
                variant="secondary"
                onClick={() => handleNavigation(-1)}
                disabled={form === "details"}
              />
              <Button
                label="Next"
                variant="primary"
                onClick={() => handleNavigation(1)}
                disabled={form === "session"}
              />
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="h-[calc(100vh-100px)] w-full">
          {renderBody()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
