import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, History, Filter, MapPin, Globe, Info, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import LeadTable from "@/components/LeadTable";
import { Lead, saveLeads, getLeads, getSearchHistory, saveSearchHistory, SearchHistory } from "@/lib/storage";
import { exportToCsv } from "@/lib/csvExport";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// OSM amenity/shop/tourism tag mapping
const BUSINESS_TYPE_MAP: Record<string, string[]> = {
  restaurant: ['amenity=restaurant'],
  cafe: ['amenity=cafe'],
  coffee: ['amenity=cafe'],
  bar: ['amenity=bar'],
  pub: ['amenity=pub'],
  pizza: ['amenity=fast_food', 'amenity=restaurant'],
  bakery: ['amenity=bakery', 'shop=bakery'],
  fast_food: ['amenity=fast_food'],
  hotel: ['tourism=hotel'],
  hostel: ['tourism=hostel'],
  gym: ['leisure=fitness_centre'],
  fitness: ['leisure=fitness_centre'],
  dentist: ['amenity=dentist'],
  doctor: ['amenity=doctors'],
  pharmacy: ['amenity=pharmacy'],
  hospital: ['amenity=hospital'],
  hair: ['shop=hairdresser'],
  salon: ['shop=hairdresser', 'shop=beauty'],
  beauty: ['shop=beauty'],
  spa: ['leisure=spa'],
  plumber: ['craft=plumber'],
  electrician: ['craft=electrician'],
  mechanic: ['shop=car_repair'],
  garage: ['shop=car_repair'],
  florist: ['shop=florist'],
  supermarket: ['shop=supermarket'],
  grocery: ['shop=convenience', 'shop=supermarket'],
  clothing: ['shop=clothes'],
  bookstore: ['shop=books'],
  school: ['amenity=school'],
  kindergarten: ['amenity=kindergarten'],
  bank: ['amenity=bank'],
  atm: ['amenity=atm'],
  parking: ['amenity=parking'],
  veterinary: ['amenity=veterinary'],
  pet: ['shop=pet'],
  optician: ['shop=optician'],
  jewelry: ['shop=jewelry'],
  electronics: ['shop=electronics'],
  furniture: ['shop=furniture'],
  laundry: ['shop=laundry', 'amenity=laundry'],
  tattoo: ['shop=tattoo'],
  yoga: ['leisure=fitness_centre'],
  swimming: ['leisure=swimming_pool', 'leisure=sports_centre'],
};

function guessOsmTags(businessType: string): string[] {
  const lower = businessType.toLowerCase().trim();
  for (const [key, tags] of Object.entries(BUSINESS_TYPE_MAP)) {
    if (lower.includes(key)) return tags;
  }
  // Fallback: use shop + amenity wildcard search
  return [`amenity=${lower}`, `shop=${lower}`, `craft=${lower}`, `tourism=${lower}`, `leisure=${lower}`];
}

function extractWebsite(tags: Record<string, string>): string | null {
  return (
    tags["website"] ||
    tags["contact:website"] ||
    tags["url"] ||
    tags["website:official"] ||
    tags["website:en"] ||
    tags["source:website"] ||
    null
  );
}

function extractPhone(tags: Record<string, string>): string | null {
  return (
    tags["phone"] ||
    tags["contact:phone"] ||
    tags["telephone"] ||
    tags["contact:mobile"] ||
    tags["mobile"] ||
    null
  );
}

function buildGoogleMapsSearchUrl(name: string, city: string, state: string, country: string): string {
  // Name-based search opens the actual Google Maps listing — not just coordinates
  const query = [name, city, state, country].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Step 1: Geocode the city to get lat/lon center using Nominatim
async function geocodeCity(city: string, state: string, country: string): Promise<{ lat: number; lon: number } | null> {
  const q = [city, state, country].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&featuretype=city`;
  const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "LeadHunterAI/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// Step 2: Query Overpass API — gives FULL OSM tags, much richer than Nominatim extratags
async function queryOverpass(lat: number, lon: number, osmTags: string[], radiusMeters: number): Promise<any[]> {
  const tagFilters = osmTags.map(t => {
    const [k, v] = t.split("=");
    if (v && v !== "*") {
      return `node["${k}"="${v}"](around:${radiusMeters},${lat},${lon});\nway["${k}"="${v}"](around:${radiusMeters},${lat},${lon});`;
    } else {
      return `node["${k}"](around:${radiusMeters},${lat},${lon});\nway["${k}"](around:${radiusMeters},${lat},${lon});`;
    }
  }).join("\n");

  const query = `[out:json][timeout:30];\n(\n${tagFilters}\n);\nout body center 40;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`
  });
  if (!res.ok) throw new Error("Overpass API error: " + res.status);
  const data = await res.json();
  return data.elements || [];
}

function osmElementsToLeads(elements: any[], businessType: string, city: string, state: string, country: string): Lead[] {
  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags.name || tags["name:en"];
    if (!name) continue;

    // Deduplicate by name+location
    const dedupeKey = name.toLowerCase().trim();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!lat || !lon) continue;

    const website = extractWebsite(tags);
    const phone = extractPhone(tags);
    const hasWebsite = !!website;

    // Build full address from OSM tags
    const houseNumber = tags["addr:housenumber"] || "";
    const street = tags["addr:street"] || "";
    const osmCity = tags["addr:city"] || city;
    const osmState = tags["addr:state"] || state;
    const address = [houseNumber, street].filter(Boolean).join(" ") || "";

    const instagram = tags["contact:instagram"] || tags["social:instagram"] || null;
    const facebook = tags["contact:facebook"] || tags["social:facebook"] || null;

    // Lead score: higher = more opportunity for agency
    let score = 50;
    if (!hasWebsite) score += 35;
    if (!phone) score += 10;
    if (instagram || facebook) score += 15;
    score = Math.min(score + Math.floor(Math.random() * 10), 100);

    leads.push({
      id: `osm-${el.type}-${el.id}`,
      businessName: name,
      category: tags.amenity || tags.shop || tags.tourism || tags.leisure || tags.craft || businessType,
      city: osmCity,
      state: osmState,
      country,
      address: address || `${osmCity}, ${osmState}`,
      phone: phone || "",
      website: website || null,
      email: tags["contact:email"] || tags["email"] || null,
      instagram: instagram ? (instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace("@", "")}`) : null,
      facebook: facebook ? (facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook.replace("@", "")}`) : null,
      twitter: tags["contact:twitter"] || null,
      youtube: tags["contact:youtube"] || null,
      tiktok: tags["contact:tiktok"] || null,
      googleMapsUrl: buildGoogleMapsSearchUrl(name, address || osmCity, osmState, country),
      hasWebsite,
      score,
      status: "new",
      notes: `OSM: ${el.type}/${el.id}`,
      rating: 0,
      reviewCount: 0,
      priceLevel: "",
      description: tags.description || tags["description:en"] || "",
      reviews: [],
      contacts: [],
      openingHours: {
        monday: tags["opening_hours"] || "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      },
      plusCode: "",
      categories: [tags.amenity, tags.shop, tags.tourism, tags.leisure, tags.craft].filter(Boolean) as string[],
      amenities: [],
      yearEstablished: 0,
      employeeCount: "",
      websiteStatus: hasWebsite ? "active" : "none",
      seoScore: hasWebsite ? 30 : 0,
      socialScore: (instagram || facebook) ? 40 : 0,
      opportunityScore: score,
      createdAt: new Date().toISOString(),
    } as Lead);
  }

  return leads;
}

export default function LeadFinder() {
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchHistory, setSearchHistoryState] = useState<SearchHistory[]>([]);
  const [searchStatus, setSearchStatus] = useState("");
  const [radius, setRadius] = useState("3000");

  const [formData, setFormData] = useState({
    country: "United States",
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
    setSearchStatus("Geocoding city...");

    const query = `${formData.businessType} in ${formData.city}, ${formData.state}`;
    const newHistory = [{
      id: Math.random().toString(36).substring(7),
      query,
      createdAt: new Date().toISOString()
    }, ...searchHistory].slice(0, 5);
    setSearchHistoryState(newHistory);
    saveSearchHistory(newHistory);

    try {
      // Step 1: Geocode city
      const center = await geocodeCity(formData.city, formData.state, formData.country);
      if (!center) {
        toast.error("Could not find that city. Check the spelling and try again.");
        setIsSearching(false);
        setSearchStatus("");
        return;
      }

      setSearchStatus(`Found ${formData.city} — querying OpenStreetMap businesses...`);

      // Step 2: Map business type to OSM tags
      const osmTags = guessOsmTags(formData.businessType);

      // Step 3: Overpass API for full tag data
      const elements = await queryOverpass(center.lat, center.lon, osmTags, parseInt(radius));

      if (elements.length === 0) {
        // Fallback: try a wider radius
        setSearchStatus("No results — trying wider area...");
        const wider = await queryOverpass(center.lat, center.lon, osmTags, 8000);
        if (wider.length === 0) {
          toast.info("No results in OpenStreetMap for this business type in this area. Try a different city or type.");
          setIsSearching(false);
          setSearchStatus("");
          return;
        }
        const newLeads = osmElementsToLeads(wider, formData.businessType, formData.city, formData.state, formData.country);
        mergeLeads(newLeads);
        return;
      }

      const newLeads = osmElementsToLeads(elements, formData.businessType, formData.city, formData.state, formData.country);
      mergeLeads(newLeads);
    } catch (err: any) {
      console.error(err);
      toast.error("Search failed: " + (err.message || "Network error. Try again."));
    } finally {
      setIsSearching(false);
      setSearchStatus("");
    }
  };

  const mergeLeads = (newLeads: Lead[]) => {
    if (newLeads.length === 0) {
      toast.info("No named businesses found in OpenStreetMap for this search.");
      return;
    }
    const existingIds = new Set(leads.map(l => l.id));
    const fresh = newLeads.filter(l => !existingIds.has(l.id));
    const updatedLeads = [...fresh, ...leads];
    setLeads(updatedLeads);
    saveLeads(updatedLeads);
    toast.success(`Found ${fresh.length} real businesses. Click "View on Google Maps" to see verified details.`);
  };

  const handleExport = () => {
    exportToCsv("leads.csv", filteredLeads);
    toast.success("Exported leads to CSV");
  };

  const handleClearLeads = () => {
    setLeads([]);
    saveLeads([]);
    toast.success("Cleared all leads");
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === "all") return true;
    if (filter === "no_website") return !lead.hasWebsite;
    if (filter === "has_website") return lead.hasWebsite;
    if (filter === "has_email") return !!lead.email;
    if (filter === "has_social") return !!(lead.instagram || lead.facebook);
    return true;
  });

  const noWebsiteCount = leads.filter(l => !l.hasWebsite).length;
  const hasWebsiteCount = leads.filter(l => l.hasWebsite).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Finder</h1>
        <p className="text-muted-foreground mt-1">
          Real businesses from OpenStreetMap via Overpass API. Click "View on Google Maps" on any lead to see verified details.
        </p>
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
                  placeholder="e.g. Restaurant, Plumber, Salon"
                  value={formData.businessType}
                  onChange={e => setFormData({...formData, businessType: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Search Radius</Label>
                <select
                  id="radius"
                  value={radius}
                  onChange={e => setRadius(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="1500">Small (~1.5 km)</option>
                  <option value="3000">Medium (~3 km)</option>
                  <option value="5000">Large (~5 km)</option>
                  <option value="8000">City-wide (~8 km)</option>
                  <option value="15000">Metro (~15 km)</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isSearching}>
                {isSearching ? (
                  <span className="flex items-center gap-2">Scanning <span className="animate-pulse">...</span></span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Find Businesses</span>
                )}
              </Button>
            </form>

            {isSearching && searchStatus && (
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary animate-pulse">
                {searchStatus}
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                <Info className="w-3.5 h-3.5" /> About the data
              </div>
              <p>Businesses come from OpenStreetMap community data. Some may have incomplete phone/website info in OSM.</p>
              <p className="text-blue-300 font-medium">→ Click any lead → "View on Google Maps" to see the full verified listing.</p>
            </div>

            {leads.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-muted/30 border">
                  <div className="text-xl font-bold text-destructive">{noWebsiteCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">No Website</div>
                </div>
                <div className="p-2 rounded bg-muted/30 border">
                  <div className="text-xl font-bold text-primary">{hasWebsiteCount}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Has Website</div>
                </div>
              </div>
            )}

            {leads.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground" onClick={handleClearLeads}>
                Clear all leads
              </Button>
            )}

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
              <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1 shrink-0" />
              {[
                { id: "all", label: `All (${leads.length})` },
                { id: "no_website", label: `No Website (${noWebsiteCount})` },
                { id: "has_website", label: `Has Website (${hasWebsiteCount})` },
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
                Querying Overpass for real {formData.businessType}s in {formData.city}...
              </div>
            </div>
          ) : filteredLeads.length > 0 ? (
            <>
              <div className="text-xs text-muted-foreground px-1 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Click any row → then "View on Google Maps" to open the real Google Maps listing with verified address, phone, and reviews.
              </div>
              <LeadTable leads={filteredLeads} />
            </>
          ) : (
            <div className="text-center p-12 border rounded-lg bg-card/30 border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No leads yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Search for a city and business type to find real local businesses from OpenStreetMap.
              </p>
              <p className="text-muted-foreground text-xs mt-2 max-w-sm mx-auto">
                Tip: "Restaurant" in major cities like Austin, New York, London work best. Use city-wide radius for more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
