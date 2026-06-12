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