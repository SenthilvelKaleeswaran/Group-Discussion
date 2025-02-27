import { DiscussionForm } from "../components/screens";
import { Button } from "../components/ui";
import { RenderSpace } from "../components/shared";
import { useDiscussionForm } from "../hooks";

export const CreateDiscussion = () => {
  const {
    form,
    setForm,
    discussionDetails,
    aiParticipants,
    aiModelData,
    mutate,
    isLoading,
    isError,
    error,
    handleSubmit,
    handleChange,
    getConditions,
    handleModelsChange,
  } = useDiscussionForm({});

  return (
    <div className="flex justify-center items-center h-full overflow-y-scroll bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-4">
            <h1 className="text-4xl font-semibold text-center text-gray-800">
              Start Your Group Discussion
            </h1>
            <div className="flex gap-4">
              <RenderSpace condition={form !== "details"}>
                <Button
                  label="Back"
                  variant="secondary"
                  onClick={() => setForm("details")}
                />
              </RenderSpace>

              <RenderSpace condition={form !== "members"}>
                <Button
                  label="Next"
                  variant="primary"
                  onClick={() => setForm("members")}
                />
              </RenderSpace>
              <RenderSpace condition={form === "members"}>
                <Button
                  label={isLoading ? "Creating..." : "Create"}
                  variant="success"
                  type="submit"
                />
              </RenderSpace>
            </div>
          </div>

          <DiscussionForm
            form={form}
            discussionDetails={discussionDetails}
            aiParticipants={aiParticipants}
            aiModelData={aiModelData}
            handleChange={handleChange}
            getConditions={getConditions}
            handleModelsChange={handleModelsChange}
          />
          <Button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            disabled={isLoading}
            label={isLoading ? "Creating Discussion..." : "Start Discussion"}
          />

          <RenderSpace condition={isError}>
            <p className="text-red-500">{error?.message}</p>
          </RenderSpace>
        </form>
      </div>
    </div>
  );
};
