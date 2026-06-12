import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leadsTable } from "./leads";
import { campaignsTable } from "./campaigns";

export const outreachTable = pgTable("outreach", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leadsTable.id),
  campaignId: integer("campaign_id").references(() => campaignsTable.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  channel: text("channel").notNull().default("email"),
  followUpNumber: integer("follow_up_number").notNull().default(0),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOutreachSchema = createInsertSchema(outreachTable).omit({ id: true, createdAt: true });
export type InsertOutreach = z.infer<typeof insertOutreachSchema>;
export type Outreach = typeof outreachTable.$inferSelect;
