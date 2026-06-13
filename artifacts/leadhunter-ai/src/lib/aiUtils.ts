import { Lead } from "./storage";

export const generateLeadScore = (hasWebsite: boolean): number => {
  return hasWebsite ? Math.floor(10 + Math.random() * 30) : Math.floor(60 + Math.random() * 30);
};

export const generateBusinessAnalysis = (name: string, type: string, location: string) => {
  return {
    summary: `${name} is a ${type} located in ${location}. They appear to have good local foot traffic but are missing significant digital opportunities.`,
    websiteOpportunity: "Without a modern website, they are likely missing out on 40% of potential local searches. Competitors in the area have modern online presences.",
    seoOpportunity: "Their Google Business profile is unclaimed or under-optimized. Claiming and optimizing this could increase visibility by 200%.",
    orderingOpportunity: "Implementing a direct online booking or ordering system could increase their revenue and reduce reliance on third-party platforms.",
    score: Math.floor(65 + Math.random() * 25)
  };
};

export const generateColdEmail = (name: string, type: string, location: string, tone: string, length: string) => {
  return `Subject: Quick question about ${name}\n\nHi there,\n\nI was looking for a ${type} in ${location} and noticed you don't have a website yet. I help local businesses like yours get set up online quickly.\n\nWould you be open to a quick chat next week?`;
};

export const generateInstagramDM = (name: string, type: string, tone: string, length: string) => {
  return `Hey ${name} team 👋 Love your posts! I noticed you don't have a website link in your bio. I build sites for ${type}s and could set one up for you in a few days. Let me know if you're interested!`;
};

export const generateFacebookMessage = (name: string, type: string, tone: string, length: string) => {
  return `Hi ${name}! I'm a local web designer. I saw your Facebook page is active but you don't have a dedicated website. I'd love to help you build one to get more customers.`;
};

export const generateWhatsAppMessage = (name: string, type: string, tone: string, length: string) => {
  return `Hi ${name}, I hope you're doing well. I noticed your business doesn't have a website. I specialize in building sites for ${type}s and can help you get online fast. Let's chat!`;
};

export const generateConversationReply = (
  leadName: string,
  businessType: string,
  channel: string,
  conversationHistory: Array<{role: string, content: string}>,
  prospectReply: string
): { message: string, reasoning: string } => {
  const replyLower = prospectReply.toLowerCase();
  
  if (replyLower.includes("not interested")) {
    return {
      message: `Totally understand! Just wanted to share that we recently helped another local ${businessType} double their leads by updating their site. If you ever change your mind, I'm here. Thanks for your time!`,
      reasoning: "Tone: Professional — Re-engaging with social proof without being pushy."
    };
  } else if (replyLower.includes("how much") || replyLower.includes("price")) {
    return {
      message: `Our packages are tailored to what you actually need, but typically start around a few hundred dollars. I'd love to hop on a quick 5-min call to see what makes sense for ${leadName}. Do you have time tomorrow?`,
      reasoning: "Tone: Helpful — Deflecting exact price to encourage a discovery call."
    };
  } else if (replyLower.includes("already have") || replyLower.includes("working with")) {
    return {
      message: `That's great you're already investing in your online presence! I'd be happy to do a free, no-obligation audit of your current setup to see if there's anything they might have missed. Let me know if that sounds useful!`,
      reasoning: "Tone: Collaborative — Offering value (an audit) rather than immediately giving up."
    };
  } else if (replyLower.includes("busy") || replyLower.includes("timing")) {
    return {
      message: `No worries at all, I know running a ${businessType} keeps you incredibly busy. I'll check back in a couple of weeks. Have a great week!`,
      reasoning: "Tone: Respectful — Planting a seed for a future follow-up."
    };
  } else if (replyLower.includes("more") || replyLower.includes("details")) {
    return {
      message: `Absolutely! Basically, we build professional, fast-loading websites that are optimized to show up on Google when people search for a ${businessType} in your area. Would you be open to a quick 10-minute call this week to see some examples?`,
      reasoning: "Tone: Informative — Providing high-level value and asking for a call."
    };
  } else {
    return {
      message: `Thanks for getting back to me! Based on what I've seen with other ${businessType}s, a solid website can really help capture local traffic. Would you be open to a brief call this week to discuss how it could work for ${leadName}?`,
      reasoning: "Tone: Friendly — Driving towards the call-to-action (booking a call)."
    };
  }
};

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
    { day: 3, subject: `Checking in - ${leadName}`, content: `Hi team, just checking you saw my last message about helping ${leadName} get online. Let me know if you have 5 mins to chat!` },
    { day: 7, subject: `Quick win for ${leadName}`, content: `Hi again, I noticed a quick fix you could make to your Google Business profile that would help you show up higher for '${businessType}' searches. Happy to share it if you're interested.` },
    { day: 14, subject: `How your competitors are getting traffic`, content: `I was doing some research and saw that other local ${businessType}s are capturing hundreds of searches a month just by having a simple booking website. We can set this up for you in a few days.` },
    { day: 30, subject: `Final follow-up from me`, content: `I haven't heard back, so I'll stop reaching out for now. If ${leadName} ever needs help capturing more local online traffic, you know where to find me! Wishing you a great month ahead.` }
  ];
};

export const generateBattleCard = (lead: Lead) => {
  const cat = (lead.category || '').toLowerCase();

  let bestHook = '';
  if ((lead.reviewCount || 0) > 100 && !lead.hasWebsite) {
    bestHook = `You have ${lead.reviewCount} glowing reviews but no website — that means hundreds of customers found you on Google but had nowhere to go next.`;
  } else if (!lead.hasWebsite) {
    bestHook = `Every competitor in ${lead.city} showing up on Google right now has a website. Right now you're invisible to ~${lead.score || 70}% of people searching online.`;
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
    {
      objection: '"I\'m already busy enough, I don\'t need more clients."',
      response: `Exactly — a website automates your lead intake so you stop missing calls. It works while you work, and you control the flow.`
    },
    {
      objection: '"I\'ve tried online marketing before, it didn\'t work."',
      response: `Most failed campaigns target too broadly. We focus hyper-locally on people already searching for ${lead.category}s in ${lead.city} — high intent, ready to buy.`
    },
    {
      objection: '"It\'s too expensive right now."',
      response: `We offer flexible payment plans. The site pays for itself the moment it books a single new client — typically in week one.`
    },
    {
      objection: '"My customers find me through word of mouth."',
      response: `Word of mouth is gold, but what happens when their friend searches for you online and finds a competitor instead? Your reviews deserve a home.`
    },
  ];
  const objection = objectionPool[Math.abs(Math.floor((lead.score || 65) * objectionPool.length / 100)) % objectionPool.length];

  let tier = 'Starter';
  let recommendedPrice = '$1,200 – $2,000';
  const score = lead.score || 65;
  if (score > 80) { tier = 'Agency Package'; recommendedPrice = '$3,500 – $5,000/mo'; }
  else if (score > 60) { tier = 'Growth Bundle'; recommendedPrice = '$2,500 – $3,500'; }
  else if (score > 40) { tier = 'Professional Site'; recommendedPrice = '$1,500 – $2,500'; }

  const closeProbability = lead.hasWebsite
    ? Math.min(45 + Math.floor(score / 5), 68)
    : Math.min(55 + Math.floor(score / 4), 87);

  return { bestHook, bestOffer, objection, recommendedPrice, tier, closeProbability };
};

export const generateOpportunityItems = (lead: Lead) => {
  const items: { problem: string; action: string; rank: 'easy' | 'medium' | 'high'; effort: string; impact: string }[] = [];

  if (!lead.hasWebsite) {
    items.push({ problem: 'No website detected', action: 'Build a 5-page professional site with contact form', rank: 'high', effort: 'Easy Win', impact: 'Critical' });
  }
  items.push({ problem: 'Google Business Profile under-optimized', action: 'Claim, verify and fully optimize GBP listing', rank: 'easy', effort: 'Easy Win', impact: 'High' });
  if (!lead.email) {
    items.push({ problem: 'No professional email found', action: 'Set up professional email (e.g. info@business.com)', rank: 'easy', effort: 'Easy Win', impact: 'Medium' });
  }
  if ((lead.seoScore || 0) < 60) {
    items.push({ problem: `Low SEO score (${lead.seoScore || 0}/100)`, action: 'Local keyword optimization + on-page SEO fixes', rank: 'medium', effort: 'Medium Win', impact: 'High' });
  }
  if (!lead.instagram || (lead.socialScore || 0) < 50) {
    items.push({ problem: 'Weak or missing social media presence', action: 'Launch consistent content strategy + Reels posting', rank: 'medium', effort: 'Medium Win', impact: 'Medium' });
  }
  items.push({ problem: 'No online booking or contact form', action: 'Add a booking widget or Calendly integration', rank: 'easy', effort: 'Easy Win', impact: 'High' });
  if ((lead.reviewCount || 0) < 50) {
    items.push({ problem: `Only ${lead.reviewCount || 0} reviews — competitors have 200+`, action: 'Launch automated review collection via SMS/email', rank: 'medium', effort: 'Medium Win', impact: 'Medium' });
  }
  items.push({ problem: 'No lead capture funnel or email list', action: 'Build a lead magnet landing page + email sequence', rank: 'high', effort: 'High Value', impact: 'High' });
  items.push({ problem: 'No paid traffic strategy in place', action: 'Launch targeted Google Ads or Meta Ads campaign', rank: 'high', effort: 'High Value', impact: 'Very High' });
  if (!lead.hasWebsite) {
    items.push({ problem: 'Missing call-to-action on all platforms', action: 'Add "Book Now" or "Call Us" buttons everywhere', rank: 'easy', effort: 'Easy Win', impact: 'Medium' });
  }

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
