import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import MessageGenerator from "@/components/MessageGenerator";
import { getLeads, Lead, saveMessagesCount, getMessagesCount } from "@/lib/storage";
import { generateColdEmail, generateInstagramDM, generateFacebookMessage, generateWhatsAppMessage, generateFollowUpSequence } from "@/lib/aiUtils";
import { toast } from "sonner";
import { Bot, Sparkles, Copy, Target } from "lucide-react";

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
  const [followUpSequence, setFollowUpSequence] = useState<Array<{day: number, subject: string, content: string, sent?: boolean}>>([]);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);

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
      saveMessagesCount(getMessagesCount() + 1);
      setIsGenerating(false);
      toast.success("Message generated!");
    }, 1200);
  };

  const handleGenerateSequence = () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error("Business name and type are required");
      return;
    }

    setIsGeneratingSequence(true);
    
    setTimeout(() => {
      const sequence = generateFollowUpSequence(formData.businessName, formData.businessType, formData.channel, generatedMessage);
      setFollowUpSequence(sequence.map(s => ({...s, sent: false})));
      setIsGeneratingSequence(false);
      toast.success("Follow-up sequence generated!");
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleSent = (index: number) => {
    const updated = [...followUpSequence];
    updated[index].sent = !updated[index].sent;
    setFollowUpSequence(updated);
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

            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Tabs defaultValue="initial" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="initial">Initial Outreach</TabsTrigger>
              <TabsTrigger value="followup">Follow-Up Sequence</TabsTrigger>
            </TabsList>
            
            <TabsContent value="initial" className="space-y-6">
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 text-primary-foreground h-12 text-base">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Crafting Message..." : "Generate AI Outreach"}
              </Button>
              <MessageGenerator 
                message={generatedMessage} 
                onRegenerate={handleGenerate} 
                isGenerating={isGenerating} 
              />
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground flex items-start gap-3">
                <Bot className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>Our AI models analyze the business type and tone to craft hyper-personalized outreach. We specifically emphasize the opportunity cost of not having a website to increase your response rates.</p>
              </div>
            </TabsContent>

            <TabsContent value="followup" className="space-y-6">
              <Button onClick={handleGenerateSequence} disabled={isGeneratingSequence} className="w-full gap-2 text-primary-foreground h-12 text-base">
                <Sparkles className="w-4 h-4" />
                {isGeneratingSequence ? "Crafting Sequence..." : "Generate Full Sequence"}
              </Button>

              {followUpSequence.length > 0 ? (
                <div className="space-y-4">
                  {followUpSequence.map((msg, idx) => (
                    <Card key={idx} className={`border-l-4 ${msg.sent ? 'border-l-emerald-500 opacity-70' : 'border-l-primary'} transition-all`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm bg-muted px-2 py-1 rounded">Day {msg.day}</span>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{formData.channel}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={msg.sent} onCheckedChange={() => toggleSent(idx)} />
                              <span className="text-xs text-muted-foreground">Mark Sent</span>
                            </label>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => copyToClipboard(formData.channel === 'email' ? `${msg.subject}\n\n${msg.content}` : msg.content)}>
                              <Copy className="w-3.5 h-3.5 mr-2" /> Copy
                            </Button>
                          </div>
                        </div>
                        {formData.channel === 'email' && (
                          <div className="mb-3 text-sm font-medium border-b pb-2">
                            Subject: {msg.subject}
                          </div>
                        )}
                        <Textarea 
                          value={msg.content} 
                          onChange={(e) => {
                            const updated = [...followUpSequence];
                            updated[idx].content = e.target.value;
                            setFollowUpSequence(updated);
                          }}
                          className="min-h-[100px] border-none bg-muted/20 focus-visible:ring-0 resize-none shadow-none text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed rounded-xl bg-muted/10">
                  <Bot className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <h3 className="font-medium text-lg mb-2">Automate your follow-ups</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">Generate a 4-step sequence spaced over 30 days to ensure you never leave a prospect hanging.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}