import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Instagram, Facebook, Twitter, Youtube, Linkedin, Globe, MapPin, Star, AlertCircle, BarChart3, Target, Calendar, Download, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import ScoreBadge from "@/components/ScoreBadge";

export default function MarketingTools() {
  const [activeTab, setActiveTab] = useState("audit");
  
  // Tab 1: Audit State
  const [auditQuery, setAuditQuery] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Tab 2: Calendar State
  const [calType, setCalType] = useState("");
  const [isGeneratingCal, setIsGeneratingCal] = useState(false);
  const [calResult, setCalResult] = useState(false);

  // Tab 3: Competitor State
  const [compQuery, setCompQuery] = useState("");
  const [isAnalyzingComp, setIsAnalyzingComp] = useState(false);
  const [compResult, setCompResult] = useState(false);

  const runAudit = (): void => {
    if(!auditQuery) { toast.error("Enter a business name to audit"); return; }
    setIsAuditing(true);
    setTimeout(() => {
      setAuditResult(true);
      setIsAuditing(false);
      toast.success("Audit complete");
    }, 1500);
  };

  const generateCalendar = (): void => {
    if(!calType) { toast.error("Enter a business type"); return; }
    setIsGeneratingCal(true);
    setTimeout(() => {
      setCalResult(true);
      setIsGeneratingCal(false);
      toast.success("Calendar generated");
    }, 1500);
  };

  const analyzeCompetitors = (): void => {
    if(!compQuery) { toast.error("Enter business details"); return; }
    setIsAnalyzingComp(true);
    setTimeout(() => {
      setCompResult(true);
      setIsAnalyzingComp(false);
      toast.success("Competitor analysis complete");
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Toolkit</h1>
        <p className="text-muted-foreground mt-1">Generate audits, content calendars, and competitive intelligence to close more deals.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto bg-card border">
          <TabsTrigger value="audit" className="py-2.5"><BarChart3 className="w-4 h-4 mr-2" /> Social Audit</TabsTrigger>
          <TabsTrigger value="calendar" className="py-2.5"><Calendar className="w-4 h-4 mr-2" /> Content Cal</TabsTrigger>
          <TabsTrigger value="competitor" className="py-2.5"><Target className="w-4 h-4 mr-2" /> Competitors</TabsTrigger>
          <TabsTrigger value="seo" className="py-2.5"><Search className="w-4 h-4 mr-2" /> Local SEO</TabsTrigger>
          <TabsTrigger value="reputation" className="py-2.5"><Star className="w-4 h-4 mr-2" /> Reputation</TabsTrigger>
        </TabsList>

        {/* TAB 1: SOCIAL AUDIT */}
        <TabsContent value="audit" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">Business Name or Handle</label>
                <Input 
                  placeholder="e.g. Mario's Pizza or @mariospizza" 
                  value={auditQuery}
                  onChange={e => setAuditQuery(e.target.value)}
                />
              </div>
              <Button onClick={runAudit} disabled={isAuditing} className="w-full md:w-auto">
                {isAuditing ? "Scanning..." : "Run Fast Audit"}
              </Button>
            </CardContent>
          </Card>

          {isAuditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          )}

          {auditResult && !isAuditing && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Instagram, name: "Instagram", status: "Active", followers: "1.2k", score: 65, color: "text-pink-600" },
                  { icon: Facebook, name: "Facebook", status: "Inactive", followers: "850", score: 30, color: "text-blue-600" },
                  { icon: Linkedin, name: "LinkedIn", status: "Missing", followers: "0", score: 0, color: "text-sky-700" },
                  { icon: MapPin, name: "Google", status: "Unclaimed", followers: "42 Reviews", score: 20, color: "text-red-500" },
                ].map((p, i) => (
                  <Card key={i}>
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <p.icon className={`w-8 h-8 mb-3 ${p.color}`} />
                      <h3 className="font-semibold">{p.name}</h3>
                      <Badge variant={p.status === 'Missing' || p.status === 'Unclaimed' ? 'destructive' : p.status === 'Inactive' ? 'secondary' : 'default'} className="my-2">
                        {p.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{p.followers}</div>
                      <div className="mt-4 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${p.score > 50 ? 'bg-primary' : 'bg-destructive'}`} style={{width: `${p.score}%`}} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary"><AlertCircle className="w-5 h-5" /> Quick Win Pitch</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 font-medium">
                    <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> They are losing search traffic because their Google Business profile is unclaimed. Offer a $199 setup package.</li>
                    <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Facebook hasn't been updated in 6 months. Offer a basic social management package.</li>
                    <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Instagram bio is missing a website link. Easy conversation starter.</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* TAB 2: CONTENT CALENDAR */}
        <TabsContent value="calendar" className="mt-6 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">Business Niche</label>
                <Input placeholder="e.g. Yoga Studio" value={calType} onChange={e => setCalType(e.target.value)} />
              </div>
              <Button onClick={generateCalendar} disabled={isGeneratingCal} className="w-full md:w-auto">
                {isGeneratingCal ? "Generating 30 Days of Content..." : "Generate Calendar"}
              </Button>
            </CardContent>
          </Card>

          {isGeneratingCal && <Skeleton className="h-[500px] w-full rounded-xl" />}

          {calResult && !isGeneratingCal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="border rounded-xl bg-card overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" /> 30-Day Strategy for {calType}</h3>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border p-[1px]">
                {Array.from({length: 12}).map((_, i) => {
                  const types = ["Reel", "Carousel", "Story", "Static"];
                  const icons = [Instagram, Facebook];
                  const t = types[i % 4];
                  const Ico = icons[i % 2];
                  return (
                    <div key={i} className="bg-card p-4 min-h-[120px] flex flex-col">
                      <div className="text-xs text-muted-foreground font-medium mb-2">Day {i+1}</div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Ico className="w-3.5 h-3.5 text-primary" />
                        <Badge variant="outline" className="text-[10px] h-5">{t}</Badge>
                      </div>
                      <p className="text-sm font-medium leading-snug">Behind the scenes: {calType} preparation & setup</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* TAB 3: COMPETITOR INTELLIGENCE */}
        <TabsContent value="competitor" className="mt-6 space-y-6">
           <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">Industry & City</label>
                <Input placeholder="e.g. Plumbers in Austin, TX" value={compQuery} onChange={e => setCompQuery(e.target.value)} />
              </div>
              <Button onClick={analyzeCompetitors} disabled={isAnalyzingComp} className="w-full md:w-auto">
                {isAnalyzingComp ? "Scanning Competitors..." : "Analyze Competitors"}
              </Button>
            </CardContent>
          </Card>

          {isAnalyzingComp && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          )}

          {compResult && !isAnalyzingComp && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {name: "ProFlow Plumbing", score: 4.8, revs: 412, url: "proflow.com", weak: "No online booking"},
                {name: "Austin Pipe Experts", score: 4.5, revs: 205, url: "austinpipe.com", weak: "Outdated 90s design"},
                {name: "City Metro Rooter", score: 3.9, revs: 88, url: "None", weak: "No website, bad reviews"}
              ].map((c, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${i===0 ? 'bg-emerald-500' : i===1 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <CardContent className="p-6 pt-8">
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm font-medium">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {c.score} <span className="text-muted-foreground font-normal">({c.revs} reviews)</span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Website</span>
                        <span className="font-medium text-primary">{c.url}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-muted-foreground">Vulnerability</span>
                        <span className="font-medium text-destructive">{c.weak}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* TAB 4: SEO */}
        <TabsContent value="seo" className="mt-6">
          <Card className="border-border/50 shadow-sm bg-card/50">
            <CardHeader className="text-center pb-2">
              <CardTitle>Local SEO Checklist Generator</CardTitle>
              <CardDescription>Run a technical SEO check to send as a PDF lead magnet.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl mx-auto mt-6 pb-8">
              <div className="space-y-4">
                {["Google My Business Claimed", "NAP Consistency across directories", "Mobile Responsive Website", "H1/H2 Tags Optimized for local keywords", "Schema Markup present", "SSL Certificate (HTTPS)"].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-md bg-muted/30 border">
                    <Checkbox id={`check-${i}`} defaultChecked={i % 2 === 0} />
                    <label htmlFor={`check-${i}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {item}
                    </label>
                  </div>
                ))}
                <Button className="w-full mt-6"><Download className="w-4 h-4 mr-2" /> Download SEO Audit PDF</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: REPUTATION */}
        <TabsContent value="reputation" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Response Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  5-Star Response <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded border text-muted-foreground">
                  "Thank you so much for the 5-star review! We're thrilled to hear you had a great experience with our team. We look forward to seeing you again soon!"
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  1-Star Response (Damage Control) <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                </div>
                <div className="text-sm bg-muted/50 p-3 rounded border text-muted-foreground">
                  "We sincerely apologize that your experience didn't meet expectations. We take this seriously and would like to make things right. Please contact our manager directly at [Phone/Email]."
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Generation SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  SMS Template <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                </div>
                <div className="text-sm bg-primary/10 p-3 rounded border border-primary/20 text-foreground font-medium">
                  "Hi [Name], thanks for choosing [Business]. If you have a minute, we'd love your feedback! Leave a review here: [Google Link]"
                </div>
              </div>
              <Button variant="outline" className="w-full">Pitch "Automated Review System"</Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}