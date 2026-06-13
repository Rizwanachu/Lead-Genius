import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getLeads, Lead } from "@/lib/storage";
import { toast } from "sonner";
import { Printer, Copy, MessageCircle, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

const PACKAGES = [
  { id: 'starter', name: 'Starter Website', description: 'Professional 5-page website', price: '$1,200 - $2,500' },
  { id: 'growth', name: 'Growth Bundle', description: 'Website + Local SEO + Google Business', price: '$2,500 - $3,500' },
  { id: 'social', name: 'Social Media Management', description: 'Content creation + scheduling + engagement', price: '$800 - $1,500/mo' },
  { id: 'agency', name: 'Full Agency Package', description: 'Website + SEO + Social + Ads Management', price: '$3,500 - $5,000/mo' }
];

export default function ProposalGenerator() {
  const [, setLocation] = useLocation();
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  
  const [formData, setFormData] = useState({
    leadId: "manual",
    businessName: "Acme Corp",
    businessType: "Local Business",
    city: "San Francisco",
    packageId: "starter",
    customPrice: "",
    timeline: "2 weeks"
  });

  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    setSavedLeads(getLeads());
  }, []);

  const handleLeadSelect = (id: string) => {
    if (id === "manual") {
      setFormData(prev => ({ ...prev, leadId: id, businessName: "", businessType: "", city: "" }));
      return;
    }
    
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
      setFormData(prev => ({
        ...prev,
        leadId: id,
        businessName: lead.businessName,
        businessType: lead.category,
        city: lead.city
      }));
    }
  };

  const handleGenerate = () => {
    if (!formData.businessName || !formData.city) {
      toast.error("Business Name and City are required");
      return;
    }
    setIsGenerated(true);
    toast.success("Proposal generated successfully!");
  };

  const selectedPackage = PACKAGES.find(p => p.id === formData.packageId) || PACKAGES[0];
  const finalPrice = formData.customPrice || selectedPackage.price;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-4 z-20 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Proposal Generator</h1>
          </div>
        </div>
        
        {isGenerated && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(`https://leadhunter.ai/p/${Math.random().toString(36).substring(7)}`);
              toast.success("Share link copied!");
            }}>
              <Copy className="w-4 h-4 mr-2" /> Share Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" onClick={() => setLocation(formData.leadId !== 'manual' ? `/conversations?lead=${formData.leadId}` : '/conversations')}>
              <MessageCircle className="w-4 h-4 mr-2" /> Start Conversation
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Config */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Client / Lead</Label>
                <Select value={formData.leadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger><SelectValue placeholder="Select saved lead" /></SelectTrigger>
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
                  <Input value={formData.businessName} onChange={e => setFormData(prev => ({...prev, businessName: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input value={formData.businessType} onChange={e => setFormData(prev => ({...prev, businessType: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={e => setFormData(prev => ({...prev, city: e.target.value}))} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <Label>Select Package</Label>
                <div className="space-y-2">
                  {PACKAGES.map(pkg => (
                    <div 
                      key={pkg.id}
                      onClick={() => setFormData(prev => ({...prev, packageId: pkg.id}))}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.packageId === pkg.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/50 hover:bg-muted/50'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{pkg.name}</span>
                        {formData.packageId === pkg.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Select value={formData.timeline} onValueChange={v => setFormData(prev => ({...prev, timeline: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="4 weeks">4 weeks</SelectItem>
                      <SelectItem value="6 weeks">6 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Custom Price (Opt)</Label>
                  <Input 
                    placeholder={selectedPackage.price}
                    value={formData.customPrice}
                    onChange={e => setFormData(prev => ({...prev, customPrice: e.target.value}))}
                  />
                </div>
              </div>

              <Button onClick={handleGenerate} className="w-full gap-2">
                <FileText className="w-4 h-4" /> Generate Proposal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:col-span-8">
          {isGenerated ? (
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 font-serif" id="proposal-document">
              {/* Proposal Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                <div>
                  <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">
                    YA
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">PROPOSAL</h1>
                  <p className="text-slate-500 font-sans mt-2">Prepared for {formData.businessName}</p>
                </div>
                <div className="text-right font-sans text-sm text-slate-500">
                  <p className="font-semibold text-slate-800">Your Agency</p>
                  <p>{new Date().toLocaleDateString()}</p>
                  <p>Ref: #PRP-{Math.floor(Math.random() * 10000)}</p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Exec Summary */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Executive Summary</h2>
                  <div className="space-y-3 text-slate-700 leading-relaxed">
                    <p>Thank you for considering our team for your digital growth strategy. We specialize in helping {formData.businessType.toLowerCase()}s in {formData.city} expand their reach and increase revenue through highly optimized online experiences.</p>
                    <p>Based on our initial analysis of {formData.businessName}, there is a significant opportunity to capture local market share currently being lost to competitors with stronger digital footprints.</p>
                  </div>
                </section>

                {/* The Problem */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">The Opportunity Gap</h2>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li>Missing a modern, conversion-optimized online presence.</li>
                    <li>Losing local search traffic due to under-optimized {formData.businessType} keywords in {formData.city}.</li>
                    <li>Lack of automated funnels to capture leads and bookings 24/7.</li>
                  </ul>
                </section>

                {/* Scope */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Our Solution: {selectedPackage.name}</h2>
                  <p className="text-slate-700 mb-4">{selectedPackage.description}</p>
                  <div className="bg-slate-50 p-6 rounded-lg font-sans border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Scope of Work</h3>
                    <div className="space-y-3 text-sm text-slate-700">
                      <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Full technical audit and discovery phase</div>
                      <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Custom design and development</div>
                      <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Mobile optimization and speed enhancements</div>
                      <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" /> Launch and handover training</div>
                    </div>
                  </div>
                </section>

                {/* Investment */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Investment</h2>
                  <div className="border border-slate-200 rounded-lg overflow-hidden font-sans">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="p-4 font-medium">Service</th>
                          <th className="p-4 font-medium text-right">Investment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-4 text-slate-800 font-medium">{selectedPackage.name} Implementation</td>
                          <td className="p-4 text-right text-slate-600">{finalPrice}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-slate-800 font-medium">Setup & Strategy Fee</td>
                          <td className="p-4 text-right text-slate-600">Included</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-4 text-slate-900 font-bold uppercase tracking-wider text-sm">Total Estimate</td>
                          <td className="p-4 text-right text-slate-900 font-bold">{finalPrice}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-500 mt-3 font-sans italic">Payment Terms: 50% required to commence work, 50% upon completion and launch.</p>
                </section>

                {/* Timeline */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 border-l-4 border-slate-900 pl-3">Timeline</h2>
                  <p className="text-slate-700">Estimated delivery: <span className="font-bold text-slate-900">{formData.timeline}</span> from contract signing and initial deposit.</p>
                </section>

                <div className="border-t border-slate-200 pt-8 mt-12 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to grow your business?</h3>
                  <p className="text-slate-600 mb-6">Let's build something great together.</p>
                  <div className="inline-block border-2 border-slate-900 text-slate-900 font-bold py-3 px-8 rounded-lg uppercase tracking-widest text-sm">
                    Sign Proposal to Begin
                  </div>
                  <p className="text-xs text-slate-400 mt-6 font-sans uppercase tracking-widest">This proposal expires in 14 days</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/10">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-lg">No Proposal Generated</p>
              <p className="text-sm">Configure options on the left and click Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}