import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { db } from "../lib/db.js";
import { audit } from "../lib/audit.js";
import { requireAdmin } from "../middleware/auth.js";
import { getClientIp, getQueryString } from "../lib/utils.js";

export const applicationsRouter = Router();

// GET /api/applications/mine?userId=...
applicationsRouter.get("/mine", async (req: Request, res: Response) => {
  const userId = getQueryString(req.query.userId);
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const apps = await db.application.findMany({
    where: {
      OR: [{ submittedById: userId }, { email: user.email }],
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ applications: apps });
});

// GET /api/applications/:id
applicationsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const app = await db.application.findUnique({ where: { id } });
  if (!app) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json({ application: app });
});

// GET /api/applications (admin only)
applicationsRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
  const actor = req.actor!;
  const status = getQueryString(req.query.status);
  const q = getQueryString(req.query.q);

  const where: Record<string, any> = {};
  const superAdminStatuses = ["reviewed", "approved", "rejected", "revoked"];

  if (actor.role === "super_admin") {
    if (status && status !== "all") {
      if (superAdminStatuses.includes(status)) {
        where.status = status;
      } else {
        return res.json({ applications: [] });
      }
    } else {
      where.status = { in: superAdminStatuses };
    }
  } else {
    if (status && status !== "all") where.status = status;
  }

  if (q) {
    where.OR = [
      { contactName: { contains: q, mode: "insensitive" } },
      { organizationName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { categoryCode: { contains: q, mode: "insensitive" } },
      { categoryTitle: { contains: q, mode: "insensitive" } },
      { nationalId: { contains: q, mode: "insensitive" } },
    ];
  }

  const apps = await db.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return res.json({ applications: apps });
});

// POST /api/applications
applicationsRouter.post("/", async (req: Request, res: Response) => {
  const actorId = req.headers["x-actor-id"] as string;
  if (!actorId) {
    return res.status(401).json({ error: "Authentication is required to submit applications." });
  }

  const actor = await db.user.findUnique({
    where: { id: actorId },
  });
  if (!actor) {
    return res.status(401).json({ error: "Authenticated user not found." });
  }

  const body = req.body || {};
  const required = [
    "categoryCode",
    "categoryNum",
    "categoryTitle",
    "applicantType",
    "contactName",
    "email",
    "phone",
    "city",
    "addressLine",
  ];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === "") {
      return res.status(400).json({ error: `Missing required field: ${f}` });
    }
  }

  if (body.applicantType === "organization" && !body.organizationName) {
    return res.status(400).json({ error: "Organization name is required for organization applicants." });
  }

  if (Number(body.categoryNum) === 25 || Number(body.categoryNum) === 28) {
    return res.status(403).json({
      error: "This category is reserved for the state enterprise and is not open to private applicants.",
    });
  }

  const nationalId = String(body.nationalId || "").replace(/[\s-]/g, "");
  if (!/^\d{16}$/.test(nationalId)) {
    return res.status(400).json({ error: "National ID must be exactly a 16-digit number." });
  }

  const created = await db.application.create({
    data: {
      categoryCode: String(body.categoryCode),
      categoryNum: Number(body.categoryNum),
      categoryTitle: String(body.categoryTitle),
      applicantType: String(body.applicantType),
      organizationName: body.organizationName || null,
      contactName: String(body.contactName),
      email: String(body.email),
      phone: String(body.phone),
      region: body.region || "Harari",
      city: String(body.city),
      addressLine: String(body.addressLine),
      tinNumber: body.tinNumber || null,
      nationalId: nationalId || null,
      readinessPercent: Number(body.readinessPercent) || 0,
      uploadedDocuments: String(body.uploadedDocuments || ""),
      notes: body.notes || null,
      status: "submitted",
      submittedById: actor.id,
    },
  });

  if (body.documentsData && Array.isArray(body.documentsData)) {
    try {
      const uploadDir = path.join(process.cwd(), "uploads", created.id);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      for (const doc of body.documentsData) {
        if (doc.name && doc.content) {
          const parts = doc.content.split(";base64,");
          const base64Data = parts.length > 1 ? parts[1] : parts[0];
          const filePath = path.join(uploadDir, doc.name);
          fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
        }
      }
    } catch (err) {
      console.error("Failed to save uploaded documents:", err);
    }
  }

  const admins = await db.user.findMany({
    where: { role: { in: ["super_admin", "admin"] }, active: true },
  });
  for (const a of admins) {
    await db.notification.create({
      data: {
        userId: a.id,
        title: "New application submitted",
        body: `${created.contactName} — ${created.categoryCode} ${created.categoryTitle}`,
        type: "application",
        link: `admin/application/${created.id}`,
        applicationId: created.id,
      },
    });
  }

  const ip = getClientIp(req);
  await audit({
    action: "application.submit",
    target: `application:${created.id}`,
    detail: `New application from ${created.contactName} for category ${created.categoryCode}`,
    ip,
  });

  return res.status(201).json({ application: created });
});

// PATCH /api/applications/:id
applicationsRouter.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const id = req.params.id as string;
  const body = req.body || {};

  const existing = await db.application.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Not found" });
  }

  const newStatus = body.status || existing.status;
  const reviewNote = body.reviewNote !== undefined ? body.reviewNote : existing.reviewNote;

  if (existing.status === "approved" && newStatus !== "approved") {
    return res.status(400).json({ error: "Once approved, an application's status cannot be changed or removed." });
  }

  if (newStatus === "rejected" && (!reviewNote || reviewNote.trim() === "")) {
    return res.status(400).json({ error: "A comment is required when rejecting an application." });
  }

  const adminOnlyStatuses = ["submitted", "under_review", "reviewed", "rejected"];
  if (admin.role === "admin" && !adminOnlyStatuses.includes(newStatus)) {
    return res.status(403).json({ error: "Only super administrators can approve, reject, or revoke applications." });
  }

  const updated = await db.application.update({
    where: { id },
    data: {
      status: newStatus,
      reviewNote,
      reviewedAt: new Date(),
      reviewedById: admin.id,
    },
  });

  const linkedUser = await db.user.findUnique({
    where: { email: existing.email },
  });
  if (linkedUser) {
    await db.notification.create({
      data: {
        userId: linkedUser.id,
        title: `Application ${newStatus}`,
        body: `Your application for ${existing.categoryTitle} is now: ${newStatus}.`,
        type:
          newStatus === "approved"
            ? "success"
            : newStatus === "rejected"
            ? "warning"
            : newStatus === "reviewed"
            ? "info"
            : "info",
        link: `admin/application/${id}`,
        applicationId: id,
      },
    });
  }

  const ip = getClientIp(req);
  await audit({
    actorId: admin.id,
    action: `application.${newStatus}`,
    target: `application:${id}`,
    detail: `Status set to ${newStatus}. Note: ${reviewNote || "(none)"}`,
    ip,
  });

  return res.json({ application: updated });
});
