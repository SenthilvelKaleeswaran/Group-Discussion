import { useMutation } from "react-query"; 
import { createDiscussion } from "../utils/api-call";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

export const DiscussionDetails = () => {
  const [discussionDetails, setDiscussionDetails] = useState({
    topic: "Online Class vs Offline Class",
    aiModelsCount: 3,
    noOFUsers: 1,
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
    const { name, value } = e.target;
    setDiscussionDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(discussionDetails);   };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-semibold text-center text-gray-800">
          Start Your Group Discussion
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
            />
          </div>

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
