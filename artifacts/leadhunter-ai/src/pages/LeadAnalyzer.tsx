import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Activity, Target, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { TextSkeleton } from "@/components/LoadingSkeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import ScoreBadge from "@/components/ScoreBadge";
import { aiAnalyzeWebsite, aiAnalyzeBusiness } from "@/lib/gemini";

export default function LeadAnalyzer() {
  const [webUrl, setWebUrl] = useState("");
  const [webName, setWebName] = useState("");
  const [isAnalyzingWeb, setIsAnalyzingWeb] = useState(false);
  const [webResult, setWebResult] = useState<any>(null);

  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("");
  const [bizLoc, setBizLoc] = useState("");
  const [isAnalyzingBiz, setIsAnalyzingBiz] = useState(false);
  const [bizResult, setBizResult] = useState<any>(null);

  const handleWebAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webName) { toast.error("Please enter a business name"); return; }
    setIsAnalyzingWeb(true);
    setWebResult(null);
    try {
      const result = await aiAnalyzeWebsite(webName, webUrl);
      setWebResult(result);
      toast.success("AI website analysis complete");
    } catch (err: any) {
      toast.error("Analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAnalyzingWeb(false);
    }
  };

  const handleBizAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizType || !bizLoc) { toast.error("Please fill all fields"); return; }
    setIsAnalyzingBiz(true);
    setBizResult(null);
    try {
      const result = await aiAnalyzeBusiness(bizName, bizType, bizLoc);
      setBizResult(result);
      toast.success("AI business intelligence generated");
    } catch (err: any) {
      toast.error("Analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setIsAnalyzingBiz(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyzer</h1>
        <p className="text-muted-foreground mt-1">Real AI-powered deep dive into a lead's digital presence. Every result is unique.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Website Detector */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Website Detector</h2>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleWebAnalyze} className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={webName} onChange={e => setWebName(e.target.value)} placeholder="e.g. Joe's Plumbing" />
                </div>
                <div className="space-y-2">
                  <Label>Website URL (or leave blank if none)</Label>
                  <Input value={webUrl} onChange={e => setWebUrl(e.target.value)} placeholder="e.g. joesplumbing.net" />
                </div>
                <Button type="submit" disabled={isAnalyzingWeb} className="w-full">
                  {isAnalyzingWeb ? "Gemini AI Analyzing..." : "Run AI Detection"}
                </Button>
              </form>

              {isAnalyzingWeb && <div className="mt-8"><TextSkeleton /></div>}

              {webResult && !isAnalyzingWeb && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                      <span className={`font-semibold ${webResult.status === 'No Website' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                        {webResult.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Overall Opportunity", value: webResult.score },
                        { label: "UX / Design", value: webResult.uxScore },
                        { label: "SEO", value: webResult.seoScore },
                        { label: "Mobile", value: webResult.mobileScore },
                        { label: "Conversion", value: webResult.conversionScore },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-mono font-medium">{value ?? "N/A"}/100</span>
                          </div>
                          <Progress value={value ?? 0} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {webResult.findings && webResult.findings.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Key Findings</h3>
                      <ul className="space-y-2">
                        {webResult.findings.map((f: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500/70 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-primary" /> Pitch Recommendations</h3>
                    <ul className="space-y-2">
                      {webResult.recs.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <Target className="w-4 h-4 shrink-0 text-primary/70 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Business Intelligence */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Business Intelligence</h2>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleBizAnalyze} className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. The Daily Grind" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input value={bizType} onChange={e => setBizType(e.target.value)} placeholder="e.g. Coffee Shop" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={bizLoc} onChange={e => setBizLoc(e.target.value)} placeholder="e.g. Seattle, WA" />
                  </div>
                </div>
                <Button type="submit" disabled={isAnalyzingBiz} className="w-full">
                  {isAnalyzingBiz ? "Gemini AI Thinking..." : "Generate AI Insights"}
                </Button>
              </form>

              {isAnalyzingBiz && <div className="mt-8"><TextSkeleton /></div>}

              {bizResult && !isAnalyzingBiz && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                      <h3 className="font-semibold text-lg">{bizName}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{bizType} in {bizLoc}</p>
                    </div>
                    <ScoreBadge score={bizResult.score} />
                  </div>

                  {bizResult.problems && bizResult.problems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-destructive flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Problems Found</h4>
                      <ul className="space-y-1.5">
                        {bizResult.problems.map((p: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-destructive shrink-0">•</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-primary">AI Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bizResult.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-primary">Website Angle</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bizResult.websiteOpportunity}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-primary">SEO Angle</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bizResult.seoOpportunity}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-primary">Conversion Angle</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bizResult.orderingOpportunity}</p>
                    </div>
                    {bizResult.revenueOpportunity && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <h4 className="text-sm font-medium mb-1 text-emerald-500 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Revenue Opportunity</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{bizResult.revenueOpportunity}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
