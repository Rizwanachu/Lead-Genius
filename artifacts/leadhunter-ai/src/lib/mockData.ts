import { Lead, Review, ContactPerson, OpeningHours } from "./storage";

const generateId = () => Math.random().toString(36).substring(2, 9);

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const jobTitles = ["Owner", "Manager", "Marketing Director", "Operations Manager", "Founder"];
const adjectives = ["Premium", "Elite", "Pro", "Star", "Gold", "Local", "Best", "Top", "City", "Metro", "Rustic", "Urban", "Modern", "Classic", "Vintage"];
const suffixes = ["Co", "Inc", "LLC", "Group", "Partners"];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateContacts = (businessName: string): ContactPerson[] => {
  const count = Math.floor(Math.random() * 3) + 1;
  const contacts: ContactPerson[] = [];
  const domain = businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + ".com";
  
  for (let i = 0; i < count; i++) {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    contacts.push({
      name: `${fn} ${ln}`,
      title: getRandomItem(jobTitles),
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedin: Math.random() > 0.5 ? `linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}` : undefined
    });
  }
  return contacts;
};

const generateReviews = (businessName: string): Review[] => {
  const count = Math.floor(Math.random() * 6) + 3; // 3 to 8 reviews
  const reviews: Review[] = [];
  
  for (let i = 0; i < count; i++) {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    const rating = Math.random() > 0.8 ? (Math.floor(Math.random() * 3) + 1) : (Math.floor(Math.random() * 2) + 4);
    
    reviews.push({
      id: generateId(),
      reviewerName: `${fn} ${ln}`,
      reviewerAvatar: `${fn[0]}${ln[0]}`,
      rating,
      text: rating > 3 ? `Great experience at ${businessName}! Highly recommended.` : `Not the best experience, needs improvement.`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
      helpful: Math.floor(Math.random() * 20),
      ownerReply: rating <= 3 && Math.random() > 0.5 ? `We are sorry to hear about your experience. Please contact us to resolve this.` : undefined
    });
  }
  
  return reviews;
};

const generateOpeningHours = (): OpeningHours => {
  const isWeekendClosed = Math.random() > 0.5;
  const hours = "9:00 AM – 6:00 PM";
  return {
    monday: hours,
    tuesday: hours,
    wednesday: hours,
    thursday: hours,
    friday: hours,
    saturday: isWeekendClosed ? "Closed" : "10:00 AM – 4:00 PM",
    sunday: "Closed"
  };
};

export const generateMockLeads = (country: string, state: string, city: string, businessType: string, count: number): Lead[] => {
  const leads: Lead[] = [];
  
  for (let i = 0; i < count; i++) {
    const hasWebsite = Math.random() > 0.4;
    const hasEmail = Math.random() > 0.3;
    const hasSocial = Math.random() > 0.2;
    
    let name = "";
    const nameFormat = Math.floor(Math.random() * 3);
    if (nameFormat === 0) {
      name = `${getRandomItem(adjectives)} ${getRandomItem(lastNames)}'s ${businessType}`;
    } else if (nameFormat === 1) {
      name = `The ${getRandomItem(adjectives)} ${businessType}`;
    } else {
      name = `${city} ${businessType} ${getRandomItem(suffixes)}`;
    }
    
    const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
    const reviewCount = Math.floor(Math.random() * 300) + 10;
    
    const websiteStatus = hasWebsite ? 'active' : (hasSocial ? 'social_only' : 'none');
    const domain = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + ".com";
    
    leads.push({
      id: generateId(),
      businessName: name,
      category: businessType,
      address: `${Math.floor(Math.random() * 9999)} Main St, ${city}, ${state}`,
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      website: hasWebsite ? `https://www.${domain}` : null,
      email: hasEmail ? `contact@${domain}` : null,
      instagram: hasSocial ? `@${domain.split('.')[0]}` : null,
      facebook: hasSocial ? `${name}` : null,
      twitter: null,
      youtube: null,
      tiktok: null,
      hasWebsite,
      score: hasWebsite ? Math.floor(10 + Math.random() * 30) : Math.floor(60 + Math.random() * 30),
      city,
      state,
      country,
      createdAt: new Date().toISOString(),
      rating: parseFloat(rating),
      reviewCount,
      priceLevel: ["$", "$$", "$$$", "$$$$"][Math.floor(Math.random() * 4)],
      description: `${name} is a premier ${businessType} serving the ${city} area. Established to provide top-quality services.`,
      reviews: generateReviews(name),
      contacts: generateContacts(name),
      openingHours: generateOpeningHours(),
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name + " " + city)}`,
      plusCode: `8FQX+V3 ${city}, ${state}`,
      categories: [businessType, "Local Business"],
      amenities: ["Free WiFi", "Parking", "Wheelchair Accessible"],
      yearEstablished: 2024 - Math.floor(Math.random() * 20),
      employeeCount: ["1-10", "11-50", "51-200"][Math.floor(Math.random() * 3)],
      websiteStatus,
      seoScore: Math.floor(Math.random() * 100),
      socialScore: Math.floor(Math.random() * 100),
      opportunityScore: Math.floor(Math.random() * 100)
    });
  }
  
  return leads;
};