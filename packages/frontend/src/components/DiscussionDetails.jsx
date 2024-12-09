import { useMutation } from "react-query";
import { createDiscussion } from "../utils/api-call";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DiscussionDetails = () => {
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "Online Class vs Offline Class",
    isTopicAiGenerated: false, // New field
    aiModelsCount: 3,
    noOFUsers: 1,
    discussionLength: 5, // Discussion duration in minutes
    conclusionBy: "Random",
    conclusionPoints: 1, // Default number of conclusion points
    micAccessWaitTime: 2, // Default wait time for mic access in seconds
  });

  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation(createDiscussion, {
    onSuccess: (data) => {
      if (data?.result) navigate(`/gd/${data?.result}`);
    },
    onError: (error) => {
      console.error("Error creating discussion:", error);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiscussionDetails((prev) => {
      if (name === "isTopicAiGenerated") {
        return {
          ...prev,
          isTopicAiGenerated: checked,
          topic: checked ? "" : "Online vs Offline Class", // Clear topic if AI-generated
        };
      }
      return {
        ...prev,
        [name]: type === "number" ? parseInt(value) || 0 : value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(discussionDetails);
  };

  // Determine valid options for "conclusionBy"
  const getOptions = () => {
    if (
      discussionDetails.conclusionPoints > 1 &&
      discussionDetails.noOFUsers > 1
    ) {
      return [
        { value: "Users", label: "👥 Users (AI will take a break)" },
        { value: "AI", label: "🤖 AI Spotlight (Only AI speaks)" },
        { value: "Random", label: "🎲 Open Mic (Anyone can jump in)" },
      ];
    }

    if (
      discussionDetails.conclusionPoints > 1 &&
      discussionDetails.noOFUsers === 1
    ) {
      return [
        { value: "AI", label: "🤖 AI Finale (AI wraps up)" },
        { value: "Random", label: "🌈 Free Flow (Open participation)" },
      ];
    }

    if (
      discussionDetails.conclusionPoints === 1 &&
      discussionDetails.noOFUsers === 1
    ) {
      return [
        { value: "You", label: "👤 Your Stage" },
        { value: "AI", label: "🤖 AI Synthesizes" },
        { value: "Random", label: "🌐 Open Arena" },
      ];
    }
    if (
      discussionDetails.conclusionPoints === 1 &&
      discussionDetails.noOFUsers > 1
    )
      return [
        { value: "Users", label: "👥 Collective Wisdom" },
        { value: "AI", label: "🧠 AI Insight Mode" },
        { value: "Random", label: "🎲 Open Access Mode" },
      ];

    return [];
  };
  const conclusionOptions = getOptions();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-semibold text-center text-gray-800">
          Start Your Group Discussion
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <section className="border rounded-md border-black p-4">
            <h2 className="text-2xl font-medium text-gray-700">
              Basic Details
            </h2>

            <div>
              <label
                htmlFor="topic"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Discussion Topic
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={discussionDetails.topic}
                onChange={handleChange}
                disabled={discussionDetails.isTopicAiGenerated}
                placeholder={
                  discussionDetails.isTopicAiGenerated
                    ? "Topic will be generated by AI"
                    : "Enter your topic"
                }
                className={`w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${
                  discussionDetails.isTopicAiGenerated
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-blue-500"
                } transition duration-200 ease-in-out shadow-sm`}
              />
            </div>
            <div className="mb-4 flex items-center gap-4">
              <label
                htmlFor="isTopicAiGenerated"
                className="text-lg font-medium text-gray-700"
              >
                Generate Topic Using AI
              </label>
              <input
                type="checkbox"
                id="isTopicAiGenerated"
                name="isTopicAiGenerated"
                checked={discussionDetails.isTopicAiGenerated}
                onChange={handleChange}
                className="w-6 h-6"
              />
            </div>
          </section>

          {/* Other Settings */}
          <section className="border p-4 border-black rounded-md">
            <h2 className="text-2xl font-medium text-gray-700">
              Users Settings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="aiModelsCount"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Number of AI Members
                </label>
                <input
                  type="number"
                  id="aiModelsCount"
                  name="aiModelsCount"
                  value={discussionDetails.aiModelsCount}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="noOFUsers"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Number of Users
                </label>
                <input
                  type="number"
                  id="noOFUsers"
                  name="noOFUsers"
                  value={discussionDetails.noOFUsers}
                  onChange={handleChange}
                  disabled
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                />
              </div>
            </div>
          </section>
          <section className="border p-2 border-black rounded-md">
            <h2 className="text-2xl font-medium text-gray-700">
              Conversation Settings
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choosethe settings for conversation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="discussionLength"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Discussion Length (Minutes)
                </label>
                <input
                  type="number"
                  id="discussionLength"
                  name="discussionLength"
                  value={discussionDetails.discussionLength}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Conclusion Settings */}
          <section className="border p-2 border-black rounded-md">
            <h2 className="text-2xl font-medium text-gray-700">
              Conclusion Settings
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose who will summarize the discussion and the number of points
              to summarize.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="conclusionPoints"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Number of Conclusion Points
                </label>
                <input
                  type="number"
                  id="conclusionPoints"
                  name="conclusionPoints"
                  value={discussionDetails.conclusionPoints}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="conclusionBy"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  Who Summarizes?
                </label>
                <select
                  id="conclusionBy"
                  name="conclusionBy"
                  value={discussionDetails.conclusionBy}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
                >
                  {conclusionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 3: Mic Settings */}
          <section className="border p-2 border-black rounded-md">
            <h2 className="text-2xl font-medium text-gray-700">Mic Settings</h2>
            <p className="text-sm text-gray-500 mb-4">
              Configure how long the system waits before granting access to the
              mic.
            </p>
            <div>
              <label
                htmlFor="micAccessWaitTime"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Mic Access Wait Time (Seconds)
              </label>
              <input
                type="number"
                id="micAccessWaitTime"
                name="micAccessWaitTime"
                value={discussionDetails.micAccessWaitTime}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
              />
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Creating Discussion..." : "Start Discussion"}
          </button>
          {isError && <p className="text-red-500">{error?.message}</p>}
        </form>
      </div>
    </div>
  );
};
