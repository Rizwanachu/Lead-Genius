import { useState, useEffect } from "react";
import { getCampaigns, saveCampaigns, Campaign } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignCard from "@/components/CampaignCard";
import { Plus, FolderKanban } from "lucide-react";
import { toast } from "sonner";

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const updated = campaigns.filter(c => c.id !== id);
      setCampaigns(updated);
      saveCampaigns(updated);
      toast.success("Campaign deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Organize your outreach targets by location and niche.</p>
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

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="text-center p-16 border rounded-xl bg-card/30 border-dashed mt-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No active campaigns</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Group your leads by niche and location to keep your outreach organized and track performance.</p>
          <Button onClick={() => setIsOpen(true)}>Create Your First Campaign</Button>
        </div>
      )}
    </div>
  );
}