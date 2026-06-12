import { useState } from "react";
import { Link } from "wouter";
import { 
  useListLeads, 
  useSearchLeads,
  getListLeadsQueryKey,
  Lead
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">{score}</Badge>;
  if (score >= 40) return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">{score}</Badge>;
  return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">{score}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500",
    contacted: "bg-purple-500/10 text-purple-500",
    opened: "bg-indigo-500/10 text-indigo-500",
    replied: "bg-orange-500/10 text-orange-500",
    interested: "bg-green-500/10 text-green-500",
    meeting_booked: "bg-emerald-500/10 text-emerald-500",
    closed: "bg-teal-500/10 text-teal-500",
    disqualified: "bg-gray-500/10 text-gray-500",
  };
  
  const color = colors[status] || "bg-gray-500/10 text-gray-500";
  
  return <Badge className={`${color} capitalize hover:${color}`}>{status.replace("_", " ")}</Badge>;
}

export default function LeadsList() {
  const { data: leads, isLoading } = useListLeads();
  const searchMut = useSearchLeads();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [formData, setFormData] = useState({ niche: "", country: "US", state: "", city: "" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMut.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        setSearchOpen(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">Manage and track your potential clients.</p>
        </div>
        
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Search className="w-4 h-4" />
              Find Leads
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Leads via AI</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSearch} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche / Industry</Label>
                <Input 
                  id="niche" 
                  value={formData.niche} 
                  onChange={e => setFormData(p => ({ ...p, niche: e.target.value }))} 
                  placeholder="e.g. Roofers, Plumbers, Dentists" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={formData.country} 
                  onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    value={formData.state} 
                    onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city} 
                    onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={searchMut.isPending}>
                {searchMut.isPending ? "Searching..." : "Start Search"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Business Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No leads found. Start by finding some.
                  </TableCell>
                </TableRow>
              ) : (
                leads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium pl-6">
                      <div className="flex flex-col">
                        <span>{lead.businessName}</span>
                        <span className="text-xs text-muted-foreground">{lead.niche}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {[lead.city, lead.state].filter(Boolean).join(", ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={lead.score} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
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