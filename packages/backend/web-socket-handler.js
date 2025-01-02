const { generateConversation } = require("./controllers/generate");

async function webSocketHandler(ws, message, request) {
  try {
    const { action, payload } = JSON.parse(message);
    console.log({ action, payload, request: request.user });

    const sendResponse = (data) => {
      return ws.send(JSON.stringify(data));
    };

    if (!action || !payload) {
      return sendResponse({
        event: "ERROR",
        message: "Missing 'action' or 'payload' in the WebSocket message.",
      });
    }

    let handler;

    if (action === "GENERATE_FEEDBACK") {
      handler = generateConversation;
    } else {
      return sendResponse({
        event: "ERROR",
        message: "Invalid action",
        details: `Action '${action}' is not supported.`,
      });
    }

    await handler(
      {
        body: {
          ...payload,
          isWebSocket: true,
          ws,
          event: action,
          sendResponse,
          user: request?.user,
        },
      },
      {
        status: (code) => ({
          json: (data) => {
            ws.send(
              JSON.stringify({
                code,
                data,
                event: action,
              })
            );
          },
        }),
      }
    );
  } catch (error) {
    console.error("Handler error:", error);
    ws.send(
      JSON.stringify({
        event: "ERROR",
        message: "Error processing WebSocket message",
        details: error.message,
      })
    );
  }
}

module.exports = { webSocketHandler };
