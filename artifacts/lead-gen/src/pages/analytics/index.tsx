import { useGetAnalyticsOverview, useGetPipelineStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Deep dive into your agency's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Avg Lead Score" value={overview?.avgLeadScore?.toFixed(1)} loading={overviewLoading} />
        <MetricCard title="Leads This Week" value={overview?.leadsThisWeek} loading={overviewLoading} />
        <MetricCard title="Total Replies" value={overview?.totalReplied} loading={overviewLoading} />
        <MetricCard title="Total Campaigns" value={overview?.totalCampaigns} loading={overviewLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, loading }: { title: string, value: any, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-3xl font-bold">{value ?? 0}</div>}
      </CardContent>
    </Card>
  );
}