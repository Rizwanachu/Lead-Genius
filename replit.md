# LeadFlow AI

An AI Lead Generation & Outreach Agency System that finds businesses without websites, scores them, generates personalized emails, and tracks the full sales pipeline.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lead-gen run dev` — run the frontend (port 24107)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TanStack Query, Wouter, Tailwind CSS, shadcn/ui, Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM schema (campaigns, leads, outreach, activity)
- `artifacts/api-server/src/routes/` — Express route handlers (leads, campaigns, outreach, analytics)
- `artifacts/api-server/src/lib/ai.ts` — AI content generation (lead search, audit, email generation)
- `artifacts/lead-gen/src/pages/` — Frontend pages (dashboard, leads, campaigns, outreach, analytics)
- `lib/api-client-react/src/generated/` — Generated React Query hooks

## Architecture decisions

- Contract-first: OpenAPI spec → Orval codegen → typed hooks (frontend) + Zod schemas (backend)
- AI content generation is template-based (no external API key required) — returns realistic leads, audits, and outreach emails
- Lead scoring: hasWebsite (-/+40), Instagram (+20), Facebook (+10), reviewCount>50 (+20), rating>=4.0 (+10)
- Activity log table tracks all funnel events for the real-time activity feed
- Campaigns are linked to leads via campaignId FK on the leads table

## Product

- **Lead Finder**: Search businesses by niche + location (country/state/city) — AI generates realistic leads with scoring
- **Lead Scoring**: 0-100 opportunity score based on website presence, social media, and review metrics
- **AI Audit**: Per-lead business analysis with problems identified and website opportunity value
- **AI Outreach**: Personalized email generation (initial + follow-up sequences) per lead
- **Campaign Manager**: Group leads into campaigns, track send/open/reply rates
- **CRM Pipeline**: Status tracking through new → contacted → opened → replied → interested → meeting_booked → closed
- **Analytics**: Dashboard with overview stats, pipeline funnel, and real-time activity feed

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before touching frontend or backend
- The `leads/search` endpoint generates AI leads (template-based), not real Google Maps data — suitable for demo/MVP
- Outreach send marks the lead as "contacted" automatically
- Campaign lead_count and sent_count are denormalized fields — update them manually or via DB trigger if needed
- Express 5: wildcard routes use `/{*splat}`, optional params use `{/:id}`, `req.params.id` may be `string[]`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
