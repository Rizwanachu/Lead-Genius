import { useListCampaigns } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CampaignStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-500",
    active: "bg-green-500/10 text-green-500",
    paused: "bg-yellow-500/10 text-yellow-500",
    completed: "bg-blue-500/10 text-blue-500",
  };
  
  const color = colors[status] || "bg-gray-500/10 text-gray-500";
  
  return <Badge className={`${color} capitalize`}>{status}</Badge>;
}

export default function CampaignsList() {
  const { data: campaigns, isLoading } = useListCampaigns();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">Manage your outreach sequences.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : campaigns?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No campaigns yet. Create one to start sending outreach.
          </div>
        ) : (
          campaigns?.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1">{campaign.name}</CardTitle>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  <CardDescription className="line-clamp-1">{campaign.niche} • {campaign.country}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{campaign.sentCount || 0}</span>
                      <span className="text-xs text-muted-foreground">Sent</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{campaign.openRate != null ? `${campaign.openRate.toFixed(0)}%` : "-"}</span>
                      <span className="text-xs text-muted-foreground">Open</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{campaign.replyRate != null ? `${campaign.replyRate.toFixed(0)}%` : "-"}</span>
                      <span className="text-xs text-muted-foreground">Reply</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}