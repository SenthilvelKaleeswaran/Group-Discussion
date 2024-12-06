import { useState } from "react";
import { useDiscussion } from "../context/details";
import { useMembers } from "../context/member";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

// Form Component
export const DiscussionDetails = () => {
  const { updateDiscussionDetails } = useDiscussion();
  const { generateMembers } = useMembers();
  const [formState, setFormState] = useState({ topic: "Online Class vs Offline Class", numMembers: 3 });
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { topic, numMembers } = formState;
    updateDiscussionDetails({ topic, numMembers: parseInt(numMembers, 10) });
    generateMembers(parseInt(numMembers, 10));
    navigate('/gd'); // Navigate to '/gd' after submission
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-semibold text-center text-gray-800">Start Your Group Discussion</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-lg font-medium text-gray-700 mb-2">
              Discussion Topic
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formState.topic}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="numMembers" className="block text-lg font-medium text-gray-700 mb-2">
              Number of Members
            </label>
            <input
              type="number"
              id="numMembers"
              name="numMembers"
              value={formState.numMembers}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
          >
            Start Discussion
          </button>
        </form>
      </div>
    </div>
  );
};
