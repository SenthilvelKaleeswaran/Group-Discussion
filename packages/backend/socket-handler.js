const { generateConversation } = require("./controllers/generate");

async function socketHandler(socket) {
  console.log("Client connected:", socket.id);

  // Function to send response
  const sendResponse = (event, data) => {
    socket.emit(event, data);
  };

  // Listen for actions from the client
  socket.on("action", async (message) => {
    try {
      const { action, payload } = message;
      console.log({ action, payload, user: socket.user });

      if (!action || !payload) {
        return sendResponse("ERROR", {
          message: "Missing 'action' or 'payload' in the message.",
        });
      }

      let handler;

      if (action === "GENERATE_FEEDBACK") {
        handler = generateConversation;
      } else {
        return sendResponse("ERROR", {
          message: "Invalid action",
          details: `Action '${action}' is not supported.`,
        });
      }

      // Call the appropriate handler
      await handler(
        {
          body: {
            ...payload,
            isWebSocket: true,
            socket,
            event: action,
            sendResponse,
            user: socket.user,
          },
        },
        {
          status: (code) => ({
            json: (data) => {
              sendResponse(action, { code, data });
            },
          }),
        }
      );
    } catch (error) {
      console.error("Handler error:", error);
      sendResponse("ERROR", {
        message: "Error processing action",
        details: error.message,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
}

module.exports = { socketHandler };
