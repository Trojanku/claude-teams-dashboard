import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../utils/config.js";
import { TeamConfigSchema } from "../types/index.js";
import type { Team, TeamConfig } from "../types/index.js";
import { generateMockTeams } from "./mockData.js";
import { NotFoundError } from "../utils/errors.js";
import { isTmuxPaneAlive } from "../utils/tmux.js";

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

    // Check liveness for each member via tmux pane
    // Members with a tmuxPaneId field are from Claude Code teams.
    // If paneId is empty (team-lead) or the pane is dead → inactive.
    let hasAnyAlive = false;
    for (const member of cfg.members) {
      const raw = member as Record<string, unknown>;
      if ("tmuxPaneId" in raw) {
        const paneId = raw.tmuxPaneId;
        if (typeof paneId === "string" && paneId) {
          const alive = await isTmuxPaneAlive(paneId);
          if (alive) {
            hasAnyAlive = true;
            continue;
          }
        }
        // Empty paneId (team-lead) or dead pane → inactive
        member.status = "inactive";
        member.currentTask = undefined;
      }
    }

    // If no members are alive, mark any remaining members inactive too
    if (!hasAnyAlive) {
      for (const member of cfg.members) {
        member.status = "inactive";
        member.currentTask = undefined;
      }
    }

    const allInactive =
      cfg.members.length > 0 &&
      cfg.members.every((m) => m.status === "inactive");
    const status: Team["status"] = allInactive
      ? "inactive"
      : activeTasks > 0
        ? "active"
        : "idle";

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
    };
  }
}

export const teamService = new TeamService();
