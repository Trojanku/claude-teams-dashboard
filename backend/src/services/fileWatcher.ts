import chokidar from "chokidar";
import path from "node:path";
import { config } from "../utils/config.js";
import { EventEmitter } from "node:events";

export type FileChangeEvent =
  | { type: "team:created"; teamId: string }
  | { type: "team:updated"; teamId: string }
  | { type: "team:deleted"; teamId: string }
  | { type: "task:created"; teamId: string; taskId: string }
  | { type: "task:updated"; teamId: string; taskId: string };

export class FileWatcherService extends EventEmitter {
  private watchers: chokidar.FSWatcher[] = [];

  start(): void {
    if (config.mockData) {
      console.log("Mock data mode - file watcher disabled");
      return;
    }

    this.watchTeams();
    this.watchTasks();
    console.log("File watchers started");
  }

  stop(): void {
    for (const w of this.watchers) {
      w.close();
    }
    this.watchers = [];
    console.log("File watchers stopped");
  }

  private watchTeams(): void {
    const teamsGlob = path.join(config.teamsDir, "*/config.json");

    const watcher = chokidar.watch(teamsGlob, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
    });

    watcher.on("add", (filePath) => {
      const teamId = this.extractTeamId(filePath, config.teamsDir);
      if (teamId) this.emit("change", { type: "team:created", teamId } satisfies FileChangeEvent);
    });

    watcher.on("change", (filePath) => {
      const teamId = this.extractTeamId(filePath, config.teamsDir);
      if (teamId) this.emit("change", { type: "team:updated", teamId } satisfies FileChangeEvent);
    });

    watcher.on("unlink", (filePath) => {
      const teamId = this.extractTeamId(filePath, config.teamsDir);
      if (teamId) this.emit("change", { type: "team:deleted", teamId } satisfies FileChangeEvent);
    });

    this.watchers.push(watcher);
  }

  private watchTasks(): void {
    const tasksGlob = path.join(config.tasksDir, "*/*.json");

    const watcher = chokidar.watch(tasksGlob, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
    });

    watcher.on("add", (filePath) => {
      const ids = this.extractTaskIds(filePath);
      if (ids) this.emit("change", { type: "task:created", ...ids } satisfies FileChangeEvent);
    });

    watcher.on("change", (filePath) => {
      const ids = this.extractTaskIds(filePath);
      if (ids) this.emit("change", { type: "task:updated", ...ids } satisfies FileChangeEvent);
    });

    this.watchers.push(watcher);
  }

  private extractTeamId(filePath: string, baseDir: string): string | null {
    const relative = path.relative(baseDir, filePath);
    const parts = relative.split(path.sep);
    return parts.length >= 2 ? parts[0] : null;
  }

  private extractTaskIds(
    filePath: string,
  ): { teamId: string; taskId: string } | null {
    const relative = path.relative(config.tasksDir, filePath);
    const parts = relative.split(path.sep);
    if (parts.length < 2) return null;
    const teamId = parts[0];
    const taskId = path.basename(parts[1], ".json");
    return { teamId, taskId };
  }
}

export const fileWatcher = new FileWatcherService();
