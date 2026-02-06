import { Router } from "express";
import { messageService } from "../../services/messageService.js";
import { SendMessageSchema } from "../../types/index.js";

const router = Router();

// POST /api/messages - Send message to agent
router.post("/", async (req, res, next) => {
  try {
    const body = SendMessageSchema.parse(req.body);
    const message = await messageService.addMessage(body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:teamId - Get message history
router.get("/:teamId", async (req, res, next) => {
  try {
    const messages = await messageService.listMessages(req.params.teamId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

export default router;
