import React, { useState } from "react";
import { CircularProgressBar } from "../../ui";

export const FeedbackTab = ({ feedback,metricsTotal }) => {
  console.log({ feedback });

  if (!feedback) {
    return <div>Hey</div>;
  }
  return (
    <div>
      <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition duration-300">
        <div className="pl-4">
          {Object?.entries(feedback).map(([category, details]) => (
            <div
              key={category}
              className="mb-4 bg-gray-600 p-3 rounded-md shadow-sm"
            >
              {/* Feedback Category */}
              <div className="flex justify-between">
                <h4 className="text-lg font-medium text-white mb-2">
                  {category}
                </h4>
                <CircularProgressBar size={70} progress={metricsTotal[category]} outOff={10} showOutOff />
              </div>

              {/* Subcategories */}
              <div className="flex flex-col gap-4">
                {Object.entries(details).map(([subCategory, value]) => (
                  <div
                    key={subCategory}
                    className="ml-4 border-l-2 border-green-500 pl-4"
                  >
                    <div className="flex gap-4">
                      <CircularProgressBar size={70} progress={value?.value} />

                      <div>
                        <p className="font-bold text-left">{subCategory}</p>

                        <p className="text-left text-gray-300">
                          {value.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
