import type { Lead } from "@workspace/db";

const NICHES = ["Cafe", "Restaurant", "Salon", "Gym", "Dental", "Bakery", "Barbershop", "Spa", "Florist", "Auto Repair"];
const CITIES_BY_STATE: Record<string, string[]> = {
  TX: ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth"],
  CA: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Fresno"],
  NY: ["New York", "Brooklyn", "Queens", "Buffalo", "Rochester"],
  FL: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
  IL: ["Chicago", "Naperville", "Aurora", "Rockford", "Elgin"],
};
const STATES = Object.keys(CITIES_BY_STATE);

const BUSINESS_PREFIXES = [
  "The", "Old Town", "Main Street", "Sunrise", "Corner", "Downtown", "Riverside", "Garden",
  "Golden", "Silver", "Blue Ridge", "Harbor", "Maple", "Oak", "Cedar", "Pine",
];
const BUSINESS_SUFFIXES: Record<string, string[]> = {
  Cafe: ["Cafe", "Coffee House", "Espresso Bar", "Roasters", "Coffee Co."],
  Restaurant: ["Bistro", "Kitchen", "Grill", "Eatery", "Dining"],
  Salon: ["Salon", "Hair Studio", "Beauty Bar", "Cuts & Style"],
  Gym: ["Fitness", "CrossFit", "Training Center", "Athletics", "Gym"],
  Dental: ["Dental", "Dentistry", "Dental Care", "Smiles"],
  Bakery: ["Bakery", "Bake Shop", "Patisserie", "Bread Co."],
  Barbershop: ["Barbershop", "The Barber", "Men's Grooming", "Cuts"],
  Spa: ["Spa", "Wellness", "Day Spa", "Retreat"],
  Florist: ["Flowers", "Floral Studio", "Blooms", "Florals"],
  "Auto Repair": ["Auto", "Auto Repair", "Motors", "Garage"],
};

const NAMES = [
  "Sarah", "Mike", "Jessica", "David", "Emily", "James", "Ashley", "Chris", "Amanda", "Robert",
  "Jennifer", "Michael", "Lisa", "Daniel", "Maria", "John", "Linda", "William", "Karen", "Richard",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function computeScore(data: {
  hasWebsite: boolean;
  instagramUrl?: string | null;
  reviewCount?: number | null;
  reviewRating?: number | null;
  facebookUrl?: string | null;
}): number {
  let score = 0;
  if (!data.hasWebsite) score += 40;
  if (data.instagramUrl) score += 20;
  if (data.facebookUrl) score += 10;
  if (data.reviewCount && data.reviewCount > 50) score += 20;
  if (data.reviewRating && data.reviewRating >= 4.0) score += 10;
  return Math.min(score, 100);
}

export async function generateLeads(params: {
  niche: string;
  country: string;
  state?: string | null;
  city?: string | null;
}): Promise<Array<{
  businessName: string;
  niche: string;
  city: string | null;
  state: string | null;
  country: string;
  email: string | null;
  phone: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  googleMapsUrl: string | null;
  reviewCount: number | null;
  reviewRating: number | null;
  hasWebsite: boolean;
  score: number;
  status: string;
  notes: string | null;
}>> {
  const niche = params.niche || rand(NICHES);
  const state = params.state || rand(STATES);
  const citiesForState = CITIES_BY_STATE[state] || ["Springfield", "Riverside", "Franklin", "Clinton", "Madison"];
  const city = params.city || rand(citiesForState);
  const suffixes = BUSINESS_SUFFIXES[niche] || [niche];
  const count = randInt(5, 12);
  const results = [];

  for (let i = 0; i < count; i++) {
    const hasWebsite = Math.random() < 0.25;
    const hasInstagram = Math.random() < 0.65;
    const hasFacebook = Math.random() < 0.5;
    const reviewCount = Math.random() < 0.8 ? randInt(12, 480) : null;
    const reviewRating = reviewCount ? Math.round((3.5 + Math.random() * 1.5) * 10) / 10 : null;
    const prefix = Math.random() > 0.5 ? rand(BUSINESS_PREFIXES) + " " : "";
    const suffix = rand(suffixes);
    const businessName = `${prefix}${suffix}`;
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = rand(NAMES);
    const email = Math.random() < 0.6 ? `${name.toLowerCase()}@${slug}.com` : null;
    const phone = Math.random() < 0.7 ? `(${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}` : null;

    const leadData = {
      businessName,
      niche,
      city,
      state,
      country: params.country,
      email,
      phone,
      instagramUrl: hasInstagram ? `https://instagram.com/${slug}` : null,
      facebookUrl: hasFacebook ? `https://facebook.com/${slug}` : null,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(`${businessName} ${city} ${state}`)}`,
      reviewCount,
      reviewRating,
      hasWebsite,
      status: "new",
      notes: null,
    };

    const score = computeScore(leadData);
    if (score < 40) continue;

    results.push({ ...leadData, score });
  }

  return results;
}

export async function generateAudit(lead: Lead): Promise<{
  summary: string;
  problems: string[];
  opportunity: string;
  score: number;
}> {
  const problems: string[] = [];

  if (!lead.hasWebsite) {
    problems.push("No website — customers can't find you on Google Search");
    problems.push("Missing out on online bookings and orders");
  }
  if (!lead.instagramUrl) {
    problems.push("No Instagram presence — limited social proof");
  }
  if (lead.reviewCount && lead.reviewCount > 100 && !lead.hasWebsite) {
    problems.push(`${lead.reviewCount} reviews but no way for customers to book online`);
  }
  if (!lead.phone) {
    problems.push("No phone number found — hard for customers to reach you");
  }
  if (lead.reviewRating && lead.reviewRating < 4.0) {
    problems.push("Below-average review rating may be hurting foot traffic");
  }

  if (problems.length === 0) {
    problems.push("Limited online visibility compared to competitors");
    problems.push("No centralized hub for menus, hours, and booking");
  }

  const reviewText = lead.reviewCount
    ? `With ${lead.reviewCount} reviews${lead.reviewRating ? ` (${lead.reviewRating} stars)` : ""}, `
    : "";

  const summary = `${lead.businessName} is a ${lead.niche.toLowerCase()} based in ${lead.city ?? lead.country}. ${reviewText}this business has an established local reputation but lacks a professional online presence. ${lead.instagramUrl ? "They have an Instagram account showing active community engagement." : "They have limited social media activity."} A dedicated website would consolidate their online presence and enable direct customer actions.`;

  const potentialValue = lead.reviewCount && lead.reviewCount > 100 ? "very high" : lead.reviewCount && lead.reviewCount > 30 ? "high" : "moderate";

  const opportunity = `Website opportunity value: ${potentialValue}. A simple 5-page site with menu/services, online booking, contact form, and Google Maps integration could significantly increase monthly revenue. Estimated website value: $1,200–$3,500. Ongoing maintenance retainer potential: $150–$400/month.`;

  const score = Math.min(
    (lead.score || 0) + (lead.reviewCount && lead.reviewCount > 50 ? 5 : 0) + (!lead.hasWebsite ? 10 : 0),
    100
  );

  return { summary, problems, opportunity, score };
}

export async function generateEmail(lead: Lead, followUpNumber: number = 0): Promise<{
  subject: string;
  body: string;
}> {
  const ownerName = rand(NAMES);
  const city = lead.city ?? lead.country;
  const niche = lead.niche.toLowerCase();

  if (followUpNumber === 0) {
    const subject = `Quick idea for ${lead.businessName} — more customers online`;
    const body = `Hi ${ownerName},

I came across ${lead.businessName} in ${city} and I have to say — ${lead.reviewCount ? `with ${lead.reviewCount} reviews, ` : ""}you've clearly built something people love.

I noticed you don't currently have a dedicated website. In today's market, most customers search Google before visiting any ${niche}, and without a website, you're likely missing 20–30% of potential new customers who simply can't find you.

I specialize in building fast, affordable websites for ${niche}s like yours — typically in under 2 weeks.

What I'd include:
• Your menu / services page
• Online booking or reservation link
• Contact form + Google Maps
• Mobile-optimized design

Would you be open to a quick 15-minute call this week? I'd love to show you a rough mockup I've already put together for ${lead.businessName}.

No commitment — just a conversation.

Best,
[Your Name]
[Your Phone]`;
    return { subject, body };
  }

  if (followUpNumber === 1) {
    const subject = `Following up — ${lead.businessName}`;
    const body = `Hi ${ownerName},

I wanted to follow up on my message from a few days ago about building a website for ${lead.businessName}.

I understand you're busy running the ${niche} — that's exactly why I try to make the process as easy as possible. Most of my clients spend less than 2 hours total on the entire project.

If you're curious, I can send over a quick mock of what your site could look like — completely free, no strings attached.

Would that be helpful?

Best,
[Your Name]`;
    return { subject, body };
  }

  const subject = `Last note — ${lead.businessName} website`;
  const body = `Hi ${ownerName},

I'll keep this short — I sent a couple of notes about creating a website for ${lead.businessName} and I don't want to be a nuisance.

If the timing isn't right, no worries at all. If you ever decide to get a website down the road, feel free to reach out.

Wishing you a great season at the ${niche}!

Best,
[Your Name]`;
  return { subject, body };
}
