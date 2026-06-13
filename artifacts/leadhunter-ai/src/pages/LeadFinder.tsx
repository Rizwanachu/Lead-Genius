import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, History, Filter, MapPin, Globe, Phone, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import LeadTable from "@/components/LeadTable";
import { Lead, saveLeads, getLeads, getSearchHistory, saveSearchHistory, SearchHistory } from "@/lib/storage";
import { exportToCsv } from "@/lib/csvExport";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

async function searchNominatim(businessType: string, city: string, state: string, country: string): Promise<Lead[]> {
  const query = `${businessType} in ${city}${state ? `, ${state}` : ""}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=20&addressdetails=1&extratags=1`;

  const res = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "LeadHunterAI/1.0" }
  });

  if (!res.ok) throw new Error("Nominatim search failed");
  const data: any[] = await res.json();

  const leads: Lead[] = data
    .filter(item => item.display_name && item.lat && item.lon)
    .map((item, i) => {
      const tags = item.extratags || {};
      const addr = item.address || {};
      const businessCity = addr.city || addr.town || addr.village || city;
      const businessState = addr.state || state;

      const name = item.name || item.display_name.split(",")[0].trim();
      const hasWebsite = !!tags.website;
      const hasPhone = !!tags.phone;
      const hasInstagram = !!(tags["contact:instagram"] || tags["social:instagram"]);
      const hasFacebook = !!(tags["contact:facebook"] || tags["social:facebook"]);

      let score = 0;
      if (!hasWebsite) score += 45;
      if (!hasPhone) score += 15;
      if (hasInstagram || hasFacebook) score += 20;
      score = Math.min(Math.max(score + Math.floor(Math.random() * 20), 30), 100);

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");

      return {
        id: `osm-${item.osm_id || i}-${Date.now()}`,
        businessName: name,
        category: businessType,
        city: businessCity,
        state: businessState,
        country,
        email: null,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || null,
        instagram: tags["contact:instagram"] ? `https://instagram.com/${tags["contact:instagram"].replace("@", "")}` : null,
        facebook: tags["contact:facebook"] || null,
        googleMapsUrl: `https://maps.google.com/?q=${item.lat},${item.lon}`,
        reviewCount: null,
        reviewRating: null,
        hasWebsite,
        score,
        status: "new",
        notes: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        osmType: item.type,
        createdAt: new Date().toISOString(),
      } as Lead;
    })
    .filter(l => l.score >= 30);

  return leads;
}

export default function LeadFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchHistory, setSearchHistoryState] = useState<SearchHistory[]>([]);
  const [searchStatus, setSearchStatus] = useState("");

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchStatus("Searching OpenStreetMap for real businesses...");

    const query = `${formData.businessType} in ${formData.city}, ${formData.state}`;
    const newHistory = [{
      id: Math.random().toString(36).substring(7),
      query,
      createdAt: new Date().toISOString()
    }, ...searchHistory].slice(0, 5);

    setSearchHistoryState(newHistory);
    saveSearchHistory(newHistory);

    try {
      const newLeads = await searchNominatim(
        formData.businessType,
        formData.city,
        formData.state,
        formData.country
      );

      if (newLeads.length === 0) {
        toast.info("No results from OpenStreetMap. Try a larger city or different business type.");
        setIsSearching(false);
        setSearchStatus("");
        return;
      }

      const existingIds = new Set(leads.map(l => l.id));
      const fresh = newLeads.filter(l => !existingIds.has(l.id));
      const updatedLeads = [...fresh, ...leads];
      setLeads(updatedLeads);
      saveLeads(updatedLeads);
      toast.success(`Found ${fresh.length} real businesses from OpenStreetMap!`);
    } catch (err) {
      toast.error("Search failed. Check your connection and try again.");
      console.error(err);
    } finally {
      setIsSearching(false);
      setSearchStatus("");
    }
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
        <p className="text-muted-foreground mt-1">Find real local businesses via OpenStreetMap — no fake data.</p>
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
                <Label htmlFor="state">State / Region</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
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
                  placeholder="e.g. Plumber, Cafe, Dentist"
                  value={formData.businessType}
                  onChange={e => setFormData({...formData, businessType: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isSearching}>
                {isSearching ? (
                  <span className="flex items-center gap-2">Scanning <span className="animate-pulse">...</span></span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Hunt Real Leads</span>
                )}
              </Button>
            </form>

            {isSearching && searchStatus && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary animate-pulse">
                {searchStatus}
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg bg-muted/30 border text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 mb-1 font-medium text-foreground">
                <MapPin className="w-3.5 h-3.5" /> Powered by OpenStreetMap
              </div>
              Real business data — no fake names. Results vary by city density in OSM.
            </div>

            {searchHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> Recent Searches
                </h3>
                <div className="space-y-2">
                  {searchHistory.map(h => (
                    <div key={h.id} className="text-xs p-2 rounded bg-muted/50 truncate text-muted-foreground">
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
            <div className="space-y-3">
              <TableSkeleton />
              <div className="text-center text-sm text-muted-foreground animate-pulse">
                Querying OpenStreetMap for real {formData.businessType}s in {formData.city}...
              </div>
            </div>
          ) : filteredLeads.length > 0 ? (
            <LeadTable leads={filteredLeads} />
          ) : (
            <div className="text-center p-12 border rounded-lg bg-card/30 border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No leads yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Search for a city and business type to find real local businesses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
