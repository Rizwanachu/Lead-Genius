import { pgTable, serial, text, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  niche: text("niche").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  googleMapsUrl: text("google_maps_url"),
  reviewCount: integer("review_count"),
  reviewRating: real("review_rating"),
  hasWebsite: boolean("has_website").notNull().default(false),
  score: integer("score").notNull().default(0),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  campaignId: integer("campaign_id").references(() => campaignsTable.id),
  auditSummary: text("audit_summary"),
  auditOpportunity: text("audit_opportunity"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
