import { useParams, Link } from "wouter";
import { useGetLead, useAuditLead, getGetLeadQueryKey, useGenerateOutreach } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, ScoreBadge } from "./index";
import { ArrowLeft, Globe, MapPin, Phone, Mail, FileText, Send, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function LeadDetail() {
  const { id } = useParams();
  const leadId = Number(id);
  const { data: lead, isLoading } = useGetLead(leadId, { query: { enabled: !!leadId, queryKey: getGetLeadQueryKey(leadId) } });
  
  const queryClient = useQueryClient();
  const auditMut = useAuditLead();
  const generateOutreachMut = useGenerateOutreach();

  const handleAudit = () => {
    auditMut.mutate({ id: leadId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(leadId) });
      }
    });
  };

  const handleGenerateOutreach = () => {
    generateOutreachMut.mutate({ data: { leadId, channel: "email" } }, {
      onSuccess: (data) => {
        // In a real app we'd redirect or open a drawer
        alert("Outreach generated! ID: " + data.id);
      }
    });
  };

  if (isLoading || !lead) return <div className="p-8 space-y-4"><Skeleton className="h-12 w-64" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{lead.businessName}</h2>
          <p className="text-muted-foreground">{lead.niche}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={lead.status} />
          <ScoreBadge score={lead.score} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <p>{[lead.city, lead.state, lead.country].filter(Boolean).join(", ") || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Website
                </span>
                <p>
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {lead.website}
                    </a>
                  ) : "No website"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </span>
                <p>{lead.phone || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <p>{lead.email || "Unknown"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full gap-2" 
              onClick={handleGenerateOutreach}
              disabled={generateOutreachMut.isPending}
            >
              <Send className="h-4 w-4" />
              Generate Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleAudit}
              disabled={auditMut.isPending}
            >
              <Sparkles className="h-4 w-4" />
              {auditMut.isPending ? "Auditing..." : "Audit Lead"}
            </Button>
          </CardContent>
        </Card>

        {lead.auditSummary && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Audit Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="audit">
                <AccordionItem value="audit">
                  <AccordionTrigger>Summary</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-4">{lead.auditSummary}</p>
                    <div className="mt-4 p-4 bg-primary/5 rounded-md border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Opportunity
                      </h4>
                      <p className="text-sm text-muted-foreground">{lead.auditOpportunity}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}