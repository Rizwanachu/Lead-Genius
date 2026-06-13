import { useState, useEffect } from "react";
import { getCampaigns, saveCampaigns, Campaign } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignCard from "@/components/CampaignCard";
import { Plus, FolderKanban, Columns, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PIPELINE_COLUMNS = [
  { id: 'new', label: 'New Lead', color: 'bg-slate-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { id: 'interested', label: 'Interested', color: 'bg-indigo-500' },
  { id: 'call_booked', label: 'Call Booked', color: 'bg-purple-500' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'bg-yellow-500' },
  { id: 'won', label: 'Won', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'bg-destructive' },
];

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'pipeline'>('pipeline');
  
  const [formData, setFormData] = useState({
    name: "",
    businessType: "",
    location: "",
    messageType: "email"
  });

  useEffect(() => {
    setCampaigns(getCampaigns());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.businessType || !formData.location) {
      toast.error("Please fill all required fields");
      return;
    }

    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      ...formData,
      status: 'draft',
      pipelineStatus: 'new',
      messagesGenerated: 0,
      leadsTargeted: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveCampaigns(updated);
    setIsOpen(false);
    setFormData({ name: "", businessType: "", location: "", messageType: "email" });
    toast.success("Campaign created");
  };

  const handleStatusChange = (id: string, status: Campaign['status']) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, status } : c);
    setCampaigns(updated);
    saveCampaigns(updated);
    toast.success(`Campaign marked as ${status}`);
  };

  const handlePipelineMove = (id: string, direction: 'left' | 'right') => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    const currentStatus = campaign.pipelineStatus || 'new';
    const currentIndex = PIPELINE_COLUMNS.findIndex(col => col.id === currentStatus);
    
    let newIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) newIndex--;
    if (direction === 'right' && currentIndex < PIPELINE_COLUMNS.length - 1) newIndex++;
    
    if (newIndex !== currentIndex) {
      const newStatus = PIPELINE_COLUMNS[newIndex].id as Campaign['pipelineStatus'];
      const updated = campaigns.map(c => c.id === id ? { ...c, pipelineStatus: newStatus } : c);
      setCampaigns(updated);
      saveCampaigns(updated);
    }
  };

  const setPipelineStatus = (id: string, status: Campaign['pipelineStatus']) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, pipelineStatus: status } : c);
    setCampaigns(updated);
    saveCampaigns(updated);
    toast.success(`Moved to ${status?.replace('_', ' ')}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const updated = campaigns.filter(c => c.id !== id);
      setCampaigns(updated);
      saveCampaigns(updated);
      toast.success("Campaign deleted");
    }
  };

  const totalWon = campaigns.filter(c => c.pipelineStatus === 'won').length;
  const totalActive = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Organize your outreach targets and manage your sales pipeline.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3 gap-2"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </Button>
            <Button 
              variant={view === 'pipeline' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3 gap-2"
              onClick={() => setView('pipeline')}
            >
              <Columns className="w-4 h-4" /> Pipeline
            </Button>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(prev => ({...prev, name: e.target.value}))} placeholder="e.g. Austin Plumbers Q3" />
                </div>
                <div className="space-y-2">
                  <Label>Business Type Target</Label>
                  <Input value={formData.businessType} onChange={e => setFormData(prev => ({...prev, businessType: e.target.value}))} placeholder="e.g. Plumber" />
                </div>
                <div className="space-y-2">
                  <Label>Target Location</Label>
                  <Input value={formData.location} onChange={e => setFormData(prev => ({...prev, location: e.target.value}))} placeholder="e.g. Austin, TX" />
                </div>
                <div className="space-y-2">
                  <Label>Primary Channel</Label>
                  <Select value={formData.messageType} onValueChange={v => setFormData(prev => ({...prev, messageType: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Cold Email</SelectItem>
                      <SelectItem value="instagram">Instagram DM</SelectItem>
                      <SelectItem value="facebook">Facebook Message</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-4">Save Campaign</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center p-16 border rounded-xl bg-card/30 border-dashed mt-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No active campaigns</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Group your leads by niche and location to keep your outreach organized and track performance.</p>
          <Button onClick={() => setIsOpen(true)}>Create Your First Campaign</Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12 overflow-y-auto">
          {campaigns.map(campaign => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-4 items-center mb-4 p-3 bg-card border rounded-lg shadow-sm shrink-0">
            <div className="flex-1 text-sm font-medium">Pipeline Overview</div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>Total Campaigns: <span className="font-bold text-foreground">{campaigns.length}</span></div>
              <div>Active: <span className="font-bold text-blue-500">{totalActive}</span></div>
              <div>Won: <span className="font-bold text-emerald-500">{totalWon}</span></div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex gap-4 h-full min-w-max">
              {PIPELINE_COLUMNS.map(column => {
                const columnCampaigns = campaigns.filter(c => (c.pipelineStatus || 'new') === column.id);
                const isWon = column.id === 'won';
                const isLost = column.id === 'lost';
                
                return (
                  <div key={column.id} className="w-80 flex flex-col h-full bg-muted/30 border rounded-xl overflow-hidden shrink-0">
                    <div className="p-3 border-b bg-card flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                        <h3 className="font-semibold text-sm">{column.label}</h3>
                      </div>
                      <div className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                        {columnCampaigns.length}
                      </div>
                    </div>
                    
                    <div className="p-3 flex-1 overflow-y-auto space-y-3">
                      <AnimatePresence>
                        {columnCampaigns.map(campaign => (
                          <motion.div
                            key={campaign.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3 bg-card border rounded-lg shadow-sm group ${isWon ? 'border-emerald-500/30' : isLost ? 'border-destructive/30' : ''}`}
                          >
                            <div className="font-medium text-sm mb-1">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
                              <span className="truncate">{campaign.businessType}</span>
                              <span className="shrink-0 ml-2 bg-muted px-1.5 py-0.5 rounded">{campaign.messageType}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6" 
                                  onClick={() => handlePipelineMove(campaign.id, 'left')}
                                  disabled={column.id === PIPELINE_COLUMNS[0].id}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6"
                                  onClick={() => handlePipelineMove(campaign.id, 'right')}
                                  disabled={column.id === PIPELINE_COLUMNS[PIPELINE_COLUMNS.length - 1].id}
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              
                              <div className="flex gap-1.5 ml-auto">
                                {!isWon && (
                                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500" onClick={() => setPipelineStatus(campaign.id, 'won')}>
                                    Won
                                  </Button>
                                )}
                                {!isLost && (
                                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive hover:bg-destructive/10" onClick={() => setPipelineStatus(campaign.id, 'lost')}>
                                    Lost
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {columnCampaigns.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground/50">
                          Empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
