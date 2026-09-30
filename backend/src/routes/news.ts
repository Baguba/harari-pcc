import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { audit } from "../lib/audit.js";
import { requireAdmin, requireSuperAdmin } from "../middleware/auth.js";
import { getClientIp } from "../lib/utils.js";

export const newsRouter = Router();

// GET /api/news
newsRouter.get("/", async (req: Request, res: Response) => {
  const actor = req.actor;
  const includeUnpublished = actor && (actor.role === "super_admin" || actor.role === "admin");

  const news = await db.news.findMany({
    where: includeUnpublished ? {} : { published: true },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return res.json({ news });
});

// POST /api/news
newsRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const body = req.body || {};

  if (!body.titleEn || !body.titleAm || !body.bodyEn || !body.bodyAm) {
    return res.status(400).json({ error: "Missing required fields (title/body in both languages)." });
  }

  const created = await db.news.create({
    data: {
      titleEn: body.titleEn,
      titleAm: body.titleAm,
      bodyEn: body.bodyEn,
      bodyAm: body.bodyAm,
      category: body.category || "general",
      pinned: !!body.pinned,
      published: !!body.published,
      publishedAt: body.published ? new Date() : null,
    },
  });

  if (created.published) {
    const users = await db.user.findMany({
      where: { role: "applicant", active: true },
    });
    for (const u of users) {
      await db.notification.create({
        data: {
          userId: u.id,
          title: `News: ${created.titleEn}`,
          body: created.bodyEn.slice(0, 200),
          type: "news",
          link: "news",
          newsId: created.id,
        },
      });
    }
  }

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "news.create",
    target: `news:${created.id}`,
    detail: `Created news: ${created.titleEn}`,
    ip,
  });

  return res.status(201).json({ news: created });
});

// PATCH /api/news/:id
newsRouter.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const id = req.params.id as string;
  const body = req.body || {};

  const existing = await db.news.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  const updated = await db.news.update({
    where: { id },
    data: {
      titleEn: body.titleEn ?? existing.titleEn,
      titleAm: body.titleAm ?? existing.titleAm,
      bodyEn: body.bodyEn ?? existing.bodyEn,
      bodyAm: body.bodyAm ?? existing.bodyAm,
      category: body.category ?? existing.category,
      pinned: body.pinned ?? existing.pinned,
      published: body.published ?? existing.published,
      publishedAt: body.published && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "news.update",
    target: `news:${id}`,
    detail: `Updated: ${updated.titleEn}`,
    ip,
  });

  return res.json({ news: updated });
});

// DELETE /api/news/:id (super_admin only)
newsRouter.delete("/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const id = req.params.id as string;

  const existing = await db.news.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  await db.news.delete({ where: { id } });

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "news.delete",
    target: `news:${id}`,
    detail: `Deleted: ${existing.titleEn}`,
    ip,
  });

  return res.json({ ok: true });
});
