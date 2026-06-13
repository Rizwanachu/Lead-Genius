import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { getLeads, Lead } from "@/lib/storage";
import { generateSalesPitcherBrief, generateRevenueOpportunity, generateBattleCard, generateOpportunityItems, generateServiceRecommendation } from "@/lib/aiUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ScoreBadge from "@/components/ScoreBadge";
import { 
  MapPin, Phone, Globe, Mail, Instagram, Facebook, Twitter, 
  Youtube, Calendar, Users, Star, StarHalf, MessageCircle, 
  ArrowLeft, Printer, Play, Copy, CheckCircle2, ChevronRight, AlertCircle, FolderKanban, TrendingUp, Search, Zap, Target, Lightbulb, PhoneCall, DollarSign, BarChart3, ShieldCheck, CheckCheck, X
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LeadDetail() {
  const [match, params] = useRoute("/leads/:id");
  const [, setLocation] = useLocation();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [callNotes, setCallNotes] = useState("");

  useEffect(() => {
    if (!match || !params?.id) return;
    setTimeout(() => {
      const leads = getLeads();
      const found = leads.find(l => l.id === params.id);
      setLead(found || null);
      setIsLoading(false);
    }, 400);
  }, [match, params?.id]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-1 h-[600px] rounded-xl" />
          <Skeleton className="lg:col-span-2 h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Lead Not Found</h2>
        <p className="text-muted-foreground">The lead you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation("/leads")} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Leads
        </Button>
      </div>
    );
  }

  const brief = generateSalesPitcherBrief(lead);
  const revenueOpportunity = generateRevenueOpportunity(lead);
  const battleCard = generateBattleCard(lead);
  const opportunityItems = generateOpportunityItems(lead);
  const serviceRec = generateServiceRecommendation(lead);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') setCopiedEmail(text);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const effortColor = (effort: string) => {
    if (effort === 'Easy Win') return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    if (effort === 'Medium Win') return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
    return 'text-purple-600 bg-purple-500/10 border-purple-500/20';
  };

  const impactColor = (impact: string) => {
    if (impact === 'Critical' || impact === 'Very High') return 'text-destructive';
    if (impact === 'High') return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const closeProbColor = (prob: number) => {
    if (prob >= 70) return 'text-emerald-500';
    if (prob >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-sm sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/leads")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold leading-none">{lead.businessName}</h1>
            <p className="text-xs text-muted-foreground mt-1">Sales Pitcher Dossier</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> PDF Brief
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation(`/campaigns`)}>
            <FolderKanban className="w-4 h-4 mr-2" /> Add to Campaign
          </Button>
          <Button size="sm" onClick={() => setLocation(`/conversations?lead=${lead.id}`)}>
            <MessageCircle className="w-4 h-4 mr-2" /> Start Conversation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 relative">
              <div className="absolute -bottom-6 left-6 w-16 h-16 bg-background rounded-xl border-2 border-border shadow-sm flex items-center justify-center text-2xl font-bold uppercase">
                {lead.businessName.substring(0, 2)}
              </div>
            </div>
            <CardContent className="pt-10 px-6 pb-6 space-y-6">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{lead.businessName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{lead.category}</Badge>
                      <span className="text-sm font-medium text-emerald-600">{lead.priceLevel}</span>
                    </div>
                  </div>
                  <ScoreBadge score={lead.score} />
                </div>
                
                <div className="flex items-center gap-1 mt-3">
                  <span className="font-bold text-lg">{lead.rating}</span>
                  <div className="flex items-center text-yellow-500">
                    {[1,2,3,4,5].map(star => (
                      lead.rating >= star ? <Star key={star} className="w-4 h-4 fill-current" /> : 
                      lead.rating >= star - 0.5 ? <StarHalf key={star} className="w-4 h-4 fill-current" /> : 
                      <Star key={star} className="w-4 h-4 text-muted" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-1">({lead.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{lead.address}<br />{lead.city}, {lead.state} {lead.country}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                </div>
                {lead.website ? (
                  <div className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors">
                    <Globe className="w-4 h-4 shrink-0" />
                    <a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{lead.website}</a>
                    <Badge variant="outline" className="ml-auto text-[10px] h-5">{lead.websiteStatus}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-destructive">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="font-medium">No Website</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="hover:underline truncate">{lead.email}</a>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {lead.instagram && <Button variant="outline" size="icon" className="h-8 w-8 text-pink-600 border-pink-200 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950 dark:border-pink-900"><Instagram className="w-4 h-4" /></Button>}
                {lead.facebook && <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-900"><Facebook className="w-4 h-4" /></Button>}
                {lead.twitter && <Button variant="outline" size="icon" className="h-8 w-8 text-sky-500 border-sky-200 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:border-sky-900"><Twitter className="w-4 h-4" /></Button>}
                {lead.youtube && <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:border-red-900"><Youtube className="w-4 h-4" /></Button>}
              </div>
              
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                // Always use name-based search — opens the real verified listing, not just coordinates
                const q = [lead.businessName, lead.address, lead.city, lead.state, lead.country].filter(Boolean).join(", ");
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
              }}>
                <MapPin className="w-4 h-4" /> View on Google Maps
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Established</div>
                  <div className="font-medium">{lead.yearEstablished}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Employees</div>
                  <div className="font-medium">{lead.employeeCount}</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-muted-foreground mb-2">Amenities</div>
                <div className="flex flex-wrap gap-1.5">
                  {lead.amenities?.map((amenity, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal bg-muted/50">{amenity}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Opening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-xs">
                <TableBody>
                  {Object.entries(lead.openingHours || {}).map(([day, hours]) => (
                    <TableRow key={day} className="border-none hover:bg-transparent">
                      <TableCell className="py-1.5 px-0 font-medium capitalize text-muted-foreground">{day}</TableCell>
                      <TableCell className="py-1.5 px-0 text-right">{hours as string}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Intelligence Tabs */}
        <div className="lg:col-span-8 space-y-5">
          {/* Always-visible brief */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <Play className="w-4 h-4" /> 30-Second Opportunity Brief
                </div>
                <p className="text-foreground/90 leading-relaxed font-medium text-sm">{brief}</p>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="dossier" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-10">
              <TabsTrigger value="dossier" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" /> Dossier</TabsTrigger>
              <TabsTrigger value="battlecard" className="gap-1.5 text-xs"><Target className="w-3.5 h-3.5" /> Battle Card</TabsTrigger>
              <TabsTrigger value="services" className="gap-1.5 text-xs"><Lightbulb className="w-3.5 h-3.5" /> Services</TabsTrigger>
              <TabsTrigger value="callprep" className="gap-1.5 text-xs"><PhoneCall className="w-3.5 h-3.5" /> Call Prep</TabsTrigger>
            </TabsList>

            {/* ── DOSSIER TAB ── */}
            <TabsContent value="dossier" className="space-y-5 mt-5">
              {/* Scores */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Website Score", score: lead.seoScore },
                  { label: "SEO Score", score: lead.seoScore },
                  { label: "Social Score", score: lead.socialScore },
                ].map((metric, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
                    <Card className="border-border/50 bg-card/50 text-center py-5">
                      <div className="text-xs font-medium text-muted-foreground mb-2">{metric.label}</div>
                      <div className={`text-3xl font-bold ${(metric.score ?? 0) > 70 ? 'text-emerald-500' : (metric.score ?? 0) > 40 ? 'text-yellow-500' : 'text-destructive'}`}>
                        {metric.score ?? 0}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Opportunity Scanner */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4 text-yellow-500" /> AI Opportunity Scanner
                    <Badge variant="secondary" className="ml-auto text-[10px]">{opportunityItems.length} issues found</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {opportunityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors">
                      <div className="shrink-0 mt-0.5">
                        {item.effort === 'Easy Win' ? <CheckCheck className="w-4 h-4 text-emerald-500" /> :
                         item.effort === 'Medium Win' ? <AlertCircle className="w-4 h-4 text-yellow-500" /> :
                         <TrendingUp className="w-4 h-4 text-purple-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{item.problem}</span>
                          <Badge variant="outline" className={`text-[10px] h-4 shrink-0 ${effortColor(item.effort)}`}>{item.effort}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.action}</p>
                      </div>
                      <div className={`text-xs font-semibold shrink-0 ${impactColor(item.impact)}`}>{item.impact}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Revenue Opportunity */}
              <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <TrendingUp className="w-24 h-24 text-emerald-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">Revenue Opportunity Estimate</CardTitle>
                  <p className="text-xs text-muted-foreground">Based on industry benchmarks</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2.5 relative z-10">
                    {[
                      { icon: Globe, color: 'text-orange-500 bg-orange-500/10', label: 'Lost Web Traffic', value: revenueOpportunity.lostTraffic, badge: 'High' },
                      { icon: TrendingUp, color: 'text-destructive bg-destructive/10', label: 'Missed Bookings/Orders', value: revenueOpportunity.missedRevenue, badge: 'Critical' },
                      { icon: Search, color: 'text-blue-500 bg-blue-500/10', label: 'SEO Gap', value: revenueOpportunity.seoGap, badge: 'Medium' },
                      { icon: Users, color: 'text-pink-500 bg-pink-500/10', label: 'Social Reach', value: revenueOpportunity.socialReach, badge: 'Medium' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className={`p-2 rounded-md shrink-0 ${row.color.split(' ')[1]}`}><row.icon className={`w-4 h-4 ${row.color.split(' ')[0]}`} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{row.label}</div>
                          <div className="text-xs text-muted-foreground truncate">{row.value}</div>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">{row.badge}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center relative z-10">
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Total Opportunity Value:</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">~${revenueOpportunity.totalOpportunity.toLocaleString()}/month</div>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Capturing just 10% = ${revenueOpportunity.agencyValue.toLocaleString()}/month for your agency</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts */}
              {(lead.contacts?.length ?? 0) > 0 && (
                <Card className="border-border/50 bg-card/50 overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="text-base">Contact Persons</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {lead.contacts?.map((contact, i) => (
                        <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {contact.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{contact.name}</div>
                              <div className="text-xs text-muted-foreground">{contact.title}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => copyToClipboard(contact.email, 'email')}>
                              {copiedEmail === contact.email ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              {contact.email}
                            </Button>
                            <Button size="sm" className="h-8 gap-1 text-xs" onClick={() => setLocation(`/outreach?lead=${lead.id}`)}>
                              Pitch <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              {(lead.reviews?.length ?? 0) > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Recent Reviews</CardTitle>
                    <Badge variant="secondary" className="font-normal text-xs">{lead.reviews?.length || 0} extracted</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    {lead.reviews?.slice(0, 4).map((review) => (
                      <div key={review.id} className="p-3 rounded-lg border bg-background text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{review.reviewerAvatar}</div>
                            <span className="font-medium text-sm">{review.reviewerName}</span>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs">{review.text}</p>
                        <div className="text-[10px] text-muted-foreground/70">{review.date}</div>
                        {review.ownerReply && (
                          <div className="ml-4 p-2.5 bg-muted/30 rounded-md border-l-2 border-border text-muted-foreground text-xs">
                            <div className="font-medium text-foreground mb-0.5">Owner Reply</div>
                            {review.ownerReply}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── BATTLE CARD TAB ── */}
            <TabsContent value="battlecard" className="space-y-5 mt-5">
              {/* Close Probability */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 text-center py-5 col-span-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Close Probability</div>
                  <div className={`text-3xl font-bold ${closeProbColor(battleCard.closeProbability)}`}>{battleCard.closeProbability}%</div>
                </Card>
                <Card className="border-border/50 bg-card/50 text-center py-5 col-span-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Recommended Tier</div>
                  <div className="text-base font-bold">{battleCard.tier}</div>
                </Card>
                <Card className="border-border/50 bg-card/50 text-center py-5 col-span-1">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Price Range</div>
                  <div className="text-sm font-bold text-emerald-500">{battleCard.recommendedPrice}</div>
                </Card>
              </div>

              {/* Best Hook */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
                    <Target className="w-4 h-4" /> Best Opening Hook
                  </div>
                  <blockquote className="text-foreground leading-relaxed border-l-4 border-primary pl-4 italic">
                    "{battleCard.bestHook}"
                  </blockquote>
                  <Button size="sm" variant="ghost" className="mt-3 h-7 text-xs gap-1.5 text-primary" onClick={() => { navigator.clipboard.writeText(battleCard.bestHook); toast.success("Hook copied!"); }}>
                    <Copy className="w-3 h-3" /> Copy Hook
                  </Button>
                </CardContent>
              </Card>

              {/* Best Offer */}
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-3">
                    <DollarSign className="w-4 h-4" /> Best Offer to Lead With
                  </div>
                  <p className="text-foreground font-medium leading-relaxed">{battleCard.bestOffer}</p>
                  <Button size="sm" variant="ghost" className="mt-3 h-7 text-xs gap-1.5 text-emerald-600 dark:text-emerald-400" onClick={() => { navigator.clipboard.writeText(battleCard.bestOffer); toast.success("Offer copied!"); }}>
                    <Copy className="w-3 h-3" /> Copy Offer
                  </Button>
                </CardContent>
              </Card>

              {/* Objection Handling */}
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-semibold text-sm">
                    <AlertCircle className="w-4 h-4" /> Likely Objection + Response
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-background/60 border border-border/50">
                      <div className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">They'll Say</div>
                      <p className="text-sm font-medium">{battleCard.objection.objection}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1 uppercase tracking-wider">You Respond</div>
                      <p className="text-sm text-foreground">{battleCard.objection.response}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5" onClick={() => { navigator.clipboard.writeText(`Objection: ${battleCard.objection.objection}\n\nResponse: ${battleCard.objection.response}`); toast.success("Objection card copied!"); }}>
                    <Copy className="w-3 h-3" /> Copy Full Card
                  </Button>
                </CardContent>
              </Card>

              {/* Full Battle Card Copy */}
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Full Battle Card</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => {
                      const text = `BATTLE CARD: ${lead.businessName}\n\n🎯 HOOK:\n${battleCard.bestHook}\n\n💰 OFFER:\n${battleCard.bestOffer}\n\n⚠️ OBJECTION: ${battleCard.objection.objection}\n✅ RESPONSE: ${battleCard.objection.response}\n\n📊 TIER: ${battleCard.tier} | ${battleCard.recommendedPrice}\n🎲 CLOSE PROBABILITY: ${battleCard.closeProbability}%`;
                      navigator.clipboard.writeText(text);
                      toast.success("Full battle card copied!");
                    }}>
                      <Copy className="w-3 h-3" /> Copy All
                    </Button>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
{`🎯 HOOK: ${battleCard.bestHook.substring(0, 80)}...
💰 OFFER: ${battleCard.bestOffer}
⚠️  OBJECTION: ${battleCard.objection.objection}
✅ RESPONSE: ${battleCard.objection.response.substring(0, 80)}...
📊 TIER: ${battleCard.tier} | ${battleCard.recommendedPrice}
🎲 CLOSE PROBABILITY: ${battleCard.closeProbability}%`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── SERVICES TAB ── */}
            <TabsContent value="services" className="space-y-5 mt-5">
              {/* Pitch Strategy */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
                    <Lightbulb className="w-4 h-4" /> AI Pitch Strategy
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{serviceRec.pitch}</p>
                </CardContent>
              </Card>

              {/* Primary Services */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Recommended Services (Lead With These)
                </h3>
                <div className="space-y-3">
                  {serviceRec.primary.map((svc, i) => (
                    <Card key={i} className={`border-border/50 bg-card/50 border-l-4 ${i === 0 ? 'border-l-primary' : 'border-l-border'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {i === 0 && <Badge className="text-[10px] h-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20">Lead With This</Badge>}
                              <span className="font-semibold text-sm">{svc.service}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{svc.why}</p>
                          </div>
                          <div className="text-sm font-bold text-emerald-500 shrink-0 text-right">{svc.price}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs gap-1.5" onClick={() => setLocation(`/proposal?service=${encodeURIComponent(svc.service)}`)}>
                          Build Proposal <ChevronRight className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Secondary / Upsell */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Upsell Opportunities (Phase 2)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {serviceRec.secondary.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal px-3 py-1.5">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-destructive mb-1">Don't Sell This</div>
                    <p className="text-xs text-muted-foreground">{serviceRec.avoid}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── CALL PREP TAB ── */}
            <TabsContent value="callprep" className="space-y-5 mt-5">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary" /> Discovery Questions to Ask
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Use these to uncover pain points and qualify the opportunity.</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {serviceRec.callPrepQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/40">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-foreground leading-relaxed">{q}</p>
                      <Button size="icon" variant="ghost" className="w-6 h-6 shrink-0" onClick={() => { navigator.clipboard.writeText(q); toast.success("Question copied!"); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pre-Call Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    `Google "${lead.businessName} ${lead.city}" — note competitor positioning`,
                    `Check their Google Maps listing for recent photos and unanswered reviews`,
                    `Search their name on Instagram and Facebook — screenshot weak content`,
                    `Prepare the mockup website link (Website Mockup Generator)`,
                    `Have the Proposal Generator open with ${battleCard.tier} pre-selected`,
                    `Know your opening hook: review the Battle Card tab first`,
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-4 h-4 rounded border border-muted-foreground/40 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Copy className="w-4 h-4 text-muted-foreground" /> Call Notes
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Notes are saved in your session — use these during or after the call.</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={callNotes}
                    onChange={e => setCallNotes(e.target.value)}
                    placeholder={`Notes for call with ${lead.businessName}...\n\n- Pain points mentioned:\n- Budget confirmed:\n- Decision maker:\n- Next step agreed:`}
                    className="min-h-[180px] text-sm resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => { navigator.clipboard.writeText(callNotes); toast.success("Notes copied!"); }}>
                      <Copy className="w-3 h-3" /> Copy Notes
                    </Button>
                    <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setLocation(`/outreach?lead=${lead.id}`)}>
                      Generate Outreach <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
