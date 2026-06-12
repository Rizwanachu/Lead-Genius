import { useParams, Link } from "wouter";
import {
  useGetCampaign, getGetCampaignQueryKey,
  useUpdateCampaign,
  useGetCampaignLeads, getGetCampaignLeadsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CampaignStatusBadge } from "./index";
import { ArrowLeft, Play, Pause, Users, Send, TrendingUp, BarChart3, ChevronRight, Mail, Star, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, ScoreBadge } from "../leads/index";

export default function CampaignDetail() {
  const { id } = useParams();
  const campaignId = Number(id);
  const { data: campaign, isLoading } = useGetCampaign(campaignId, {
    query: { enabled: !!campaignId, queryKey: getGetCampaignQueryKey(campaignId) },
  });
  const { data: leads, isLoading: leadsLoading } = useGetCampaignLeads(campaignId, {
    query: { enabled: !!campaignId, queryKey: getGetCampaignLeadsQueryKey(campaignId) },
  });

  const queryClient = useQueryClient();
  const updateMut = useUpdateCampaign();

  const toggleStatus = () => {
    if (!campaign) return;
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateMut.mutate({ id: campaignId, data: { status: newStatus as any } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) }),
    });
  };

  if (isLoading || !campaign) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const metrics = [
    { label: "Total Leads", value: campaign.leadCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10", sub: "enrolled" },
    { label: "Emails Sent", value: campaign.sentCount || 0, icon: Send, color: "text-purple-600", bg: "bg-purple-500/10", sub: "delivered" },
    { label: "Open Rate", value: campaign.openRate != null ? `${campaign.openRate.toFixed(1)}%` : "—", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-500/10", sub: "of sent" },
    { label: "Reply Rate", value: campaign.replyRate != null ? `${campaign.replyRate.toFixed(1)}%` : "—", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-500/10", sub: "conversion" },
  ];

  const funnel = [
    { label: "Sent", pct: 100, color: "bg-blue-500" },
    { label: "Opened", pct: campaign.openRate ?? 0, color: "bg-indigo-500" },
    { label: "Replied", pct: campaign.replyRate ?? 0, color: "bg-orange-500" },
  ];

  const sentCount = campaign.sentCount ?? 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold tracking-tight">{campaign.name}</h2>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {campaign.description || `Targeting ${campaign.niche} in ${[campaign.city, campaign.state, campaign.country].filter(Boolean).join(", ")}`}
          </p>
        </div>
        <Button
          variant={campaign.status === "active" ? "outline" : "default"}
          className="gap-2 shrink-0"
          onClick={toggleStatus}
          disabled={updateMut.isPending}
        >
          {campaign.status === "active"
            ? <><Pause className="h-4 w-4" /> Pause</>
            : <><Play className="h-4 w-4" /> Activate</>
          }
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {sentCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Email Funnel Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map(({ label, pct, color }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground font-medium">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Enrolled Leads
              {leads?.length != null && (
                <Badge variant="secondary" className="text-xs font-normal">{leads.length}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Business</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {[5].map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : ""}>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                    ))}
                    <TableCell className="pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-muted-foreground/40" />
                      <p className="font-medium">No leads enrolled yet</p>
                      <p className="text-xs">Use the Lead Finder to discover and add leads to this campaign.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads?.map((lead) => (
                  <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.businessName}</p>
                        <p className="text-xs text-muted-foreground">{lead.niche}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />{lead.email}
                          </div>
                        )}
                        {lead.reviewCount != null && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {lead.reviewRating?.toFixed(1)} ({lead.reviewCount})
                          </div>
                        )}
                        {!lead.email && lead.reviewCount == null && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell><ScoreBadge score={lead.score} /></TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          View <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
