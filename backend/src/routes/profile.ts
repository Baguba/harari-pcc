import { Router, Request, Response } from "express";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "../lib/db.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

export const profileRouter = Router();

// GET /api/profile (allow any authenticated user to view stamp/signature)
profileRouter.get("/", requireAuth, async (_req: Request, res: Response) => {
  const superAdmin = await db.user.findFirst({
    where: { role: "super_admin", active: true },
    select: { stampUrl: true, signatureUrl: true },
  });

  return res.json({
    stampUrl: superAdmin?.stampUrl || null,
    signatureUrl: superAdmin?.signatureUrl || null,
  });
});

// PATCH /api/profile (super admin only)
profileRouter.patch("/", requireSuperAdmin, async (req: Request, res: Response) => {
  const admin = req.actor!;
  const body = req.body || {};
  const uploadDir = path.join(process.cwd(), "uploads", "profile");
  await mkdir(uploadDir, { recursive: true });

  const updateData: Record<string, string> = {};

  // Process stamp upload
  if (body.stamp) {
    const { data, filename } = body.stamp as { data: string; filename: string };
    const ext = path.extname(filename) || ".png";
    const stampFilename = `stamp-${admin.id}${ext}`;
    const filePath = path.join(uploadDir, stampFilename);
    const buffer = Buffer.from(data, "base64");
    await writeFile(filePath, buffer);
    updateData.stampUrl = `/uploads/profile/${stampFilename}`;
  }

  // Process signature upload
  if (body.signature) {
    const { data, filename } = body.signature as { data: string; filename: string };
    const ext = path.extname(filename) || ".png";
    const sigFilename = `signature-${admin.id}${ext}`;
    const filePath = path.join(uploadDir, sigFilename);
    const buffer = Buffer.from(data, "base64");
    await writeFile(filePath, buffer);
    updateData.signatureUrl = `/uploads/profile/${sigFilename}`;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No files provided." });
  }

  const updated = await db.user.update({
    where: { id: admin.id },
    data: updateData,
    select: { stampUrl: true, signatureUrl: true },
  });

  return res.json({
    stampUrl: updated.stampUrl,
    signatureUrl: updated.signatureUrl,
  });
});
