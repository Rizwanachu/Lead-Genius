import { useGetAnalyticsOverview, useGetPipelineStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, Send, CheckCircle, BarChart } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useGetAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Here's what's happening with your outreach today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Leads" 
          value={overview?.totalLeads} 
          icon={Users} 
          loading={overviewLoading} 
        />
        <StatCard 
          title="Emails Sent" 
          value={overview?.emailsSent} 
          icon={Send} 
          loading={overviewLoading} 
        />
        <StatCard 
          title="Meetings Booked" 
          value={overview?.totalMeetingsBooked} 
          icon={CheckCircle} 
          loading={overviewLoading} 
        />
        <StatCard 
          title="Avg Reply Rate" 
          value={overview?.replyRate != null ? `${overview.replyRate.toFixed(1)}%` : "0%"} 
          icon={Activity} 
          loading={overviewLoading} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {pipeline?.map(stat => (
                  <div key={stat.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{stat.label || stat.status.replace("_", " ")}</span>
                    <span className="text-sm text-muted-foreground">{stat.count}</span>
                  </div>
                ))}
                {!pipeline?.length && <div className="text-sm text-muted-foreground py-4 text-center">No pipeline data available.</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {activity?.map(item => (
                  <div key={item.id} className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">{item.description}</span>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <span className="capitalize">{item.type.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                ))}
                {!activity?.length && <div className="text-sm text-muted-foreground py-4 text-center">No recent activity.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}