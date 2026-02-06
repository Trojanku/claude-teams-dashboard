import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { config } from "./utils/config.js";
import { errorHandler, notFoundHandler } from "./api/middleware.js";
import { setupWebSocket } from "./websocket/index.js";
import { fileWatcher } from "./services/fileWatcher.js";
import healthRouter from "./api/routes/health.js";
import teamsRouter from "./api/routes/teams.js";
import tasksRouter from "./api/routes/tasks.js";
import messagesRouter from "./api/routes/messages.js";
import { taskService } from "./services/taskService.js";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Routes
app.use("/api", healthRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/messages", messagesRouter);

// WebSocket
setupWebSocket(httpServer);

// Reset endpoint for testing
app.post("/api/reset", (_req, res) => {
  taskService.resetMockData();
  res.json({ ok: true });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start file watcher
fileWatcher.start();

httpServer.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`CORS enabled for: ${config.corsOrigin}`);
  console.log(`Mock data mode: ${config.mockData}`);
});

export { app, httpServer };
