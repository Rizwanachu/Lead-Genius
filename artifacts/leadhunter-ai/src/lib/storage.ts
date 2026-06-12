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
  hasWebsite: boolean
  score: number
  city: string
  state: string
  country: string
  createdAt: string
}

export type Campaign = {
  id: string
  name: string
  businessType: string
  location: string
  messageType: string
  status: 'draft' | 'active' | 'paused' | 'completed'
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

export const clearAllData = () => {
  localStorage.removeItem('lh_leads')
  localStorage.removeItem('lh_campaigns')
  localStorage.removeItem('lh_messages')
  localStorage.removeItem('lh_settings')
  localStorage.removeItem('lh_search_history')
}