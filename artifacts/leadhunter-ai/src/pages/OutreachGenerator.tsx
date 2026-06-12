import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MessageGenerator from "@/components/MessageGenerator";
import { getLeads, Lead, saveMessagesCount, getMessagesCount } from "@/lib/storage";
import { generateColdEmail, generateInstagramDM, generateFacebookMessage, generateWhatsAppMessage } from "@/lib/aiUtils";
import { toast } from "sonner";
import { Bot, Sparkles } from "lucide-react";

export default function OutreachGenerator() {
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  
  const [formData, setFormData] = useState({
    leadId: "manual",
    businessName: "",
    businessType: "",
    location: "",
    channel: "email",
    tone: "professional",
    length: "medium"
  });

  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSavedLeads(getLeads());
  }, []);

  const handleLeadSelect = (id: string) => {
    if (id === "manual") {
      setFormData(prev => ({ ...prev, leadId: id, businessName: "", businessType: "", location: "" }));
      return;
    }
    
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
      setFormData(prev => ({
        ...prev,
        leadId: id,
        businessName: lead.businessName,
        businessType: lead.category,
        location: `${lead.city}, ${lead.state}`
      }));
    }
  };

  const handleGenerate = () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error("Business name and type are required");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      let msg = "";
      switch (formData.channel) {
        case "email":
          msg = generateColdEmail(formData.businessName, formData.businessType, formData.location, formData.tone, formData.length);
          break;
        case "instagram":
          msg = generateInstagramDM(formData.businessName, formData.businessType, formData.tone, formData.length);
          break;
        case "facebook":
          msg = generateFacebookMessage(formData.businessName, formData.businessType, formData.tone, formData.length);
          break;
        case "whatsapp":
          msg = generateWhatsAppMessage(formData.businessName, formData.businessType, formData.tone, formData.length);
          break;
      }
      
      setGeneratedMessage(msg);
      
      // Increment global counter
      saveMessagesCount(getMessagesCount() + 1);
      
      setIsGenerating(false);
      toast.success("Message generated!");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outreach Generator</h1>
        <p className="text-muted-foreground mt-1">Craft personalized, high-converting messages tailored to specific businesses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Target Lead</Label>
                <Select value={formData.leadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select saved lead or manual entry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">-- Manual Entry --</SelectItem>
                    {savedLeads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.businessName} ({lead.city})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 bg-muted/20 border rounded-lg">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    value={formData.businessName} 
                    onChange={e => setFormData(prev => ({...prev, businessName: e.target.value}))}
                    placeholder="e.g. Mario's Pizza"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Input 
                      value={formData.businessType} 
                      onChange={e => setFormData(prev => ({...prev, businessType: e.target.value}))}
                      placeholder="e.g. Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      value={formData.location} 
                      onChange={e => setFormData(prev => ({...prev, location: e.target.value}))}
                      placeholder="e.g. Chicago"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select value={formData.channel} onValueChange={v => setFormData(prev => ({...prev, channel: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Cold Email</SelectItem>
                      <SelectItem value="instagram">Instagram DM</SelectItem>
                      <SelectItem value="facebook">Facebook Message</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={formData.tone} onValueChange={v => setFormData(prev => ({...prev, tone: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <Select value={formData.length} onValueChange={v => setFormData(prev => ({...prev, length: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 text-primary-foreground">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Crafting Message..." : "Generate AI Outreach"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <MessageGenerator 
            message={generatedMessage} 
            onRegenerate={handleGenerate} 
            isGenerating={isGenerating} 
          />
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground flex items-start gap-3">
            <Bot className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p>Our AI models analyze the business type and tone to craft hyper-personalized outreach. We specifically emphasize the opportunity cost of not having a website to increase your response rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick component defined here just to make the icon work above
function Target(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}