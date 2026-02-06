import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../utils/config.js";
import { TeamConfigSchema } from "../types/index.js";
import type { Team, TeamConfig } from "../types/index.js";
import { generateMockTeams } from "./mockData.js";
import { NotFoundError } from "../utils/errors.js";

async function getLastActivityAt(teamId: string): Promise<string> {
  const mtimes: number[] = [];

  // config.json mtime
  const configPath = path.join(config.teamsDir, teamId, "config.json");
  try {
    const stat = await fs.stat(configPath);
    mtimes.push(stat.mtimeMs);
  } catch { /* ignore */ }

  // inbox files
  const inboxDir = path.join(config.teamsDir, teamId, "inboxes");
  try {
    const entries = await fs.readdir(inboxDir, { withFileTypes: true });
    for (const entry of entries) {
      try {
        const stat = await fs.stat(path.join(inboxDir, entry.name));
        mtimes.push(stat.mtimeMs);
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  // task files
  const tasksDir = path.join(config.tasksDir, teamId);
  try {
    const entries = await fs.readdir(tasksDir);
    for (const f of entries) {
      if (!f.endsWith(".json")) continue;
      try {
        const stat = await fs.stat(path.join(tasksDir, f));
        mtimes.push(stat.mtimeMs);
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  if (mtimes.length === 0) return new Date().toISOString();
  return new Date(Math.max(...mtimes)).toISOString();
}
export class TeamService {
  private get teamsDir(): string {
    return config.teamsDir;
  }

  async listTeams(): Promise<Team[]> {
    if (config.mockData) {
      return generateMockTeams();
    }

    try {
      await fs.access(this.teamsDir);
    } catch {
      return [];
    }

    const entries = await fs.readdir(this.teamsDir, { withFileTypes: true });
    const teams: Team[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const team = await this.readTeam(entry.name);
      if (team) teams.push(team);
    }

    return teams;
  }

  async getTeam(id: string): Promise<Team> {
    if (config.mockData) {
      const teams = generateMockTeams();
      const team = teams.find((t) => t.id === id);
      if (!team) throw new NotFoundError(`Team '${id}'`);
      return team;
    }

    const team = await this.readTeam(id);
    if (!team) throw new NotFoundError(`Team '${id}'`);
    return team;
  }

  async getTeamMembers(id: string): Promise<Team["members"]> {
    const team = await this.getTeam(id);
    return team.members;
  }

  private async readTeam(teamId: string): Promise<Team | null> {
    const configPath = path.join(this.teamsDir, teamId, "config.json");
    try {
      const raw = await fs.readFile(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      const validated = TeamConfigSchema.parse(parsed);
      return await this.toTeam(teamId, validated);
    } catch {
      // Skip teams with missing or malformed config
      return null;
    }
  }

  private async toTeam(id: string, cfg: TeamConfig): Promise<Team> {
    let taskCount = 0;
    let activeTasks = 0;

    const tasksDir = path.join(config.tasksDir, id);
    try {
      const taskFiles = await fs.readdir(tasksDir);
      for (const f of taskFiles) {
        if (!f.endsWith(".json")) continue;
        taskCount++;
        try {
          const raw = await fs.readFile(path.join(tasksDir, f), "utf-8");
          const task = JSON.parse(raw);
          if (task.status === "in_progress") activeTasks++;
        } catch {
          // skip malformed task files
        }
      }
    } catch {
      // tasks dir may not exist
    }

    const allInactive =
      cfg.members.length > 0 &&
      cfg.members.every((m) => m.status === "inactive");
    const status: Team["status"] = allInactive
      ? "inactive"
      : activeTasks > 0
        ? "active"
        : "idle";

    const lastActivityAt = await getLastActivityAt(id);

    return {
      id,
      name: cfg.name || id,
      description: cfg.description,
      members: cfg.members,
      taskCount,
      activeTasks,
      status,
      createdAt: typeof cfg.createdAt === "number"
        ? new Date(cfg.createdAt).toISOString()
        : cfg.createdAt,
      lastActivityAt,
    };
  }
}

export const teamService = new TeamService();
