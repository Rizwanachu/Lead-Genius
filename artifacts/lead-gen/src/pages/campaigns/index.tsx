import { useState } from "react";
import { useListCampaigns, useCreateCampaign, getListCampaignsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, TrendingUp, Users, Send, BarChart3, ArrowRight, Megaphone, Target } from "lucide-react";

export function CampaignStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    draft:     { bg: "bg-gray-500/10",   text: "text-gray-500",    dot: "bg-gray-400" },
    active:    { bg: "bg-green-500/10",  text: "text-green-600",   dot: "bg-green-500" },
    paused:    { bg: "bg-yellow-500/10", text: "text-yellow-600",  dot: "bg-yellow-500" },
    completed: { bg: "bg-blue-500/10",   text: "text-blue-600",    dot: "bg-blue-500" },
  };
  const c = config[status] || config.draft;
  return (
    <Badge className={`${c.bg} ${c.text} border-0 font-medium text-xs px-2.5 py-0.5 flex items-center gap-1.5 w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === "active" ? "animate-pulse" : ""}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function CampaignsList() {
  const { data: campaigns, isLoading } = useListCampaigns();
  const createMut = useCreateCampaign();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", niche: "", country: "USA", state: "", city: "", description: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate({ data: form as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
        setOpen(false);
        setForm({ name: "", niche: "", country: "USA", state: "", city: "", description: "" });
      }
    });
  };

  const activeCampaigns = campaigns?.filter(c => c.status === "active").length ?? 0;
  const totalSent = campaigns?.reduce((s, c) => s + (c.sentCount || 0), 0) ?? 0;
  const avgReplyRate = campaigns?.length
    ? (campaigns.reduce((s, c) => s + (c.replyRate || 0), 0) / campaigns.filter(c => c.replyRate != null).length) || 0
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your outreach sequences and track performance.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Create Campaign
              </DialogTitle>
              <DialogDescription>Set up a new outreach campaign targeting a specific niche and location.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Campaign Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Austin Cafe Blitz" required className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Niche</Label>
                  <Input value={form.niche} onChange={e => setForm(p => ({ ...p, niche: e.target.value }))} placeholder="e.g. Cafe" required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Country</Label>
                  <Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} required className="h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">State</Label>
                  <Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="e.g. TX" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Austin" className="h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this campaign" className="h-10" />
              </div>
              <Button type="submit" className="w-full h-10 gap-2" disabled={createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {[
          { label: "Active Campaigns", value: activeCampaigns, icon: Target, color: "text-green-600", bg: "bg-green-500/10" },
          { label: "Total Emails Sent", value: totalSent, icon: Send, color: "text-purple-600", bg: "bg-purple-500/10" },
          { label: "Avg Reply Rate", value: `${avgReplyRate.toFixed(1)}%`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create a campaign to start sending outreach at scale.</p>
            <Button className="mt-4 gap-2" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" /> Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((campaign) => {
            const openRate = campaign.openRate;
            const replyRate = campaign.replyRate;
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">{campaign.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          {campaign.niche} · {[campaign.city, campaign.state, campaign.country].filter(Boolean).join(", ")}
                        </CardDescription>
                      </div>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    {campaign.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{campaign.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <div className="grid grid-cols-3 gap-0 pt-3 border-t border-border">
                      {[
                        { label: "Leads", value: campaign.leadCount || 0, icon: Users },
                        { label: "Open", value: openRate != null ? `${openRate.toFixed(0)}%` : "—", icon: BarChart3 },
                        { label: "Reply", value: replyRate != null ? `${replyRate.toFixed(0)}%` : "—", icon: TrendingUp },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center text-center p-2">
                          <span className="text-xl font-bold">{value}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Icon className="w-3 h-3" />{label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      View details <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
