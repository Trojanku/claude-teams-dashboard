import { Router } from "express";
import { taskService } from "../../services/taskService.js";
import { CreateTaskSchema, UpdateTaskSchema } from "../../types/index.js";

const router = Router();

// GET /api/tasks - List all tasks across teams
router.get("/", async (req, res, next) => {
  try {
    const teamId = req.query.teamId as string | undefined;
    const tasks = teamId
      ? await taskService.listTasksForTeam(teamId)
      : await taskService.listAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Create task
router.post("/", async (req, res, next) => {
  try {
    const body = CreateTaskSchema.parse(req.body);
    const task = await taskService.createTask(body.teamId, {
      subject: body.subject,
      description: body.description,
      activeForm: body.activeForm,
      owner: body.owner,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - Get task details
router.get("/:id", async (req, res, next) => {
  try {
    const teamId = req.query.teamId as string | undefined;
    const task = await taskService.getTask(req.params.id, teamId);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id - Update task
router.patch("/:id", async (req, res, next) => {
  try {
    const updates = UpdateTaskSchema.parse(req.body);
    const teamId = req.query.teamId as string;
    if (!teamId) {
      res.status(400).json({ error: "teamId query parameter is required" });
      return;
    }
    const task = await taskService.updateTask(req.params.id, teamId, updates);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

export default router;
