import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { teamService } from "../../services/teamService.js";
import { taskService } from "../../services/taskService.js";
import { SpawnTeammateSchema } from "../../types/index.js";
import { AppError } from "../../utils/errors.js";
import { config } from "../../utils/config.js";

const router = Router();

// GET /api/teams - List all teams
router.get("/", async (_req, res, next) => {
  try {
    const teams = await teamService.listTeams();
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

// GET /api/teams/:id - Get team details
router.get("/:id", async (req, res, next) => {
  try {
    const team = await teamService.getTeam(req.params.id);
    res.json(team);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/teams/:id - Cleanup team
router.delete("/:id", async (req, res, next) => {
  try {
    const teamId = req.params.id;
    // Verify team exists
    await teamService.getTeam(teamId);

    if (!config.mockData) {
      const teamDir = path.join(config.teamsDir, teamId);
      await fs.rm(teamDir, { recursive: true, force: true });

      const taskDir = path.join(config.tasksDir, teamId);
      await fs.rm(taskDir, { recursive: true, force: true }).catch(() => {});
    }

    res.json({ message: `Team '${teamId}' cleaned up` });
  } catch (err) {
    next(err);
  }
});

// GET /api/teams/:id/members - List team members
router.get("/:id/members", async (req, res, next) => {
  try {
    const members = await teamService.getTeamMembers(req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// POST /api/teams/:id/spawn - Spawn teammate
router.post("/:id/spawn", async (req, res, next) => {
  try {
    const body = SpawnTeammateSchema.parse(req.body);
    // Spawning is a placeholder - real spawning happens through Claude Code
    res.status(201).json({
      name: body.name,
      agentType: body.agentType,
      message: "Teammate spawn initiated",
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/teams/:teamId/tasks - Get team's tasks
router.get("/:teamId/tasks", async (req, res, next) => {
  try {
    const tasks = await taskService.listTasksForTeam(req.params.teamId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

export default router;
