import { getLeads, getCampaigns, getMessagesCount, Campaign } from "@/lib/storage";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { Users, Globe, MessageSquareText, FolderKanban, ArrowRight, TrendingUp, DollarSign, PhoneCall, FileText, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import ScoreBadge from "@/components/ScoreBadge";
import { Badge } from "@/components/ui/badge";

const AVG_DEAL_VALUE = 1800;

function PipelineStage({ label, count, total, color, icon: Icon, delay }: {
  label: string; count: number; total: number; color: string; icon: React.ElementType; delay: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex flex-col items-center gap-2 flex-1 min-w-0"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs text-muted-foreground text-center leading-tight">{label}</div>
      {total > 0 && (
        <div className="text-[10px] font-medium text-muted-foreground/60">{pct}%</div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    noWebsite: 0,
    messages: 0,
    activeCampaigns: 0
  });

  const [pipeline, setPipeline] = useState({
    found: 0,
    contacted: 0,
    interested: 0,
    callBooked: 0,
    proposalSent: 0,
    won: 0,
    lost: 0,
  });

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const leads = getLeads();
    const campaigns = getCampaigns();
    const messages = getMessagesCount();

    setStats({
      totalLeads: leads.length,
      noWebsite: leads.filter(l => !l.hasWebsite).length,
      messages,
      activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length
    });

    const contacted = campaigns.filter((c: Campaign) => c.pipelineStatus && c.pipelineStatus !== 'new').length;
    const interested = campaigns.filter((c: Campaign) => ['interested', 'call_booked', 'proposal_sent', 'won'].includes(c.pipelineStatus || '')).length;
    const callBooked = campaigns.filter((c: Campaign) => ['call_booked', 'proposal_sent', 'won'].includes(c.pipelineStatus || '')).length;
    const proposalSent = campaigns.filter((c: Campaign) => ['proposal_sent', 'won'].includes(c.pipelineStatus || '')).length;
    const won = campaigns.filter((c: Campaign) => c.pipelineStatus === 'won').length;
    const lost = campaigns.filter((c: Campaign) => c.pipelineStatus === 'lost').length;

    setPipeline({
      found: leads.length,
      contacted,
      interested,
      callBooked,
      proposalSent,
      won,
      lost,
    });

    setRecentLeads(leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    setRecentCampaigns(campaigns.sort((a: Campaign, b: Campaign) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
  }, []);

  const estimatedRevenue = pipeline.won * AVG_DEAL_VALUE;
  const conversionRate = pipeline.found > 0 ? Math.round((pipeline.won / pipeline.found) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cockpit</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your agency overview at a glance.</p>
        </div>
        {estimatedRevenue > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              ${estimatedRevenue.toLocaleString()} estimated closed revenue
            </span>
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} delay={0.1} />
        <StatCard title="No Website" value={stats.noWebsite} icon={Globe} delay={0.2} />
        <StatCard title="Messages Generated" value={stats.messages} icon={MessageSquareText} delay={0.3} />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={FolderKanban} delay={0.4} />
      </div>

      {/* Agency Pipeline Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Agency Pipeline
              </CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {pipeline.found > 0 && (
                  <span>Overall conversion: <span className="font-semibold text-foreground">{conversionRate}%</span></span>
                )}
                <Link href="/campaigns" className="text-primary hover:underline flex items-center gap-1">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {pipeline.found === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No pipeline data yet. Hunt some leads and create campaigns to start tracking.</p>
                <Link href="/leads" className="mt-3 inline-flex items-center gap-1 text-primary text-sm hover:underline">
                  Go to Lead Finder <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                {/* Stages */}
                <PipelineStage label="Leads Found" count={pipeline.found} total={pipeline.found} color="bg-slate-500" icon={Users} delay={0.1} />
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 mb-6 shrink-0" />
                <PipelineStage label="Contacted" count={pipeline.contacted} total={pipeline.found} color="bg-blue-500" icon={MessageSquareText} delay={0.15} />
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 mb-6 shrink-0" />
                <PipelineStage label="Interested" count={pipeline.interested} total={pipeline.found} color="bg-indigo-500" icon={TrendingUp} delay={0.2} />
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 mb-6 shrink-0" />
                <PipelineStage label="Call Booked" count={pipeline.callBooked} total={pipeline.found} color="bg-purple-500" icon={PhoneCall} delay={0.25} />
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 mb-6 shrink-0" />
                <PipelineStage label="Proposal Sent" count={pipeline.proposalSent} total={pipeline.found} color="bg-amber-500" icon={FileText} delay={0.3} />
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 mb-6 shrink-0" />
                <PipelineStage label="Closed Won" count={pipeline.won} total={pipeline.found} color="bg-emerald-500" icon={Trophy} delay={0.35} />
              </div>
            )}

            {/* Revenue Row */}
            {pipeline.won > 0 && (
              <div className="mt-6 pt-5 border-t border-border/50 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Deals Closed</div>
                  <div className="text-xl font-bold text-emerald-500">{pipeline.won}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Avg Deal Value</div>
                  <div className="text-xl font-bold">${AVG_DEAL_VALUE.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Est. Revenue</div>
                  <div className="text-xl font-bold text-emerald-500">${estimatedRevenue.toLocaleString()}</div>
                </div>
              </div>
            )}

            {pipeline.lost > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                {pipeline.lost} campaign{pipeline.lost !== 1 ? 's' : ''} marked as lost
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Leads + Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Leads</h2>
            <Link href="/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-0">
              {recentLeads.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium text-foreground">{lead.businessName}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className="uppercase tracking-wider">{lead.category}</span>
                            <span>•</span>
                            <span>{lead.city}, {lead.state}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {!lead.hasWebsite ? (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">No Website</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Has Website</Badge>
                          )}
                          <div className="hidden sm:block">
                            <ScoreBadge score={lead.score} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Users className="w-12 h-12 mb-3 text-muted-foreground/30" />
                  <p>No leads found. Start hunting!</p>
                  <Link href="/leads" className="mt-4 text-primary hover:underline text-sm">Go to Lead Finder</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Campaigns</h2>
            <Link href="/campaigns" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign: Campaign) => (
                <Card key={campaign.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate pr-2">{campaign.name}</h3>
                      <Badge className={campaign.status === 'active' ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    {campaign.pipelineStatus && campaign.pipelineStatus !== 'new' && (
                      <div className="mb-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{campaign.pipelineStatus?.replace('_', ' ')}</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                      <span>{campaign.messagesGenerated} / {campaign.leadsTargeted} Msgs</span>
                      <span className="uppercase tracking-wider">{campaign.messageType}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center">
                  <FolderKanban className="w-8 h-8 mb-2 text-muted-foreground/30" />
                  <p className="text-sm">No campaigns running.</p>
                  <Link href="/campaigns" className="mt-2 text-primary hover:underline text-sm">Create one</Link>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
