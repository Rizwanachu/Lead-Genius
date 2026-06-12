import { useGetAnalyticsOverview, useGetPipelineStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, Send, CheckCircle, TrendingUp, ArrowRight, Mail, Star, Target, Zap } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  new:           { color: "text-blue-600",    bg: "bg-blue-500",    label: "New" },
  contacted:     { color: "text-purple-600",  bg: "bg-purple-500",  label: "Contacted" },
  opened:        { color: "text-indigo-600",  bg: "bg-indigo-500",  label: "Opened" },
  replied:       { color: "text-orange-600",  bg: "bg-orange-500",  label: "Replied" },
  interested:    { color: "text-green-600",   bg: "bg-green-500",   label: "Interested" },
  meeting_booked:{ color: "text-emerald-600", bg: "bg-emerald-500", label: "Meeting Booked" },
  closed:        { color: "text-teal-600",    bg: "bg-teal-500",    label: "Closed" },
  disqualified:  { color: "text-gray-500",    bg: "bg-gray-400",    label: "Disqualified" },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  lead_found:     <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Users className="w-4 h-4 text-blue-500" /></div>,
  outreach_sent:  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center"><Send className="w-4 h-4 text-purple-500" /></div>,
  email_opened:   <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center"><Mail className="w-4 h-4 text-indigo-500" /></div>,
  email_replied:  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"><Activity className="w-4 h-4 text-orange-500" /></div>,
  meeting_booked: <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>,
  lead_closed:    <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center"><Star className="w-4 h-4 text-teal-500" /></div>,
};

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 8 });

  const totalPipeline = pipeline?.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back — here's your agency overview.</p>
        </div>
        <Link href="/leads">
          <Button className="gap-2 shadow-sm">
            <Zap className="w-4 h-4" />
            Find New Leads
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={overview?.totalLeads}
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          trend="+12% this week"
          loading={overviewLoading}
        />
        <StatCard
          title="Emails Sent"
          value={overview?.emailsSent}
          icon={Send}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
          trend="+3 today"
          loading={overviewLoading}
        />
        <StatCard
          title="Meetings Booked"
          value={overview?.totalMeetingsBooked}
          icon={CheckCircle}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          trend="2 this week"
          loading={overviewLoading}
        />
        <StatCard
          title="Avg Reply Rate"
          value={overview?.replyRate != null ? `${overview.replyRate.toFixed(1)}%` : "0%"}
          icon={TrendingUp}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
          trend="Industry avg 8%"
          loading={overviewLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Pipeline Overview</CardTitle>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-7">
                  View Analytics <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {pipeline?.filter(s => s.status !== "disqualified").map(stat => {
                  const cfg = STATUS_CONFIG[stat.status] || { color: "text-gray-500", bg: "bg-gray-400", label: stat.status };
                  const pct = Math.round((stat.count / totalPipeline) * 100);
                  return (
                    <div key={stat.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                          <span className="font-medium">{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-xs">{pct}%</span>
                          <span className="font-semibold w-6 text-right">{stat.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.bg} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!pipeline?.length && (
                  <div className="text-sm text-muted-foreground py-8 text-center">No pipeline data available.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <Badge variant="secondary" className="text-xs font-normal">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityLoading ? (
              <div className="space-y-4 px-6 pb-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity?.slice(0, 6).map(item => (
                  <div key={item.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                    {ACTIVITY_ICONS[item.type] || (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug line-clamp-2">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {!activity?.length && (
                  <div className="text-sm text-muted-foreground py-8 text-center px-6">No recent activity.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Lead Scoring</p>
                <p className="text-xs text-muted-foreground">AI-powered opportunity score</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leads are scored 0-100 based on website presence, social media activity, review count, and rating.
            </p>
            <Link href="/leads">
              <Button size="sm" variant="outline" className="mt-4 w-full gap-1 text-xs">
                View Leads <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Outreach</p>
                <p className="text-xs text-muted-foreground">Personalized email generation</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate highly personalized cold emails and follow-up sequences tailored to each business.
            </p>
            <Link href="/outreach">
              <Button size="sm" variant="outline" className="mt-4 w-full gap-1 text-xs border-emerald-500/30 hover:bg-emerald-500/10">
                Open Outreach <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Campaigns</p>
                <p className="text-xs text-muted-foreground">Track send & reply rates</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Group leads into campaigns, track open and reply rates, and manage your full outreach pipeline.
            </p>
            <Link href="/campaigns">
              <Button size="sm" variant="outline" className="mt-4 w-full gap-1 text-xs border-orange-500/30 hover:bg-orange-500/10">
                View Campaigns <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend, loading }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-2" />
        ) : (
          <div className="text-3xl font-bold tracking-tight mb-1">{value ?? 0}</div>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
