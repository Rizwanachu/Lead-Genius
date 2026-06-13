const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const res = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.85 }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function aiAnalyzeBusiness(
  businessName: string,
  businessType: string,
  location: string,
  websiteUrl?: string,
  reviewCount?: number,
  reviewRating?: number
): Promise<{
  summary: string;
  websiteOpportunity: string;
  seoOpportunity: string;
  orderingOpportunity: string;
  revenueOpportunity: string;
  score: number;
  problems: string[];
}> {
  const prompt = `You are a digital growth consultant analyzing a local business for outreach purposes.

Business: ${businessName}
Type: ${businessType}
Location: ${location}
Website: ${websiteUrl || "None found"}
Google Reviews: ${reviewCount ?? "Unknown"} reviews, ${reviewRating ?? "Unknown"} star rating

Analyze this business as a potential client for a web design / digital marketing agency. Return a JSON object with these exact keys:
{
  "summary": "2-3 sentences describing the business and their overall digital situation",
  "websiteOpportunity": "1-2 sentences on specific website opportunities or issues",
  "seoOpportunity": "1-2 sentences on specific local SEO opportunities",
  "orderingOpportunity": "1-2 sentences on conversion/booking/ordering opportunities",
  "revenueOpportunity": "1 sentence estimating potential revenue opportunity with a realistic dollar amount",
  "score": <number 0-100 representing how strong of a lead they are>,
  "problems": ["problem 1", "problem 2", "problem 3"] (3-5 specific, unique problems this business has)
}

Be specific to THIS business — no generic answers. Make each insight unique and actionable. Return only valid JSON.`;

  const raw = await callGemini(prompt);
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
  try {
    return JSON.parse(json);
  } catch {
    return {
      summary: raw.slice(0, 300),
      websiteOpportunity: "Unable to parse full analysis.",
      seoOpportunity: "",
      orderingOpportunity: "",
      revenueOpportunity: "",
      score: 65,
      problems: []
    };
  }
}

export async function aiGenerateOutreach(
  businessName: string,
  businessType: string,
  location: string,
  channel: "email" | "instagram" | "facebook" | "whatsapp",
  tone: string,
  length: string,
  problems?: string[]
): Promise<string[]> {
  const problemContext = problems && problems.length > 0
    ? `Known problems with this business:\n${problems.map(p => `- ${p}`).join("\n")}`
    : "";

  const lengthGuide = {
    short: "1-3 sentences only. Ultra brief.",
    medium: "4-6 sentences. Balanced.",
    long: "Full message with context, specifics, and a clear CTA. For email, include a subject line."
  }[length] || "4-6 sentences.";

  const channelGuide = channel === "email"
    ? "Write a cold outreach EMAIL. Start with 'Subject: ...' on the first line, then a blank line, then the body."
    : `Write a ${channel} direct message. Keep it casual and conversational.`;

  const prompt = `You are an expert cold outreach copywriter for a web design / digital marketing agency.

Write 3 completely different outreach messages to this business. Each variant must use a genuinely different angle, hook, and call-to-action.

Business: ${businessName}
Type: ${businessType}
Location: ${location}
${problemContext}

Channel: ${channel}
Tone: ${tone}
Length: ${lengthGuide}
Format: ${channelGuide}

Rules:
- Never sound like AI or a template
- Reference specific details about the business
- Each variant must feel completely different
- Tone "${tone}": ${
    tone === "friendly" ? "warm, casual, human, light humor ok" :
    tone === "professional" ? "polished, business-like, respectful" :
    tone === "direct" ? "short, punchy, no fluff, bold" :
    "elevated, exclusive, high-value"
  }

Return a JSON array with exactly 3 strings: ["variant1", "variant2", "variant3"]
Return ONLY the JSON array, nothing else.`;

  const raw = await callGemini(prompt);
  const arrMatch = raw.match(/\[[\s\S]*\]/)?.[0];
  if (arrMatch) {
    try {
      const parsed = JSON.parse(arrMatch);
      if (Array.isArray(parsed) && parsed.length >= 3) return parsed.slice(0, 3);
    } catch {}
  }
  return [raw.slice(0, 800), raw.slice(0, 600), raw.slice(0, 400)];
}

export async function aiGenerateFollowUpSequence(
  businessName: string,
  businessType: string,
  channel: string,
  initialMessage: string
): Promise<Array<{ day: number; subject: string; content: string }>> {
  const prompt = `You are a cold outreach expert. Create a 4-message follow-up sequence for this scenario:

Business: ${businessName} (${businessType})
Channel: ${channel}
Initial message sent: "${initialMessage.slice(0, 300)}"

Create 4 follow-up messages at days 3, 7, 14, and 21. Each should:
- Reference the previous touchpoint without being annoying
- Add NEW value or a different angle each time
- Escalate gently in urgency
- Day 21 should be a graceful "last message"

Return a JSON array:
[
  {"day": 3, "subject": "...", "content": "..."},
  {"day": 7, "subject": "...", "content": "..."},
  {"day": 14, "subject": "...", "content": "..."},
  {"day": 21, "subject": "...", "content": "..."}
]
Return ONLY the JSON array.`;

  const raw = await callGemini(prompt);
  const arrMatch = raw.match(/\[[\s\S]*\]/)?.[0];
  if (arrMatch) {
    try {
      const parsed = JSON.parse(arrMatch);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [
    { day: 3, subject: `Following up — ${businessName}`, content: `Just wanted to make sure my last message didn't get buried. Still happy to put together a free mockup for ${businessName}. Worth a look?` },
    { day: 7, subject: `Quick question for ${businessName}`, content: `Hi, just circling back one more time. I've actually started sketching out some ideas for ${businessName}'s site. Can I send them over?` },
    { day: 14, subject: `One last idea for ${businessName}`, content: `I won't keep following up after this — but I wanted to share one specific idea I had for ${businessName} that I think could make a real difference. Want to hear it?` },
    { day: 21, subject: `Closing the loop — ${businessName}`, content: `This will be my last message. If the timing ever feels right to talk about ${businessName}'s online presence, my door is always open. Wishing you a great season!` }
  ];
}

export async function aiGenerateProposal(
  businessName: string,
  businessType: string,
  city: string,
  packageName: string,
  packageDescription: string,
  price: string,
  timeline: string
): Promise<{
  executiveSummary: string;
  opportunityGap: string[];
  scopeItems: string[];
  roiForecast: string;
  guarantee: string;
}> {
  const prompt = `You are a senior digital agency proposal writer. Write a professional, persuasive proposal for a potential client.

Client Business: ${businessName}
Industry: ${businessType}
City: ${city}
Package: ${packageName} — ${packageDescription}
Investment: ${price}
Timeline: ${timeline}

Generate proposal content as JSON:
{
  "executiveSummary": "2-3 paragraph executive summary specific to this business and industry. Reference the city, their specific competitive landscape, and how digital presence affects their type of business.",
  "opportunityGap": ["specific gap 1", "specific gap 2", "specific gap 3", "specific gap 4"] (4 specific digital gaps for this type of business in their market),
  "scopeItems": ["deliverable 1", "deliverable 2", ...] (6-8 specific scope items for the chosen package),
  "roiForecast": "2-3 sentences projecting realistic ROI for this specific business type and package",
  "guarantee": "1-2 sentences with a specific satisfaction/results guarantee"
}

Be specific to THIS business and industry. No generic filler. Return only valid JSON.`;

  const raw = await callGemini(prompt);
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
  try {
    return JSON.parse(json);
  } catch {
    return {
      executiveSummary: `Thank you for considering our team for ${businessName}'s digital growth strategy. We specialize in helping ${businessType.toLowerCase()}s in ${city} capture more local market share through strategic online presence. Based on our initial research, ${businessName} has a strong local reputation that isn't being fully reflected in your digital footprint — and that gap represents a significant opportunity.`,
      opportunityGap: [
        `Missing a conversion-optimized website in the competitive ${city} ${businessType} market`,
        `Losing local search traffic to competitors with stronger SEO`,
        `No automated system to capture leads and bookings 24/7`,
        `Under-leveraged social proof and review management`
      ],
      scopeItems: [
        "Full discovery and competitive analysis",
        "Custom design and development",
        "Mobile-first, speed-optimized build",
        "Local SEO foundation",
        "Google Business Profile optimization",
        "Contact forms and booking integration",
        "Launch and staff training session"
      ],
      roiForecast: `Based on industry benchmarks for ${businessType}s in markets like ${city}, a professional website typically pays for itself within 60–90 days through new customer acquisition. Even conservatively, capturing 2–3 new clients per month from organic search would exceed the investment within the first quarter.`,
      guarantee: `We guarantee delivery within the agreed timeline or we work for free until it's done. Your satisfaction is our only benchmark.`
    };
  }
}

export async function aiGenerateContentCalendar(
  businessType: string,
  location: string
): Promise<Array<{ day: number; platform: string; type: string; hook: string; caption: string }>> {
  const prompt = `You are a social media strategist. Create a 30-day content calendar for a ${businessType} in ${location}.

Generate 30 posts across Instagram, Facebook, and Google Business. Vary the content types: Reel, Carousel, Story, Static Post, Google Update.

Return a JSON array of 30 objects:
[
  {
    "day": 1,
    "platform": "Instagram",
    "type": "Reel",
    "hook": "attention-grabbing first line or hook",
    "caption": "full caption with hashtags"
  },
  ...
]

Make hooks specific and engaging for a ${businessType}. Return ONLY valid JSON.`;

  const raw = await callGemini(prompt);
  const arrMatch = raw.match(/\[[\s\S]*\]/)?.[0];
  if (arrMatch) {
    try {
      const parsed = JSON.parse(arrMatch);
      if (Array.isArray(parsed)) return parsed.slice(0, 30);
    } catch {}
  }
  return Array.from({ length: 12 }, (_, i) => ({
    day: i + 1,
    platform: i % 2 === 0 ? "Instagram" : "Facebook",
    type: ["Reel", "Carousel", "Story", "Static"][i % 4],
    hook: `Day ${i + 1}: Behind the scenes at your ${businessType}`,
    caption: `Sharing what makes us different. #${businessType.replace(/\s/g, "")} #${location.replace(/\s/g, "")}`
  }));
}

export async function aiGenerateSEOPlan(
  businessName: string,
  businessType: string,
  location: string
): Promise<{
  keywords: string[];
  servicePages: string[];
  blogIdeas: string[];
  gbpTips: string[];
}> {
  const prompt = `You are a local SEO expert. Create a local SEO plan for:

Business: ${businessName}
Type: ${businessType}
Location: ${location}

Return JSON:
{
  "keywords": ["keyword 1", "keyword 2", ...] (10 high-value local keywords with city),
  "servicePages": ["page title 1", ...] (6 service/landing page ideas),
  "blogIdeas": ["blog title 1", ...] (6 blog post ideas targeting local intent),
  "gbpTips": ["tip 1", ...] (5 specific Google Business Profile optimization tips)
}

Be specific to this business type and location. Return ONLY valid JSON.`;

  const raw = await callGemini(prompt);
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
  try {
    return JSON.parse(json);
  } catch {
    return {
      keywords: [`best ${businessType} in ${location}`, `${businessType} near me ${location}`, `affordable ${businessType} ${location}`],
      servicePages: ["Home", "Services", "About", "Contact", "Reviews", "Book Now"],
      blogIdeas: [`Top 5 tips for choosing a ${businessType} in ${location}`, `Why ${location} locals love ${businessName}`],
      gbpTips: ["Add 10+ photos", "Respond to all reviews", "Post weekly updates", "Add all services", "Enable messaging"]
    };
  }
}

export async function aiGenerateReviewResponse(
  businessName: string,
  businessType: string,
  reviewText: string,
  starRating: number
): Promise<string> {
  const prompt = `You are the owner of ${businessName} (${businessType}). Write a genuine, personal response to this Google review.

Review (${starRating} stars): "${reviewText}"

Rules:
- Sound human, not corporate
- If positive: express genuine gratitude, mention something specific from their review
- If negative (1-2 stars): acknowledge the issue, apologize sincerely, offer to make it right, provide contact
- Keep it under 100 words
- Don't use generic phrases like "We value your feedback"

Return ONLY the response text, nothing else.`;

  return await callGemini(prompt);
}

export async function aiAnalyzeWebsite(
  businessName: string,
  websiteUrl: string
): Promise<{
  status: string;
  score: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  conversionScore: number;
  findings: string[];
  recs: string[];
}> {
  let siteContent = "";
  if (websiteUrl && websiteUrl !== "none" && websiteUrl.length > 4) {
    const cleanUrl = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    siteContent = `Website URL: ${cleanUrl}`;
  }

  const prompt = `You are a web design expert analyzing a business website for a pitch.

Business: ${businessName}
${siteContent || "No website found for this business."}

${siteContent
  ? `Analyze this website as if you've reviewed it. Based on the URL/domain and business name, make informed assessments.`
  : `This business has NO website. Analyze the opportunity.`}

Return JSON:
{
  "status": "${siteContent ? "Outdated Website or Needs Improvement" : "No Website"}",
  "score": <overall opportunity score 0-100>,
  "uxScore": <0-100>,
  "seoScore": <0-100>,
  "mobileScore": <0-100>,
  "conversionScore": <0-100>,
  "findings": ["finding 1", "finding 2", "finding 3"] (3-4 specific findings),
  "recs": ["rec 1", "rec 2", "rec 3", "rec 4"] (4 specific recommendations for the agency to pitch)
}

Return ONLY valid JSON.`;

  const raw = await callGemini(prompt);
  const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
  try {
    return JSON.parse(json);
  } catch {
    const hasWeb = !!siteContent;
    return {
      status: hasWeb ? "Needs Improvement" : "No Website",
      score: hasWeb ? 45 : 88,
      uxScore: hasWeb ? 40 : 0,
      seoScore: hasWeb ? 35 : 0,
      mobileScore: hasWeb ? 50 : 0,
      conversionScore: hasWeb ? 30 : 0,
      findings: hasWeb
        ? ["Website may be outdated", "Mobile experience unclear", "SEO not optimized"]
        : ["No website found", "Missing from Google Search", "No online booking possible"],
      recs: ["Build modern responsive site", "Optimize for local SEO", "Add booking/contact flow", "Set up Google Business Profile"]
    };
  }
}
