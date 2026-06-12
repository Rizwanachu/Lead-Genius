import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, History, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import LeadTable from "@/components/LeadTable";
import { generateMockLeads } from "@/lib/mockData";
import { Lead, saveLeads, getLeads, getSearchHistory, saveSearchHistory, SearchHistory } from "@/lib/storage";
import { exportToCsv } from "@/lib/csvExport";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function LeadFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchHistory, setSearchHistoryState] = useState<SearchHistory[]>([]);

  const [formData, setFormData] = useState({
    country: "USA",
    state: "Texas",
    city: "Austin",
    businessType: "Restaurant"
  });

  useEffect(() => {
    setLeads(getLeads());
    setSearchHistoryState(getSearchHistory());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Save to history
    const query = `${formData.businessType} in ${formData.city}, ${formData.state}`;
    const newHistory = [{
      id: Math.random().toString(36).substring(7),
      query,
      createdAt: new Date().toISOString()
    }, ...searchHistory].slice(0, 5);
    
    setSearchHistoryState(newHistory);
    saveSearchHistory(newHistory);

    setTimeout(() => {
      const mockCount = Math.floor(Math.random() * 8) + 8; // 8-15 leads
      const newLeads = generateMockLeads(
        formData.country, 
        formData.state, 
        formData.city, 
        formData.businessType, 
        mockCount
      );
      
      const updatedLeads = [...newLeads, ...leads];
      setLeads(updatedLeads);
      saveLeads(updatedLeads);
      setIsSearching(false);
      toast.success(`Found ${newLeads.length} new leads!`);
    }, 1500);
  };

  const handleExport = () => {
    exportToCsv("leads.csv", filteredLeads);
    toast.success("Exported leads to CSV");
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === "all") return true;
    if (filter === "no_website") return !lead.hasWebsite;
    if (filter === "has_website") return lead.hasWebsite;
    if (filter === "has_email") return !!lead.email;
    if (filter === "has_social") return !!lead.instagram || !!lead.facebook;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Finder</h1>
        <p className="text-muted-foreground mt-1">Hunt for local businesses missing digital opportunities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50 h-fit sticky top-20">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={formData.country} 
                  onChange={e => setFormData({...formData, country: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  value={formData.state} 
                  onChange={e => setFormData({...formData, state: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input 
                  id="businessType" 
                  placeholder="e.g. Plumber, Cafe" 
                  value={formData.businessType} 
                  onChange={e => setFormData({...formData, businessType: e.target.value})} 
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isSearching}>
                {isSearching ? (
                  <span className="flex items-center gap-2">Scanning <span className="animate-pulse">...</span></span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Hunt Leads</span>
                )}
              </Button>
            </form>

            {searchHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> Recent Searches
                </h3>
                <div className="space-y-2">
                  {searchHistory.map(h => (
                    <div key={h.id} className="text-xs p-2 rounded bg-muted/50 truncate text-muted-foreground cursor-pointer hover:bg-muted/80">
                      {h.query}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/30 p-2 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1" />
              {[
                { id: "all", label: "All" },
                { id: "no_website", label: "No Website" },
                { id: "has_website", label: "Has Website" },
                { id: "has_email", label: "Has Email" },
                { id: "has_social", label: "Has Social" },
              ].map(f => (
                <Badge 
                  key={f.id}
                  variant={filter === f.id ? "default" : "secondary"}
                  className={`cursor-pointer whitespace-nowrap ${filter === f.id ? 'bg-primary' : 'hover:bg-muted'}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </Badge>
              ))}
            </div>
            
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredLeads.length === 0} className="shrink-0">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>

          {isSearching ? (
            <TableSkeleton />
          ) : filteredLeads.length > 0 ? (
            <LeadTable leads={filteredLeads} />
          ) : (
            <div className="text-center p-12 border rounded-lg bg-card/30 border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No leads found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try searching for a different location or business type.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}