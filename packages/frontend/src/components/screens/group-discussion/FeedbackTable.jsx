import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Table } from "../../ui";
import { useSelector, useDispatch } from "react-redux";
import { displayToast, Loader, RenderSpace } from "../../shared";
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

  const { userFeedbackStatus = {},selectedParticipants=[] } = useSelector((state) => state.session);

  console.log({ userFeedbackStatus });

  const onSelectionChange = (data) => {
    console.log({ selectedParticipants: data, icame: "icame" });
    dispatch(setSelectedParticipants(data));
  };

  const updateUserStatus = (userId, status) => {
    dispatch(setFeedbackStatus({ userId, newStatus: status }));
  };

  const { status, feedbackStatus = "", feedbackSelectedParticipant } = session;

  const isFeedbackInprogress =
    feedbackStatus === "SELECTED_IN_PROGRESS" ||
    feedbackStatus === "IN_PROGRESS";

   
  const highlightedRows = isFeedbackInprogress
    ? feedbackSelectedParticipant?.[feedbackSelectedParticipant?.length - 1]
        ?.participants
    : []
  
    console.log({feedbackSelectedParticipant})

  console.log({ feedbackSelectedParticipant ,highlightedRows});

  const feedbackSelectedParticipantList = feedbackSelectedParticipant
    ?.map((_) => _?.participants)
    .flat();

  const discussionScore = useMemo(
    () => calculateOverallScore(discussion, userPoints),
    [discussion, userPoints]
  );

  const getValue = (data, current, total) => {
    return `${data[current] || 0} / ${data[total] || 0}`;
  };

  const getTableData = useCallback(() => {
    if (loading || !userPoints) return [];

    const users = [
      ...(participants?.participant || []),
      ...(aiParticipants || []),
    ];

    console.log({ users });

    // Separate selected and not selected users in one iteration
    const { selectedList, notSelectedList } = users.reduce(
      (acc, item) => {
        const userId = item?.userId || item?._id;
        const userPointData = userPoints[userId] || {};
        const initialStatus = userFeedbackStatus[userId] || null;
        const discussionScoreValue = Number(
          (discussionScore[userId] || 0).toFixed(2)
        );
        const feedbackScoreValue = Number(
          evaluateMetrics(item?.feedback || {}) || 0
        );
        const totalScore = Number(
          (discussionScoreValue + feedbackScoreValue).toFixed(2)
        );
        const isSelected = feedbackSelectedParticipantList?.includes(item?._id);

        const commonData = {
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
        };

        if (isSelected) {
          acc.selectedList.push({
            ...commonData,
            discussionScore: { value: discussionScoreValue },
            performanceFeedback: {
              value: participants?.participant?.some(
                (p) => p?.userId === item?.userId && p?.feedback
              )
                ? "✅"
                : "❌",
            },
            feedbackScore: { value: feedbackScoreValue },
            totalScore: { value: totalScore },
            actions: {
              value: (
                <Actions
                  userId={userId}
                  updateUserStatus={updateUserStatus}
                  initialStatus={initialStatus}
                />
              ),
            },
          });
        } else {
          acc.notSelectedList.push({
            ...commonData,
            totalPoints: {
              value:
                (userPointData["points"] || 0) +
                (userPointData["conclusionPoints"] || 0),
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
          });
        }

        return acc;
      },
      { selectedList: [], notSelectedList: [] }
    );

    return { selectedList, notSelectedList };
  }, [
    participants?.participant,
    aiParticipants,
    loading,
    userPoints,
    discussionScore,
    userFeedbackStatus,
    session,
  ]);

  const [data, setData] = useState([]);

  console.log({ updatedhighlightedRows: highlightedRows });

  useEffect(() => {
    setData(getTableData());
  }, [getTableData]);

  if (loading || participants?.length === 0) return <div className="h-24 bg-gray-900 rounded-md place-content-center place-items-center"><Loader /></div> 

  console.log({ data, userFeedbackStatus, aiParticipants });

  return (
    <div className="space-y-8 rounded-lg">
      <RenderSpace condition={data?.selectedList?.length}>
        <div className="bg-gray-900 p-4 rounded-md space-y-4">
          <RenderSpace condition={data?.notSelectedList?.length}>
            {isFeedbackInprogress ? (
              <Loader text="Feedback Generating...." />
            ) : (
              <p className="text-left text-base">Feedback generated</p>
            )}
          </RenderSpace>
          <Table
            data={data?.selectedList}
            sortKey={"totalScore"}
            highlightedRows={highlightedRows}
          />
        </div>
      </RenderSpace>

      <RenderSpace condition={data?.notSelectedList?.length}>
        <div className="bg-gray-900 p-4 rounded-md space-y-4">
          <RenderSpace condition={data?.selectedList?.length}>
            <p className="text-left text-base">Feedback Not Generated</p>
          </RenderSpace>

          <Table
            data={data?.notSelectedList}
            sortKey={"totalPoints"}
            selectable
            onSelectionChange={onSelectionChange}
            selectedRows= {selectedParticipants}
          />
        </div>
      </RenderSpace>
    </div>
  );
}
