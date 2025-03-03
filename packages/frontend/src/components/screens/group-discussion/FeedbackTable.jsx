import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Table } from "../../ui";
import { useSelector, useDispatch } from "react-redux";
import { displayToast, Loader } from "../../shared";
import { CreateDiscussion } from "../../../screens";
import { NewDiscussionModal } from "./NewDiscussionModal";
import { setFeedbackStatus, setSelectedParticipants } from "../../../store";

const Actions = ({ userId, updateUserStatus, initialStatus }) => {
  const handleStatusChange = (status) => {
    const newStatus = initialStatus === status ? null : status;
    updateUserStatus(userId, newStatus);
  };

  const statusOptions = [
    { status: "SELECTED", emoji: "🟢", label: "Select" },
    { status: "REJECTED", emoji: "🔴", label: "Reject" },
    { status: "WAITING_LIST", emoji: "🟡", label: "Wait List" },
  ];

  return (
    <div className="flex gap-2 flex-1 w-full">
      {statusOptions.map(({ status, emoji, label }) => (
        <Button
          key={status}
          label={initialStatus === status ? `${emoji} ${label}ed` : label}
          variant="ghost"
          onClick={() => handleStatusChange(status)}
        />
      ))}
    </div>
  );
};

const isFalsyObject = (obj) => !obj || Object.keys(obj).length === 0;

const evaluateMetrics = (feedback) => {
  return Object.values(feedback || {}).reduce((totalScore, metric) => {
    const subMetrics = Object.values(metric);
    const averageValue =
      subMetrics.reduce(
        (sum, subMetric) => sum + parseFloat(subMetric.value || 0),
        0
      ) / subMetrics.length;

    const normalizedScore = (averageValue / 100) * 10; // Normalize to a 10-point scale
    return totalScore + normalizedScore;
  }, 0);
};

const calculateOverallScore = (array, userPoints) => {
  if (!array || !userPoints || !Object.keys(userPoints).length) return {};

  const maxValue = Math.max(
    ...Object.values(userPoints).map((point) => point.points || 0)
  );

  if (maxValue <= 0) return {};

  const val = array.reduce((acc, item) => {
    const key = item.userId?._id ?? item.aiId?._id;
    const itemScore = evaluateMetrics(item.feedback);

    acc[key] = (acc[key] || 0) + itemScore;
    return acc;
  }, {});

  Object.entries(val).forEach(([key, value]) => {
    if (userPoints[key]) {
      val[key] = (value * userPoints[key].points) / maxValue;
    }
  });

  return val;
};

export function FeedbackTable({
  socket,
  events,
  aiParticipants,
  sessionId,
  session,
}) {
  const dispatch = useDispatch();

  const { participants, loading } = useSelector((state) => state.participants);

  const { userPoints = {}, discussion = [] } = useSelector(
    (state) => state.conversation
  );

  const { userFeedbackStatus = {} } = useSelector((state) => state.session);

  console.log({ userFeedbackStatus });

  const onSelectionChange = (data)=>{
    dispatch(setSelectedParticipants(data)); 
  }

  const updateUserStatus = (userId, status) => {
    dispatch(setFeedbackStatus({ userId, newStatus: status }));
  };

  const getButtonStatus = () => {
    return status === "FEEDBACK_GENERATING";
  };

  // Handle "Declare Result"
  const handleDeclareResult = () => {
    // if (selectedIds.length === 0) {
    //   displayToast({
    //     data: { error: "No participants selected to declare the result." },
    //   });
    //   return;
    // }

    socket.emit("DECLARE_RESULT", {
      selectedParticipants: userFeedbackStatus,
      sessionId,
    });
  };

  const discussionScore = useMemo(
    () => calculateOverallScore(discussion, userPoints),
    [discussion, userPoints]
  );
  const { status } = session;

  const getTableData = useCallback(() => {
    if (loading || !userPoints) return [];

    const users = [
      ...(participants?.participant || []),
      ...(aiParticipants || []),
    ];

    const getValue = (data, current, total) => {
      console.log({ data, current, total });
      if (status === "COMPLETED") {
        return data[total] || 0;
      }
      return `${data[current] || 0} / ${data[total] || 0}`;
    };

    return users.map((item) => {
      const userId = item?.userId || item?._id;
      const userPointData = userPoints[userId] || {};
      const discussionScoreValue = Number(
        (discussionScore[userId] || 0).toFixed(2)
      );
      const feedbackScoreValue = Number(
        evaluateMetrics(item?.feedback || {}) || 0
      );

      const initialStatus = userFeedbackStatus[userId] || null;

      return {
        _id: { display: false, value: item?._id },
        userId: { display: false, value: userId },
        name: { value: item?.name },
        totalDiscussionPoints: {
          value: getValue(userPointData, "feedback", "points"),
        },
        conclusionPoints: {
          value: getValue(
            userPointData,
            "conclusionFeedback",
            "conclusionPoints"
          ),
        },
        totalPoints: {
          value:
            getValue(userPointData, "feedback", "points") +
            getValue(userPointData, "conclusionFeedback", "conclusionPoints"),
          display: status === "COMPLETED",
        },
        discussionScore: {
          value: discussionScoreValue,
          display: status !== "COMPLETED",
        },
        performanceFeedback: {
          value: !isFalsyObject(
            participants?.participant?.find((_) => _?.userId === item?.userId)
              ?.feedback
          )
            ? "✅"
            : "❌",
          display: status !== "COMPLETED",
        },
        feedbackScore: {
          value: feedbackScoreValue,
          display: status !== "COMPLETED",
        },
        totalScore: {
          value: Number((discussionScoreValue + feedbackScoreValue).toFixed(2)),
          display: status !== "COMPLETED",
        },
        actions: {
          value: (
            <Actions
              userId={userId}
              updateUserStatus={updateUserStatus}
              initialStatus={initialStatus}
            />
          ),
        },
      };
    });
  }, [
    participants?.participant,
    aiParticipants,
    loading,
    userPoints,
    discussionScore,
    userFeedbackStatus,
  ]);

  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getTableData());
  }, [getTableData]);


  

  if (loading || participants?.length === 0) return <Loader />;

  console.log({ data, userFeedbackStatus, aiParticipants });

  return (
    <div className="space-y-4">
      <Table
        data={data}
        sortKey={status === "COMPLETED" ? "totalPoints" : "totalScore"}
        selectable
        onSelectionChange={onSelectionChange}
        
      />
      <div className="flex gap-4 items-center justify-center">
        <NewDiscussionModal
          participant={participants?.participant}
          participantStatus={userFeedbackStatus}
          handleStatusChange={updateUserStatus}
          aiParticipants={aiParticipants}
          session={session}
          socket={socket}
          disabled={getButtonStatus()}
        />
        {/* <Button label="Make Another Round" onClick={handleMakeAnotherRound} /> */}
        <Button
          label="Declare Result"
          onClick={handleDeclareResult}
          disabled={getButtonStatus()}
        />
      </div>
    </div>
  );
}
