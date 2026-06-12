import { useParams, Link } from "wouter";
import { useGetCampaign, getGetCampaignQueryKey, useUpdateCampaign, useGetCampaignLeads, getGetCampaignLeadsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "./index";
import { ArrowLeft, Play, Pause, Users, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../leads/index";

export default function CampaignDetail() {
  const { id } = useParams();
  const campaignId = Number(id);
  const { data: campaign, isLoading } = useGetCampaign(campaignId, { query: { enabled: !!campaignId, queryKey: getGetCampaignQueryKey(campaignId) } });
  const { data: leads, isLoading: leadsLoading } = useGetCampaignLeads(campaignId, { query: { enabled: !!campaignId, queryKey: getGetCampaignLeadsQueryKey(campaignId) } });
  
  const queryClient = useQueryClient();
  const updateMut = useUpdateCampaign();

  const toggleStatus = () => {
    if (!campaign) return;
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateMut.mutate({ id: campaignId, data: { status: newStatus as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCampaignQueryKey(campaignId) });
      }
    });
  };

  if (isLoading || !campaign) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {campaign.name}
            <CampaignStatusBadge status={campaign.status} />
          </h2>
          <p className="text-muted-foreground">{campaign.description || `Targeting ${campaign.niche} in ${campaign.country}`}</p>
        </div>
        <div className="ml-auto">
          <Button 
            variant={campaign.status === "active" ? "secondary" : "default"}
            className="gap-2"
            onClick={toggleStatus}
            disabled={updateMut.isPending}
          >
            {campaign.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {campaign.status === "active" ? "Pause Campaign" : "Activate Campaign"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaign.leadCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaign.sentCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaign.openRate != null ? `${campaign.openRate.toFixed(1)}%` : "-"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reply Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaign.replyRate != null ? `${campaign.replyRate.toFixed(1)}%` : "-"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads in Campaign</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No leads enrolled in this campaign.
                  </TableCell>
                </TableRow>
              ) : (
                leads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium pl-6">{lead.businessName}</TableCell>
                    <TableCell>{lead.email || "-"}</TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="text-right pr-6">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
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