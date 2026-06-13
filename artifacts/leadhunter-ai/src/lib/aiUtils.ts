import { Lead } from "./storage";

export const generateLeadScore = (hasWebsite: boolean): number => {
  return hasWebsite ? Math.floor(10 + Math.random() * 30) : Math.floor(60 + Math.random() * 30);
};

export const generateBusinessAnalysis = (name: string, type: string, location: string) => {
  return {
    summary: `${name} is a ${type} located in ${location}. They appear to have good local foot traffic but are missing significant digital opportunities.`,
    websiteOpportunity: "Without a modern website, they are likely missing out on 40% of potential local searches.",
    seoOpportunity: "Their Google Business profile is unclaimed or under-optimized.",
    orderingOpportunity: "Implementing a direct online booking or ordering system could increase their revenue.",
    score: Math.floor(65 + Math.random() * 25)
  };
};

// ─── Outreach Generators ────────────────────────────────────────────────────

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function buildEmail(name: string, type: string, location: string, tone: string, length: string, variant: number): string {
  const subjectMap: Record<string, string[]> = {
    friendly: [`Hey ${name} — quick thought 👋`, `Noticed something about ${name}`, `A little idea for ${name} ✨`],
    professional: [`Digital growth opportunity for ${name}`, `${name} — a quick observation`, `Re: ${name}'s online presence`],
    direct: [`${name} is losing customers online`, `Your competitors are eating your lunch`, `Blunt truth about ${name}'s website`],
    premium: [`An exclusive opportunity for ${name}`, `I put together something for ${name}`, `${name} — a confidential note`],
  };
  const subject = (subjectMap[tone] || subjectMap.professional)[variant % 3];

  const hooks: Record<string, string[]> = {
    friendly: [
      `I was actually searching for a ${type} in ${location} the other day and came across ${name}. You guys have great reviews — but I couldn't find a website!`,
      `I love what ${name} is doing in ${location}. Seriously good reputation. But when I tried to find your website to book, I hit a dead end.`,
      `Hey! I work with local ${type}s in ${location} and I noticed ${name} doesn't have a website yet. Given how great your reviews are, that's honestly a shame!`,
    ],
    professional: [
      `I came across ${name} while researching ${type}s in ${location}. While your business has clearly built a strong reputation, I noticed the absence of a dedicated website.`,
      `During a recent analysis of the ${type} market in ${location}, ${name} stood out — both for its strong review profile and for a significant gap in its digital presence.`,
      `I specialize in helping local ${type}s in ${location} establish a compelling online presence, and I believe ${name} represents a particularly strong opportunity.`,
    ],
    direct: [
      `${name} doesn't have a website. Every day, potential customers in ${location} search online, land on a competitor, and never even hear your name.`,
      `People search "${type} in ${location}" 1,000+ times a month. Without a website, ${name} doesn't exist to those people.`,
      `Your competitors have websites. You don't. That gap costs ${name} real money every single month.`,
    ],
    premium: [
      `I came across ${name} while researching the most respected ${type}s in ${location}, and your reputation is exceptional. That's precisely why I'm reaching out.`,
      `I only work with a handful of businesses per quarter — and ${name} is exactly the kind of brand I believe in. Your reviews and reputation are genuinely impressive.`,
      `I've been following ${name}'s growth in ${location}, and I believe you're significantly underrepresented online for the quality you offer.`,
    ],
  };

  const ctaMap: Record<string, string[]> = {
    friendly: [
      `Would love to show you a free mockup of what ${name}'s site could look like. No pressure, no cost — just a fun idea. Interested? 😊`,
      `I'd love to put together a quick demo site for you — takes me a day and it's totally free to see. Want me to send it over?`,
      `Can I send you a 2-minute video walkthrough of what I'm thinking? Zero commitment, just a cool concept.`,
    ],
    professional: [
      `I'd welcome the opportunity to share a brief concept I've developed for ${name}. Would a 10-minute call this week be feasible?`,
      `I've prepared an initial mockup based on ${name}'s niche and competitor landscape. I'd love to share it — would you be open to a brief call?`,
      `I'm happy to put together a no-obligation site concept for ${name} to review. When would be a good time to connect?`,
    ],
    direct: [
      `I can have a working mockup ready in 24 hours. Want to see it — yes or no?`,
      `I'll build a free demo page for ${name} right now. If you like it, we talk. If not, no hard feelings. Deal?`,
      `Takes me one day to show you what ${name}'s site could look like. Should I send it?`,
    ],
    premium: [
      `I'd like to share a preliminary concept I've put together — exclusively for ${name}. Would you be open to a brief confidential discussion?`,
      `I've reserved space in my schedule for a project of this caliber. Would a private 15-minute call work this week?`,
      `I'll have a premium concept ready within 48 hours — tailored specifically to ${name}'s brand. Would you like to review it?`,
    ],
  };

  const body = (hooks[tone] || hooks.professional)[variant % 3];
  const cta = (ctaMap[tone] || ctaMap.professional)[variant % 3];

  if (length === 'short') {
    return `Subject: ${subject}\n\n${body}\n\n${cta}`;
  }

  const middleMap: Record<string, string> = {
    friendly: `I've helped a bunch of ${type}s in the area go from zero online presence to booked-out calendars — and it honestly doesn't have to be complicated or expensive.`,
    professional: `I work exclusively with local service businesses to build conversion-optimized websites that generate inbound leads. The results for ${type}s in ${location} have been consistently strong.`,
    direct: `I've built sites for ${type}s across ${location} — most start getting calls within 2 weeks of going live. The process is fast, affordable, and completely risk-free.`,
    premium: `My work focuses exclusively on premium local businesses — those with genuine quality that simply isn't reflected in their current digital presence. The results speak for themselves.`,
  };

  const middle = middleMap[tone] || middleMap.professional;

  if (length === 'medium') {
    return `Subject: ${subject}\n\n${body}\n\n${middle}\n\n${cta}`;
  }

  // long
  const detailMap: Record<string, string> = {
    friendly: `Here's what I'm thinking: a clean, mobile-friendly site with your menu/services, contact info, a gallery, and a booking button. Something that actually shows off how good ${name} is. I can have a mockup ready in a day — just to show you the vibe.`,
    professional: `Specifically, I would develop a mobile-optimized, SEO-ready website tailored to the ${type} market in ${location}. This would include a Google Business optimization, a conversion-focused home page, and an integrated contact/booking flow. Timeline: 2 weeks from agreement to launch.`,
    direct: `Here's what happens: I build a mockup in 24 hours. You review it. If you like it, we move forward for a flat fee with a clear timeline. No retainers, no surprises. The site goes live in 2 weeks.`,
    premium: `What I propose is a bespoke, hand-crafted digital experience that matches the quality and reputation ${name} has built offline. This is not a template — it's a fully custom design, built specifically for your brand, your clientele, and your market position in ${location}.`,
  };

  const detail = detailMap[tone] || detailMap.professional;

  return `Subject: ${subject}\n\n${body}\n\n${middle}\n\n${detail}\n\n${cta}`;
}

function buildDM(name: string, type: string, tone: string, length: string, variant: number, platform: string): string {
  const short = {
    friendly: [
      `Hey ${name}! Love your content 🙌 Noticed you don't have a website link in your bio — I build sites for ${type}s and yours would be 🔥. DM me if you're curious!`,
      `Hi ${name}! Your ${type} posts are great. Quick question — have you thought about getting a website? I could set one up in a few days. Happy to show you a free mockup!`,
    ],
    professional: [
      `Hello ${name}, I noticed your active ${platform} presence but no dedicated website. I help ${type}s establish a professional online presence — would you be open to a brief conversation?`,
      `Hi ${name}, I work with ${type}s to build websites that convert followers into customers. I'd love to share a concept for your brand. Interested?`,
    ],
    direct: [
      `${name} — no website + great reviews = money left on the table. I fix that. Interested?`,
      `Hey ${name}. Your ${platform} looks solid but no website means you're invisible on Google. I can fix that in 2 weeks. Want to see a mockup?`,
    ],
    premium: [
      `Hi ${name} — I came across your ${platform} and was genuinely impressed by what ${name} is building. I create premium websites for brands like yours. Would you be open to a quick chat?`,
      `Hello ${name}. Your brand has a lot of potential that isn't being captured online. I'd love to show you what a proper digital presence could look like for ${name}.`,
    ],
  };

  const variants = (short[tone as keyof typeof short] || short.professional);
  const msg = variants[variant % variants.length];

  if (length === 'short') return msg;
  if (length === 'medium') return msg + ` I've helped other ${type}s in the area grow their bookings significantly with a simple, well-designed site. Takes about 2 weeks start to finish.`;
  return msg + ` I've helped other ${type}s in the area grow their bookings significantly with a simple, well-designed site. Takes about 2 weeks start to finish. I'd put together a free mockup for ${name} — no strings attached — just so you can see what's possible. Let me know!`;
}

export const generateColdEmail = (name: string, type: string, location: string, tone: string, length: string): string => {
  return buildEmail(name, type, location, tone, length, Math.floor(Math.random() * 3));
};

export const generateColdEmailVariants = (name: string, type: string, location: string, tone: string, length: string): string[] => {
  return [
    buildEmail(name, type, location, tone, length, 0),
    buildEmail(name, type, location, tone, length, 1),
    buildEmail(name, type, location, tone, length, 2),
  ];
};

export const generateInstagramDM = (name: string, type: string, tone: string, length: string): string => {
  return buildDM(name, type, tone, length, Math.floor(Math.random() * 2), 'Instagram');
};

export const generateInstagramDMVariants = (name: string, type: string, tone: string, length: string): string[] => {
  return [0, 1, 2].map(i => buildDM(name, type, tone, length, i, 'Instagram'));
};

export const generateFacebookMessage = (name: string, type: string, tone: string, length: string): string => {
  return buildDM(name, type, tone, length, Math.floor(Math.random() * 2), 'Facebook');
};

export const generateFacebookMessageVariants = (name: string, type: string, tone: string, length: string): string[] => {
  return [0, 1, 2].map(i => buildDM(name, type, tone, length, i, 'Facebook'));
};

export const generateWhatsAppMessage = (name: string, type: string, tone: string, length: string): string => {
  return buildDM(name, type, tone, length, Math.floor(Math.random() * 2), 'WhatsApp');
};

export const generateWhatsAppMessageVariants = (name: string, type: string, tone: string, length: string): string[] => {
  return [0, 1, 2].map(i => buildDM(name, type, tone, length, i, 'WhatsApp'));
};

export const generateAllVariants = (name: string, type: string, location: string, channel: string, tone: string, length: string): string[] => {
  switch (channel) {
    case 'email': return generateColdEmailVariants(name, type, location, tone, length);
    case 'instagram': return generateInstagramDMVariants(name, type, tone, length);
    case 'facebook': return generateFacebookMessageVariants(name, type, tone, length);
    case 'whatsapp': return generateWhatsAppMessageVariants(name, type, tone, length);
    default: return generateColdEmailVariants(name, type, location, tone, length);
  }
};

// ─── Conversation AI ─────────────────────────────────────────────────────────

export const generateConversationReply = (
  leadName: string,
  businessType: string,
  channel: string,
  conversationHistory: Array<{role: string, content: string}>,
  prospectReply: string
): { message: string, reasoning: string } => {
  const r = prospectReply.toLowerCase().trim();
  const isEmail = channel === 'email';
  const msgCount = conversationHistory.filter(m => m.role === 'received').length;
  const isEarlyStage = msgCount <= 1;
  
  // Detect sentiment & intent from what they actually wrote
  const isPositive = /yes|sure|interested|tell me more|sounds good|love to|definitely|let's|show me|send it|go ahead|when|how|ok|great|perfect|would love|happy to|excited/i.test(r);
  const isNegative = /not interested|no thanks|don't need|don t need|no thank|pass|stop|remove|unsubscribe|leave me alone|busy|not now|go away/i.test(r);
  const isPriceQuestion = /how much|price|cost|what.*charge|fee|rates?|afford|expensive|cheap|budget|quote/i.test(r);
  const isAlreadyHasOne = /already have|have a website|working with|use someone|got someone|have someone|have an agency|have a developer/i.test(r);
  const isBusyObjn = /too busy|no time|not the right time|bad timing|maybe later|later|not right now/i.test(r);
  const isSkeptical = /how do i know|proof|results|examples|portfolio|guarantee|worked before|doesn't work|don't believe|scam|why should|who are you/i.test(r);
  const isAskingHowItWorks = /how does|how would|how do you|what's the process|what's involved|what do you|how long|timeline|what happens|walk me through/i.test(r);

  if (isPositive) {
    const options = [
      {
        message: isEmail
          ? `That's great to hear! Here's what I'd suggest as a next step — let me put together a free mockup of what ${leadName}'s site could look like based on your niche and the top competitors in your area. It takes me about a day, and it'll give you something concrete to react to rather than just a sales pitch.\n\nDoes that sound fair? If so, can you confirm the best email to send it to?`
          : `Awesome! Let me put together a quick mockup for ${leadName} — gives you something real to look at rather than me just talking about it. Takes about a day. Should I send it over here or do you have an email?`,
        reasoning: "Interest confirmed — moving to demo mockup to keep momentum."
      },
      {
        message: isEmail
          ? `Excellent — really glad to hear that. Let me suggest we skip the long back-and-forth and just get on a quick 15-minute call. I'll show you a live mockup of what ${leadName}'s website could look like, we'll see if it's a fit, and if not — no hard feelings at all.\n\nWhat does your schedule look like this week? I'm flexible.`
          : `Love it! Let's keep it simple — I'll set up a quick 15-min call and show you the concept live. I hate wasting people's time so I'll make it worth yours. What day works?`,
        reasoning: "Steering toward a call to show momentum and close faster."
      },
      {
        message: isEmail
          ? `Awesome, really appreciated. Before I dive in — can I ask you one quick question? What's the #1 thing you wish more customers knew about ${leadName} when they're searching for a ${businessType} in your area? That'll help me build something that actually speaks to your ideal clients, not just a generic site.`
          : `Nice! Quick question before I start — what's the one thing you'd want new customers to know about ${leadName}? That'll shape the mockup so it actually converts, not just looks pretty.`,
        reasoning: "Asking a qualifying question to deepen engagement and personalize the next step."
      },
    ];
    return pick(options);
  }

  if (isNegative) {
    const options = [
      {
        message: isEmail
          ? `Completely understood, and I appreciate you taking the time to respond — that means a lot. I won't bother you again.\n\nOne last thought before I go: ${leadName} has some genuinely strong reviews. That kind of reputation is rare, and it deserves to be seen by more people. If you ever want to talk about that, my door is always open. Wishing you a great season ahead.`
          : `Totally understood! No hard feelings at all. If things ever change or you want to chat about growing ${leadName}'s online presence down the road, you know where to find me. Wishing you all the best! 🙌`,
        reasoning: "Graceful exit — genuine, not pushy. Leaves a positive impression for future."
      },
      {
        message: isEmail
          ? `Fair enough — and I genuinely respect the direct answer. I'll leave you to it.\n\nOnly thing I'd say: the ${businessType} market in your area is moving fast online. If that ever becomes a concern, even a year from now, feel free to reach back out. No pitch, just a conversation. Take care!`
          : `Got it, no worries! Just keep in mind that if ${leadName} ever wants to get more clients from Google or social, the offer stands. Wishing you a great one! 👋`,
        reasoning: "Planting a seed for the future without any pressure."
      },
    ];
    return pick(options);
  }

  if (isPriceQuestion) {
    const options = [
      {
        message: isEmail
          ? `Good question, and I'll be straight with you — pricing depends on what ${leadName} actually needs, not a one-size-fits-all package.\n\nFor most ${businessType}s, a clean professional website runs between $1,200–$2,500. That's a one-time build, not a monthly subscription. Monthly SEO or ads are separate if you want them.\n\nHonestly, the best thing I can do is build you a free mockup first — that way you can see exactly what you're getting before any money changes hands. Does that sound reasonable?`
          : `Great question! It really depends on what ${leadName} needs, but most ${businessType}s are looking at $1,200–$2,500 for a solid website. One-time cost.\n\nBefore any of that — let me just build you a free mockup so you can see what it'd look like. Zero cost, zero obligation. Then we can talk numbers if you like what you see. Sound good?`,
        reasoning: "Giving a real price range with context, then pivoting to mockup to reduce price friction."
      },
      {
        message: isEmail
          ? `Happy to talk numbers! Here's how I think about it: a website for ${leadName} is a one-time investment that keeps working 24/7. If it brings in even 1–2 new customers a month, it typically pays for itself within 60–90 days.\n\nMost projects in the $1,500–$3,000 range. But I'd love to put a free concept together first — that way you know exactly what you're getting. What do you think?`
          : `Sure! Most sites I build are $1,500–$2,500 one-time. No monthly fees unless you want SEO or ads.\n\nBut honestly — let me show you the mockup first. If you like what you see, we talk. If not, it's free and you've lost nothing. Want me to put it together?`,
        reasoning: "Anchoring price with ROI framing, then reducing risk with the free mockup offer."
      },
    ];
    return pick(options);
  }

  if (isAlreadyHasOne) {
    const options = [
      {
        message: isEmail
          ? `That's actually great — it means you already understand the value of being online. Can I ask: are you happy with the leads or bookings it's currently generating?\n\nThe reason I ask is that a lot of sites look good but don't actually convert visitors into customers. I do a completely free audit — takes about 10 minutes — and I'll tell you honestly if what you have is working or if there's room to improve. No pitch, just a second opinion. Interested?`
          : `That's good to know! Quick question — are you happy with the leads it's bringing in? I do a free 10-min audit and just tell you honestly what's working and what isn't. No pitch involved. Want me to take a quick look?`,
        reasoning: "Pivoting from selling to auditing — a lower-friction offer that still creates an opening."
      },
      {
        message: isEmail
          ? `Ah, fair enough — already a step ahead! Most ${businessType}s I work with still have gaps though, especially around local SEO and mobile conversions.\n\nI won't try to replace what you have. But if you're ever curious whether it's performing as well as it could, I'd genuinely enjoy giving you a no-strings audit. Some of my best clients came from 'I already have someone' — they just wanted a second set of eyes.`
          : `Got it! If you ever want a second opinion on how it's performing for local search and mobile — happy to take a quick look for free. No obligation. Just curious to see what's working for you.`,
        reasoning: "Acknowledging their current setup while planting the seed for an audit/improvement."
      },
    ];
    return pick(options);
  }

  if (isBusyObjn) {
    const options = [
      {
        message: isEmail
          ? `Completely understand — running a ${businessType} leaves you with zero time for extras. I'll make this as easy as possible: you don't have to do anything.\n\nI'll put together a free mockup of ${leadName}'s potential site on my own, send it to you in a couple of days, and you can look at it whenever you have 2 minutes. No call needed yet, no commitment. Does that work?`
          : `Makes total sense — you're running a ${businessType}, not a marketing department! Here's what I'll do: I'll put together a quick concept for ${leadName} on my end and just send it when it's ready. You look at it when you have 5 minutes. No pressure. Sound OK?`,
        reasoning: "Removing all friction — offering to do the work unilaterally so 'busy' isn't a blocker."
      },
      {
        message: isEmail
          ? `Totally get it — this time of year is non-stop for ${businessType}s. I'll keep this short: I'll check back in 3 weeks when things might have settled a bit. In the meantime, if anything changes or you get a quiet moment, feel free to reach out anytime.\n\nHope the rest of the season goes brilliantly for ${leadName}!`
          : `No worries at all — I'll circle back in a few weeks when things settle. If you ever get a spare 5 minutes and want to see what I'm thinking for ${leadName}, just drop me a message! 😊`,
        reasoning: "Respecting their time and scheduling a soft follow-up, keeping the door open."
      },
    ];
    return pick(options);
  }

  if (isSkeptical) {
    const options = [
      {
        message: isEmail
          ? `Fair skepticism — I'd rather earn your trust than ask for it.\n\nHere's what I'll do: I'll build a free mockup of ${leadName}'s potential website — no templates, something actually tailored to your business. You get to see the real work before spending a single dollar. If it impresses you, we talk. If not, you've lost nothing and I've learned something.\n\nThat's as low-risk as it gets. Want me to get started?`
          : `Totally fair — you don't know me yet! How about this: I'll build a free demo page for ${leadName} right now. You see the actual work before any conversation about money. If it's good, great. If not, no hard feelings. Want me to do it?`,
        reasoning: "Addressing skepticism by offering proof before any commitment — the demo does the selling."
      },
      {
        message: isEmail
          ? `No worries — healthy skepticism is smart in business. I can share a couple of recent examples of sites I've built for ${businessType}s if that helps build some context.\n\nBut honestly, the best proof I can give you is a free mockup built specifically for ${leadName}. That way you're not looking at someone else's site — you're looking at yours. Want me to put that together?`
          : `That's a fair point! I can show you some recent work if it helps. But the best proof is seeing what I'd do for ${leadName} specifically — that's free and takes me a day. Want me to put it together?`,
        reasoning: "Offering social proof and a custom demo to overcome trust barriers."
      },
    ];
    return pick(options);
  }

  if (isAskingHowItWorks) {
    const options = [
      {
        message: isEmail
          ? `Great question — here's the simple version:\n\n1. I build a free mockup of ${leadName}'s site (takes about a day, no cost to you)\n2. You review it and give feedback\n3. If you like it, we agree on a flat-fee price and I build the real thing\n4. You get a live website in about 2 weeks — mobile-friendly, fast, and SEO-ready\n\nNo retainers, no monthly fees unless you want ongoing SEO. Does that sound like what you're looking for?`
          : `Simple version:\n1️⃣ I build a free mockup for ${leadName} (1 day, no cost)\n2️⃣ You review and give feedback\n3️⃣ If you love it, we agree on a price and build the real thing\n4️⃣ Live site in ~2 weeks\n\nNo hidden fees. Want me to start the mockup?`,
        reasoning: "Clear numbered process removes ambiguity and makes it easy to say yes."
      },
      {
        message: isEmail
          ? `Happy to walk you through it! The process is designed to be as simple as possible for you.\n\nI do all the heavy lifting — research, design, copywriting. All I need from you is about 30 minutes of your time across the whole project: a quick call to understand what you need, and a final review. Everything else, I handle.\n\nMost ${businessType}s are live within 2 weeks. Want to start with a free mockup so you can see the style before committing?`
          : `Super easy on your end! I handle everything — design, copy, setup. You just review and approve. Usually 2 weeks start to finish.\n\nWant me to put together a free mockup so you can see the vibe first?`,
        reasoning: "Emphasizing simplicity and minimal time investment from them."
      },
    ];
    return pick(options);
  }

  // Generic / unclear reply — context-aware fallback
  const genericOptions = [
    {
      message: isEmail
        ? `Thanks for getting back to me! Based on what you've shared, here's what I think the quick win for ${leadName} is: getting you properly visible in local searches — especially on mobile, where most people search for a ${businessType}.\n\nI'd love to put together a free mockup so you can actually see what I'm envisioning. It's the easiest way to make this concrete. Does that work?`
        : `Thanks for the reply! I think the biggest quick win for ${leadName} would be getting you visible in local ${businessType} searches on Google. Want me to put a free mockup together to show you what I mean? No cost, no strings.`,
      reasoning: "Keeping it light and relevant — looping back to a concrete next step."
    },
    {
      message: isEmail
        ? `Appreciate you writing back. I'll cut straight to the point: I think ${leadName} is leaving real money on the table by not having a proper online presence, given how strong your reputation already is.\n\nThe easiest way to show you what I mean — without any back-and-forth — is a free mockup. I can have one ready in 24 hours. Want me to put it together?`
        : `Hey, thanks for getting back! I genuinely think ${leadName} has a lot of untapped potential online. Mind if I put together a quick free mockup — just to show you what's possible? It takes me a day and costs you nothing.`,
      reasoning: "Direct and action-oriented — pushing toward the demo to close the loop."
    },
    {
      message: isEmail
        ? `Thanks for responding — I appreciate it. Here's where I'd love to take this next: instead of more emails back and forth, can I just build you a free concept for ${leadName}'s website? You review it on your own time, no pressure, and we go from there.\n\nIt's the fastest way to see if we're a fit. What do you think?`
        : `Thanks for getting back! Can I just build a free concept for ${leadName}? You check it out on your own time. Easiest way to see if this makes sense for you. OK to send it?`,
      reasoning: "Proposing a concrete next step to move out of email purgatory."
    },
  ];
  return pick(genericOptions);
};

// ─── Sales Intelligence ───────────────────────────────────────────────────────

export const generateSalesPitcherBrief = (lead: Lead): string => {
  const missingFeatures = [];
  if (!lead.hasWebsite) missingFeatures.push("no website");
  if (!lead.email) missingFeatures.push("no professional email");
  if (!lead.instagram && !lead.facebook) missingFeatures.push("limited social media presence");
  const missingString = missingFeatures.length > 0 ? missingFeatures.join(", ") : "an outdated online presence";
  return `${lead.businessName} has been operating since ${lead.yearEstablished} with ${lead.rating} stars but has ${missingString}. Their ${lead.reviewCount} Google reviews show customers love them, but they are likely losing potential traffic to competitors. You have a clear opening to offer digital marketing services tailored for a ${lead.category}.`;
};

export const generateRevenueOpportunity = (lead: Lead) => {
  const visitors = lead.hasWebsite ? Math.floor(Math.random() * 200 + 100) : Math.floor(Math.random() * 500 + 300);
  const revenue = visitors * 15;
  const seo = Math.floor(Math.random() * 800 + 200);
  const social = Math.floor(Math.random() * 1500 + 500);
  return {
    lostTraffic: `~${visitors} potential visitors/month missing`,
    missedRevenue: `~$${revenue.toLocaleString()}/month in online revenue not captured`,
    seoGap: `Competitors capturing ${seo}+ local searches you're missing`,
    socialReach: `~${social.toLocaleString()} potential customers not reached monthly`,
    totalOpportunity: revenue + (seo * 5),
    agencyValue: Math.floor((revenue + (seo * 5)) * 0.1)
  };
};

export const generateFollowUpSequence = (leadName: string, businessType: string, channel: string, initialMessage: string) => {
  return [
    { day: 3, subject: `Checking in — ${leadName}`, content: `Hey! Just wanted to make sure my last message didn't get buried. I'd genuinely love to show ${leadName} what a site could look like — it's free to see and takes me a day to put together. Worth a look?` },
    { day: 7, subject: `A quick win I spotted for ${leadName}`, content: `I was doing some research and noticed that when people search "${businessType} near me" in your area, a few competitors are showing up with websites and you're not. I can fix that. Would it be worth a 10-minute call?` },
    { day: 14, subject: `How other ${businessType}s in your area are getting more customers`, content: `I recently helped another local ${businessType} go from no online presence to ranking in Google Maps within 45 days. Their bookings went up noticeably in the first month. I think the same thing is possible for ${leadName} — want me to walk you through it?` },
    { day: 30, subject: `Last message from me, ${leadName}`, content: `I've reached out a few times now and haven't heard back, so I'll leave you to it — I know running a ${businessType} keeps you busy. If the timing is ever right to talk about getting ${leadName} more visible online, I'm still here. Wishing you a fantastic season ahead!` }
  ];
};

export const generateBattleCard = (lead: Lead) => {
  const cat = (lead.category || '').toLowerCase();
  let bestHook = '';
  if ((lead.reviewCount || 0) > 100 && !lead.hasWebsite) {
    bestHook = `You have ${lead.reviewCount} glowing reviews but no website — that means hundreds of customers found you on Google but had nowhere to go next.`;
  } else if (!lead.hasWebsite) {
    bestHook = `Every competitor in ${lead.city} showing up on Google right now has a website. You're invisible to ~${lead.score || 70}% of people searching online.`;
  } else {
    bestHook = `Your site has significant SEO gaps — competitors are capturing searches for "${lead.category} in ${lead.city}" that should belong to you.`;
  }
  let bestOffer = '';
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('pizza')) {
    bestOffer = '5-page website + online ordering system + Google Business optimization — fully delivered in 2 weeks.';
  } else if (cat.includes('dentist') || cat.includes('doctor') || cat.includes('medical') || cat.includes('clinic')) {
    bestOffer = 'Google Ads campaign targeting local high-intent patients + a dedicated booking landing page.';
  } else if (cat.includes('gym') || cat.includes('fitness') || cat.includes('yoga')) {
    bestOffer = 'Lead generation funnel + 30-day Reels content strategy — fill your classes without paid ads.';
  } else if (cat.includes('clothing') || cat.includes('boutique') || cat.includes('fashion')) {
    bestOffer = 'Shopify e-commerce store + Instagram ad campaign — sell nationwide, not just locally.';
  } else {
    bestOffer = 'Professional website + Local SEO package — appear in Google Maps top 3 within 60 days.';
  }
  const objectionPool = [
    { objection: '"I\'m already busy enough, I don\'t need more clients."', response: `Exactly — a website automates your lead intake so you stop missing calls. It works while you work, and you control the flow.` },
    { objection: '"I\'ve tried online marketing before, it didn\'t work."', response: `Most failed campaigns target too broadly. We focus hyper-locally on people already searching for ${lead.category}s in ${lead.city} — high intent, ready to buy.` },
    { objection: '"It\'s too expensive right now."', response: `We offer flexible payment plans. The site pays for itself the moment it books a single new client — typically in week one.` },
    { objection: '"My customers find me through word of mouth."', response: `Word of mouth is gold, but what happens when their friend searches for you online and finds a competitor instead? Your reviews deserve a home.` },
  ];
  const score = lead.score || 65;
  const objection = objectionPool[Math.abs(Math.floor(score * objectionPool.length / 100)) % objectionPool.length];
  let tier = 'Starter'; let recommendedPrice = '$1,200 – $2,000';
  if (score > 80) { tier = 'Agency Package'; recommendedPrice = '$3,500 – $5,000/mo'; }
  else if (score > 60) { tier = 'Growth Bundle'; recommendedPrice = '$2,500 – $3,500'; }
  else if (score > 40) { tier = 'Professional Site'; recommendedPrice = '$1,500 – $2,500'; }
  const closeProbability = lead.hasWebsite ? Math.min(45 + Math.floor(score / 5), 68) : Math.min(55 + Math.floor(score / 4), 87);
  return { bestHook, bestOffer, objection, recommendedPrice, tier, closeProbability };
};

export const generateOpportunityItems = (lead: Lead) => {
  const items: { problem: string; action: string; rank: 'easy' | 'medium' | 'high'; effort: string; impact: string }[] = [];
  if (!lead.hasWebsite) items.push({ problem: 'No website detected', action: 'Build a 5-page professional site with contact form', rank: 'high', effort: 'Easy Win', impact: 'Critical' });
  items.push({ problem: 'Google Business Profile under-optimized', action: 'Claim, verify and fully optimize GBP listing', rank: 'easy', effort: 'Easy Win', impact: 'High' });
  if (!lead.email) items.push({ problem: 'No professional email found', action: 'Set up professional email (e.g. info@business.com)', rank: 'easy', effort: 'Easy Win', impact: 'Medium' });
  if ((lead.seoScore || 0) < 60) items.push({ problem: `Low SEO score (${lead.seoScore || 0}/100)`, action: 'Local keyword optimization + on-page SEO fixes', rank: 'medium', effort: 'Medium Win', impact: 'High' });
  if (!lead.instagram || (lead.socialScore || 0) < 50) items.push({ problem: 'Weak or missing social media presence', action: 'Launch consistent content strategy + Reels posting', rank: 'medium', effort: 'Medium Win', impact: 'Medium' });
  items.push({ problem: 'No online booking or contact form', action: 'Add a booking widget or Calendly integration', rank: 'easy', effort: 'Easy Win', impact: 'High' });
  if ((lead.reviewCount || 0) < 50) items.push({ problem: `Only ${lead.reviewCount || 0} reviews — competitors have 200+`, action: 'Launch automated review collection via SMS/email', rank: 'medium', effort: 'Medium Win', impact: 'Medium' });
  items.push({ problem: 'No lead capture funnel or email list', action: 'Build a lead magnet landing page + email sequence', rank: 'high', effort: 'High Value', impact: 'High' });
  items.push({ problem: 'No paid traffic strategy in place', action: 'Launch targeted Google Ads or Meta Ads campaign', rank: 'high', effort: 'High Value', impact: 'Very High' });
  if (!lead.hasWebsite) items.push({ problem: 'Missing call-to-action on all platforms', action: 'Add "Book Now" or "Call Us" buttons everywhere', rank: 'easy', effort: 'Easy Win', impact: 'Medium' });
  return items.slice(0, 10);
};

export const generateServiceRecommendation = (lead: Lead) => {
  const cat = (lead.category || '').toLowerCase();
  let primary: { service: string; price: string; why: string }[] = [];
  let secondary: string[] = [];
  let avoid = '';
  let pitch = '';

  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('pizza') || cat.includes('bar') || cat.includes('diner')) {
    primary = [
      { service: 'Restaurant Website', price: '$1,200 – $2,000', why: 'Menu, hours, location — customers check online before visiting.' },
      { service: 'Online Ordering System', price: '$600 – $900/mo', why: 'Cut 30% delivery app commissions. Own your orders.' },
      { service: 'Local SEO', price: '$400 – $600/mo', why: 'Rank for "best [food type] near me" with high buyer intent.' },
    ];
    secondary = ['Instagram Reels Content Calendar', 'Google Review Automation', 'Google Business Profile Setup'];
    avoid = 'LinkedIn Ads, B2B content marketing';
    pitch = 'Lead with online ordering — framing it as saving them 30% in DoorDash fees makes the ROI immediately obvious. That message closes.';
  } else if (cat.includes('dentist') || cat.includes('dental') || cat.includes('orthodont') || cat.includes('clinic') || cat.includes('doctor')) {
    primary = [
      { service: 'Google Ads (Local)', price: '$800 – $2,000/mo', why: 'People search "dentist near me" when in pain — high intent, ready to book.' },
      { service: 'SEO + Local Content', price: '$600/mo', why: 'Rank for "family dentist in [city]" with long-term compound returns.' },
      { service: 'Procedure Landing Pages', price: '$600 – $1,000', why: 'Dedicated pages for implants, whitening, Invisalign convert 3x better.' },
    ];
    secondary = ['Review Automation', 'Patient Referral Program', 'Before/After Gallery Page'];
    avoid = 'TikTok, mass Instagram — wrong demographics for dental';
    pitch = 'Lead with Google Ads. One new dental patient = $2,000–5,000 LTV. Ads at $1,500/mo that bring 3 new patients is an obvious win to any dentist.';
  } else if (cat.includes('gym') || cat.includes('fitness') || cat.includes('yoga') || cat.includes('pilates') || cat.includes('crossfit')) {
    primary = [
      { service: 'Lead Generation Funnel', price: '$1,200 – $2,000', why: 'Free trial offer page + email drip that converts browsers into members.' },
      { service: 'Reels Content Strategy', price: '$600 – $900/mo', why: 'Short-form workout videos organically fill class slots better than any ad.' },
      { service: 'Facebook & Instagram Ads', price: '$600 – $1,500/mo', why: 'Hyperlocal targeting of fitness-interested people within 5 miles.' },
    ];
    secondary = ['Membership Pricing Page', 'Email Newsletter', 'Google Business Optimization'];
    avoid = 'Google Ads — too expensive for gym LTV, broad intent mismatch';
    pitch = 'Lead with Reels + free trial funnel. Show them a competitor gym doing this. Social proof sells fitness — people buy transformation, not features.';
  } else if (cat.includes('clothing') || cat.includes('boutique') || cat.includes('fashion') || cat.includes('apparel') || cat.includes('shop')) {
    primary = [
      { service: 'Shopify E-commerce Store', price: '$2,000 – $4,000', why: 'Turn walk-in customers into 24/7 online revenue nationwide.' },
      { service: 'Meta Ads (Facebook + Instagram)', price: '$800 – $2,000/mo', why: 'Clothing is visual — Instagram carousel and story ads convert extremely well.' },
      { service: 'Content Creation Package', price: '$600 – $1,200/mo', why: 'UGC-style Reels drive organic traffic that compounds over time.' },
    ];
    secondary = ['TikTok Shop Integration', 'Email Newsletter', 'Influencer Gifting Strategy'];
    avoid = 'Google Ads — low ROAS for clothing, broad intent';
    pitch = 'Lead with Shopify. Every boutique dreams of selling beyond their city. Frame it as their store being open 24/7 to the entire country.';
  } else {
    primary = [
      { service: 'Professional Website', price: '$1,200 – $2,500', why: lead.hasWebsite ? 'Modernize their outdated presence and improve conversion rate.' : 'Zero online credibility without one — it\'s table stakes.' },
      { service: 'Local SEO Package', price: '$400 – $700/mo', why: `Capture "${lead.category} in ${lead.city}" searches — high intent, ready to hire.` },
      { service: 'Google Business Optimization', price: '$300 – $500', why: 'Quick win — visible results in 30 days with minimal investment.' },
    ];
    secondary = ['Social Media Management', 'Email Marketing Setup', 'Google Ads (Phase 2)'];
    avoid = 'Complex ad funnels before establishing baseline online presence';
    pitch = `Start with website + GBP optimization. Build trust first with a quick win, then upsell SEO and ads once they see the results rolling in.`;
  }

  const callPrepQuestions = [
    `How are most of your new customers currently finding you?`,
    `Have you tried any online marketing before — what happened?`,
    `What's your biggest challenge right now — getting new clients, or managing existing ones?`,
    `If you could wave a magic wand, where would you want ${lead.businessName} to be in 12 months?`,
    `Who is your main competitor in ${lead.city}, and what are they doing that you're not?`,
    `What's a new customer worth to your business over their lifetime?`,
  ];

  return { primary, secondary, avoid, pitch, callPrepQuestions };
};
