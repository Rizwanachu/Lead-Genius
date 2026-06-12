import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/lib/storage";
import ScoreBadge from "./ScoreBadge";
import { Globe, Mail, Instagram, Facebook } from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) return null;

  return (
    <div className="border rounded-md overflow-hidden bg-card/50 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-center">Opp Score</TableHead>
            <TableHead className="text-right">Digital Presence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.businessName}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal capitalize">{lead.category}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {lead.city}, {lead.state}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <ScoreBadge score={lead.score} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                  <Globe className={`w-4 h-4 ${lead.hasWebsite ? 'text-primary' : 'opacity-30'}`} />
                  <Mail className={`w-4 h-4 ${lead.email ? 'text-primary' : 'opacity-30'}`} />
                  <Instagram className={`w-4 h-4 ${lead.instagram ? 'text-primary' : 'opacity-30'}`} />
                  <Facebook className={`w-4 h-4 ${lead.facebook ? 'text-primary' : 'opacity-30'}`} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}