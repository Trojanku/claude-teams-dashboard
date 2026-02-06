import path from "node:path";
import os from "node:os";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  mockData: process.env.MOCK_DATA === "true",
  teamsDir: process.env.TEAMS_DIR || path.join(os.homedir(), ".claude", "teams"),
  tasksDir: process.env.TASKS_DIR || path.join(os.homedir(), ".claude", "tasks"),
};
