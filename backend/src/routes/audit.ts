import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { requireAdmin } from "../middleware/auth.js";

export const auditRouter = Router();

// GET /api/audit
auditRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true, name: true, role: true } } },
  });
  return res.json({ logs });
});
