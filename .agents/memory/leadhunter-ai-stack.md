---
name: LeadHunter AI real-AI stack
description: How real data and AI are wired into LeadHunter AI (free stack)
---

# LeadHunter AI — Real AI Architecture

## Free Stack Used
- **Lead Finder**: Nominatim (OpenStreetMap) — `https://nominatim.openstreetmap.org/search` — no key needed
- **All AI**: Gemini 2.5 Flash via direct Google API — key stored as `GEMINI_API_KEY` secret

## Key Implementation Detail
GEMINI_API_KEY is a Replit Secret. It is exposed to the Vite frontend via `vite.config.ts` `define` block:
```ts
define: { "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(process.env.GEMINI_API_KEY || "") }
```
All Gemini calls live in `artifacts/leadhunter-ai/src/lib/gemini.ts` — client-side fetch to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`.

**Why client-side:** No paid API server integration available; direct Gemini REST API is free tier friendly.

## Pages Updated
- LeadFinder: Nominatim real business search
- LeadAnalyzer: aiAnalyzeWebsite + aiAnalyzeBusiness (Gemini)
- OutreachGenerator: aiGenerateOutreach + aiGenerateFollowUpSequence (Gemini)
- ProposalGenerator: aiGenerateProposal (Gemini) — full custom executive summary, scope, ROI, guarantee
- MarketingTools: aiGenerateContentCalendar, aiGenerateSEOPlan, aiGenerateReviewResponse, aiAnalyzeBusiness (Gemini)
