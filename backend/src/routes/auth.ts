import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { audit } from "../lib/audit.js";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../lib/password.js";
import { loginRateLimiter, signupRateLimiter } from "../lib/rate-limit.js";
import { getClientIp } from "../lib/utils.js";

export const authRouter = Router();

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  const ip = getClientIp(req) || "unknown";
  const rateLimitResult = loginRateLimiter.check(ip);

  if (!rateLimitResult.success) {
    res.setHeader("Retry-After", Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString());
    return res.status(429).json({ error: "Too many login attempts from this IP. Please try again later." });
  }

  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(403).json({
      error: "Account is temporarily locked due to too many failed attempts. Please try again later.",
    });
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    const newAttempts = user.failedLoginAttempts + 1;
    let lockedUntil: Date | null = null;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil,
      },
    });

    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  await audit({
    actorId: user.id,
    action: "auth.login",
    target: `user:${user.id}`,
    detail: `${user.role} logged in`,
    ip,
  });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      region: user.region,
    },
  });
});

// POST /api/auth/signup
authRouter.post("/signup", async (req: Request, res: Response) => {
  const ip = getClientIp(req) || "unknown";
  const rateLimitResult = signupRateLimiter.check(ip);

  if (!rateLimitResult.success) {
    res.setHeader("Retry-After", Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString());
    return res.status(429).json({ error: "Too many signups from this IP. Please try again later." });
  }

  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  const name = (req.body.name || "").trim();
  const phone = (req.body.phone || "").trim();
  const region = (req.body.region || "Harari").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const pwError = validatePasswordStrength(password);
  if (pwError) {
    return res.status(400).json({ error: pwError });
  }

  if (!email.includes("@") || email.length < 5) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Please sign in instead." });
  }

  const hashedPassword = await hashPassword(password);

  const created = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role: "applicant",
      phone: phone || null,
      region: region || null,
      active: true,
    },
  });

  await audit({
    actorId: created.id,
    action: "auth.signup",
    target: `user:${created.id}`,
    detail: `New applicant registered: ${created.email}`,
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
    },
  });
});

// POST /api/auth/logout
authRouter.post("/logout", (_req: Request, res: Response) => {
  return res.json({ ok: true });
});
