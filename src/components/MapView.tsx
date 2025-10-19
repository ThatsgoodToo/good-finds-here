import { MapPin } from "lucide-react";

const MapView = () => {
  // Mock vendor locations
  const vendors = [
    { id: 1, name: "Artisan Pottery", lat: 40, lng: -100, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200" },
    { id: 2, name: "Local Honey", lat: 35, lng: -95, image: "https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=200" },
    { id: 3, name: "Handmade Jewelry", lat: 42, lng: -110, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="relative w-full h-[600px] bg-muted rounded-lg overflow-hidden border border-border">
        {/* Simplified map representation */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-card">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {/* Vendor pins */}
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="absolute group cursor-pointer"
            style={{
              left: `${((vendor.lng + 180) / 360) * 100}%`,
              top: `${((90 - vendor.lat) / 180) * 100}%`,
            }}
          >
            <MapPin className="h-8 w-8 text-primary drop-shadow-lg animate-scale-in" />
            
            {/* Vendor preview card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-card border border-border rounded-lg shadow-xl p-3 w-48">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="text-foreground font-semibold text-sm">{vendor.name}</h3>
                <p className="text-muted-foreground text-xs mt-1">View Listing</p>
              </div>
            </div>
          </div>
        ))}

        {/* Map overlay text */}
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
          <p className="text-foreground text-sm font-medium">
            🌍 Exploring Local Vendors
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
