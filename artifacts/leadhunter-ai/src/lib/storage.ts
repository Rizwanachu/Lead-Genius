export type Review = {
  id: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  text: string
  date: string
  helpful: number
  ownerReply?: string
}

export type ContactPerson = {
  name: string
  title: string
  email: string
  phone?: string
  linkedin?: string
}

export type OpeningHours = {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export type Lead = {
  id: string
  businessName: string
  category: string
  address: string
  phone: string
  website: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  youtube: string | null
  tiktok: string | null
  hasWebsite: boolean
  score: number
  city: string
  state: string
  country: string
  createdAt: string
  rating: number
  reviewCount: number
  priceLevel: string
  description: string
  reviews: Review[]
  contacts: ContactPerson[]
  openingHours: OpeningHours
  googleMapsUrl: string
  plusCode: string
  categories: string[]
  amenities: string[]
  yearEstablished: number
  employeeCount: string
  websiteStatus: 'none' | 'outdated' | 'social_only' | 'active'
  seoScore: number
  socialScore: number
  opportunityScore: number
}

export type ConversationMessage = {
  id: string
  role: 'sent' | 'received'
  content: string
  timestamp: string
  channel: 'email' | 'instagram' | 'facebook' | 'whatsapp'
}

export type Conversation = {
  id: string
  leadId: string
  leadName: string
  channel: 'email' | 'instagram' | 'facebook' | 'whatsapp'
  status: 'new' | 'in_progress' | 'interested' | 'converted' | 'dead'
  messages: ConversationMessage[]
  createdAt: string
  updatedAt: string
  notes?: string
}

export type Campaign = {
  id: string
  name: string
  businessType: string
  location: string
  messageType: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  pipelineStatus?: 'new' | 'contacted' | 'interested' | 'call_booked' | 'proposal_sent' | 'won' | 'lost'
  messagesGenerated: number
  leadsTargeted: number
  createdAt: string
}

export type Settings = {
  openaiKey: string
  geminiKey: string
  resendKey: string
}

export type SearchHistory = {
  id: string
  query: string
  createdAt: string
}

const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage", error)
  }
}

export const getLeads = (): Lead[] => getItem<Lead[]>('lh_leads', [])
export const saveLeads = (leads: Lead[]) => setItem('lh_leads', leads)

export const getCampaigns = (): Campaign[] => getItem<Campaign[]>('lh_campaigns', [])
export const saveCampaigns = (campaigns: Campaign[]) => setItem('lh_campaigns', campaigns)

export const getMessagesCount = (): number => getItem<number>('lh_messages', 0)
export const saveMessagesCount = (count: number) => setItem('lh_messages', count)

export const getSettings = (): Settings => getItem<Settings>('lh_settings', { openaiKey: '', geminiKey: '', resendKey: '' })
export const saveSettings = (settings: Settings) => setItem('lh_settings', settings)

export const getSearchHistory = (): SearchHistory[] => getItem<SearchHistory[]>('lh_search_history', [])
export const saveSearchHistory = (history: SearchHistory[]) => setItem('lh_search_history', history)

export const getConversations = (): Conversation[] => getItem<Conversation[]>('lh_conversations', [])
export const saveConversations = (conversations: Conversation[]) => setItem('lh_conversations', conversations)

export const clearAllData = () => {
  localStorage.removeItem('lh_leads')
  localStorage.removeItem('lh_campaigns')
  localStorage.removeItem('lh_messages')
  localStorage.removeItem('lh_settings')
  localStorage.removeItem('lh_search_history')
  localStorage.removeItem('lh_conversations')
}