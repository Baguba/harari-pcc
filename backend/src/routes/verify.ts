import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";

export const verifyRouter = Router();

// GET /api/verify?id=<applicationId>
verifyRouter.get("/", async (req: Request, res: Response) => {
  const id = req.query.id as string;

  if (!id) {
    return res.status(400).json({ valid: false, error: "Missing certificate ID" });
  }

  try {
    const app = await db.application.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        categoryCode: true,
        categoryTitle: true,
        contactName: true,
        organizationName: true,
        reviewedAt: true,
        createdAt: true,
      },
    });

    if (!app) {
      return res.status(404).json({ valid: false, error: "Certificate not found" });
    }

    if (app.status !== "approved") {
      return res.json({
        valid: false,
        error: "Certificate is not valid",
        status: app.status,
      });
    }

    const issuedDate = app.reviewedAt ? new Date(app.reviewedAt) : null;
    const validUntil = issuedDate ? new Date(new Date(issuedDate).setFullYear(issuedDate.getFullYear() + 1)) : null;
    const isExpired = validUntil ? new Date() > validUntil : false;

    return res.json({
      valid: !isExpired,
      expired: isExpired,
      certificate: {
        holderName: app.organizationName || app.contactName,
        categoryCode: app.categoryCode,
        categoryTitle: app.categoryTitle,
        certificateNo: app.id.slice(0, 16).toUpperCase(),
        issuedDate: issuedDate?.toISOString() || null,
        validUntil: validUntil?.toISOString() || null,
        status: app.status,
      },
    });
  } catch {
    return res.status(500).json({ valid: false, error: "Verification failed" });
  }
});
