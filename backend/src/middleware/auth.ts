import { Request, Response, NextFunction } from "express";

export interface AuthenticatedUser {
  id: string;
  role: "super_admin" | "admin" | "applicant";
}

declare global {
  namespace Express {
    interface Request {
      actor?: AuthenticatedUser;
    }
  }
}

export function extractActor(req: Request, _res: Response, next: NextFunction) {
  const actorId = req.headers["x-actor-id"];
  const actorRole = req.headers["x-actor-role"];

  if (typeof actorId === "string" && typeof actorRole === "string") {
    req.actor = {
      id: actorId,
      role: actorRole as "super_admin" | "admin" | "applicant",
    };
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.actor) {
    return res.status(401).json({ error: "Authentication is required." });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || (req.actor.role !== "super_admin" && req.actor.role !== "admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.actor || req.actor.role !== "super_admin") {
    return res.status(403).json({ error: "Forbidden: Super admin access required." });
  }
  next();
}
