import { Router } from "express";
import { config } from "../../utils/config.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mockData: config.mockData,
  });
});

export default router;
