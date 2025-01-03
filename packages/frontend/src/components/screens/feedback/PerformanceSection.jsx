import React from "react";
import CircularProgressBar from "../ui/CircularProgressBar";
import FeedbackTab from "./FeedbackTab";

const PerformanceSection = ({ currentData, expectedPoints }) => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-6 space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl text-left font-semibold text-white mb-4">
            Particpant Feedback
          </h2>
          <p className="text-left">
            Expected Number of Points : {expectedPoints}
          </p>
          <p className="text-left">
            Total Number of Points Spoken: {currentData?.conversation?.length}
          </p>
        </div>
        <CircularProgressBar
          progress={currentData?.overAllTotalScore}
          outOff={80}
          showOutOff
        />
      </div>

      <FeedbackTab
        feedback={currentData?.feedback}
        metricsTotal={currentData?.overAllMetricsTotalPoints}
      />
    </div>
  );
};

export default PerformanceSection;
