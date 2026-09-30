import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import { extractActor } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { applicationsRouter } from "./routes/applications.js";
import { newsRouter } from "./routes/news.js";
import { notificationsRouter } from "./routes/notifications.js";
import { usersRouter } from "./routes/users.js";
import { metricsRouter } from "./routes/metrics.js";
import { auditRouter } from "./routes/audit.js";
import { profileRouter } from "./routes/profile.js";
import { verifyRouter } from "./routes/verify.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(extractActor);

// Static uploads serving
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Health check
app.get("/api", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "MCIT Portal API Server is running" });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/news", newsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/profile", profileRouter);
app.use("/api/verify", verifyRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
