import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, campaignsTable, leadsTable } from "@workspace/db";
import {
  CreateCampaignBody,
  UpdateCampaignBody,
  GetCampaignParams,
  UpdateCampaignParams,
  DeleteCampaignParams,
  GetCampaignLeadsParams,
  ListCampaignsResponse,
  GetCampaignResponse,
  UpdateCampaignResponse,
  GetCampaignLeadsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/campaigns", async (_req, res): Promise<void> => {
  const campaigns = await db.select().from(campaignsTable).orderBy(campaignsTable.createdAt);
  res.json(ListCampaignsResponse.parse(campaigns.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt?.toISOString() ?? null,
  }))));
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [campaign] = await db.insert(campaignsTable).values(parsed.data).returning();
  res.status(201).json(GetCampaignResponse.parse({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt?.toISOString() ?? null,
  }));
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCampaignParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, params.data.id));
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  res.json(GetCampaignResponse.parse({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt?.toISOString() ?? null,
  }));
});

router.patch("/campaigns/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCampaignParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [campaign] = await db.update(campaignsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(campaignsTable.id, params.data.id))
    .returning();
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  res.json(UpdateCampaignResponse.parse({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt?.toISOString() ?? null,
  }));
});

router.delete("/campaigns/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [deleted] = await db.delete(campaignsTable).where(eq(campaignsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Campaign not found" }); return; }
  res.sendStatus(204);
});

router.get("/campaigns/:id/leads", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCampaignLeadsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const leads = await db.select().from(leadsTable).where(eq(leadsTable.campaignId, params.data.id));
  res.json(GetCampaignLeadsResponse.parse(leads.map(l => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt?.toISOString() ?? null,
  }))));
});

export default router;
