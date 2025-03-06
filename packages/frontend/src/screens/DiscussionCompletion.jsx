import React, { useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ButtonDropdown, PermissionGuard } from "../components/shared";
import { Button } from "../components/ui";
import { NewDiscussionModal } from "../components/screens/group-discussion/NewDiscussionModal";
import { setFeedbackStatus, setSelectedParticipants } from "../store";
import { FeedbackTable } from "../components/screens";

const GenerateFeedbackButton = React.memo(
  ({ isFeedbackInprogress, feedbackStatus, socket, sessionId }) => {
    const userId = localStorage.getItem("userId");
    const selectedParticipants = useSelector(
      (state) => state.session.selectedParticipants
    );

    const dispatch = useDispatch();

    useEffect(() => {
      console.log({ selectedParticipants5: selectedParticipants });
    }, [selectedParticipants]);

    const handleGenerateFeedback = useCallback(
      (data = {}) => {
        socket.emit("GENERATE_FEEDBACK", { sessionId, ...data });
        dispatch(setSelectedParticipants([]));
      },
      [selectedParticipants]
    );

    const options = useMemo(
      () => [
        {
          id: "generate",
          label: "Generate Feedback for all",
          onClick: () => handleGenerateFeedback(),
        },
        {
          id: "generate_selected",
          label: "Generate Feedback for selected",
          onClick: () =>
            handleGenerateFeedback({ selectedParticipants, startedBy: userId }),
          disabled: selectedParticipants?.length === 0,
        },
      ],
      [selectedParticipants, handleGenerateFeedback, userId] // Recreate options when dependencies change
    );

    // Define defaultLabel with useMemo
    const defaultLabel = useMemo(
      () =>
        feedbackStatus === "SELECTED_IN_PROGRESS"
          ? "Generating Feedback for selected"
          : feedbackStatus === "IN_PROGRESS"
          ? "Generating Feedback"
          : "Generate Feedback",
      [feedbackStatus] // Recalculate defaultLabel when feedbackStatus changes
    );

    return (
      <PermissionGuard
        field="generateFeedbackButton"
        condition={!isFeedbackInprogress && feedbackStatus !== "COMPLETED"}
      >
        <ButtonDropdown
          options={options}
          defaultLabel={defaultLabel}
          defaultOption={
            isFeedbackInprogress
              ? "no_id"
              : selectedParticipants?.length === 0
              ? "generate"
              : "generate_selected"
          }
          loading={isFeedbackInprogress}
          disabled={false}
        />
      </PermissionGuard>
    );
  }
);

// Extracted MakeAnotherRoundButton Component
const MakeAnotherRoundButton = React.memo(
  ({
    isFeedbackCompleted,
    participants,
    userFeedbackStatus,
    updateUserStatus,
    aiParticipants,
    data,
    socket,
    getButtonStatus,
  }) => (
    <PermissionGuard
      field="makeAnotherRoundButton"
      condition={isFeedbackCompleted}
    >
      <NewDiscussionModal
        participant={participants?.participant}
        participantStatus={userFeedbackStatus}
        handleStatusChange={updateUserStatus}
        aiParticipants={aiParticipants}
        session={data}
        socket={socket}
        disabled={getButtonStatus()}
      />
    </PermissionGuard>
  )
);

// Extracted DeclareResultButton Component
const DeclareResultButton = React.memo(
  ({ isFeedbackCompleted, handleDeclareResult, getButtonStatus }) => (
    <PermissionGuard
      field="declareResultButton"
      condition={isFeedbackCompleted}
    >
      <Button
        label="Declare Result"
        onClick={handleDeclareResult}
        disabled={getButtonStatus()}
        variant="success"
      />
    </PermissionGuard>
  )
);

export default function DiscussionCompletion({ data, events, socket }) {
  const dispatch = useDispatch();

  const { mutedParticipants = [], userRole } = useSelector(
    (state) => state.controls
  );

  const { participants, loading } = useSelector((state) => state.participants);

  const {
    status = "",
    feedbackStatus = "",
    aiParticipants = [],
    _id: sessionId,
  } = data;

  const {
    userFeedbackStatus = {},
    selectedParticipants,
    sessionData,
  } = useSelector((state) => state.session);

  console.log({ selectedParticipants1: selectedParticipants, sessionData });

  const handleDeclareResult = useCallback(() => {
    socket.emit("DECLARE_RESULT", {
      selectedParticipants: userFeedbackStatus,
      sessionId,
    });
  }, [socket, userFeedbackStatus, sessionId]);

  const updateUserStatus = useCallback(
    (userId, status) => {
      dispatch(setFeedbackStatus({ userId, newStatus: status }));
    },
    [dispatch]
  );

  const isFeedbackInprogress =
    feedbackStatus === "SELECTED_IN_PROGRESS" ||
    feedbackStatus === "IN_PROGRESS";

  const isFeedbackCompleted =
    feedbackStatus === "SELECTED_COMPLETED" || feedbackStatus === "COMPLETED";

  const getButtonStatus = () => isFeedbackInprogress;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-800 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-yellow-400">
          {feedbackStatus === ""
            ? "You are rejected"
            : feedbackStatus === "COMPLETED"
            ? `🎉🏆 Feedback Generation Completed! 🏆🎉`
            : isFeedbackInprogress
            ? `🌟🏆 Feedback Generation in Progress... 🏆🌟`
            : status === "COMPLETED"
            ? `🎊🏆 Discussion Battle Finished! 🏆🎊`
            : `🔄 Processing... 🔄`}
        </h2>

        <div className="flex flex-col items-center justify-center p-4 bg-gray-900 rounded-lg text-white">
          <div className="flex flex-col items-center space-y-8">
            {isFeedbackInprogress && (
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20 animate-ping">
                <div className="h-8 w-8 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
              </div>
            )}

            <p className="text-sm text-gray-200">
              {feedbackStatus === "COMPLETED"
                ? "All feedback has been processed successfully. 📊🔍"
                : isFeedbackInprogress
                ? "Please wait while we process your discussion. ⏳🔄"
                : status === "COMPLETED"
                ? "The discussion has concluded. Thank you for participating! 👏🎉"
                : "Please wait while we set up your session. ⚙️🕒"}
            </p>
          </div>
        </div>

        {/* Optimized components */}
        <GenerateFeedbackButton
          isFeedbackInprogress={isFeedbackInprogress}
          feedbackStatus={feedbackStatus}
          socket={socket}
          sessionId={sessionId}
        />

        <div className="flex gap-4">
          <MakeAnotherRoundButton
            isFeedbackCompleted={isFeedbackCompleted}
            participants={participants}
            userFeedbackStatus={userFeedbackStatus}
            updateUserStatus={updateUserStatus}
            aiParticipants={aiParticipants}
            data={data}
            socket={socket}
            getButtonStatus={getButtonStatus}
          />

          <DeclareResultButton
            isFeedbackCompleted={isFeedbackCompleted}
            handleDeclareResult={handleDeclareResult}
            getButtonStatus={getButtonStatus}
          />
        </div>
      </div>
      <PermissionGuard field="feedbackTable">
        <FeedbackTable
          aiParticipants={aiParticipants}
          events={events}
          socket={socket}
          sessionId={sessionId}
          session={data}
        />
      </PermissionGuard>
    </div>
  );
}
