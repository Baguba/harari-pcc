import { Router, Request, Response } from "express";
import { db } from "../lib/db.js";
import { requireAdmin } from "../middleware/auth.js";

export const metricsRouter = Router();

// GET /api/metrics
metricsRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const dayDates: { d: Date; next: Date }[] = [];
  const timeseriesPromises = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    dayDates.push({ d, next });
    timeseriesPromises.push(
      db.application.count({
        where: { createdAt: { gte: d, lt: next } },
      })
    );
  }

  const baseQueriesPromise = Promise.all([
    db.application.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    db.application.groupBy({
      by: ["categoryCode"],
      _count: { _all: true },
      orderBy: { _count: { categoryCode: "desc" } },
      take: 10,
    }),
    db.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const [recent, byCategory, statusGrouped] = await baseQueriesPromise;
  const dayCounts = await Promise.all(timeseriesPromises);

  const statusCounts = statusGrouped.reduce((acc, curr) => {
    acc[curr.status] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  const submitted = statusCounts["submitted"] || 0;
  const underReview = statusCounts["under_review"] || 0;
  const approved = statusCounts["approved"] || 0;
  const reviewed = statusCounts["reviewed"] || 0;
  const rejected = statusCounts["rejected"] || 0;
  const total = statusGrouped.reduce((sum, curr) => sum + curr._count._all, 0);

  const timeseries = dayDates.map((dateObj, idx) => ({
    date: dateObj.d.toISOString().slice(0, 10),
    count: dayCounts[idx],
  }));

  const statusBreakdown = statusGrouped.map((s) => ({
    status: s.status,
    count: s._count._all,
  }));

  return res.json({
    totals: {
      total,
      submitted,
      underReview,
      approved,
      reviewed,
      rejected,
      recent,
    },
    byCategory: byCategory.map((c) => ({
      code: c.categoryCode,
      count: c._count._all,
    })),
    statusBreakdown,
    timeseries,
  });
});
