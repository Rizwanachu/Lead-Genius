import { useListOutreach, useSendOutreach, getListOutreachQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Send, Mail, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export function OutreachStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    opened: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    clicked: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    replied: "bg-green-500/10 text-green-500 border-green-500/20",
    bounced: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  const color = colors[status] || "bg-gray-500/10 text-gray-500";
  
  return <Badge variant="outline" className={`${color} capitalize`}>{status}</Badge>;
}

export default function OutreachList() {
  const { data: messages, isLoading } = useListOutreach();
  const sendMut = useSendOutreach();
  const queryClient = useQueryClient();

  const handleSend = (id: number) => {
    sendMut.mutate({ data: { outreachId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOutreachQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Outreach Center</h2>
        <p className="text-muted-foreground">Review and send your generated outreach messages.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 w-[200px]">Subject</TableHead>
                <TableHead className="w-[100px]">Channel</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : messages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No outreach messages generated yet.
                  </TableCell>
                </TableRow>
              ) : (
                messages?.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-medium pl-6 line-clamp-2 h-[72px] flex items-center">
                      <span className="truncate" title={msg.subject}>{msg.subject}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background">
                        {msg.channel === 'email' ? <Mail className="w-3 h-3 mr-1" /> : null}
                        <span className="capitalize">{msg.channel}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <OutreachStatusBadge status={msg.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(msg.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {msg.status === 'draft' ? (
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleSend(msg.id)}
                          disabled={sendMut.isPending}
                        >
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
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