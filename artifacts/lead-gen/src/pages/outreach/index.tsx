import React, { useState } from "react";
import { useListOutreach, useSendOutreach, getListOutreachQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Send, Mail, CheckCircle2, Eye, MessageSquare, Clock, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export function OutreachStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    draft:   { bg: "bg-gray-500/10",    text: "text-gray-500" },
    sent:    { bg: "bg-blue-500/10",    text: "text-blue-600" },
    opened:  { bg: "bg-indigo-500/10",  text: "text-indigo-600" },
    clicked: { bg: "bg-purple-500/10",  text: "text-purple-600" },
    replied: { bg: "bg-green-500/10",   text: "text-green-600" },
    bounced: { bg: "bg-red-500/10",     text: "text-red-600" },
  };
  const c = config[status] || config.draft;
  return (
    <Badge className={`${c.bg} ${c.text} border-0 capitalize font-medium text-xs px-2.5 py-0.5`}>{status}</Badge>
  );
}

export default function OutreachList() {
  const { data: messages, isLoading } = useListOutreach();
  const sendMut = useSendOutreach();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "sent" | "replied">("all");

  const handleSend = (id: number) => {
    sendMut.mutate({ data: { outreachId: id } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOutreachQueryKey() }),
    });
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { key: "all", label: "All", count: messages?.length ?? 0 },
    { key: "draft", label: "Drafts", count: messages?.filter(m => m.status === "draft").length ?? 0 },
    { key: "sent", label: "Sent", count: messages?.filter(m => ["sent", "opened"].includes(m.status)).length ?? 0 },
    { key: "replied", label: "Replied", count: messages?.filter(m => m.status === "replied").length ?? 0 },
  ];

  const filtered = activeTab === "all" ? messages
    : activeTab === "draft" ? messages?.filter(m => m.status === "draft")
    : activeTab === "sent" ? messages?.filter(m => ["sent", "opened"].includes(m.status))
    : messages?.filter(m => m.status === "replied");

  const statsSent = messages?.filter(m => m.status !== "draft").length ?? 0;
  const statsOpened = messages?.filter(m => ["opened", "replied"].includes(m.status)).length ?? 0;
  const statsReplied = messages?.filter(m => m.status === "replied").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Outreach Center</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Review, edit, and send your personalized outreach emails.</p>
        </div>
        <Link href="/leads">
          <Button className="gap-2 shadow-sm">
            <Mail className="w-4 h-4" />
            Generate New Email
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {[
          { label: "Emails Sent", value: statsSent, icon: Send, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Opened", value: statsOpened, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-500/10", pct: statsSent > 0 ? ((statsOpened / statsSent) * 100).toFixed(0) + "%" : "—" },
          { label: "Replied", value: statsReplied, icon: MessageSquare, color: "text-green-600", bg: "bg-green-500/10", pct: statsSent > 0 ? ((statsReplied / statsSent) * 100).toFixed(0) + "%" : "—" },
        ].map(({ label, value, icon: Icon, color, bg, pct }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{value}</span>
                  {pct && <span className="text-sm text-muted-foreground">{pct}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{tab.count}</Badge>
          </button>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Lead</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Timeline</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-5 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">No messages found</p>
                        <p className="text-xs mt-0.5">Go to a lead profile and click "Generate Email" to create outreach.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((msg) => (
                  <React.Fragment key={msg.id}>
                    <TableRow
                      className="group hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate max-w-xs">{msg.subject}</p>
                            {(msg.followUpNumber ?? 0) > 0 && (
                              <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">Follow-up #{msg.followUpNumber}</Badge>
                            )}
                          </div>
                          {expanded === msg.id
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {msg.leadId ? (
                          <Link href={`/leads/${msg.leadId}`} onClick={e => e.stopPropagation()}>
                            <span className="text-sm text-primary hover:underline font-medium">Lead #{msg.leadId}</span>
                          </Link>
                        ) : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      <TableCell>
                        <OutreachStatusBadge status={msg.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </div>
                          {msg.sentAt && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Send className="w-3 h-3" />
                              {format(new Date(msg.sentAt), "MMM d")}
                            </div>
                          )}
                          {msg.repliedAt && (
                            <div className="flex items-center gap-1 text-green-600">
                              <MessageSquare className="w-3 h-3" />
                              {format(new Date(msg.repliedAt), "MMM d")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right" onClick={e => e.stopPropagation()}>
                        {msg.status === "draft" ? (
                          <Button
                            size="sm"
                            className="gap-1.5 h-8 text-xs shadow-sm"
                            onClick={() => handleSend(msg.id)}
                            disabled={sendMut.isPending}
                          >
                            <Send className="h-3 w-3" />
                            Send
                          </Button>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Sent
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    {expanded === msg.id && (
                      <TableRow key={`${msg.id}-expanded`} className="hover:bg-transparent">
                        <TableCell colSpan={5} className="px-6 pb-4 pt-0 bg-muted/20">
                          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Preview</p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-7 text-xs"
                                onClick={() => handleCopy(msg.id, msg.body)}
                              >
                                {copied === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                {copied === msg.id ? "Copied!" : "Copy Body"}
                              </Button>
                            </div>
                            <pre className="text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed bg-muted/40 rounded-lg p-4">
                              {msg.body}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
