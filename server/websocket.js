import WebSocket, { WebSocketServer } from "ws";

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket client connected");

    ws.send(
      JSON.stringify({
        type: "connection",
        message: "Connected to Comsy WebSocket server",
        timestamp: new Date().toISOString(),
      })
    );

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        console.log("Received:", data);

        switch (data.type) {
          case "speed":
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "speed",
                    speed: data.speed,
                    timestamp: new Date().toISOString(),
                  })
                );
              }
            });
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    ws.on("close", () => console.log("Client disconnected"));
    ws.on("error", (err) => console.error("WebSocket error:", err));
  });

  // Heartbeat
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.ping();
    });
  }, 30000);

  console.log("WebSocket server running");
  return wss;
}
