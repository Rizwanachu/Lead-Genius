import { Router, type IRouter } from "express";
import { eq, and, gte, ilike, or, sql } from "drizzle-orm";
import { db, leadsTable, activityTable } from "@workspace/db";
import {
  ListLeadsQueryParams,
  CreateLeadBody,
  SearchLeadsBody,
  GetLeadParams,
  UpdateLeadParams,
  UpdateLeadBody,
  DeleteLeadParams,
  AuditLeadParams,
  ListLeadsResponse,
  GetLeadResponse,
  UpdateLeadResponse,
  SearchLeadsResponse,
  AuditLeadResponse,
} from "@workspace/api-zod";
import { generateAudit, generateLeads } from "../lib/ai";

const router: IRouter = Router();

function serializeLead(l: typeof leadsTable.$inferSelect) {
  return {
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt?.toISOString() ?? null,
  };
}

router.get("/leads", async (req, res): Promise<void> => {
  const queryParsed = ListLeadsQueryParams.safeParse(req.query);
  if (!queryParsed.success) { res.status(400).json({ error: queryParsed.error.message }); return; }
  const { status, minScore, campaign_id, search, limit = 50, offset = 0 } = queryParsed.data;

  const conditions = [];
  if (status) conditions.push(eq(leadsTable.status, status));
  if (minScore != null) conditions.push(gte(leadsTable.score, minScore));
  if (campaign_id != null) conditions.push(eq(leadsTable.campaignId, campaign_id));
  if (search) {
    conditions.push(or(
      ilike(leadsTable.businessName, `%${search}%`),
      ilike(leadsTable.city ?? sql`''`, `%${search}%`),
      ilike(leadsTable.niche, `%${search}%`),
    ));
  }

  const query = db.select().from(leadsTable);
  const leads = conditions.length > 0
    ? await query.where(and(...conditions)).limit(limit).offset(offset).orderBy(leadsTable.createdAt)
    : await query.limit(limit).offset(offset).orderBy(leadsTable.createdAt);

  res.json(ListLeadsResponse.parse(leads.map(serializeLead)));
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const score = computeScore(parsed.data);
  const [lead] = await db.insert(leadsTable).values({ ...parsed.data, score }).returning();

  await db.insert(activityTable).values({
    type: "lead_found",
    description: `New lead added: ${lead.businessName}`,
    leadName: lead.businessName,
    leadId: lead.id,
  });

  res.status(201).json(GetLeadResponse.parse(serializeLead(lead)));
});

router.post("/leads/search", async (req, res): Promise<void> => {
  const parsed = SearchLeadsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const generatedLeads = await generateLeads(parsed.data);

  const inserted = await Promise.all(
    generatedLeads.map(async (leadData) => {
      const [lead] = await db.insert(leadsTable).values({
        ...leadData,
        campaignId: parsed.data.campaignId ?? null,
      }).returning();
      await db.insert(activityTable).values({
        type: "lead_found",
        description: `Lead found via search: ${lead.businessName} in ${lead.city ?? lead.country}`,
        leadName: lead.businessName,
        leadId: lead.id,
      });
      return lead;
    })
  );

  res.json(SearchLeadsResponse.parse(inserted.map(serializeLead)));
});

router.get("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, params.data.id));
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json(GetLeadResponse.parse(serializeLead(lead)));
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [lead] = await db.update(leadsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(leadsTable.id, params.data.id))
    .returning();
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  if (parsed.data.status) {
    const typeMap: Record<string, string> = {
      meeting_booked: "meeting_booked",
      closed: "lead_closed",
      replied: "email_replied",
    };
    const actType = typeMap[parsed.data.status];
    if (actType) {
      await db.insert(activityTable).values({
        type: actType,
        description: `${lead.businessName} status changed to ${parsed.data.status}`,
        leadName: lead.businessName,
        leadId: lead.id,
      });
    }
  }

  res.json(UpdateLeadResponse.parse(serializeLead(lead)));
});

router.delete("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [deleted] = await db.delete(leadsTable).where(eq(leadsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Lead not found" }); return; }
  res.sendStatus(204);
});

router.post("/leads/:id/audit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AuditLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, params.data.id));
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const audit = await generateAudit(lead);

  await db.update(leadsTable).set({
    auditSummary: audit.summary,
    auditOpportunity: audit.opportunity,
    score: audit.score,
    updatedAt: new Date(),
  }).where(eq(leadsTable.id, lead.id));

  res.json(AuditLeadResponse.parse({ leadId: lead.id, ...audit }));
});

function computeScore(data: {
  hasWebsite?: boolean;
  instagramUrl?: string;
  facebookUrl?: string;
  reviewCount?: number;
  reviewRating?: number;
}): number {
  let score = 0;
  if (!data.hasWebsite) score += 40;
  if (data.instagramUrl) score += 20;
  if (data.facebookUrl) score += 10;
  if (data.reviewCount && data.reviewCount > 50) score += 20;
  if (data.reviewRating && data.reviewRating >= 4.0) score += 10;
  return Math.min(score, 100);
}

export default router;
