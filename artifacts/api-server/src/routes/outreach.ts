import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, outreachTable, leadsTable, activityTable } from "@workspace/db";
import {
  ListOutreachQueryParams,
  GenerateOutreachBody,
  SendOutreachBody,
  GetOutreachParams,
  UpdateOutreachParams,
  UpdateOutreachBody,
  ListOutreachResponse,
  GenerateOutreachResponse,
  SendOutreachResponse,
  GetOutreachResponse,
  UpdateOutreachResponse,
} from "@workspace/api-zod";
import { generateEmail } from "../lib/ai";

const router: IRouter = Router();

function serializeOutreach(o: typeof outreachTable.$inferSelect) {
  return {
    ...o,
    sentAt: o.sentAt?.toISOString() ?? null,
    openedAt: o.openedAt?.toISOString() ?? null,
    repliedAt: o.repliedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/outreach", async (req, res): Promise<void> => {
  const queryParsed = ListOutreachQueryParams.safeParse(req.query);
  if (!queryParsed.success) { res.status(400).json({ error: queryParsed.error.message }); return; }
  const { lead_id, campaign_id, status } = queryParsed.data;

  const conditions = [];
  if (lead_id != null) conditions.push(eq(outreachTable.leadId, lead_id));
  if (campaign_id != null) conditions.push(eq(outreachTable.campaignId, campaign_id));
  if (status) conditions.push(eq(outreachTable.status, status));

  const query = db.select().from(outreachTable);
  const messages = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(outreachTable.createdAt)
    : await query.orderBy(outreachTable.createdAt);

  res.json(ListOutreachResponse.parse(messages.map(serializeOutreach)));
});

router.post("/outreach/generate", async (req, res): Promise<void> => {
  const parsed = GenerateOutreachBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, parsed.data.leadId));
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }

  const { subject, body } = await generateEmail(lead, parsed.data.followUpNumber ?? 0);

  const [message] = await db.insert(outreachTable).values({
    leadId: parsed.data.leadId,
    campaignId: parsed.data.campaignId ?? null,
    subject,
    body,
    status: "draft",
    channel: parsed.data.channel ?? "email",
    followUpNumber: parsed.data.followUpNumber ?? 0,
  }).returning();

  res.json(GenerateOutreachResponse.parse(serializeOutreach(message)));
});

router.post("/outreach/send", async (req, res): Promise<void> => {
  const parsed = SendOutreachBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [msg] = await db.select().from(outreachTable).where(eq(outreachTable.id, parsed.data.outreachId));
  if (!msg) { res.status(404).json({ error: "Outreach message not found" }); return; }

  const [updated] = await db.update(outreachTable)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(outreachTable.id, parsed.data.outreachId))
    .returning();

  await db.update(leadsTable)
    .set({ status: "contacted", updatedAt: new Date() })
    .where(eq(leadsTable.id, msg.leadId));

  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, msg.leadId));
  await db.insert(activityTable).values({
    type: "outreach_sent",
    description: `Outreach email sent to ${lead?.businessName ?? "business"}`,
    leadName: lead?.businessName ?? null,
    leadId: msg.leadId,
  });

  res.json(SendOutreachResponse.parse(serializeOutreach(updated)));
});

router.get("/outreach/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOutreachParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [msg] = await db.select().from(outreachTable).where(eq(outreachTable.id, params.data.id));
  if (!msg) { res.status(404).json({ error: "Outreach message not found" }); return; }
  res.json(GetOutreachResponse.parse(serializeOutreach(msg)));
});

router.patch("/outreach/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateOutreachParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateOutreachBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [msg] = await db.update(outreachTable)
    .set(parsed.data)
    .where(eq(outreachTable.id, params.data.id))
    .returning();
  if (!msg) { res.status(404).json({ error: "Outreach message not found" }); return; }
  res.json(UpdateOutreachResponse.parse(serializeOutreach(msg)));
});

export default router;
