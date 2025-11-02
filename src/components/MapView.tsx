import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MapView = () => {
  const [vendors, setVendors] = useState<Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    image: string;
    categories: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);
      try {
        // Fetch vendor profiles with location data
        const { data: vendorProfiles } = await supabase
          .from("vendor_profiles")
          .select("user_id, business_name, city, state_region, area_of_expertise")
          .eq("status", "active")
          .limit(20);

        if (vendorProfiles) {
          // Get profile images for vendors
          const userIds = vendorProfiles.map(v => v.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, avatar_url, profile_picture_url")
            .in("id", userIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

          // Map vendors with approximate coordinates based on city/state
          const mappedVendors = vendorProfiles.map((vp, index) => {
            const profile = profileMap.get(vp.user_id);
            // Use a simple hash of city name to generate consistent coordinates
            const cityHash = vp.city.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const stateHash = vp.state_region.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            return {
              id: vp.user_id,
              name: vp.business_name || "Vendor",
              // Generate coordinates in the US range (roughly)
              lat: 25 + (cityHash % 25),
              lng: -125 + (stateHash % 50),
              image: profile?.profile_picture_url || profile?.avatar_url || "/placeholder.svg",
              categories: vp.area_of_expertise || ["product"],
            };
          });

          setVendors(mappedVendors);
        }
      } catch (error) {
        console.error("Error loading vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="relative w-full h-[600px] bg-muted rounded-lg overflow-hidden border border-border">
        {/* Simplified map representation */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-card">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">No vendors found</p>
          </div>
        ) : (
          <>
            {/* Vendor pins */}
            {vendors.map((vendor) => {
              const categories = Array.isArray(vendor.categories) ? vendor.categories : ["product"];
              return (
                <div
                  key={vendor.id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${((vendor.lng + 180) / 360) * 100}%`,
                    top: `${((90 - vendor.lat) / 180) * 100}%`,
                  }}
                  onClick={() => window.location.href = `/vendor/${vendor.id}`}
                >
                  <MapPin className="h-8 w-8 text-primary drop-shadow-lg animate-scale-in" />
                  
                  {/* Vendor preview card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-card border border-border rounded-lg shadow-xl p-3 w-48">
                      <div className="relative">
                        {/* Category Dots */}
                        <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                          {categories.slice(0, 3).map((cat, index) => (
                            <div 
                              key={`${cat}-${index}`}
                              className="w-3 h-3 rounded-full ring-1 ring-border bg-category-product"
                            />
                          ))}
                        </div>
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      </div>
                      <h3 className="text-foreground font-semibold text-sm">{vendor.name}</h3>
                      <p className="text-muted-foreground text-xs mt-1">View Listing</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Map overlay text */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
          <p className="text-foreground text-sm font-medium">
            🌍 Exploring Local Vendors ({vendors.length})
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
