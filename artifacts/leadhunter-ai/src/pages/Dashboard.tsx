import { getLeads, getCampaigns, getMessagesCount } from "@/lib/storage";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { Users, Globe, MessageSquareText, FolderKanban, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import ScoreBadge from "@/components/ScoreBadge";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    noWebsite: 0,
    messages: 0,
    activeCampaigns: 0
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
      activeCampaigns: campaigns.filter(c => c.status === 'active').length
    });

    setRecentLeads(leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
    setRecentCampaigns(campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cockpit</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your lead generation overview at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Leads" 
          value={stats.totalLeads} 
          icon={Users} 
          delay={0.1} 
        />
        <StatCard 
          title="No Website" 
          value={stats.noWebsite} 
          icon={Globe} 
          delay={0.2} 
        />
        <StatCard 
          title="Messages Generated" 
          value={stats.messages} 
          icon={MessageSquareText} 
          delay={0.3} 
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats.activeCampaigns} 
          icon={FolderKanban} 
          delay={0.4} 
        />
      </div>

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
                    <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
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
              recentCampaigns.map(campaign => (
                <Card key={campaign.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate pr-2">{campaign.name}</h3>
                      <Badge className={campaign.status === 'active' ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
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
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}