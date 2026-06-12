import { useState } from "react";
import { Link } from "wouter";
import {
  useListLeads,
  useSearchLeads,
  getListLeadsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Search, MapPin, Star, Instagram, Facebook, Globe, ChevronRight, Sparkles, Filter, SlidersHorizontal } from "lucide-react";

export function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-sm font-semibold text-green-600">{score}</span>
    </div>
  );
  if (score >= 40) return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-yellow-500" />
      <span className="text-sm font-semibold text-yellow-600">{score}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-sm font-semibold text-red-500">{score}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    new:            { bg: "bg-blue-500/10",     text: "text-blue-600" },
    contacted:      { bg: "bg-purple-500/10",   text: "text-purple-600" },
    opened:         { bg: "bg-indigo-500/10",   text: "text-indigo-600" },
    replied:        { bg: "bg-orange-500/10",   text: "text-orange-600" },
    interested:     { bg: "bg-green-500/10",    text: "text-green-600" },
    meeting_booked: { bg: "bg-emerald-500/10",  text: "text-emerald-600" },
    closed:         { bg: "bg-teal-500/10",     text: "text-teal-600" },
    disqualified:   { bg: "bg-gray-500/10",     text: "text-gray-500" },
  };
  const c = config[status] || config.disqualified;
  return (
    <Badge className={`${c.bg} ${c.text} border-0 capitalize font-medium text-xs px-2.5 py-0.5`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export default function LeadsList() {
  const { data: leads, isLoading } = useListLeads();
  const searchMut = useSearchLeads();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [formData, setFormData] = useState({ niche: "", country: "USA", state: "", city: "" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMut.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
        setSearchOpen(false);
        setFormData({ niche: "", country: "USA", state: "", city: "" });
      }
    });
  };

  const filtered = leads?.filter(l =>
    !filter || l.businessName.toLowerCase().includes(filter.toLowerCase()) ||
    l.niche?.toLowerCase().includes(filter.toLowerCase()) ||
    l.city?.toLowerCase().includes(filter.toLowerCase())
  );

  const statuses = ["new", "contacted", "opened", "replied", "interested", "meeting_booked", "closed"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {leads?.length ?? 0} businesses found — sorted by opportunity score
          </p>
        </div>
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Find Leads with AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Lead Finder
              </DialogTitle>
              <DialogDescription>
                Enter a niche and location — the AI generates scored leads with contact details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSearch} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="niche" className="text-sm font-medium">Business Type / Niche</Label>
                <Input
                  id="niche"
                  value={formData.niche}
                  onChange={e => setFormData(p => ({ ...p, niche: e.target.value }))}
                  placeholder="e.g. Roofers, Plumbers, Dentists, Cafes"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                  required
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">State / Region</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                    placeholder="e.g. TX"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Austin"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                The AI will generate 5–10 realistic business leads with scoring, contact info, and social profiles.
              </div>
              <Button type="submit" className="w-full h-10 gap-2" disabled={searchMut.isPending}>
                {searchMut.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating leads...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Leads
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search leads..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 text-center">
        {statuses.map(s => {
          const count = leads?.filter(l => l.status === s).length ?? 0;
          return (
            <div key={s} className="bg-card border border-border rounded-lg p-3">
              <div className="text-lg font-bold">{count}</div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">{s.replace("_", " ")}</div>
            </div>
          );
        })}
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-6 w-[260px] font-semibold">Business</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Score</TableHead>
                <TableHead className="font-semibold">Signals</TableHead>
                <TableHead className="font-semibold">Reviews</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {[260, 120, 60, 80, 80, 100, 100].map((w, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}>
                        <Skeleton className={`h-5 w-${w > 100 ? "32" : w > 80 ? "20" : "12"}`} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">No leads found</p>
                        <p className="text-xs mt-0.5">Try adjusting your filter or use AI to find new leads</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.sort((a, b) => b.score - a.score).map((lead) => (
                  <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.businessName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lead.niche}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={lead.score} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {lead.instagramUrl ? (
                          <div title="Instagram" className="w-5 h-5 rounded bg-pink-500/10 flex items-center justify-center">
                            <Instagram className="w-3 h-3 text-pink-500" />
                          </div>
                        ) : <div className="w-5 h-5 rounded bg-muted" />}
                        {lead.facebookUrl ? (
                          <div title="Facebook" className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
                            <Facebook className="w-3 h-3 text-blue-500" />
                          </div>
                        ) : <div className="w-5 h-5 rounded bg-muted" />}
                        {lead.hasWebsite ? (
                          <div title="Has Website" className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-green-500" />
                          </div>
                        ) : (
                          <div title="No Website" className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-red-400 opacity-50" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.reviewCount != null ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{lead.reviewRating?.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">({lead.reviewCount})</span>
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          View <ChevronRight className="w-3 h-3" />
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
