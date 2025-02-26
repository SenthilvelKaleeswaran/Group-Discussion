import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Table } from "../../ui";
import { useSelector, useDispatch } from "react-redux";
import { displayToast, Loader } from "../../shared";
import { setUserPoints } from "../../../store";

// Utility to check for falsy objects
const isFalsyObject = (obj) => !obj || Object.keys(obj).length === 0;

// Function to evaluate metrics from feedback
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

// Function to calculate overall scores from a discussion array
const calculateOverallScore = (array, userPoints) => {
  if (!array || !userPoints || !Object.keys(userPoints).length) return {};

  // Extract the maximum value from userPoints' relevant numeric properties
  const maxValue = Math.max(
    ...Object.values(userPoints).map((point) => point.points || 0) // Ensure numeric values
  );

  if (maxValue <= 0) return {}; // Avoid division by zero

  // Aggregate scores from the discussion array
  const val = array.reduce((acc, item) => {
    const key = item.userId?._id ?? item.aiId?._id;
    const itemScore = evaluateMetrics(item.feedback);

    acc[key] = (acc[key] || 0) + itemScore;
    return acc;
  }, {});

  // Normalize the scores relative to the max value
  Object.entries(val).forEach(([key, value]) => {
    if (userPoints[key]) {
      val[key] = (value * userPoints[key].points) / maxValue;
    }
  });

  return val;
};

export function FeedbackTable({ socket, events, aiParticipants,sessionId }) {
  const { participants, loading } = useSelector((state) => state.participants);
  const { userPoints = {}, discussion = [] } = useSelector(
    (state) => state.conversation
  );
  const dispatch = useDispatch();

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectionChange = (ids) => {
    console.log("Selected Row IDs:", ids);
    setSelectedIds(ids);
  };

  // State to hold table data
  const [data, setData] = useState([]);

  // Calculate discussion scores once
  const discussionScore = useMemo(
    () => calculateOverallScore(discussion, userPoints),
    [discussion, userPoints]
  );

  // Function to prepare table data
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
      };
    });
  }, [
    participants?.participant,
    aiParticipants,
    loading,
    userPoints,
    discussionScore,
  ]);

  // Update table data whenever dependencies change
  useEffect(() => {
    setData(getTableData());
  }, [getTableData]);

  // Update feedback counts when FEEDBACK_CONVERSATION_UPDATE event occurs
  useEffect(() => {
    const updateFeedbackCounts = events?.FEEDBACK_CONVERSATION_UPDATE;
    if (updateFeedbackCounts) {
      const { userId, isConclusion } = updateFeedbackCounts;
      if (userId && userPoints[userId]) {
        dispatch(
          setUserPoints({
            ...userPoints,
            [userId]: {
              ...userPoints[userId],
              conclusionFeedback:
                userPoints[userId].conclusionFeedback + (isConclusion ? 1 : 0),
              feedback: userPoints[userId].feedback + (!isConclusion ? 1 : 0),
            },
          })
        );
      }
    }
  }, [events?.FEEDBACK_CONVERSATION_UPDATE, userPoints, dispatch]);

  const handleMakeAnotherRound = () => {
    if (selectedIds.length === 0) {
      displayToast({
        data: { error: "Select participants for the next round." },
      });
      return;
    }

    socket.emit("NEXT_ROUND", { selectedParticipants: selectedIds,sessionId });
  };

  if (participants?.length === 0) return <Loader />;

  return (
    <div>
      <Table
        data={data}
        sortKey="totalScore"
        selectable={true}
        onSelectionChange={handleSelectionChange}
      />
      <div className="flex gap-4">
        <Button label="Make Another Round" onClick={handleMakeAnotherRound} />
        <Button label="Declare Result" />
      </div>
    </div>
  );
}
