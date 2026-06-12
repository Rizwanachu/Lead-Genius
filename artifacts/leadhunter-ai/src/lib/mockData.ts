import { Lead } from "./storage";

const generateId = () => Math.random().toString(36).substring(2, 9);

export const generateMockLeads = (country: string, state: string, city: string, businessType: string, count: number): Lead[] => {
  const leads: Lead[] = [];
  const adjectives = ["Premium", "Elite", "Pro", "Star", "Gold", "Local", "Best", "Top", "City", "Metro"];
  
  for (let i = 0; i < count; i++) {
    const hasWebsite = Math.random() > 0.4;
    const hasEmail = Math.random() > 0.3;
    const hasSocial = Math.random() > 0.2;
    
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${businessType} ${city}`;
    
    leads.push({
      id: generateId(),
      businessName: name,
      category: businessType,
      address: `${Math.floor(Math.random() * 9999)} Main St, ${city}, ${state}`,
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      website: hasWebsite ? `https://www.${name.replace(/\s+/g, '').toLowerCase()}.com` : null,
      email: hasEmail ? `contact@${name.replace(/\s+/g, '').toLowerCase()}.com` : null,
      instagram: hasSocial ? `@${name.replace(/\s+/g, '').toLowerCase()}` : null,
      facebook: hasSocial ? `${name}` : null,
      hasWebsite,
      score: hasWebsite ? Math.floor(10 + Math.random() * 30) : Math.floor(60 + Math.random() * 30),
      city,
      state,
      country,
      createdAt: new Date().toISOString()
    });
  }
  
  return leads;
};