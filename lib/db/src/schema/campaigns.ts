import { pgTable, serial, text, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  city: text("city"),
  status: text("status").notNull().default("draft"),
  description: text("description"),
  emailSubjectTemplate: text("email_subject_template"),
  emailBodyTemplate: text("email_body_template"),
  maxFollowUps: integer("max_follow_ups").notNull().default(3),
  followUpIntervalDays: integer("follow_up_interval_days").notNull().default(3),
  leadCount: integer("lead_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  openRate: real("open_rate"),
  replyRate: real("reply_rate"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true, updatedAt: true, leadCount: true, sentCount: true, openRate: true, replyRate: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
