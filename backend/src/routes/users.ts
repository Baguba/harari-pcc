import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { audit } from "../lib/audit.js";
import { hashPassword } from "../lib/password.js";
import { requireAdmin, requireSuperAdmin } from "../middleware/auth.js";
import { getClientIp } from "../lib/utils.js";

export const usersRouter = Router();

// GET /api/users
usersRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      region: true,
      active: true,
      createdAt: true,
    },
  });
  return res.json({ users });
});

// POST /api/users (super_admin only)
usersRouter.post("/", requireSuperAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const body = req.body || {};

  if (!body.email || !body.password || !body.role) {
    return res.status(400).json({ error: "Email, password, and role are required." });
  }

  if (!["super_admin", "admin", "applicant"].includes(body.role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  const email = body.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use." });
  }

  const hashedPassword = await hashPassword(body.password);

  const created = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: body.name || null,
      role: body.role,
      phone: body.phone || null,
      region: body.region || null,
      active: body.active ?? true,
    },
  });

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "user.create",
    target: `user:${created.id}`,
    detail: `Created ${created.role} user: ${created.email}`,
    ip,
  });

  return res.status(201).json({
    user: {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      phone: created.phone,
      region: created.region,
      active: created.active,
    },
  });
});

// PATCH /api/users/:id (super_admin only)
usersRouter.patch("/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const id = req.params.id as string;
  const body = req.body || {};

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    return res.status(404).json({ error: "Not found" });
  }

  if (target.role === "super_admin" && body.role && body.role !== "super_admin") {
    const superCount = await db.user.count({ where: { role: "super_admin", active: true } });
    if (superCount <= 1) {
      return res.status(400).json({ error: "Cannot demote the last active super administrator." });
    }
  }

  const updateData: Record<string, any> = {
    name: body.name ?? target.name,
    role: body.role ?? target.role,
    phone: body.phone ?? target.phone,
    region: body.region ?? target.region,
    active: body.active ?? target.active,
  };

  if (body.password) {
    updateData.password = await hashPassword(body.password);
  }

  const updated = await db.user.update({
    where: { id },
    data: updateData,
  });

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "user.update",
    target: `user:${id}`,
    detail: `Updated ${updated.email} — role: ${updated.role}, active: ${updated.active}`,
    ip,
  });

  return res.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      phone: updated.phone,
      region: updated.region,
      active: updated.active,
    },
  });
});

// DELETE /api/users/:id (super_admin only)
usersRouter.delete("/:id", requireSuperAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const id = req.params.id as string;

  if (id === admin.id) {
    return res.status(400).json({ error: "You cannot delete your own account while signed in." });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    return res.status(404).json({ error: "Not found" });
  }

  if (target.role === "super_admin") {
    const superCount = await db.user.count({ where: { role: "super_admin", active: true } });
    if (superCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the last active super administrator." });
    }
  }

  await db.user.delete({ where: { id } });

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: "user.delete",
    target: `user:${id}`,
    detail: `Deleted ${target.email}`,
    ip,
  });

  return res.json({ ok: true });
});
