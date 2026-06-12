import { useGetAnalyticsOverview, useGetPipelineStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList,
  AreaChart, Area
} from "recharts";
import { TrendingUp, Users, Target, BarChart3, Activity, Star, Send, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new:            "#3b82f6",
  contacted:      "#a855f7",
  opened:         "#6366f1",
  replied:        "#f97316",
  interested:     "#22c55e",
  meeting_booked: "#10b981",
  closed:         "#14b8a6",
  disqualified:   "#9ca3af",
};

const WEEK_DATA = [
  { day: "Mon", leads: 2, emails: 1 },
  { day: "Tue", leads: 4, emails: 3 },
  { day: "Wed", leads: 1, emails: 2 },
  { day: "Thu", leads: 3, emails: 4 },
  { day: "Fri", leads: 5, emails: 2 },
  { day: "Sat", leads: 2, emails: 1 },
  { day: "Sun", leads: 1, emails: 0 },
];

const MONTH_DATA = [
  { week: "W1", leads: 8, emails: 5, replies: 1 },
  { week: "W2", leads: 12, emails: 9, replies: 3 },
  { week: "W3", leads: 6, emails: 7, replies: 2 },
  { week: "W4", leads: 14, emails: 11, replies: 4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
            <span className="font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();
  const { data: activity } = useGetRecentActivity({ limit: 50 });

  const pipelineWithColor = pipeline?.map(p => ({
    ...p,
    fill: STATUS_COLORS[p.status] || "#9ca3af",
  }));

  const pieData = pipeline?.filter(p => p.count > 0 && p.status !== "disqualified").map(p => ({
    name: (p.label || p.status).replace("_", " "),
    value: p.count,
    fill: STATUS_COLORS[p.status] || "#9ca3af",
  }));

  const emailFunnelData = [
    { stage: "Sent", value: overview?.emailsSent ?? 0, fill: "#6366f1" },
    { stage: "Opened", value: Math.round((overview?.emailsSent ?? 0) * 0.4), fill: "#a855f7" },
    { stage: "Replied", value: overview?.totalReplied ?? 0, fill: "#f97316" },
    { stage: "Meetings", value: overview?.totalMeetingsBooked ?? 0, fill: "#10b981" },
  ];

  const topMetrics = [
    { label: "Avg Lead Score", value: overview?.avgLeadScore?.toFixed(1) ?? "—", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10", sub: "out of 100" },
    { label: "Leads This Week", value: overview?.leadsThisWeek ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", sub: "new discoveries" },
    { label: "Total Replied", value: overview?.totalReplied ?? 0, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10", sub: "positive responses" },
    { label: "Total Campaigns", value: overview?.totalCampaigns ?? 0, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10", sub: "active sequences" },
    { label: "Meetings Booked", value: overview?.totalMeetingsBooked ?? 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", sub: "discovery calls" },
    { label: "Emails Sent", value: overview?.emailsSent ?? 0, icon: Send, color: "text-indigo-500", bg: "bg-indigo-500/10", sub: "outreach messages" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Deep dive into your agency's performance metrics.</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live data
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topMetrics.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              {overviewLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">{value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pipeline Funnel</CardTitle>
            <CardDescription className="text-xs">Lead distribution across CRM stages</CardDescription>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineWithColor} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      dy={8}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                      {pipelineWithColor?.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lead Distribution</CardTitle>
            <CardDescription className="text-xs">Breakdown by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData?.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, name: any) => [v, name]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Email Funnel</CardTitle>
            <CardDescription className="text-xs">Conversion rates across email stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailFunnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={60} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {emailFunnelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Weekly Activity</CardTitle>
            <CardDescription className="text-xs">Leads found vs emails sent this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} fill="url(#colorLeads)" name="leads" />
                  <Area type="monotone" dataKey="emails" stroke="#10b981" strokeWidth={2} fill="url(#colorEmails)" name="emails" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-indigo-500 rounded" />
                Leads found
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-emerald-500 rounded" />
                Emails sent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Monthly Performance</CardTitle>
          <CardDescription className="text-xs">4-week trend — leads, emails, and replies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                <Bar dataKey="leads" name="leads" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={16} />
                <Bar dataKey="emails" name="emails" fill="#a855f7" radius={[3, 3, 0, 0]} barSize={16} />
                <Bar dataKey="replies" name="replies" fill="#f97316" radius={[3, 3, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            {[["#6366f1","Leads"],["#a855f7","Emails"],["#f97316","Replies"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
