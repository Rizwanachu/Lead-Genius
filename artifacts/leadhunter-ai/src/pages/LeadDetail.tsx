import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { getLeads, Lead } from "@/lib/storage";
import { generateSalesPitcherBrief } from "@/lib/aiUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBadge from "@/components/ScoreBadge";
import { 
  MapPin, Phone, Globe, Mail, Instagram, Facebook, Twitter, 
  Youtube, Calendar, Users, Star, StarHalf, MessageCircle, 
  ExternalLink, ArrowLeft, Printer, Play, Copy, CheckCircle2, ChevronRight, AlertCircle, FolderKanban
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LeadDetail() {
  const [match, params] = useRoute("/leads/:id");
  const [, setLocation] = useLocation();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params?.id) return;
    
    // Simulate slight network delay for realism
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

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') setCopiedEmail(text);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
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
              
              <Button variant="outline" className="w-full gap-2" onClick={() => window.open(lead.googleMapsUrl, '_blank')}>
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
                      <TableCell className="py-1.5 px-0 text-right">{hours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Intelligence */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                  <Play className="w-4 h-4" /> 30-Second Opportunity Brief
                </div>
                <p className="text-foreground/90 leading-relaxed font-medium">
                  {brief}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Website Score", score: lead.seoScore },
              { label: "SEO Score", score: lead.seoScore },
              { label: "Social Score", score: lead.socialScore },
            ].map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 text-center py-6">
                  <div className="text-sm font-medium text-muted-foreground mb-3">{metric.label}</div>
                  <div className={`text-4xl font-bold ${metric.score > 70 ? 'text-emerald-500' : metric.score > 40 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {metric.score}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-destructive" /> Key Problems Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {!lead.hasWebsite && (
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                    <span className="text-sm"><strong>No professional website</strong> — Missing approximately 40% of local search traffic. Current digital presence relies entirely on third-party platforms.</span>
                  </li>
                )}
                {lead.seoScore < 50 && (
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                    <span className="text-sm"><strong>Poor Local SEO</strong> — Google Business profile is under-optimized. Competitors are outranking them for local "{lead.category}" searches.</span>
                  </li>
                )}
                {(!lead.instagram || lead.socialScore < 50) && (
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                    <span className="text-sm"><strong>Weak Social Strategy</strong> — Inconsistent posting and lack of clear call-to-actions on social channels.</span>
                  </li>
                )}
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-sm"><strong>Missed Revenue</strong> — Lack of direct online booking/ordering system forces customers to call or use expensive third-party apps.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg">Contact Persons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {lead.contacts?.map((contact, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-2"
                        onClick={() => copyToClipboard(contact.email, 'email')}
                      >
                        {copiedEmail === contact.email ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {contact.email}
                      </Button>
                      <Button size="sm" className="h-8 gap-1" onClick={() => setLocation(`/outreach?lead=${lead.id}`)}>
                        Pitch <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
              <Badge variant="secondary" className="font-normal">{lead.reviews?.length || 0} extracted</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {lead.reviews?.slice(0, 4).map((review) => (
                <div key={review.id} className="p-4 rounded-lg border bg-background text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                        {review.reviewerAvatar}
                      </div>
                      <span className="font-medium">{review.reviewerName}</span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                  <div className="text-[10px] text-muted-foreground/70">{review.date}</div>
                  
                  {review.ownerReply && (
                    <div className="mt-3 ml-4 p-3 bg-muted/30 rounded-md border-l-2 border-border text-muted-foreground text-xs">
                      <div className="font-medium text-foreground mb-1">Owner Reply</div>
                      {review.ownerReply}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
