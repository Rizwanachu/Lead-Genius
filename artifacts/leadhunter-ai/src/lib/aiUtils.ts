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