import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getLeads, Lead, saveMessagesCount, getMessagesCount } from "@/lib/storage";
import { aiGenerateOutreach, aiGenerateFollowUpSequence } from "@/lib/gemini";
import { toast } from "sonner";
import { Bot, Sparkles, Copy, Target, CheckCircle2, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TONE_DESC: Record<string, string> = {
  friendly: "Warm, casual, uses light humor — great for local shops & restaurants.",
  professional: "Polished and businesslike — works for clinics, offices, agencies.",
  direct: "Short, punchy, no fluff — ideal for high-volume cold outreach.",
  premium: "Elevated, exclusive tone — perfect for boutiques and high-end brands.",
};

const LENGTH_DESC: Record<string, string> = {
  short: "1–3 sentences. Low friction, best for DMs and busy prospects.",
  medium: "4–6 sentences. Balanced. Works for most channels.",
  long: "Full email with context and detail. Best for warm or high-value leads.",
};

export default function OutreachGenerator() {
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);

  const [formData, setFormData] = useState({
    leadId: "manual",
    businessName: "",
    businessType: "",
    location: "",
    channel: "email",
    tone: "professional",
    length: "medium",
  });

  const [variants, setVariants] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [followUpSequence, setFollowUpSequence] = useState<Array<{ day: number; subject: string; content: string; sent?: boolean }>>([]);
  const [isGeneratingSequence, setIsGeneratingSequence] = useState(false);

  useEffect(() => { setSavedLeads(getLeads()); }, []);

  const handleLeadSelect = (id: string) => {
    if (id === "manual") {
      setFormData(p => ({ ...p, leadId: id, businessName: "", businessType: "", location: "" }));
      return;
    }
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
      setFormData(p => ({
        ...p, leadId: id,
        businessName: lead.businessName,
        businessType: lead.category,
        location: `${lead.city}, ${lead.state}`,
      }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error("Business name and type are required");
      return;
    }
    setIsGenerating(true);
    setVariants([]);
    try {
      const msgs = await aiGenerateOutreach(
        formData.businessName,
        formData.businessType,
        formData.location,
        formData.channel as any,
        formData.tone,
        formData.length
      );
      setVariants(msgs);
      setSelectedVariant(0);
      saveMessagesCount(getMessagesCount() + 3);
      toast.success("3 AI-generated variants ready — each is completely unique!");
    } catch (err: any) {
      toast.error("Generation failed: " + (err.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSequence = async () => {
    if (!formData.businessName || !formData.businessType) {
      toast.error("Business name and type are required");
      return;
    }
    setIsGeneratingSequence(true);
    try {
      const seq = await aiGenerateFollowUpSequence(
        formData.businessName,
        formData.businessType,
        formData.channel,
        variants[selectedVariant] || ""
      );
      setFollowUpSequence(seq.map(s => ({ ...s, sent: false })));
      toast.success("AI follow-up sequence generated!");
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setIsGeneratingSequence(false);
    }
  };

  const copyToClipboard = (text: string, idx?: number) => {
    navigator.clipboard.writeText(text);
    if (idx !== undefined) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
    toast.success("Copied!");
  };

  const toggleSent = (i: number) => {
    const updated = [...followUpSequence];
    updated[i].sent = !updated[i].sent;
    setFollowUpSequence(updated);
  };

  const channelLabel = { email: "Cold Email", instagram: "Instagram DM", facebook: "Facebook Message", whatsapp: "WhatsApp" }[formData.channel] || formData.channel;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outreach Generator</h1>
        <p className="text-muted-foreground mt-1">Gemini AI writes 3 completely unique, personalized messages — no templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-5">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Target Lead</Label>
                <Select value={formData.leadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger><SelectValue placeholder="Select saved lead or manual entry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">-- Manual Entry --</SelectItem>
                    {savedLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.businessName} ({l.city})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-4 bg-muted/20 border rounded-lg">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name</Label>
                  <Input value={formData.businessName} onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))} placeholder="e.g. Mario's Pizza" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Business Type</Label>
                    <Input value={formData.businessType} onChange={e => setFormData(p => ({ ...p, businessType: e.target.value }))} placeholder="e.g. Restaurant" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Chicago" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label className="text-xs">Channel</Label>
                  <Select value={formData.channel} onValueChange={v => setFormData(p => ({ ...p, channel: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Cold Email</SelectItem>
                      <SelectItem value="instagram">Instagram DM</SelectItem>
                      <SelectItem value="facebook">Facebook Message</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tone</Label>
                  <Select value={formData.tone} onValueChange={v => setFormData(p => ({ ...p, tone: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">{TONE_DESC[formData.tone]}</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Message Length</Label>
                  <Select value={formData.length} onValueChange={v => setFormData(p => ({ ...p, length: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">{LENGTH_DESC[formData.length]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Tabs defaultValue="initial" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-5">
              <TabsTrigger value="initial">Initial Outreach</TabsTrigger>
              <TabsTrigger value="followup">Follow-Up Sequence</TabsTrigger>
            </TabsList>

            <TabsContent value="initial" className="space-y-5">
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2 h-12 text-base font-semibold">
                {isGenerating
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI Writing 3 Unique Messages...</>
                  : <><Sparkles className="w-4 h-4" /> Generate AI Outreach (3 Variants)</>}
              </Button>

              <AnimatePresence>
                {variants.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium">Select a variant:</span>
                      {variants.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedVariant(i)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${selectedVariant === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                        >
                          Variant {i + 1}
                        </button>
                      ))}
                      <span className="ml-auto text-xs text-muted-foreground capitalize">{channelLabel} · {formData.tone} · {formData.length}</span>
                    </div>

                    {variants.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        onClick={() => setSelectedVariant(i)}
                        className={`relative rounded-xl border p-4 cursor-pointer transition-all ${selectedVariant === i ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/60 bg-card/50 hover:bg-muted/30'}`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={selectedVariant === i ? "default" : "secondary"} className="text-[10px]">
                              Variant {i + 1}
                            </Badge>
                            {selectedVariant === i && <Badge variant="outline" className="text-[10px] text-primary border-primary">Selected</Badge>}
                          </div>
                          <Button
                            size="sm"
                            variant={copiedIdx === i ? "default" : "outline"}
                            className="h-7 px-2 text-xs shrink-0"
                            onClick={e => { e.stopPropagation(); copyToClipboard(msg, i); }}
                          >
                            {copiedIdx === i ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                          </Button>
                        </div>
                        <Textarea
                          value={msg}
                          readOnly
                          className="min-h-[100px] resize-none bg-transparent border-none focus-visible:ring-0 shadow-none text-sm p-0 cursor-pointer"
                          style={{ pointerEvents: 'none' }}
                        />
                        <p className="text-[10px] text-muted-foreground mt-2 text-right">{msg.length} chars</p>
                      </motion.div>
                    ))}

                    <div className="flex justify-between items-center pt-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> Written by Gemini AI — each variant is genuinely unique.
                      </p>
                      <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-xs gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {variants.length === 0 && !isGenerating && (
                <div className="p-10 text-center border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <h3 className="font-medium mb-1">Click Generate to get 3 AI-written messages</h3>
                  <p className="text-sm">Gemini AI writes each one from scratch — no templates, completely unique every time.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="followup" className="space-y-5">
              <Button onClick={handleGenerateSequence} disabled={isGeneratingSequence} className="w-full gap-2 h-12 text-base font-semibold">
                {isGeneratingSequence
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> AI Building Sequence...</>
                  : <><ChevronRight className="w-4 h-4" /> Generate AI Follow-Up Sequence</>}
              </Button>

              {followUpSequence.length > 0 ? (
                <div className="space-y-4">
                  {followUpSequence.map((msg, idx) => (
                    <Card key={idx} className={`border-l-4 transition-all ${msg.sent ? 'border-l-emerald-500 opacity-60' : 'border-l-primary'}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm bg-muted px-2 py-1 rounded">Day {msg.day}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{channelLabel}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={msg.sent} onCheckedChange={() => toggleSent(idx)} />
                              <span className="text-xs text-muted-foreground">Mark Sent</span>
                            </label>
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => copyToClipboard(formData.channel === 'email' ? `${msg.subject}\n\n${msg.content}` : msg.content)}>
                              <Copy className="w-3 h-3 mr-1" /> Copy
                            </Button>
                          </div>
                        </div>
                        {formData.channel === 'email' && msg.subject && (
                          <div className="mb-3 text-sm font-semibold border-b pb-2 text-muted-foreground">Subject: {msg.subject}</div>
                        )}
                        <Textarea
                          value={msg.content}
                          onChange={e => {
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
                  <Bot className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-40" />
                  <h3 className="font-medium text-lg mb-2">AI-written follow-up sequence</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">Gemini writes 4 follow-up messages at Days 3, 7, 14, and 21 — each with a different angle.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
