import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { db, leadsTable, outreachTable, campaignsTable, activityTable } from "@workspace/db";
import {
  GetAnalyticsOverviewResponse,
  GetPipelineStatsResponse,
  GetRecentActivityQueryParams,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/overview", async (_req, res): Promise<void> => {
  const [leadStats] = await db.select({
    totalLeads: sql<number>`count(*)::int`,
    totalContacted: sql<number>`count(*) filter (where status != 'new')::int`,
    totalReplied: sql<number>`count(*) filter (where status = 'replied' or status = 'interested' or status = 'meeting_booked' or status = 'closed')::int`,
    totalMeetings: sql<number>`count(*) filter (where status = 'meeting_booked' or status = 'closed')::int`,
    avgScore: sql<number>`coalesce(avg(score), 0)::float`,
    leadsThisWeek: sql<number>`count(*) filter (where created_at >= now() - interval '7 days')::int`,
  }).from(leadsTable);

  const [emailStats] = await db.select({
    totalSent: sql<number>`count(*) filter (where status != 'draft')::int`,
    totalOpened: sql<number>`count(*) filter (where status in ('opened', 'clicked', 'replied'))::int`,
    totalReplied: sql<number>`count(*) filter (where status = 'replied')::int`,
  }).from(outreachTable);

  const [campaignStats] = await db.select({
    total: sql<number>`count(*)::int`,
  }).from(campaignsTable);

  const emailsSent = emailStats?.totalSent ?? 0;
  const openRate = emailsSent > 0 ? ((emailStats?.totalOpened ?? 0) / emailsSent) * 100 : 0;
  const replyRate = emailsSent > 0 ? ((emailStats?.totalReplied ?? 0) / emailsSent) * 100 : 0;

  res.json(GetAnalyticsOverviewResponse.parse({
    totalLeads: leadStats?.totalLeads ?? 0,
    totalContacted: leadStats?.totalContacted ?? 0,
    totalReplied: leadStats?.totalReplied ?? 0,
    totalMeetingsBooked: leadStats?.totalMeetings ?? 0,
    totalCampaigns: campaignStats?.total ?? 0,
    emailsSent,
    openRate: Math.round(openRate * 10) / 10,
    replyRate: Math.round(replyRate * 10) / 10,
    avgLeadScore: Math.round((leadStats?.avgScore ?? 0) * 10) / 10,
    leadsThisWeek: leadStats?.leadsThisWeek ?? 0,
  }));
});

router.get("/analytics/pipeline", async (_req, res): Promise<void> => {
  const statuses = [
    { status: "new", label: "New" },
    { status: "contacted", label: "Contacted" },
    { status: "opened", label: "Opened" },
    { status: "replied", label: "Replied" },
    { status: "interested", label: "Interested" },
    { status: "meeting_booked", label: "Meeting Booked" },
    { status: "closed", label: "Closed" },
    { status: "disqualified", label: "Disqualified" },
  ];

  const results = await db.select({
    status: leadsTable.status,
    count: sql<number>`count(*)::int`,
  }).from(leadsTable).groupBy(leadsTable.status);

  const countMap = new Map(results.map(r => [r.status, r.count]));

  const pipeline = statuses.map(s => ({
    status: s.status,
    label: s.label,
    count: countMap.get(s.status) ?? 0,
  }));

  res.json(GetPipelineStatsResponse.parse(pipeline));
});

router.get("/analytics/activity", async (req, res): Promise<void> => {
  const queryParsed = GetRecentActivityQueryParams.safeParse(req.query);
  if (!queryParsed.success) { res.status(400).json({ error: queryParsed.error.message }); return; }
  const limit = queryParsed.data.limit ?? 20;

  const activities = await db.select().from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(limit);

  res.json(GetRecentActivityResponse.parse(activities.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }))));
});

export default router;
