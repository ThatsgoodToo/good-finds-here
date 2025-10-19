import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MapView = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);

  // Mock vendor locations with real coordinates
  const vendors = [
    { id: 1, name: "Clay & Co.", lat: 45.5152, lng: -122.6784, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200", category: "Ceramics" },
    { id: 2, name: "Bee Happy Farms", lat: 45.5231, lng: -122.6765, image: "https://images.unsplash.com/photo-1587049352846-4a222e784eaf?w=200", category: "Local Honey" },
    { id: 3, name: "Studio Ceramics", lat: 45.5185, lng: -122.6891, image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200", category: "Pottery" },
    { id: 4, name: "Metalworks", lat: 45.5289, lng: -122.6625, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200", category: "Jewelry" },
    { id: 5, name: "Pure Essence", lat: 45.5098, lng: -122.6801, image: "https://images.unsplash.com/photo-1600428449936-7d99b66d3e7c?w=200", category: "Organic Soaps" },
  ];

  useEffect(() => {
    // Check if token is saved in localStorage
    const savedToken = localStorage.getItem("mapboxToken");
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenSaved(true);
      initializeMap(savedToken);
    } else {
      setShowTokenDialog(true);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-122.6784, 45.5152], // Portland, OR
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      // Add vendor markers
      vendors.forEach((vendor) => {
        if (!map.current) return;

        // Create custom marker element
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.cursor = "pointer";
        el.innerHTML = `
          <div class="flex items-center justify-center w-10 h-10 bg-primary rounded-full shadow-lg border-2 border-background">
            <svg class="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <img src="${vendor.image}" alt="${vendor.name}" class="w-full h-24 object-cover rounded mb-2" />
            <h3 class="font-semibold text-sm mb-1">${vendor.name}</h3>
            <p class="text-xs text-muted-foreground">${vendor.category}</p>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([vendor.lng, vendor.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem("mapboxToken", mapboxToken);
      setTokenSaved(true);
      setShowTokenDialog(false);
      initializeMap(mapboxToken);
    }
  };

  if (!tokenSaved) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Map View Setup Required</h2>
            <p className="text-muted-foreground mb-6">
              To use the map view, you need to add your Mapbox public token.
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div>
                <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
                <Input
                  id="mapboxToken"
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveToken} className="w-full">
                Save Token & Initialize Map
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Get your token at{" "}
                <a
                  href="https://mapbox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="relative w-full h-[600px] bg-card rounded-lg overflow-hidden border border-border shadow-lg">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Map overlay */}
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-border shadow-md">
          <p className="text-foreground text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Exploring {vendors.length} Local Vendors
          </p>
        </div>

        {/* Settings button to change token */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm shadow-md"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Map Settings</DialogTitle>
              <DialogDescription>
                Update your Mapbox public token
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newToken">Mapbox Public Token</Label>
                <Input
                  id="newToken"
                  type="text"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveToken} className="w-full">
                Update Token
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MapView;
