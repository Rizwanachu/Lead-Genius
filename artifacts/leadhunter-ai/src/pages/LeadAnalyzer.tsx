import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search, Activity, Target, Zap, LayoutTemplate } from "lucide-react";
import { generateBusinessAnalysis } from "@/lib/aiUtils";
import { TextSkeleton } from "@/components/LoadingSkeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import ScoreBadge from "@/components/ScoreBadge";

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

  const handleWebAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webName) {
      toast.error("Please enter a business name");
      return;
    }
    setIsAnalyzingWeb(true);
    setTimeout(() => {
      const hasWeb = webUrl && webUrl !== "none" && webUrl.length > 4;
      setWebResult({
        status: hasWeb ? "Outdated Website" : "No Website",
        score: hasWeb ? 45 : 85,
        recs: hasWeb ? [
          "Modernize layout for mobile responsiveness",
          "Add clear call-to-actions on homepage",
          "Improve page load speed (currently 4.2s)",
          "Implement basic local SEO tags"
        ] : [
          "Claim a professional domain name immediately",
          "Build a high-conversion landing page",
          "Set up Google Business Profile linking to site",
          "Create localized landing pages for service area"
        ]
      });
      setIsAnalyzingWeb(false);
      toast.success("Analysis complete");
    }, 1000);
  };

  const handleBizAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !bizType || !bizLoc) {
      toast.error("Please fill all fields");
      return;
    }
    setIsAnalyzingBiz(true);
    setTimeout(() => {
      setBizResult(generateBusinessAnalysis(bizName, bizType, bizLoc));
      setIsAnalyzingBiz(false);
      toast.success("Business intelligence generated");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyzer</h1>
        <p className="text-muted-foreground mt-1">Deep dive into a lead's digital presence to find pitching angles.</p>
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
                  <Label>Current URL (or "none")</Label>
                  <Input value={webUrl} onChange={e => setWebUrl(e.target.value)} placeholder="e.g. joesplumbing.net" />
                </div>
                <Button type="submit" disabled={isAnalyzingWeb} className="w-full">
                  {isAnalyzingWeb ? "Scanning..." : "Run Detection"}
                </Button>
              </form>

              {isAnalyzingWeb && <div className="mt-8"><TextSkeleton /></div>}

              {webResult && !isAnalyzingWeb && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Status</span>
                      <span className={`font-semibold ${webResult.status === 'No Website' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                        {webResult.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span>Opportunity Score</span>
                        <span className="font-mono">{webResult.score}/100</span>
                      </div>
                      <Progress value={webResult.score} className={`h-2 ${webResult.score > 70 ? 'text-emerald-500' : 'text-yellow-500'}`} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Key Recommendations</h3>
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

        {/* Business Analyzer */}
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
                  {isAnalyzingBiz ? "Analyzing..." : "Generate Insights"}
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

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-primary">Summary</h4>
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