import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLeads, Lead } from "@/lib/storage";
import { toast } from "sonner";
import { Monitor, Smartphone, Tablet, Copy, ArrowLeft, Send, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TEMPLATES = [
  { id: 'modern', name: 'Modern Minimal', desc: 'Clean, whitespace-heavy, high-end feel' },
  { id: 'bold', name: 'Bold & Vibrant', desc: 'High contrast, eye-catching CTAs' },
  { id: 'classic', name: 'Classic Professional', desc: 'Corporate, trustworthy, traditional' },
  { id: 'food', name: 'Restaurant / Food', desc: 'Image-heavy, warm, appetite-driven' },
  { id: 'service', name: 'Service Business', desc: 'Trust-focused, strong social proof' },
];

const COLORS = [
  { id: 'blue',    label: 'Ocean',   val: '#2563eb', bg: 'bg-blue-600' },
  { id: 'emerald', label: 'Forest',  val: '#059669', bg: 'bg-emerald-600' },
  { id: 'rose',    label: 'Rose',    val: '#e11d48', bg: 'bg-rose-600' },
  { id: 'amber',   label: 'Golden',  val: '#d97706', bg: 'bg-amber-600' },
  { id: 'violet',  label: 'Violet',  val: '#7c3aed', bg: 'bg-violet-600' },
  { id: 'slate',   label: 'Slate',   val: '#334155', bg: 'bg-slate-700' },
];

export default function WebsiteMockup() {
  const [, setLocation] = useLocation();
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    leadId: 'manual',
    businessName: 'Bella Vista Kitchen',
    businessType: 'Restaurant',
    city: 'San Francisco',
    phone: '(415) 555-0192',
    tagline: 'Authentic flavors, local heart.',
    color: '#2563eb',
    template: 'modern',
  });

  useEffect(() => { setSavedLeads(getLeads()); }, []);

  const handleLeadSelect = (id: string) => {
    if (id === 'manual') {
      setFormData(p => ({ ...p, leadId: id, businessName: '', businessType: '', city: '', phone: '', tagline: '' }));
      return;
    }
    const lead = savedLeads.find(l => l.id === id);
    if (lead) {
      setFormData(p => ({
        ...p, leadId: id,
        businessName: lead.businessName,
        businessType: lead.category,
        city: lead.city,
        phone: lead.phone || '(555) 123-4567',
        tagline: `The best ${lead.category} in ${lead.city}.`,
      }));
    }
  };

  const handleGenerate = () => {
    if (!formData.businessName) { toast.error('Business Name is required'); return; }
    setIsLoading(true); setIsGenerated(false);
    setTimeout(() => { setIsLoading(false); setIsGenerated(true); toast.success('Mockup generated!'); }, 900);
  };

  const previewWidth = viewMode === 'mobile' ? 390 : viewMode === 'tablet' ? 768 : 1200;

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto pb-20 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 shrink-0 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Instant Mockup Generator</h1>
            <p className="text-xs text-muted-foreground">Build a demo site in seconds — then send the link in your outreach</p>
          </div>
        </div>
        {isGenerated && (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border gap-0.5">
              {(['desktop','tablet','mobile'] as const).map(m => (
                <Button key={m} variant={viewMode === m ? 'secondary' : 'ghost'} size="sm" className="h-8 px-2.5" onClick={() => setViewMode(m)}>
                  {m === 'desktop' ? <Monitor className="w-4 h-4" /> : m === 'tablet' ? <Tablet className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`https://preview.leadhunter.ai/m/${Math.random().toString(36).substring(7)}`); toast.success('Preview link copied!'); }}>
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button size="sm" onClick={() => setLocation(formData.leadId !== 'manual' ? `/outreach?lead=${formData.leadId}` : '/outreach')}>
              <Send className="w-4 h-4 mr-2" /> Use in Outreach
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Config Panel */}
        <div className="w-72 shrink-0 overflow-y-auto space-y-4 pb-4 pr-1">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Load from Lead</Label>
                <Select value={formData.leadId} onValueChange={handleLeadSelect}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select lead" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                    {savedLeads.map(l => <SelectItem key={l.id} value={l.id}>{l.businessName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2 border-t">
                {[
                  { label: 'Business Name', key: 'businessName', placeholder: 'e.g. Mario\'s Pizza' },
                  { label: 'Industry', key: 'businessType', placeholder: 'e.g. Restaurant' },
                  { label: 'City', key: 'city', placeholder: 'e.g. Chicago' },
                  { label: 'Phone', key: 'phone', placeholder: '(555) 000-0000' },
                  { label: 'Tagline', key: 'tagline', placeholder: 'One-line value prop' },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs">{f.label}</Label>
                    <Input className="h-8 text-sm" placeholder={f.placeholder}
                      value={(formData as any)[f.key]}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">Brand Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c.id} title={c.label} onClick={() => setFormData(p => ({ ...p, color: c.val }))}
                      className={`w-8 h-8 rounded-full ${c.bg} ring-offset-2 ring-offset-background transition-all ${formData.color === c.val ? 'ring-2 ring-foreground scale-110' : 'opacity-70 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">Template Style</Label>
                <div className="space-y-1.5">
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => setFormData(p => ({ ...p, template: t.id }))}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${formData.template === t.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/40'}`}>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerate} className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate Preview'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#1a1a2e] rounded-xl overflow-hidden relative flex flex-col min-h-0">
          {/* Browser chrome */}
          {isGenerated && (
            <div className="shrink-0 bg-[#2d2d44] px-4 py-2.5 flex items-center gap-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-[#1a1a2e] rounded-md px-3 py-1 text-xs text-white/40 font-mono">
                {formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
              </div>
              <div className="text-xs text-white/30">{previewWidth}px</div>
            </div>
          )}

          <div className="flex-1 overflow-auto flex items-start justify-center p-6 min-h-0">
            {!isGenerated && !isLoading && (
              <div className="text-center text-white/30 my-auto">
                <Monitor className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Configure and click Generate</p>
                <p className="text-sm mt-1">Preview will appear here</p>
              </div>
            )}
            {isLoading && (
              <div className="w-full max-w-3xl space-y-3 my-auto">
                <Skeleton className="h-72 w-full rounded-xl" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            )}
            {isGenerated && !isLoading && (
              <div
                className="bg-white shadow-2xl origin-top transition-all duration-500"
                style={{
                  width: previewWidth,
                  minHeight: 800,
                  borderRadius: viewMode === 'mobile' ? 24 : 8,
                  border: viewMode === 'mobile' ? '10px solid #1e293b' : 'none',
                  transform: viewMode === 'desktop' ? 'scale(0.72)' : viewMode === 'tablet' ? 'scale(0.82)' : 'scale(0.9)',
                  transformOrigin: 'top center',
                  marginBottom: viewMode === 'desktop' ? '-28%' : viewMode === 'tablet' ? '-18%' : '-10%',
                }}
              >
                <MockupTemplate
                  name={formData.businessName}
                  type={formData.businessType}
                  city={formData.city}
                  phone={formData.phone}
                  tagline={formData.tagline}
                  color={formData.color}
                  template={formData.template}
                  isMobile={viewMode === 'mobile'}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function hex2rgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

interface MockupProps { name: string; type: string; city: string; phone: string; tagline: string; color: string; template: string; isMobile?: boolean; }

function MockupTemplate({ name, type, city, phone, tagline, color, template, isMobile }: MockupProps) {
  const rgb = hex2rgb(color);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const tag = tagline || `The best ${type} in ${city}.`;

  const services = [
    { title: type === 'Restaurant' ? 'Dine In' : type === 'Gym' ? 'Personal Training' : 'Consultation', desc: `Premium ${type.toLowerCase()} experience tailored just for you.`, icon: '✦' },
    { title: type === 'Restaurant' ? 'Takeaway' : type === 'Gym' ? 'Group Classes' : 'Full Service', desc: `Convenient and fast — designed around your lifestyle.`, icon: '◈' },
    { title: type === 'Restaurant' ? 'Catering' : type === 'Gym' ? 'Nutrition Plans' : 'Support & Follow-up', desc: `We go the extra mile for every single client.`, icon: '❖' },
  ];

  const reviews = [
    { name: 'Sarah M.', text: `Best ${type.toLowerCase()} in the whole ${city} area — hands down!`, stars: 5 },
    { name: 'James R.', text: `Incredible quality and super friendly team. Will be back!`, stars: 5 },
    { name: 'Priya K.', text: `Finally a place that actually cares about their customers.`, stars: 5 },
  ];

  if (template === 'food') {
    return (
      <div style={{ fontFamily: "'Georgia', serif", color: '#1a0a00', background: '#fff' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 60px', borderBottom: '1px solid #f0e6d3', background: '#fffbf5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials}</div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>{name}</span>
          </div>
          {!isMobile && <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#7c5c3e' }}>
            <span>Menu</span><span>Reservations</span><span>About</span><span>Contact</span>
          </div>}
          <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Reserve Table</button>
        </nav>

        <section style={{ background: `linear-gradient(135deg, #2d1b0e 0%, #5c3317 100%)`, padding: isMobile ? '60px 24px' : '100px 60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: `rgba(${rgb},0.3)`, color: '#f5c27f', borderRadius: 20, padding: '6px 18px', fontSize: 12, fontWeight: 600, letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>Now Open in {city}</div>
          <h1 style={{ color: '#fff', fontSize: isMobile ? 36 : 64, fontWeight: 700, lineHeight: 1.1, marginBottom: 20, margin: '0 0 20px' }}>{name}</h1>
          <p style={{ color: '#d4a96a', fontSize: isMobile ? 16 : 20, maxWidth: 520, margin: '0 auto 36px' }}>{tag}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Reserve a Table</button>
            <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '14px 32px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>View Menu</button>
          </div>
        </section>

        <section style={{ padding: isMobile ? '40px 24px' : '70px 60px', background: '#fffbf5' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 700, color: '#2d1b0e' }}>What We Offer</h2>
            <p style={{ color: '#7c5c3e', marginTop: 8 }}>Crafted with love, served with pride</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 24 }}>
            {services.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #f0e6d3', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `rgba(${rgb},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22, color: color }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#2d1b0e' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#7c5c3e', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: isMobile ? '40px 24px' : '70px 60px', background: '#2d1b0e' }}>
          <h2 style={{ color: '#fff', fontSize: isMobile ? 22 : 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>What Our Guests Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                <div style={{ color: '#f5c27f', fontSize: 16, marginBottom: 12 }}>{'★★★★★'}</div>
                <p style={{ color: '#e8d5b5', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>"{r.text}"</p>
                <p style={{ color: '#a08060', fontSize: 13, fontWeight: 600 }}>— {r.name}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ background: '#1a0a00', color: '#a08060', padding: isMobile ? '30px 24px' : '40px 60px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{name}</div>
            <p style={{ fontSize: 13 }}>{city} • Open Daily</p>
          </div>
          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <p style={{ fontSize: 13, marginBottom: 4 }}>{phone}</p>
            <p style={{ fontSize: 13 }}>reservations@{name.replace(/[^a-zA-Z]/g,'').toLowerCase()}.com</p>
          </div>
        </footer>
      </div>
    );
  }

  if (template === 'bold') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#000', color: '#fff' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 50px', background: '#0a0a0a', borderBottom: `2px solid ${color}` }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase', color: '#fff' }}>{name}</div>
          {!isMobile && <div style={{ display: 'flex', gap: 28, fontSize: 13, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            <span>Services</span><span>Portfolio</span><span>Pricing</span>
          </div>}
          <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, cursor: 'pointer' }}>Call Now</button>
        </nav>

        <section style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)`, padding: isMobile ? '70px 24px' : '120px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 300, height: 300, borderRadius: '50%', background: `rgba(${rgb},0.15)`, filter: 'blur(60px)' }} />
          <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, color: color, marginBottom: 20 }}>#{type.toUpperCase()} IN {city.toUpperCase()}</div>
          <h1 style={{ fontSize: isMobile ? 42 : 80, fontWeight: 900, lineHeight: 0.95, margin: '0 0 28px', textTransform: 'uppercase', letterSpacing: '-2px' }}>
            {name.split(' ').map((w, i) => <span key={i} style={{ display: 'block', color: i % 2 === 0 ? '#fff' : color }}>{w}</span>)}
          </h1>
          <p style={{ color: '#888', fontSize: isMobile ? 15 : 18, maxWidth: 480, lineHeight: 1.6, marginBottom: 36 }}>{tag}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 4, padding: '16px 36px', fontWeight: 800, fontSize: 15, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: 1 }}>Get Started Now</button>
            <button style={{ background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '16px 36px', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', cursor: 'pointer' }}>See Our Work</button>
          </div>
        </section>

        <section style={{ background: '#111', padding: isMobile ? '40px 24px' : '80px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: isMobile ? 26 : 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1 }}>What We Do</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {services.map((s, i) => (
              <div key={i} style={{ borderRadius: 8, padding: 28, background: '#1a1a1a', border: `1px solid ${i === 0 ? color : '#333'}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: `rgba(${rgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: color, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>{s.title}</h3>
                <p style={{ color: '#777', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: color, padding: isMobile ? '50px 24px' : '80px 60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? 28 : 48, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 16 }}>Ready to Dominate?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32 }}>Let's build something that your competitors will envy.</p>
          <button style={{ background: '#fff', color: color, border: 'none', borderRadius: 4, padding: '16px 48px', fontWeight: 900, fontSize: 16, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: 1 }}>Book a Free Call</button>
        </section>

        <footer style={{ background: '#0a0a0a', color: '#555', padding: isMobile ? '24px' : '32px 60px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
          <span style={{ fontWeight: 800, color: '#333', textTransform: 'uppercase' }}>{name}</span>
          <span>{phone} • {city}</span>
        </footer>
      </div>
    );
  }

  if (template === 'classic') {
    return (
      <div style={{ fontFamily: "'Georgia', serif", color: '#1e293b', background: '#fff' }}>
        <div style={{ background: '#1e293b', padding: isMobile ? '10px 20px' : '10px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
          <span>📞 {phone}</span>
          {!isMobile && <span>✉ contact@{name.replace(/[^a-zA-Z]/g,'').toLowerCase()}.com</span>}
          <span>📍 {city}</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '18px 20px' : '22px 60px', borderBottom: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#1e293b', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>{initials}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{name}</div>
              {!isMobile && <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Est. {city}</div>}
            </div>
          </div>
          {!isMobile && <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#475569' }}>
            <span>Home</span><span>Services</span><span>About Us</span><span>Testimonials</span><span>Contact</span>
          </div>}
          <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 22px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Get a Quote</button>
        </nav>

        <section style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', padding: isMobile ? '60px 24px' : '90px 60px' }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'inline-block', background: `rgba(${rgb},0.1)`, color: color, borderRadius: 4, padding: '4px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Trusted in {city} Since 2010</div>
            <h1 style={{ fontSize: isMobile ? 32 : 54, fontWeight: 700, lineHeight: 1.15, margin: '0 0 20px', color: '#0f172a' }}>Reliable. Professional.<br /><span style={{ color: color }}>{type} Services</span></h1>
            <p style={{ color: '#475569', fontSize: isMobile ? 15 : 18, lineHeight: 1.7, marginBottom: 36 }}>{tag} Serving the {city} community with integrity and expertise.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 4, padding: '14px 30px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Request a Free Consultation</button>
              <button style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 4, padding: '14px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>📞 {phone}</button>
            </div>
          </div>
        </section>

        <section style={{ background: '#fff', padding: isMobile ? '40px 24px' : '70px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 700, color: '#0f172a' }}>Our Core Services</h2>
            <div style={{ width: 48, height: 3, background: color, borderRadius: 2, margin: '14px auto 0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 24 }}>
            {services.map((s, i) => (
              <div key={i} style={{ borderRadius: 8, padding: 28, border: `1px solid #e2e8f0`, background: '#fafafa' }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, background: `rgba(${rgb},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: color, marginBottom: 18 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#1e293b' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: '#f8fafc', padding: isMobile ? '40px 24px' : '70px 60px' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 40, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 34, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Why {city} Trusts Us</h2>
              <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: 15 }}>With years of experience and hundreds of satisfied clients, {name} is the go-to {type.toLowerCase()} provider in {city}. We combine expertise with genuine care for every customer.</p>
              {[{ label: '200+', desc: 'Happy Clients' }, { label: '8 yrs', desc: 'In Business' }, { label: '4.9★', desc: 'Average Rating' }].map((stat, i) => (
                <div key={i} style={{ display: 'inline-block', marginTop: 24, marginRight: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: color }}>{stat.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {reviews.slice(0, 2).map((r, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#fbbf24', marginBottom: 10 }}>★★★★★</div>
                  <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7 }}>"{r.text}"</p>
                  <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ background: '#1e293b', color: '#94a3b8', padding: isMobile ? '28px 24px' : '40px 60px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 20, fontSize: 13 }}>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{name}</div>
            <p>Professional {type} Services in {city}</p>
          </div>
          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <p style={{ marginBottom: 4 }}>{phone}</p>
            <p>contact@{name.replace(/[^a-zA-Z]/g,'').toLowerCase()}.com</p>
          </div>
        </footer>
      </div>
    );
  }

  if (template === 'service') {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", color: '#111827', background: '#fff' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '18px 60px', background: '#fff', boxShadow: '0 1px 0 #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>{initials}</div>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{name}</span>
          </div>
          {!isMobile && <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#6b7280' }}>
            <span>Services</span><span>Pricing</span><span>Reviews</span><span>FAQ</span>
          </div>}
          <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Book Now →</button>
        </nav>

        <section style={{ background: `linear-gradient(135deg, rgba(${rgb},0.08) 0%, #fff 70%)`, padding: isMobile ? '60px 24px' : '100px 60px' }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ background: '#fbbf24', width: 6, height: 6, borderRadius: '50%' }} />
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>★★★★★ Rated #1 in {city}</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 34 : 58, fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1px' }}>
              {type} you can <span style={{ color: color }}>actually trust.</span>
            </h1>
            <p style={{ color: '#4b5563', fontSize: isMobile ? 15 : 18, lineHeight: 1.7, marginBottom: 36 }}>{tag} No hidden fees, no shortcuts — just results.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 10, padding: '15px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Get a Free Quote</button>
              <button style={{ background: 'transparent', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 10, padding: '15px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{phone}</button>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
              {[{ n: '500+', l: 'Jobs Done' }, { n: '4.9', l: 'Star Rating' }, { n: '24h', l: 'Response Time' }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: '#f9fafb', padding: isMobile ? '40px 24px' : '80px 60px' }}>
          <h2 style={{ fontSize: isMobile ? 22 : 34, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>What We Offer</h2>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 48 }}>Everything you need, handled by professionals.</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {services.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `rgba(${rgb},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: color, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ marginTop: 16, color: color, fontSize: 13, fontWeight: 600 }}>Learn more →</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: isMobile ? '40px 24px' : '80px 60px', background: '#fff' }}>
          <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>What Our Clients Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
                <div style={{ color: '#fbbf24', fontSize: 16, marginBottom: 12 }}>★★★★★</div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7 }}>"{r.text}"</p>
                <p style={{ marginTop: 16, fontSize: 13, fontWeight: 600 }}>— {r.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: color, padding: isMobile ? '50px 24px' : '70px 60px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: isMobile ? 26 : 42, fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 17, marginBottom: 32 }}>Call us today or book a slot online — we'll handle the rest.</p>
          <button style={{ background: '#fff', color: color, border: 'none', borderRadius: 10, padding: '16px 44px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Book Your Free Consultation</button>
        </section>

        <footer style={{ background: '#111827', color: '#6b7280', padding: isMobile ? '28px 24px' : '40px 60px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
          <div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{name}</div><p>Professional {type} in {city}</p></div>
          <div style={{ textAlign: isMobile ? 'left' : 'right' }}><p style={{ marginBottom: 4 }}>{phone}</p><p>{city}, Available 7 Days</p></div>
        </footer>
      </div>
    );
  }

  // Default: Modern Minimal
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#0f172a', background: '#fff' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 64px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>{initials}</div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>{name}</span>
        </div>
        {!isMobile && <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#64748b', fontWeight: 500 }}>
          <span>Services</span><span>About</span><span>Reviews</span><span>Contact</span>
        </div>}
        <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Book Now</button>
      </nav>

      <section style={{ padding: isMobile ? '70px 24px' : '110px 64px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: `rgba(${rgb},0.08)`, color: color, borderRadius: 20, padding: '6px 18px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>Premier {type} in {city}</div>
        <h1 style={{ fontSize: isMobile ? 38 : 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 24px', color: '#0f172a' }}>
          Exceptional.<br /><span style={{ color: color }}>Every time.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 20, color: '#64748b', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>{tag} Trusted by hundreds of happy customers across {city}.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 10, padding: '16px 36px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: `0 8px 24px rgba(${rgb},0.3)` }}>Schedule Appointment</button>
          <button style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 28px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{phone}</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 60, paddingTop: 40, borderTop: '1px solid #f1f5f9' }}>
          {[{ n: '4.9★', l: 'Average Rating' }, { n: '300+', l: 'Happy Clients' }, { n: `#1`, l: `in ${city}` }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{s.n}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#f8fafc', padding: isMobile ? '50px 24px' : '90px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: isMobile ? 26 : 42, fontWeight: 700, letterSpacing: '-1px', margin: 0 }}>Our Services</h2>
          <p style={{ color: '#94a3b8', marginTop: 10 }}>Everything you need from a top-tier {type.toLowerCase()}.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 24 }}>
          {services.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `rgba(${rgb},0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: color, marginBottom: 20 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>{s.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: isMobile ? '50px 24px' : '90px 64px' }}>
        <h2 style={{ fontSize: isMobile ? 24 : 38, fontWeight: 700, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>What People Are Saying</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ borderRadius: 14, padding: 28, border: '1px solid #e2e8f0', background: '#fafafa' }}>
              <div style={{ color: '#fbbf24', fontSize: 18, marginBottom: 14 }}>★★★★★</div>
              <p style={{ color: '#334155', fontSize: 15, lineHeight: 1.7 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `rgba(${rgb},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: color }}>{r.name[0]}</div>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: `linear-gradient(135deg, rgba(${rgb},0.06) 0%, rgba(${rgb},0.12) 100%)`, margin: isMobile ? '0 24px 40px' : '0 60px 60px', borderRadius: 20, padding: isMobile ? '48px 28px' : '70px 60px', textAlign: 'center', border: `1px solid rgba(${rgb},0.15)` }}>
        <h2 style={{ fontSize: isMobile ? 26 : 42, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>Ready to experience the difference?</h2>
        <p style={{ color: '#64748b', fontSize: 17, marginBottom: 36 }}>Book online in 60 seconds — no calls required.</p>
        <button style={{ background: color, color: '#fff', border: 'none', borderRadius: 12, padding: '16px 48px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 30px rgba(${rgb},0.3)` }}>Book Your Appointment</button>
      </section>

      <footer style={{ background: '#0f172a', color: '#64748b', padding: isMobile ? '32px 24px' : '44px 64px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 20, fontSize: 13 }}>
        <div><div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{name}</div><p>{type} Services · {city}</p></div>
        <div style={{ textAlign: isMobile ? 'left' : 'right' }}><p style={{ marginBottom: 4 }}>{phone}</p><p>contact@{name.replace(/[^a-zA-Z]/g,'').toLowerCase()}.com</p></div>
      </footer>
    </div>
  );
}
