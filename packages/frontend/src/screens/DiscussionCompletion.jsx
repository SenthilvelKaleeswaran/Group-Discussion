import React from "react";
import { useSelector } from "react-redux";
import { ButtonDropdown, RenderSpace } from "../components/shared";
import { Button } from "../components/ui";
import { FeedbackTable } from "../components/screens";

export default function DiscussionCompletion({ data, events, socket }) {
  console.log({ current: "issl" });

  const { mutedParticipants = [], userRole } = useSelector(
    (state) => state.controls
  );

  const { userSession, queue = {} } = useSelector((state) => state.session);
  const { status = "", aiParticipants = [], _id: sessionId } = data;
  console.log({ userSession, userRole });

  const { userFeedbackStatus = {}, selectedParticipants } = useSelector(
    (state) => state.session
  );

  const handleGenerateFeedback = (data = {}) => {
    socket.emit("GENERATE_FEEDBACK", { sessionId, ...data });
  };

  const length = selectedParticipants?.length;

  const userId = localStorage.getItem("userId");

  const options = [
    {
      id: "generate",
      label: "Generate Feedback for all",
      onClick: () => handleGenerateFeedback(),
    },
    {
      id: "generte_selected",
      label: `Generate Feedback for selected`,
      onClick: () =>
        handleGenerateFeedback({ selectedParticipants, startedBy: userId }),
      disabled: length === 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-800 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-yellow-400">
          🏆 Discussion Battle Finished!
        </h2>
        <p className="text-sm text-gray-300">
          Your discussion journey has concluded. What’s next?
        </p>

        <RenderSpace condition={userRole !== "participant"}>
          <ButtonDropdown
            options={options}
            defaultLabel="Generate Feedback"
            defaultOption={length === 0 ? "generate" : "generte_selected"}
            loading={status === "FEEDBACK_GENERATING"}
            disabled={false}
          />
        </RenderSpace>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          {data?.feedback?.length ? (
            <button
              onClick={() => handleFeedbackGeneration({ id })}
              disabled={isFeedbackGenerating}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              📊 View Feedback
            </button>
          ) : (
            <button
              onClick={() => handleFeedbackGeneration({ id })}
              disabled={isFeedbackGenerating}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
            >
              {isFeedbackGenerating
                ? "✨ Generating...."
                : "✨ Generate Feedback"}
            </button>
          )}
          <button className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
            🔄 Start New Discussion
          </button>
          <button className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition duration-300">
            📖 View Past Discussions
          </button>
        </div> */}
      </div>

      <RenderSpace condition={userRole !== "participant"}>
        <FeedbackTable
          aiParticipants={aiParticipants}
          events={events}
          socket={socket}
          sessionId={sessionId}
          session={data}
        />
      </RenderSpace>

      <div></div>
    </div>
  );
}

// status = completed-> battle completed screen
// '' =
