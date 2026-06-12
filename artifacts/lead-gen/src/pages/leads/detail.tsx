import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetLead,
  useAuditLead,
  getGetLeadQueryKey,
  useGenerateOutreach,
  useListOutreach,
  getListOutreachQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, ScoreBadge } from "./index";
import {
  ArrowLeft, Globe, MapPin, Phone, Mail, Send, Sparkles,
  Instagram, Facebook, Star, ExternalLink, CheckCircle, Clock,
  Copy, ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";
import { format } from "date-fns";

export default function LeadDetail() {
  const { id } = useParams();
  const leadId = Number(id);
  const { data: lead, isLoading } = useGetLead(leadId, {
    query: { enabled: !!leadId, queryKey: getGetLeadQueryKey(leadId) },
  });
  const { data: outreachMessages } = useListOutreach();

  const queryClient = useQueryClient();
  const auditMut = useAuditLead();
  const generateOutreachMut = useGenerateOutreach();
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const leadOutreach = outreachMessages?.filter(m => m.leadId === leadId) ?? [];

  const handleAudit = () => {
    auditMut.mutate({ id: leadId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(leadId) }),
    });
  };

  const handleGenerateOutreach = () => {
    generateOutreachMut.mutate({ data: { leadId, channel: "email" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOutreachQueryKey() });
      },
    });
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading || !lead) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const infoItems = [
    { icon: MapPin, label: "Location", value: [lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "Unknown" },
    { icon: Phone, label: "Phone", value: lead.phone || null, href: lead.phone ? `tel:${lead.phone}` : undefined },
    { icon: Mail, label: "Email", value: lead.email || null, href: lead.email ? `mailto:${lead.email}` : undefined },
    { icon: Globe, label: "Website", value: lead.hasWebsite ? (lead.website || "Has website") : "No website — opportunity!", href: lead.website || undefined, isOpportunity: !lead.hasWebsite },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/leads">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{lead.businessName}</h2>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-muted-foreground text-sm">{lead.niche} · {[lead.city, lead.state].filter(Boolean).join(", ")}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Opportunity Score</p>
            <ScoreBadge score={lead.score} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {infoItems.map(({ icon: Icon, label, value, href, isOpportunity }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                      {value}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className={`text-sm font-medium ${isOpportunity ? "text-orange-600" : value ? "text-foreground" : "text-muted-foreground"}`}>
                      {value || "Not available"}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {lead.instagramUrl ? (
                  <a href={lead.instagramUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors text-pink-600 text-sm font-medium">
                    <Instagram className="w-4 h-4" />
                    Instagram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                    <Instagram className="w-4 h-4" />
                    No Instagram
                  </div>
                )}
                {lead.facebookUrl ? (
                  <a href={lead.facebookUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-blue-600 text-sm font-medium">
                    <Facebook className="w-4 h-4" />
                    Facebook
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
                    <Facebook className="w-4 h-4" />
                    No Facebook
                  </div>
                )}
                {lead.reviewCount != null && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-700 text-sm font-medium">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {lead.reviewRating?.toFixed(1)} · {lead.reviewCount} reviews
                  </div>
                )}
                {lead.googleMapsUrl && (
                  <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors text-green-700 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {lead.auditSummary && (
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-6 h-6 bg-primary/15 rounded flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  AI Business Audit
                  <Badge variant="secondary" className="ml-auto text-[10px]">AI Generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{lead.auditSummary}</p>
                {lead.auditOpportunity && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-xl border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Opportunity Assessment
                    </p>
                    <p className="text-sm font-medium text-foreground">{lead.auditOpportunity}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {leadOutreach.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Outreach History
                  <Badge variant="outline" className="ml-auto text-xs">{leadOutreach.length} message{leadOutreach.length !== 1 ? "s" : ""}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leadOutreach.map(msg => (
                  <div key={msg.id} className="border border-border rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setExpandedEmail(expandedEmail === msg.id ? null : msg.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-[10px] px-1.5 py-0 border-0 ${
                            msg.status === "replied" ? "bg-green-500/10 text-green-600" :
                            msg.status === "opened" ? "bg-indigo-500/10 text-indigo-600" :
                            msg.status === "sent" ? "bg-blue-500/10 text-blue-600" :
                            "bg-gray-500/10 text-gray-500"
                          } capitalize`}>{msg.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {msg.sentAt ? `Sent ${format(new Date(msg.sentAt), "MMM d")}` : "Draft"}
                          </span>
                          {(msg.followUpNumber ?? 0) > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Follow-up #{msg.followUpNumber}</Badge>
                          )}
                        </div>
                      </div>
                      {expandedEmail === msg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </div>
                    {expandedEmail === msg.id && (
                      <div className="border-t border-border bg-muted/20 p-4">
                        <pre className="text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed">{msg.body}</pre>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 h-7 text-xs"
                            onClick={() => handleCopy(msg.id, msg.body)}
                          >
                            {copied === msg.id ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {copied === msg.id ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Button
                className="w-full gap-2 shadow-sm"
                onClick={handleGenerateOutreach}
                disabled={generateOutreachMut.isPending}
              >
                {generateOutreachMut.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Generate Email
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleAudit}
                disabled={auditMut.isPending}
              >
                {auditMut.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {lead.auditSummary ? "Re-Audit Lead" : "Run AI Audit"}
                  </>
                )}
              </Button>
              <Link href="/outreach">
                <Button variant="ghost" className="w-full gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  View All Outreach
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lead Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Campaign", value: lead.campaignId ? `Campaign #${lead.campaignId}` : "No campaign" },
                { label: "Added", value: lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : "—" },
                { label: "Last Updated", value: lead.updatedAt ? format(new Date(lead.updatedAt), "MMM d, yyyy") : "—" },
                { label: "Has Website", value: lead.hasWebsite ? "Yes" : "No — prime target" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {!lead.auditSummary && (
            <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
              <CardContent className="p-4 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-primary mx-auto" />
                <p className="text-sm font-medium">Run an AI Audit</p>
                <p className="text-xs text-muted-foreground">Get a detailed business analysis with opportunity value and personalized insights.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
