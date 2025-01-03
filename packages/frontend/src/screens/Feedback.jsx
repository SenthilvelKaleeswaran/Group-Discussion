import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import { getGroupDiscussion } from "../utils/api-call";
import { RecapDiscussionProvider } from "../context";
import { CircularProgressBar } from "../components/ui";
import {
  ConversationSection,
  PerformanceSection,
  ConversationSpace,
} from "../components/screens";
import { RenderSpace } from "../components/shared";

export const Feedback = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedOption, setSelectedOption] = useState("overall");

  const userId = localStorage.getItem("userId");

  const { data, error, isLoading } = useQuery(
    [`group-discussion-${id}`, id],
    () => getGroupDiscussion(id),
    {
      enabled: !!id,
    }
  );

  useEffect(() => {
    if (!isLoading && !error && data?.participants?.length === 1) {
      setSelectedParticipant(data?.participants[0]?._id);
    }
  }, [data]);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-white">Error fetching data</div>;
  }

  const {
    topic,
    isTopicAiGenerated,
    aiParticipants,
    noOfUsers,
    conversationId: { messages },
    participants,
    feedback,
    discussionLength,
    conclusionBy,
    conclusionPoints,
    micAccessWaitTime,
    status,
  } = data;

  const getTotalPoints = (data) => {
    let obj = {};
    Object.keys(data || {}).forEach((category) => {
      const factors = data[category];

      // Sum all factor values in the category
      let totalScore = 0;
      let factorCount = 0;

      Object.keys(factors).forEach((factor) => {
        const value = parseFloat(factors[factor].value);
        if (!isNaN(value)) {
          totalScore += value;
          factorCount++;
        }
      });

      // Calculate scaled total out of 10
      const totalOutOf10 = ((totalScore / (factorCount * 100)) * 10).toFixed(1);

      // Add the total score to the category
      obj[category] = parseFloat(totalOutOf10);
    });

    return obj;
  };

  const calculateTotal = (metrics) => {
    if (!metrics || typeof metrics !== "object") {
      console.error("Invalid input: Expected an object with numeric values.");
      return 0; // Default to 0 for invalid input
    }

    return Object.values(metrics).reduce((total, value) => {
      if (typeof value === "number") {
        return total + value;
      } else {
        console.warn(`Skipping non-numeric value: ${value}`);
        return total;
      }
    }, 0);
  };

  const getTotalValue = ({ points, maxScorePerMetric = 10, outOff = 100 }) => {
    if (!points) {
      console.error("Invalid conversation: No points found.");
      return 0; // Default percentage if points are missing
    }

    const totalScore = calculateTotal(points);
    const numMetrics = Object.keys(points).length;
    const maxPossibleScore = numMetrics * maxScorePerMetric;

    return ((totalScore / maxPossibleScore) * outOff).toFixed(2);
  };

  const getGrouppedConversation = (data) => {
    return data.reduce((acc, item, index) => {
      const { userId: user, name } = item;

      const key = user ? user : name;

      if (!acc[key]) {
        acc[key] = { conversation: [] };
      }

      const points = getTotalPoints(item?.feedback);

      item.overAllMetricsTotalPoints = points;
      item.totalMetricsScore = getTotalValue({ points });
      item.index = index;

      acc[key].conversation.push(item);

      return acc;
    }, {});
  };

  const totalScoreCalculation = () => {
    // const userConversation = messages?.filter((item) => item?.userId);
    const grouppedData = getGrouppedConversation(messages);

    const totalParticipants =
      (aiParticipants?.length || 0) + (participants?.length || 0);
    const expectedPoints =
      totalParticipants > 0 && discussionLength > 0
        ? Math.floor(totalParticipants / discussionLength) || 1
        : 0;

    feedback?.forEach((item) => {
      const data = getTotalPoints(item?.feedback);
      console.log({ item, feedback, data });

      if (grouppedData[item?._id]) {
        grouppedData[item._id].name = participants?.find(
          (data) => data?.userId === item?.userId
        )?.name;
        grouppedData[item._id].feedback = item?.feedback;
        grouppedData[item._id].overAllMetricsTotalPoints = data;
        grouppedData[item._id].userId = item?._id;
        console.log({ item: grouppedData });
      }
    });

    Object.entries(grouppedData).forEach(([key, value]) => {
      let totalSpokenScore = 0;

      // const soretedValue = value?.conversation?.sort((a,b)=>a.totalMetricsScore + b.totalConversationScore).slice(0,expectedPoints)

      // Calculate totalSpokenScore
      value?.conversation?.forEach((item) => {
        totalSpokenScore += parseFloat(item?.totalMetricsScore) || 0;
      });

      console.log({ aaaa: value?.conversation, totalSpokenScore });
      const spokenPoints = value?.conversation?.length || 0;

      const calc = (
        ((totalSpokenScore / spokenPoints) * 20) / 100 || 0
      ).toFixed(2);

      const overAllTotalScore = getTotalValue({
        points: value?.overAllMetricsTotalPoints,
        outOff: 80,
      });

      value.totalConversationScore = calc; // Assign the calculated score
      value.overAllTotalScore = overAllTotalScore;
      value.total = (parseFloat(overAllTotalScore) + parseFloat(calc)).toFixed(
        2
      );
    });

    grouppedData.expectedPoints = expectedPoints || 1;

    console.log({ grouppedData });

    return grouppedData;
  };

  const renderData = totalScoreCalculation();
  const currentData = renderData[selectedParticipant];

  console.log({ data, renderData, selectedParticipant, currentData });

  const handleParticipantSelect = (event) => {
    const { value } = event.target;
    console.log({ value });

    setSelectedParticipant(value);
    console.log({ currentData });

    setSelectedOption("conversation");
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <RecapDiscussionProvider
      data={data}
      selectedParticipant={selectedParticipant}
      setSelectedOption={setSelectedOption}
      setSelectedParticipant={setSelectedParticipant}
      grouppedData={renderData}
    >
      <div className="bg-green-500 min-h-screen p-6">
        <div className="flex flex-row-reverse gap-6 bg-gray-800 rounded-md p-4">
          <div className="w-1/2 bg-gray-700 rounded-md h-full">
            <ConversationSpace data={data} />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="bg-gray-700 w-full p-4 rounded-md space-y-4">
              <div className="flex justify-between gap-8">
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-gray-500 font-semibold">
                    Total Number of AI Participants
                  </span>
                  <span className="font-semibold">
                    {aiParticipants?.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <span className="font-bold text-xl">
                    {topic}Online Class vs Offline Class Online Class vs Offline
                    Class
                  </span>
                  <span className="text-purple-500">
                    {!isTopicAiGenerated ? "(AI Generated Topic)" : ""}
                  </span>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <span className="text-gray-500 font-semibold">
                    Total Number of Users
                  </span>
                  <span className="font-semibold">{participants?.length}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex flex-col gap-4">
                  <div className="flex  gap-2 items-center">
                    <span className="text-gray-500 font-semibold">
                      Conclusion By
                    </span>
                    <span className="font-semibold">{conclusionBy}</span>
                  </div>
                  <div className="flex  gap-2 items-center">
                    <span className="text-gray-500 font-semibold">
                      Number Of Conclusion points
                    </span>
                    <span className="font-semibold">{conclusionPoints}</span>
                  </div>

                  <div className="flex  gap-2 items-center">
                    <span className="text-gray-500 font-semibold">
                      Mike aceess wait time
                    </span>
                    <span className="font-semibold">
                      {micAccessWaitTime} Seconds
                    </span>
                  </div>
                </div>
                <RenderSpace condition={!!currentData?.userId}>
                  <CircularProgressBar
                    progress={currentData?.total}
                    size={105}
                    strokeWidth={15}
                  />
                </RenderSpace>
              </div>
            </div>
            <div className="flex flex-col w-full bg-gray-600 rounded-md p-4">
              <div className="flex justify-between w-full p-4">
                <div>
                  <p className="text-2xl font-bold">Overall Feedback</p>
                  <p className="text-left">
                    Name : {currentData?.name || selectedParticipant}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-4 bg-gray-600 rounded-md">
                    <div>
                      <div>
                        <select
                          value={selectedParticipant}
                          onChange={(event) => handleParticipantSelect(event)}
                          className="p-2 w-full bg-gray-800 rounded-md border-none outline-none space-y-2"
                        >
                          <optgroup label="Members">
                            {data?.participants.map((participant) => (
                              <option
                                key={participant._id}
                                value={participant._id}
                              >
                                {participant.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="AI Participants">
                            {data?.aiParticipants?.map((participant) => (
                              <option
                                key={participant.name}
                                value={participant.name}
                              >
                                {participant.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    <RenderSpace condition={!!currentData?.userId}>
                      <div>
                        <div>
                          <label className="text-left">
                            <input
                              type="radio"
                              value="overall"
                              checked={selectedOption === "overall"}
                              onChange={handleOptionChange}
                            />
                            Overall Feedback
                          </label>
                        </div>
                        <div>
                          <label className="text-left">
                            <input
                              type="radio"
                              value="conversation"
                              checked={selectedOption === "conversation"}
                              onChange={handleOptionChange}
                            />
                            Conversation
                          </label>
                        </div>
                      </div>
                    </RenderSpace>
                  </div>
                </div>
              </div>
              {selectedOption === "overall" ? (
                <PerformanceSection
                  currentData={currentData}
                  totalpoints={renderData?.expectedPoints}
                />
              ) : (
                <ConversationSection
                  currentData={currentData}
                  totalpoints={renderData?.expectedPoints}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </RecapDiscussionProvider>
  );
};
