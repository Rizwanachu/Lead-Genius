import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLeads, Lead } from "@/lib/storage";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, Copy, ArrowLeft, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TEMPLATES = [
  { id: 'modern', name: 'Modern Minimal', desc: 'Clean lines, lots of whitespace' },
  { id: 'bold', name: 'Bold & Colorful', desc: 'High contrast, vibrant' },
  { id: 'classic', name: 'Classic Professional', desc: 'Corporate, trustworthy' },
  { id: 'food', name: 'Restaurant/Food', desc: 'Image-heavy, appetizing' },
  { id: 'service', name: 'Service Business', desc: 'Trust-focused, clear CTAs' }
];

const COLORS = [
  { id: 'blue', class: 'bg-blue-600', val: '#2563eb' },
  { id: 'emerald', class: 'bg-emerald-600', val: '#059669' },
  { id: 'rose', class: 'bg-rose-600', val: '#e11d48' },
  { id: 'amber', class: 'bg-amber-500', val: '#f59e0b' },
  { id: 'slate', class: 'bg-slate-800', val: '#1e293b' },
];

export default function WebsiteMockup() {
  const [, setLocation] = useLocation();
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [formData, setFormData] = useState({
    leadId: "manual",
    businessName: "Acme Corp",
    businessType: "Local Business",
    city: "San Francisco",
    phone: "(555) 123-4567",
    color: "#2563eb",
    template: "modern"
  });

  useEffect(() => {
    setSavedLeads(getLeads());
  }, []);

  const handleLeadSelect = (id: string) => {
    if (id === "manual") {
      setFormData(prev => ({ ...prev, leadId: id, businessName: "", businessType: "", city: "", phone: "" }));
      return;
    }
    
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
      setFormData(prev => ({
        ...prev,
        leadId: id,
        businessName: lead.businessName,
        businessType: lead.category,
        city: lead.city,
        phone: lead.phone || "(555) 123-4567"
      }));
    }
  };

  const handleGenerate = () => {
    if (!formData.businessName) {
      toast.error("Business Name is required");
      return;
    }
    setIsLoading(true);
    setIsGenerated(false);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
      toast.success("Mockup generated successfully!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-20 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center gap-4 shrink-0 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Instant Mockup Generator</h1>
          </div>
        </div>
        
        {isGenerated && (
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
              <Button variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2" onClick={() => setViewMode('desktop')}>
                <Monitor className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'tablet' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2" onClick={() => setViewMode('tablet')}>
                <Tablet className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2" onClick={() => setViewMode('mobile')}>
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="w-px h-6 bg-border mx-1"></div>
            
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(`https://leadhunter.ai/m/${Math.random().toString(36).substring(7)}`);
              toast.success("Mock URL copied!");
            }}>
              <Copy className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button size="sm" onClick={() => setLocation(formData.leadId !== 'manual' ? `/outreach?lead=${formData.leadId}` : '/outreach')}>
              <Send className="w-4 h-4 mr-2" /> Use in Outreach
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel: Config */}
        <div className="w-80 shrink-0 flex flex-col overflow-y-auto pr-2 pb-6 space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label>Client Data</Label>
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

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name</Label>
                  <Input className="h-8 text-sm" value={formData.businessName} onChange={e => setFormData(prev => ({...prev, businessName: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Industry</Label>
                  <Input className="h-8 text-sm" value={formData.businessType} onChange={e => setFormData(prev => ({...prev, businessType: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Input className="h-8 text-sm" value={formData.city} onChange={e => setFormData(prev => ({...prev, city: e.target.value}))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input className="h-8 text-sm" value={formData.phone} onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))} />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Brand Color</Label>
                <div className="flex gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFormData(prev => ({...prev, color: c.val}))}
                      className={`w-8 h-8 rounded-full ${c.class} ring-offset-2 ring-offset-background transition-all ${formData.color === c.val ? 'ring-2 ring-foreground scale-110' : 'opacity-80 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Template</Label>
                <div className="space-y-2">
                  {TEMPLATES.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setFormData(prev => ({...prev, template: t.id}))}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.template === t.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/50'}`}
                    >
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} className="w-full" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Preview'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Preview Area */}
        <div className="flex-1 bg-muted/30 border border-border/50 rounded-xl overflow-hidden relative flex items-center justify-center">
          {!isGenerated && !isLoading && (
            <div className="text-center text-muted-foreground opacity-50">
              <Monitor className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">No Mockup Generated</p>
            </div>
          )}

          {isLoading && (
            <div className="w-full h-full p-8 flex items-center justify-center">
              <div className="w-full max-w-3xl space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {isGenerated && !isLoading && (
            <div className="w-full h-full overflow-auto flex justify-center bg-[#f0f0f0] p-8 custom-scrollbar">
              <div 
                className={`transition-all duration-500 origin-top bg-white shadow-2xl relative ${
                  viewMode === 'mobile' 
                    ? 'w-[375px] rounded-[3rem] border-[12px] border-slate-800 h-[812px] overflow-hidden' 
                    : viewMode === 'tablet' 
                    ? 'w-[768px] min-h-[1024px] rounded-xl overflow-hidden' 
                    : 'w-full max-w-[1200px] min-h-[800px] rounded-xl overflow-hidden'
                }`}
              >
                {viewMode === 'mobile' && (
                  <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                    <div className="w-32 h-6 bg-slate-800 rounded-b-xl"></div>
                  </div>
                )}
                
                {/* Embedded Template Component */}
                <div className={`w-full h-full bg-white text-slate-900 ${viewMode === 'mobile' ? 'overflow-y-auto overflow-x-hidden pt-6' : ''}`}>
                  <MockupTemplate 
                    name={formData.businessName}
                    type={formData.businessType}
                    city={formData.city}
                    phone={formData.phone}
                    color={formData.color}
                    template={formData.template}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inner Component to render the actual mockup design
function MockupTemplate({ name, type, city, phone, color, template }: any) {
  
  if (template === 'bold') {
    return (
      <div className="font-sans">
        <header className="p-6 flex justify-between items-center" style={{ backgroundColor: color }}>
          <div className="text-2xl font-black text-white uppercase tracking-tighter">{name}</div>
          <button className="bg-black text-white px-6 py-2 rounded-full font-bold uppercase text-sm">Call Now</button>
        </header>
        <section className="py-24 px-8 text-center" style={{ backgroundColor: color }}>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase leading-none mb-6 max-w-4xl mx-auto">THE BEST {type} IN {city}</h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Bold, uncompromising service that gets results.</p>
          <button className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform">Get Started</button>
        </section>
        <section className="py-20 px-8 bg-black text-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/10 p-8 border border-white/20">
                <div className="w-16 h-16 mb-6 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: color }}>★</div>
                <h3 className="text-2xl font-bold mb-4 uppercase">Service {i}</h3>
                <p className="text-white/60 leading-relaxed">High quality solutions tailored to your exact needs with proven results.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Default: Modern Minimal (or others if expanding)
  return (
    <div className="font-sans antialiased text-slate-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight">{name}</div>
        <div className="hidden md:flex gap-8 font-medium text-slate-500">
          <span>Services</span>
          <span>About</span>
          <span>Reviews</span>
        </div>
        <button className="px-6 py-2.5 rounded-lg text-white font-medium shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: color }}>
          Book Now
        </button>
      </nav>

      {/* Hero */}
      <section className="px-8 py-20 md:py-32 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${color}15`, color: color }}>
          Premier {type} in {city}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
          Exceptional quality. <br/>Local convenience.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          We provide top-tier {type.toLowerCase()} services to the {city} community. Experience the difference today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl shadow-blue-500/20 text-lg hover:-translate-y-1 transition-transform" style={{ backgroundColor: color }}>
            Schedule an Appointment
          </button>
          <button className="px-8 py-4 rounded-xl text-slate-700 bg-slate-100 font-semibold text-lg hover:bg-slate-200 transition-colors">
            {phone}
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Comprehensive solutions for all your needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Core Offering', icon: '✦' },
              { title: 'Premium Service', icon: '◈' },
              { title: 'Maintenance', icon: '❖' }
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-6 text-white shadow-inner" style={{ backgroundColor: color }}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed">Professional {s.title.toLowerCase()} delivered with expertise and care for maximum satisfaction.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-white text-2xl font-bold mb-4">{name}</div>
            <p className="max-w-sm mb-6">Your trusted {type.toLowerCase()} in {city}. Open Monday to Saturday.</p>
          </div>
          <div className="md:text-right">
            <div className="text-white font-medium mb-4">Contact Us</div>
            <p>{phone}</p>
            <p>contact@{name.replace(/[^a-zA-Z]/g, '').toLowerCase()}.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}