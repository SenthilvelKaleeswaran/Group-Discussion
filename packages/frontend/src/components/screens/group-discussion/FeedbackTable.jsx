import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Table } from "../../ui";
import { useSelector, useDispatch } from "react-redux";
import { displayToast, Loader } from "../../shared";
import { CreateDiscussion } from "../../../screens";
import {  NewDiscussionModal } from "./NewDiscussionModal";

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

export function FeedbackTable({ socket, events, aiParticipants, sessionId,session }) {
  const { participants, loading } = useSelector((state) => state.participants);
  const { userPoints = {}, discussion = [] } = useSelector(
    (state) => state.conversation
  );
  const dispatch = useDispatch();

  const [selectedIds, setSelectedIds] = useState([]);
  const [userStatus, setUserStatus] = useState({}); // Store user status updates

  console.log({ userStatus });

  // Function to update user status in the array
  const updateUserStatus = (userId, newStatus) => {
    setUserStatus((prev) => {
      const updatedStatus = { ...prev };
      if (newStatus === null) {
        delete updatedStatus[userId];
      } else {
        updatedStatus[userId] = newStatus;
      }
      return updatedStatus;
    });
  };

  // Handle "Make Another Round"
  const handleMakeAnotherRound = () => {
    if (selectedIds.length === 0) {
      displayToast({
        data: { error: "Select participants for the next round." },
      });
      return;
    }

    socket.emit("NEXT_ROUND", {
      selectedParticipants: userStatus,
      sessionId,
      type: "ANOTHER",
    });
  };

  // Handle "Declare Result"
  const handleDeclareResult = () => {
    if (selectedIds.length === 0) {
      displayToast({
        data: { error: "No participants selected to declare the result." },
      });
      return;
    }

    socket.emit("DECLARE_RESULT", {
      selectedParticipants: userStatus,
      sessionId,
    });
  };

  const discussionScore = useMemo(
    () => calculateOverallScore(discussion, userPoints),
    [discussion, userPoints]
  );

  const getTableData = useCallback(() => {
    if (loading || !userPoints) return [];

    const users = [
      ...(participants?.participant || []),
      ...(aiParticipants || []),
    ];

    return users.map((item) => {
      const userId = item?.userId || item?._id;
      const userPointData = userPoints[userId] || {};
      const discussionScoreValue = Number(
        (discussionScore[userId] || 0).toFixed(2)
      );
      const feedbackScoreValue = Number(
        evaluateMetrics(item?.feedback || {}) || 0
      );

      const initialStatus = userStatus[userId] || null;

      return {
        _id: { display: false, value: item?._id },
        userId: { display: false, value: userId },
        name: { value: item?.name },
        totalPoints: {
          value: `${userPointData.feedback || 0} / ${
            userPointData.points || 0
          }`,
        },
        conclusionPoints: {
          value: `${userPointData.conclusionFeedback || 0} / ${
            userPointData.conclusionPoints || 0
          }`,
        },
        discussionScore: { value: discussionScoreValue },
        performanceFeedback: {
          value: !isFalsyObject(
            participants?.participant?.find((_) => _?.userId === item?.userId)
              ?.feedback
          )
            ? "✅"
            : "❌",
        },
        feedbackScore: { value: feedbackScoreValue },
        totalScore: {
          value: Number((discussionScoreValue + feedbackScoreValue).toFixed(2)),
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
    userStatus,
  ]);

  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getTableData());
  }, [getTableData]);

  if (loading || participants?.length === 0) return <Loader />;

  console.log({data,userStatus,aiParticipants})

  
  

  return (
    <div>
      <Table data={data} sortKey="totalScore" />
      <div className="flex gap-4">
      <NewDiscussionModal
        participant={participants?.participant}
        participantStatus={userStatus}
        handleStatusChange={updateUserStatus}
        aiParticipants={aiParticipants}
        session={session}
        socket={socket}
      />
        {/* <Button label="Make Another Round" onClick={handleMakeAnotherRound} /> */}
        <Button label="Declare Result" onClick={handleDeclareResult} />
      </div>
    </div>
  );
}
