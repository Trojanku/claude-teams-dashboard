import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../types/index.js";
import { config } from "../utils/config.js";
import { fileWatcher } from "../services/fileWatcher.js";
import type { FileChangeEvent } from "../services/fileWatcher.js";
import { teamService } from "../services/teamService.js";
import { taskService } from "../services/taskService.js";
import { messageService } from "../services/messageService.js";

export type AppSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents
>;

let io: AppSocketServer | null = null;

export function setupWebSocket(httpServer: HttpServer): AppSocketServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("subscribe:team", (teamId) => {
      socket.join(`team:${teamId}`);
      console.log(`Client ${socket.id} subscribed to team ${teamId}`);
    });

    socket.on("subscribe:tasks", (teamId) => {
      socket.join(`tasks:${teamId}`);
      console.log(`Client ${socket.id} subscribed to tasks for ${teamId}`);
    });

    socket.on("send:message", async (data) => {
      try {
        const message = await messageService.addMessage(data);
        // Broadcast to team room
        io!.to(`team:${data.teamId}`).emit("message:received", message);
      } catch (err) {
        console.error("Error handling send:message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Connect file watcher events to WebSocket broadcasts
  setupFileWatcherBridge();

  return io;
}

function setupFileWatcherBridge(): void {
  if (!io) return;

  fileWatcher.on("change", async (event: FileChangeEvent) => {
    if (!io) return;

    try {
      switch (event.type) {
        case "team:created": {
          const team = await teamService.getTeam(event.teamId);
          io.emit("team:created", team);
          break;
        }
        case "team:updated": {
          const team = await teamService.getTeam(event.teamId);
          io.to(`team:${event.teamId}`).emit("team:updated", team);
          // Also broadcast globally so team list updates
          io.emit("team:updated", team);
          break;
        }
        case "team:deleted": {
          io.emit("team:deleted", event.teamId);
          break;
        }
        case "task:created": {
          const task = await taskService.getTask(event.taskId, event.teamId);
          io.to(`tasks:${event.teamId}`).emit("task:created", task);
          break;
        }
        case "task:updated": {
          const task = await taskService.getTask(event.taskId, event.teamId);
          io.to(`tasks:${event.teamId}`).emit("task:updated", task);
          break;
        }
      }
    } catch (err) {
      console.error(`Error broadcasting ${event.type}:`, err);
    }
  });
}

export function getIO(): AppSocketServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
