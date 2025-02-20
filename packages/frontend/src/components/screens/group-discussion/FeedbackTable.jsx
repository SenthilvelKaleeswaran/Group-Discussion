import React, { useState, useEffect, useCallback } from "react";
import { Table } from "../../ui";
import { useSelector } from "react-redux";
import { Loader } from "../../shared";
import { useDispatch } from "react-redux";
import { setUserPoints } from "../../../store";

export function FeedbackTable({ events, aiParticipants }) {
  const { participants, loading } = useSelector((state) => state.participants);
  const { userPoints = {} } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  // State to hold table data
  const [data, setData] = useState([]);

  const isFalsyObject = (obj) => !obj || Object.keys(obj).length === 0;

  // Function to prepare table data
  const getTableData = useCallback(() => {
    if (loading || !userPoints) return [];
    const users = [
      ...(participants?.participant || []),
      ...(aiParticipants || []),
    ];

    console.log({ users, ccc: participants?.participant });

    return users.map((item) => ({
      _id: {
        display: false,
        value: item?._id,
      },
      userId: {
        display: false,
        value: item?.userId || item?._id,
      },
      name: {
        value: item?.name,
      },
      totalPoints: {
        value: `${userPoints[item?.userId || item?._id]?.feedback || 0} /  ${
          userPoints[item?.userId || item?._id]?.points || 0
        } `,
      },

      conclusionPoints: {
        value: `${
          userPoints[item?.userId || item?._id]?.conclusionFeedback || 0
        } /  ${userPoints[item?.userId || item?._id]?.conclusionPoints || 0} `,
      },

      discussionScore: {
        value: 0,
      },
      overAllFeedbckGenerte: {
        value: !isFalsyObject(
          participants?.participant?.find((_) => _?.userId === item?.userId)?.feedback
        )
          ? "✅"
          : "❌",
      },
      feedbackScore: {
        value: 0,
      },
      totalScore: {
        value: 45,
      },
    }));
  }, [participants?.participant, aiParticipants, loading, userPoints]);

  // Update table data whenever participants or aiParticipants change
  useEffect(() => {
    const newData = getTableData();
    setData(newData);
  }, [getTableData]);

  useEffect(() => {
    const updateFeedbackCounts = events?.FEEDBACK_CONVERSATION_UPDATE;

    if (updateFeedbackCounts) {
      const { userId, isConclusion } = updateFeedbackCounts;

      if (userId && userPoints?.[userId]) {
        const updatedUserPoints = {
          ...userPoints,
          [userId]: {
            ...userPoints[userId],
            conclusionFeedback:
              userPoints[userId].conclusionFeedback + (isConclusion ? 1 : 0),
            feedback: userPoints[userId].feedback + (!isConclusion ? 1 : 0),
          },
        };

        dispatch(setUserPoints(updatedUserPoints));
      }
    }
  }, [events?.FEEDBACK_CONVERSATION_UPDATE]);

  if (loading) return <Loader />;

  return <Table data={data} sortKey="score" />;
}
