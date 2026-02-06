import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../utils/config.js";
import type { Task, TaskStatus } from "../types/index.js";
import { generateMockTasks } from "./mockData.js";
import { NotFoundError } from "../utils/errors.js";

export class TaskService {
  // In-memory store for mock data mutations
  private mockTasks: Task[] | null = null;

  private getMockTasks(): Task[] {
    if (!this.mockTasks) {
      this.mockTasks = generateMockTasks();
    }
    return this.mockTasks;
  }

  resetMockData(): void {
    this.mockTasks = null;
  }

  private get tasksDir(): string {
    return config.tasksDir;
  }

  async listAllTasks(): Promise<Task[]> {
    if (config.mockData) {
      return this.getMockTasks();
    }

    try {
      await fs.access(this.tasksDir);
    } catch {
      return [];
    }

    const teamDirs = await fs.readdir(this.tasksDir, { withFileTypes: true });
    const allTasks: Task[] = [];

    for (const dir of teamDirs) {
      if (!dir.isDirectory()) continue;
      const tasks = await this.listTasksForTeam(dir.name);
      allTasks.push(...tasks);
    }

    return allTasks;
  }

  async listTasksForTeam(teamId: string): Promise<Task[]> {
    if (config.mockData) {
      return this.getMockTasks().filter((t) => t.teamId === teamId);
    }

    const teamTasksDir = path.join(this.tasksDir, teamId);
    try {
      await fs.access(teamTasksDir);
    } catch {
      return [];
    }

    const files = await fs.readdir(teamTasksDir);
    const tasks: Task[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const task = await this.readTaskFile(teamId, file);
      if (task) tasks.push(task);
    }

    return tasks;
  }

  async getTask(taskId: string, teamId?: string): Promise<Task> {
    if (config.mockData) {
      const tasks = this.getMockTasks();
      const task = tasks.find(
        (t) => t.id === taskId && (!teamId || t.teamId === teamId),
      );
      if (!task) throw new NotFoundError(`Task '${taskId}'`);
      return task;
    }

    // If teamId is provided, look directly
    if (teamId) {
      const task = await this.readTaskFile(teamId, `${taskId}.json`);
      if (!task) throw new NotFoundError(`Task '${taskId}'`);
      return task;
    }

    // Otherwise search across all teams
    const allTasks = await this.listAllTasks();
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundError(`Task '${taskId}'`);
    return task;
  }

  async createTask(
    teamId: string,
    data: {
      subject: string;
      description?: string;
      activeForm?: string;
      owner?: string;
    },
  ): Promise<Task> {
    if (config.mockData) {
      const tasks = this.getMockTasks();
      const maxId = tasks.reduce(
        (max, t) => Math.max(max, parseInt(t.id, 10) || 0),
        0,
      );
      const newId = String(maxId + 1);
      const task: Task = {
        id: newId,
        subject: data.subject,
        description: data.description,
        status: "pending",
        owner: data.owner,
        teamId,
        blocks: [],
        blockedBy: [],
        activeForm: data.activeForm,
        createdAt: new Date().toISOString(),
      };
      tasks.push(task);
      return task;
    }

    const teamTasksDir = path.join(this.tasksDir, teamId);
    await fs.mkdir(teamTasksDir, { recursive: true });

    const existing = await this.listTasksForTeam(teamId);
    const maxId = existing.reduce(
      (max, t) => Math.max(max, parseInt(t.id, 10) || 0),
      0,
    );
    const newId = String(maxId + 1);

    const task: Task = {
      id: newId,
      subject: data.subject,
      description: data.description,
      status: "pending",
      owner: data.owner,
      teamId,
      blocks: [],
      blockedBy: [],
      activeForm: data.activeForm,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(teamTasksDir, `${newId}.json`),
      JSON.stringify(task, null, 2),
    );

    return task;
  }

  async updateTask(
    taskId: string,
    teamId: string,
    updates: {
      status?: TaskStatus;
      subject?: string;
      description?: string;
      activeForm?: string;
      owner?: string | null;
      addBlocks?: string[];
      addBlockedBy?: string[];
      metadata?: Record<string, unknown>;
    },
  ): Promise<Task> {
    const task = await this.getTask(taskId, teamId);

    if (updates.status !== undefined) task.status = updates.status;
    if (updates.subject !== undefined) task.subject = updates.subject;
    if (updates.description !== undefined)
      task.description = updates.description;
    if (updates.activeForm !== undefined) task.activeForm = updates.activeForm;
    if (updates.owner !== undefined)
      task.owner = updates.owner ?? undefined;
    if (updates.addBlocks) {
      task.blocks = [...new Set([...task.blocks, ...updates.addBlocks])];
    }
    if (updates.addBlockedBy) {
      task.blockedBy = [
        ...new Set([...task.blockedBy, ...updates.addBlockedBy]),
      ];
    }
    if (updates.metadata) {
      task.metadata = { ...task.metadata, ...updates.metadata };
    }
    task.updatedAt = new Date().toISOString();

    if (config.mockData) {
      // In mock mode, update the in-memory store
      const tasks = this.getMockTasks();
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx >= 0) {
        tasks[idx] = task;
      }
      return task;
    }

    const filePath = path.join(this.tasksDir, teamId, `${taskId}.json`);
    await fs.writeFile(filePath, JSON.stringify(task, null, 2));

    return task;
  }

  private async readTaskFile(
    teamId: string,
    filename: string,
  ): Promise<Task | null> {
    const filePath = path.join(this.tasksDir, teamId, filename);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      // Ensure teamId is set
      return {
        id: parsed.id ?? filename.replace(".json", ""),
        subject: parsed.subject ?? "Untitled",
        description: parsed.description,
        status: parsed.status ?? "pending",
        owner: parsed.owner,
        teamId,
        blocks: parsed.blocks ?? [],
        blockedBy: parsed.blockedBy ?? [],
        activeForm: parsed.activeForm,
        metadata: parsed.metadata,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
      } satisfies Task;
    } catch {
      return null;
    }
  }
}

export const taskService = new TaskService();
