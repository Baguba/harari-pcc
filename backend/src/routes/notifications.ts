import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { getQueryString } from "../lib/utils.js";

export const notificationsRouter = Router();

// GET /api/notifications?userId=...
notificationsRouter.get("/", async (req: Request, res: Response) => {
  const userId = getQueryString(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await db.notification.count({
    where: { userId, read: false },
  });

  return res.json({ notifications, unreadCount });
});

// POST /api/notifications/read-all
notificationsRouter.post("/read-all", async (req: Request, res: Response) => {
  const body = req.body || {};
  const userId = body.userId;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return res.json({ ok: true });
});

// PATCH /api/notifications/:id
notificationsRouter.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const body = req.body || {};

  const updated = await db.notification.update({
    where: { id },
    data: { read: body.read ?? true },
  });

  return res.json({ notification: updated });
});
